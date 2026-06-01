import { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Card, Text, Chip, FAB } from 'react-native-paper';
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

  if (reservations.length === 0) {
    return (
      <>
        <View style={styles.centered}>
          <MaterialCommunityIcons
            name="calendar-blank-outline"
            size={48}
            color={COLORS.textSecondary}
          />
          <Text style={styles.emptyText}>Aucune réservation pour le moment</Text>
        </View>

        <FAB
          icon="plus"
          color={COLORS.surface}
          style={styles.fab}
          onPress={goToAddReservation}
        />
      </>
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
        {reservations.map((r) => (
          <ReservationCard key={r.id} r={r} />
        ))}
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
  emptyText: {
    color: COLORS.textSecondary,
    marginTop: 8,
  },
});