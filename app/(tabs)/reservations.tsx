import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, RefreshControl, ActivityIndicator } from 'react-native';
import { Card, Text, Chip, FAB } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { reservationService, Reservation } from '@/services/reservationService';

// --- Helpers ---
const STATUT_CONFIG: Record<string, { label: string; couleur: string }> = {
  en_attente: { label: 'En attente', couleur: '#ff9800' },
  validee:    { label: 'Validée',    couleur: '#4caf50' },
  terminee:   { label: 'Terminée',   couleur: '#2196f3' },
  annulee:    { label: 'Annulée',    couleur: '#f44336' },
};

function formatDate(iso: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR');
}

function formatHeure(iso: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

// --- Composant carte ---
function ReservationCard({ r }: { r: Reservation }) {
  const statut = STATUT_CONFIG[r.statut] ?? { label: r.statut, couleur: '#999' };

  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.row}>
          <Text variant="titleMedium" style={styles.objet} numberOfLines={1}>
            {r.objet_deplacement}
          </Text>
          <Chip
            style={{ backgroundColor: statut.couleur + '22' }}
            textStyle={{ color: statut.couleur, fontSize: 11 }}
          >
            {statut.label}
          </Chip>
        </View>

        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="map-marker" size={14} color="#666" />
          <Text variant="bodySmall" style={styles.detail}>
            {r.lieu_depart} → {r.destination_itineraire}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="calendar-arrow-right" size={14} color="#666" />
          <Text variant="bodySmall" style={styles.detail}>
            {formatDate(r.date_depart)} à {formatHeure(r.heure_depart)}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="calendar-arrow-left" size={14} color="#666" />
          <Text variant="bodySmall" style={styles.detail}>
            Retour : {formatDate(r.date_retour)} à {formatHeure(r.heure_retour)}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="account-group" size={14} color="#666" />
          <Text variant="bodySmall" style={styles.detail}>
            {r.nombre_passager} passager{r.nombre_passager > 1 ? 's' : ''}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
}

// --- Page principale ---
export default function Reservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);
  const [error, setError]               = useState<string | null>(null);

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
    (async () => {
      setLoading(true);
      await fetchReservations();
      setLoading(false);
    })();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchReservations();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6200ee" />
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

  if (reservations.length === 0) {
    return (
        <>
      <View style={styles.centered}>
        <MaterialCommunityIcons name="calendar-blank-outline" size={48} color="#aaa" />
        <Text style={{ color: '#aaa' }}>Aucune réservation pour le moment</Text>
      </View>
       <FAB
        icon="plus"
        color="#fff"
        style={styles.fab}
        onPress={() => {}}
      />
        </>
      
    );
  }

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6200ee']} />}
      >
        {reservations.map((r) => (
          <ReservationCard key={r.id} r={r} />
        ))}
      </ScrollView>
      <FAB
        icon="plus"
        color="#fff"
        style={styles.fab}
        onPress={() => {}}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: '#f5f5f5', paddingTop: 5 },
  content:    { padding: 16, paddingBottom: 80 },
  card:       { marginBottom: 12 },
  row:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  objet:      { fontWeight: 'bold', flex: 1, marginRight: 8 },
  detailRow:  { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  detail:     { color: '#666', flex: 1 },
  fab:        { position: 'absolute', right: 16, bottom: 16,backgroundColor: '#1976d2'},
  centered:   { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  errorText:  { color: '#f44336', textAlign: 'center', paddingHorizontal: 24 },
});