import { ScrollView, StyleSheet, View } from 'react-native';
import { Card, Text, Chip, FAB } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const reservations = [
  { id: 1, client: 'Jean Dupont', vehicule: 'AB-123-CD', date: '28/05/2026', statut: 'Confirmée', couleur: '#4caf50' },
  { id: 2, client: 'Marie Martin', vehicule: 'EF-456-GH', date: '29/05/2026', statut: 'En attente', couleur: '#ff9800' },
  { id: 3, client: 'Paul Bernard', vehicule: 'IJ-789-KL', date: '30/05/2026', statut: 'Annulée', couleur: '#f44336' },
];

export default function Reservations() {
  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {reservations.map((r) => (
          <Card key={r.id} style={styles.card}>
            <Card.Content>
              <View style={styles.row}>
                <Text variant="titleMedium" style={styles.client}>{r.client}</Text>
                <Chip
                  style={{ backgroundColor: r.couleur + '22' }}
                  textStyle={{ color: r.couleur, fontSize: 11 }}
                >
                  {r.statut}
                </Chip>
              </View>
              <View style={styles.detailRow}>
                <MaterialCommunityIcons name="car" size={14} color="#666" />
                <Text variant="bodySmall" style={styles.detail}>{r.vehicule}</Text>
              </View>
              <View style={styles.detailRow}>
                <MaterialCommunityIcons name="calendar" size={14} color="#666" />
                <Text variant="bodySmall" style={styles.detail}>{r.date}</Text>
              </View>
            </Card.Content>
          </Card>
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
  container: { flex: 1, backgroundColor: '#f5f5f5' , paddingTop: 40},
  content: { padding: 16, paddingBottom: 80 },
  title: { fontWeight: 'bold', marginBottom: 16 },
  card: { marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  client: { fontWeight: 'bold' },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  detail: { color: '#666' },
  fab: { position: 'absolute', right: 16, bottom: 16, backgroundColor: '#6200ee' },
});