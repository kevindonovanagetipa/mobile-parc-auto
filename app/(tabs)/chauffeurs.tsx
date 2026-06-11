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
import { chauffeurService, Chauffeur } from '@/services/chauffeurService';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const BLUE_LIGHT = '#e6fde3';

type SortOption = 'date_desc' | 'date_asc' | 'nom_asc' | 'nom_desc';

const DISPO_CONFIG: Record<string, { couleur: string }> = {
  Disponible:   { couleur: '#4caf50' },
  disponible:   { couleur: '#4caf50' },
  'En course':  { couleur: '#ff9800' },
  en_course:    { couleur: '#ff9800' },
  Congé:        { couleur: '#9e9e9e' },
  conge:        { couleur: '#9e9e9e' },
  Indisponible: { couleur: '#f44336' },
};

function getCouleur(disponibilite: string) {
  return DISPO_CONFIG[disponibilite]?.couleur ?? '#9e9e9e';
}

function getInitiales(nom: string, prenom: string) {
  return `${nom?.[0] ?? ''}${prenom?.[0] ?? ''}`.toUpperCase();
}

function getNomComplet(chauffeur: Chauffeur) {
  return `${chauffeur.nom ?? ''} ${chauffeur.prenom ?? ''}`.trim();
}

function getChauffeurDateTime(chauffeur: Chauffeur) {
  const date = chauffeur.created_at || chauffeur.updated_at || '';
  if (!date) return 0;
  const time = new Date(date).getTime();
  return Number.isNaN(time) ? 0 : time;
}

function getSortLabel(sortOption: SortOption) {
  switch (sortOption) {
    case 'date_desc': return 'Date récente';
    case 'date_asc':  return 'Date ancienne';
    case 'nom_asc':   return 'Nom A-Z';
    case 'nom_desc':  return 'Nom Z-A';
    default:          return 'Trier';
  }
}

function ChauffeurCard({ c }: { c: Chauffeur }) {
  const couleur = getCouleur(c.disponibilite);
  const nomComplet = getNomComplet(c);

  return (
    <Card style={styles.card}>
      <Card.Content style={styles.row}>
        <Avatar.Text
          size={48}
          label={getInitiales(c.nom, c.prenom)}
          style={{ backgroundColor: '#1565C033' }}
          color="#1565C0"
        />
        <View style={styles.info}>
          <Text variant="titleMedium" style={styles.nom}>{nomComplet}</Text>
          {!!c.telephone && (
            <Text variant="bodySmall" style={styles.tel}>{c.telephone}</Text>
          )}
          {!!c.email && (
            <Text variant="bodySmall" style={styles.tel}>{c.email}</Text>
          )}
          <View style={styles.chips}>
            <Chip
              style={{ backgroundColor: couleur + '22', alignSelf: 'flex-start', marginTop: 4 }}
              textStyle={{ color: couleur, fontSize: 11 }}
            >
              {c.disponibilite}
            </Chip>
            {!!c.categorie_permis && (
              <Chip
                style={{ backgroundColor: '#6200ee22', alignSelf: 'flex-start', marginTop: 4 }}
                textStyle={{ color: '#6200ee', fontSize: 11 }}
              >
                Permis {c.categorie_permis}
              </Chip>
            )}
          </View>
        </View>
      </Card.Content>
    </Card>
  );
}

export default function Chauffeurs() {
  const [chauffeurs, setChauffeurs] = useState<Chauffeur[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('nom_asc');
  const [sortMenuVisible, setSortMenuVisible] = useState(false);

  const fetchChauffeurs = useCallback(async () => {
    try {
      const data = await chauffeurService.getAll();
      setChauffeurs(data.items);
      setError(null);
    } catch (e: any) {
      setError(e.message);
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchChauffeurs();
      setLoading(false);
    })();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchChauffeurs();
    setRefreshing(false);
  };

  const filteredChauffeurs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const result = chauffeurs.filter((chauffeur) => {
      const searchableText = [
        chauffeur.nom,
        chauffeur.prenom,
        chauffeur.telephone,
        chauffeur.email,
        chauffeur.disponibilite,
        chauffeur.categorie_permis,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return searchableText.includes(query);
    });

    result.sort((a, b) => {
      if (sortOption === 'date_desc') return getChauffeurDateTime(b) - getChauffeurDateTime(a);
      if (sortOption === 'date_asc')  return getChauffeurDateTime(a) - getChauffeurDateTime(b);
      if (sortOption === 'nom_asc')   return getNomComplet(a).localeCompare(getNomComplet(b));
      if (sortOption === 'nom_desc')  return getNomComplet(b).localeCompare(getNomComplet(a));
      return 0;
    });

    return result;
  }, [chauffeurs, searchQuery, sortOption]);

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
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6200ee']} />
      }
    >
      <View style={styles.searchAndSortContainer}>
        <TextInput
          mode="outlined"
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Rechercher un chauffeur..."
          left={<TextInput.Icon icon="magnify" />}
          right={
            searchQuery
              ? <TextInput.Icon icon="close" onPress={() => setSearchQuery('')} />
              : undefined
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
          <Menu.Item title="Date récente"  leadingIcon="sort-calendar-descending"   onPress={() => handleSelectSort('date_desc')} />
          <Menu.Item title="Date ancienne" leadingIcon="sort-calendar-ascending"    onPress={() => handleSelectSort('date_asc')} />
          <Divider />
          <Menu.Item title="Nom A-Z"       leadingIcon="sort-alphabetical-ascending"  onPress={() => handleSelectSort('nom_asc')} />
          <Menu.Item title="Nom Z-A"       leadingIcon="sort-alphabetical-descending" onPress={() => handleSelectSort('nom_desc')} />
        </Menu>
      </View>

      <Text style={styles.resultText}>
        {filteredChauffeurs.length} chauffeur
        {filteredChauffeurs.length > 1 ? 's' : ''} disponible
        {filteredChauffeurs.length > 1 ? 's' : ''}
      </Text>

      {filteredChauffeurs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="account-search-outline" size={48} color="#999" />
          <Text style={styles.emptyText}>
            {searchQuery
              ? 'Aucun chauffeur ne correspond à votre recherche'
              : 'Aucun chauffeur disponible'}
          </Text>
        </View>
      ) : (
        filteredChauffeurs.map((c) => <ChauffeurCard key={c.id} c={c} />)
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BLUE_LIGHT,
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
    backgroundColor: '#ffffff',
  },
  searchInputOutline: {
    borderRadius: 14,
    borderColor: '#d6e4f0',
  },
  sortButton: {
    alignSelf: 'flex-start',
    borderRadius: 14,
    borderColor: '#1976d2',
    backgroundColor: '#ffffff',
  },
  sortButtonLabel: {
    color: '#1976d2',
    fontSize: 12,
    fontWeight: '600',
  },
  resultText: {
    marginBottom: 12,
    color: '#607d8b',
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
  tel: {
    color: '#666',
    marginTop: 2,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  centered: {
    flex: 1,
    backgroundColor: BLUE_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    color: '#f44336',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 12,
    color: '#777',
    fontSize: 15,
    textAlign: 'center',
  },
});