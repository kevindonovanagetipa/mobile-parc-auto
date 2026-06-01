import { useEffect, useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import {
  Card,
  Text,
  Chip,
  FAB,
  TextInput,
  Button,
  Menu,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { ROUTES } from '@/constants/routes';
import { COLORS } from '@/constants/colors';
import { reservationService, Reservation } from '@/services/reservationService';

const STATUT_CONFIG: Record<string, { label: string; couleur: string }> = {
  en_attente: { label: 'En attente', couleur: COLORS.warning },
  validee: { label: 'Validée', couleur: COLORS.success },
  terminee: { label: 'Terminée', couleur: COLORS.info },
  annulee: { label: 'Annulée', couleur: COLORS.error },
};

type SortOption = 'date_desc' | 'date_asc' | 'nom_asc' | 'nom_desc';

function formatDate(iso: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR');
}

function formatHeure(iso: string) {
  if (!iso) return '—';

  return new Date(iso).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getReservationDateTime(reservation: Reservation) {
  const date =
    reservation.date_depart ||
    reservation.created_at ||
    '';

  if (!date) return 0;

  const time = new Date(date).getTime();

  return Number.isNaN(time) ? 0 : time;
}

function getReservationName(reservation: Reservation) {
  return reservation.objet_deplacement || '';
}

function getSortLabel(sortOption: SortOption) {
  switch (sortOption) {
    case 'date_desc':
      return 'Date récente';
    case 'date_asc':
      return 'Date ancienne';
    case 'nom_asc':
      return 'Nom A-Z';
    case 'nom_desc':
      return 'Nom Z-A';
    default:
      return 'Trier';
  }
}

function getStatutLabel(statut: string) {
  return STATUT_CONFIG[statut]?.label ?? statut;
}

function ReservationCard({ r }: { r: Reservation }) {
  const statut = STATUT_CONFIG[r.statut] ?? {
    label: r.statut,
    couleur: COLORS.textSecondary,
  };

  const goToUpdateReservation = () => {
    router.push({
      pathname: '/(tabs)/reservations/modifier/[id]',
      params: { id: r.id },
    });
  };

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={goToUpdateReservation}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.row}>
            <Text variant="titleMedium" style={styles.objet} numberOfLines={1}>
              {r.objet_deplacement}
            </Text>

            <Chip
              style={{ backgroundColor: `${statut.couleur}22` }}
              textStyle={{ color: statut.couleur, fontSize: 11 }}
            >
              {statut.label}
            </Chip>
          </View>

          <View style={styles.detailRow}>
            <MaterialCommunityIcons
              name="map-marker"
              size={14}
              color={COLORS.textSecondary}
            />
            <Text variant="bodySmall" style={styles.detail}>
              {r.lieu_depart} → {r.destination_itineraire}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <MaterialCommunityIcons
              name="calendar-arrow-right"
              size={14}
              color={COLORS.textSecondary}
            />
            <Text variant="bodySmall" style={styles.detail}>
              {formatDate(r.date_depart)} à {formatHeure(r.heure_depart)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <MaterialCommunityIcons
              name="calendar-arrow-left"
              size={14}
              color={COLORS.textSecondary}
            />
            <Text variant="bodySmall" style={styles.detail}>
              Retour : {formatDate(r.date_retour)} à {formatHeure(r.heure_retour)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <MaterialCommunityIcons
              name="account-group"
              size={14}
              color={COLORS.textSecondary}
            />
            <Text variant="bodySmall" style={styles.detail}>
              {r.nombre_passager} passager{r.nombre_passager > 1 ? 's' : ''}
            </Text>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
}

export default function Reservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('date_desc');
  const [sortMenuVisible, setSortMenuVisible] = useState(false);

  const fetchReservations = async () => {
    try {
      const data = await reservationService.getMesReservations();
      setReservations(data);
      setError(null);
    } catch (e: any) {
      setError(e.message);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchReservations();
      setLoading(false);
    };

    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchReservations();
    setRefreshing(false);
  };

  const goToAddReservation = () => {
    router.push(ROUTES.ADD_RESERVATION);
  };

  const filteredReservations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const result = reservations.filter((reservation) => {
      const searchableText = [
        reservation.objet_deplacement,
        reservation.lieu_depart,
        reservation.destination_itineraire,
        reservation.passagers,
        reservation.nombre_passager?.toString(),
        getStatutLabel(reservation.statut),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchableText.includes(query);
    });

    result.sort((a, b) => {
      if (sortOption === 'date_desc') {
        return getReservationDateTime(b) - getReservationDateTime(a);
      }

      if (sortOption === 'date_asc') {
        return getReservationDateTime(a) - getReservationDateTime(b);
      }

      if (sortOption === 'nom_asc') {
        return getReservationName(a).localeCompare(getReservationName(b));
      }

      if (sortOption === 'nom_desc') {
        return getReservationName(b).localeCompare(getReservationName(a));
      }

      return 0;
    });

    return result;
  }, [reservations, searchQuery, sortOption]);

  const handleSelectSort = (option: SortOption) => {
    setSortOption(option);
    setSortMenuVisible(false);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <MaterialCommunityIcons
          name="alert-circle-outline"
          size={48}
          color={COLORS.error}
        />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        }
      >
        <View style={styles.searchAndSortContainer}>
          <TextInput
            mode="outlined"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Rechercher une réservation..."
            left={<TextInput.Icon icon="magnify" />}
            right={
              searchQuery ? (
                <TextInput.Icon
                  icon="close"
                  onPress={() => setSearchQuery('')}
                />
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

            <Menu.Item
              title="Nom A-Z"
              leadingIcon="sort-alphabetical-ascending"
              onPress={() => handleSelectSort('nom_asc')}
            />

            <Menu.Item
              title="Nom Z-A"
              leadingIcon="sort-alphabetical-descending"
              onPress={() => handleSelectSort('nom_desc')}
            />
          </Menu>
        </View>

        <Text style={styles.resultText}>
          {filteredReservations.length} réservation
          {filteredReservations.length > 1 ? 's' : ''} trouvée
          {filteredReservations.length > 1 ? 's' : ''}
        </Text>

        {filteredReservations.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="calendar-blank-outline"
              size={48}
              color={COLORS.textSecondary}
            />

            <Text style={styles.emptyText}>
              {searchQuery
                ? 'Aucune réservation ne correspond à votre recherche'
                : 'Aucune réservation pour le moment'}
            </Text>
          </View>
        ) : (
          filteredReservations.map((r) => (
            <ReservationCard key={r.id} r={r} />
          ))
        )}
      </ScrollView>

      <FAB
        icon="plus"
        color={COLORS.surface}
        style={styles.fab}
        onPress={goToAddReservation}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 5,
    backgroundColor: COLORS.background,
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
    flex: 1,
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
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },

  card: {
    marginBottom: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  objet: {
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
    color: COLORS.text,
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },

  detail: {
    color: COLORS.textSecondary,
    flex: 1,
  },

  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: COLORS.primary,
  },

  centered: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },

  errorText: {
    color: COLORS.error,
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
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
});