import { ScrollView, StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const stats = [
  { label: 'Véhicules', value: '12', icon: 'car', color: '#6200ee' },
  { label: 'Chauffeurs', value: '8', icon: 'account-tie', color: '#03dac6' },
  { label: 'Réservations', value: '24', icon: 'calendar', color: '#ff6d00' },
  { label: 'Courses', value: '5', icon: 'map-marker-path', color: '#d50000' },
];

export default function Dashboard() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.grid}>
        {stats.map((stat) => (
          <Card key={stat.label} style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <MaterialCommunityIcons name={stat.icon as any} size={32} color={stat.color} />
              <Text variant="headlineMedium" style={styles.value}>{stat.value}</Text>
              <Text variant="bodySmall" style={styles.label}>{stat.label}</Text>
            </Card.Content>
          </Card>
        ))}
      </View>

      <Text variant="titleMedium" style={styles.sectionTitle}>Activité récente</Text>
      {[1, 2, 3].map((i) => (
        <Card key={i} style={styles.activityCard}>
          <Card.Content style={styles.activityRow}>
            <MaterialCommunityIcons name="circle" size={10} color="#6200ee" />
            <Text variant="bodyMedium" style={styles.activityText}>
              Réservation #{i} — Véhicule AB-{i}23-CD
            </Text>
          </Card.Content>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', paddingTop: 40 },
  content: { padding: 16 },
  title: { fontWeight: 'bold', marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  card: { width: '47%' },
  cardContent: { alignItems: 'center', paddingVertical: 12 },
  value: { fontWeight: 'bold', marginTop: 8 },
  label: { color: '#666', marginTop: 4 },
  sectionTitle: { fontWeight: 'bold', marginBottom: 12 },
  activityCard: { marginBottom: 8 },
  activityRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  activityText: { flex: 1 },
});