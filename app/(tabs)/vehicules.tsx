import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import {
  Card,
  Text,
  Avatar,
  Chip,
  TextInput,
  Button,
  Menu,
  Divider,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { vehiculeService, Vehicule } from '@/services/vehiculeService';
import { type AppColors, useAppColors } from '@/constants/colors';


type SortOption = 'date_desc' | 'date_asc' | 'marque_asc' | 'marque_desc';

const DISPO_CONFIG: Record<string, { label: string; couleur: string }> = {
  disponible: {
    label: 'Disponible',
    couleur: '#4caf50',
  },
  indisponible: {
    label: 'Indisponible',
    couleur: '#f44336',
  },
  en_reparation: {
    label: 'En réparation',
    couleur: '#ff9800',
  },
  reserve: {
    label: 'Réservé',
    couleur: '#2196f3',
  },
};

const STATUT_CONFIG: Record<string, { label: string; couleur: string }> = {
  actif: {
    label: 'Actif',
    couleur: '#4caf50',
  },
  inactif: {
    label: 'Inactif',
    couleur: '#9e9e9e',
  },
};

function getDisponibiliteConfig(disponibilite?: string | null) {
  if (!disponibilite) {
    return {
      label: 'Non défini',
      couleur: '#9e9e9e',
    };
  }

  return (
    DISPO_CONFIG[disponibilite] ?? {
      label: disponibilite,
      couleur: '#9e9e9e',
    }
  );
}

function getStatutConfig(statut?: string | null) {
  if (!statut) {
    return {
      label: 'Non défini',
      couleur: '#9e9e9e',
    };
  }

  return (
    STATUT_CONFIG[statut] ?? {
      label: statut,
      couleur: '#9e9e9e',
    }
  );
}

function getVehiculeTitre(vehicule: Vehicule) {
  const marque = vehicule.marque ?? '';
  const modele = vehicule.modele ?? '';

  return `${marque} ${modele}`.trim() || `Véhicule ${vehicule.id}`;
}

function getVehiculeSousTitre(vehicule: Vehicule) {
  if (vehicule.numero_vehicule && vehicule.numero_immatriculation) {
    return `${vehicule.numero_vehicule} - ${vehicule.numero_immatriculation}`;
  }

  return vehicule.numero_vehicule || vehicule.numero_immatriculation || '';
}

function getVehiculeDateTime(vehicule: Vehicule) {
  const date = vehicule.created_at || vehicule.updated_at || '';
  if (!date) return 0;

  const time = new Date(date).getTime();
  return Number.isNaN(time) ? 0 : time;
}

function getSortLabel(sortOption: SortOption) {
  switch (sortOption) {
    case 'date_desc':
      return 'Date récente';
    case 'date_asc':
      return 'Date ancienne';
    case 'marque_asc':
      return 'Marque A-Z';
    case 'marque_desc':
      return 'Marque Z-A';
    default:
      return 'Trier';
  }
}

function formatKilometrage(value?: number | string | null) {
  if (value === null || value === undefined || value === '') return null;

  const numberValue = Number(value);

  if (Number.isNaN(numberValue)) {
    return `${value} km`;
  }

  return `${numberValue.toLocaleString('fr-FR')} km`;
}

function VehiculeCard({ v, styles }: { v: Vehicule; styles: ReturnType<typeof createStyles> }) {
  const dispo = getDisponibiliteConfig(v.disponibilite);
  const statut = getStatutConfig(v.statut);
  const titre = getVehiculeTitre(v);
  const sousTitre = getVehiculeSousTitre(v);
  const kilometrage = formatKilometrage(v.kilometrage_actuel);

  return (
    <Card style={styles.card}>
      <Card.Content style={styles.row}>
        <Avatar.Icon
          size={48}
          icon="car"
          style={{ backgroundColor: '#1565C033' }}
          color="#1565C0"
        />

        <View style={styles.info}>
          <Text variant="titleMedium" style={styles.nom}>
            {titre}
          </Text>

          {!!sousTitre && (
            <Text variant="bodySmall" style={styles.detailText}>
              {sousTitre}
            </Text>
          )}

          {!!v.couleur && (
            <Text variant="bodySmall" style={styles.detailText}>
              Couleur : {v.couleur}
            </Text>
          )}

          {!!v.nombre_place && (
            <Text variant="bodySmall" style={styles.detailText}>
              Places : {v.nombre_place}
            </Text>
          )}

          {!!kilometrage && (
            <Text variant="bodySmall" style={styles.detailText}>
              Kilométrage : {kilometrage}
            </Text>
          )}

          <View style={styles.chips}>
            <Chip
              style={{
                backgroundColor: dispo.couleur + '22',
                alignSelf: 'flex-start',
                marginTop: 4,
              }}
              textStyle={{
                color: dispo.couleur,
                fontSize: 11,
              }}
            >
              {dispo.label}
            </Chip>

            <Chip
              style={{
                backgroundColor: statut.couleur + '22',
                alignSelf: 'flex-start',
                marginTop: 4,
              }}
              textStyle={{
                color: statut.couleur,
                fontSize: 11,
              }}
            >
              {statut.label}
            </Chip>

            {Number(v.nombre_anomalie) > 0 && (
              <Chip
                style={{
                  backgroundColor: '#f4433622',
                  alignSelf: 'flex-start',
                  marginTop: 4,
                }}
                textStyle={{
                  color: '#f44336',
                  fontSize: 11,
                }}
              >
                {v.nombre_anomalie} anomalie
                {Number(v.nombre_anomalie) > 1 ? 's' : ''}
              </Chip>
            )}
          </View>
        </View>
      </Card.Content>
    </Card>
  );
}

export default function Vehicules() {
  const COLORS = useAppColors();
  const styles = createStyles(COLORS);
  const [vehicules, setVehicules] = useState<Vehicule[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('marque_asc');
  const [sortMenuVisible, setSortMenuVisible] = useState(false);

  const fetchVehicules = useCallback(async () => {
    try {
      const data = await vehiculeService.getAll();
      setVehicules(data.items);
      setError(null);
    } catch (e: any) {
      setError(e.message || 'Erreur lors du chargement des véhicules');
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchVehicules();
      setLoading(false);
    })();
  }, [fetchVehicules]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchVehicules();
    setRefreshing(false);
  };

  const filteredVehicules = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const result = vehicules.filter((vehicule) => {
      const searchableText = [
        vehicule.numero_vehicule,
        vehicule.numero_immatriculation,
        vehicule.marque,
        vehicule.modele,
        vehicule.couleur,
        vehicule.disponibilite,
        vehicule.statut,
        vehicule.nombre_place,
        vehicule.kilometrage_actuel,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchableText.includes(query);
    });

    result.sort((a, b) => {
      if (sortOption === 'date_desc') {
        return getVehiculeDateTime(b) - getVehiculeDateTime(a);
      }

      if (sortOption === 'date_asc') {
        return getVehiculeDateTime(a) - getVehiculeDateTime(b);
      }

      if (sortOption === 'marque_asc') {
        return getVehiculeTitre(a).localeCompare(getVehiculeTitre(b));
      }

      if (sortOption === 'marque_desc') {
        return getVehiculeTitre(b).localeCompare(getVehiculeTitre(a));
      }

      return 0;
    });

    return result;
  }, [vehicules, searchQuery, sortOption]);

  const handleSelectSort = (option: SortOption) => {
    setSortOption(option);
    setSortMenuVisible(false);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#f44336" />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#6200ee']}
        />
      }
    >
      <View style={styles.searchAndSortContainer}>
        <TextInput
          mode="outlined"
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Rechercher un véhicule..."
          left={<TextInput.Icon icon="magnify" />}
          right={
            searchQuery ? (
              <TextInput.Icon icon="close" onPress={() => setSearchQuery('')} />
            ) : undefined
          }
          style={styles.searchInput}
          outlineStyle={styles.searchInputOutline}
        />

        <Menu
          visible={sortMenuVisible}
          onDismiss={() => setSortMenuVisible(false)}
          anchor={
            <Button
              mode="outlined"
              icon="sort"
              onPress={() => setSortMenuVisible(true)}
              style={styles.sortButton}
              labelStyle={styles.sortButtonLabel}
            >
              {getSortLabel(sortOption)}
            </Button>
          }
        >
          <Menu.Item
            title="Date récente"
            leadingIcon="sort-calendar-descending"
            onPress={() => handleSelectSort('date_desc')}
          />
          <Menu.Item
            title="Date ancienne"
            leadingIcon="sort-calendar-ascending"
            onPress={() => handleSelectSort('date_asc')}
          />
          <Divider />
          <Menu.Item
            title="Marque A-Z"
            leadingIcon="sort-alphabetical-ascending"
            onPress={() => handleSelectSort('marque_asc')}
          />
          <Menu.Item
            title="Marque Z-A"
            leadingIcon="sort-alphabetical-descending"
            onPress={() => handleSelectSort('marque_desc')}
          />
        </Menu>
      </View>

      <Text style={styles.resultText}>
        {filteredVehicules.length} véhicule
        {filteredVehicules.length > 1 ? 's' : ''} trouvé
        {filteredVehicules.length > 1 ? 's' : ''}
      </Text>

      {filteredVehicules.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="car-search-outline" size={48} color={COLORS.iconMuted} />
          <Text style={styles.emptyText}>
            {searchQuery
              ? 'Aucun véhicule ne correspond à votre recherche'
              : 'Aucun véhicule disponible'}
          </Text>
        </View>
      ) : (
        filteredVehicules.map((v) => <VehiculeCard key={v.id} v={v} styles={styles} />)
      )}
    </ScrollView>
  );
}

const createStyles = (COLORS: AppColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: 5,
  },
  content: {
    padding: 16,
    paddingBottom: 80,
  },
  searchAndSortContainer: {
    gap: 10,
    marginBottom: 8,
  },
  searchInput: {
    backgroundColor: COLORS.inputSurface,
  },
  searchInputOutline: {
    borderRadius: 14,
    borderColor: COLORS.mutedBorder,
  },
  sortButton: {
    alignSelf: 'flex-start',
    borderRadius: 14,
    borderColor: '#1976d2',
    backgroundColor: COLORS.inputSurface,
  },
  sortButtonLabel: {
    color: '#1976d2',
    fontSize: 12,
    fontWeight: '600',
  },
  resultText: {
    marginBottom: 12,
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  card: {
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  info: {
    flex: 1,
  },
  nom: {
    fontWeight: 'bold',
  },
  detailText: {
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  centered: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    color: '#f44336',
    textAlign: 'center',
    paddingHorizontal: 24,
    marginTop: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 12,
    color: COLORS.emptyText,
    fontSize: 15,
    textAlign: 'center',
  },
});