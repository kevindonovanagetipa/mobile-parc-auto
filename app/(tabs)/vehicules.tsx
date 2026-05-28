import { ScrollView, StyleSheet } from 'react-native';
import { Card, Text, Chip, FAB } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const vehicules = [
  { id: 1, immatriculation: 'AB-123-CD', type: 'Berline', statut: 'Disponible', couleur: '#4caf50' },
  { id: 2, immatriculation: 'EF-456-GH', type: 'SUV', statut: 'En course', couleur: '#ff9800' },
  { id: 3, immatriculation: 'IJ-789-KL', type: 'Minibus', statut: 'En maintenance', couleur: '#f44336' },
];

export default function Vehicules() {
  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text variant="headlineMedium" style={styles.title}>Véhicules</Text>
        {vehicules.map((v) => (
          <Card key={v.id} style={styles.card}>
            <Card.Content style={styles.row}>
              <MaterialCommunityIcons name="car" size={40} color="#6200ee" />
              <View style={styles.info}>
                <Text variant="titleMedium" style={styles.immat}>{v.immatriculation}</Text>
                <Text variant="bodySmall" style={styles.type}>{v.type}</Text>
                <Chip
                  style={[styles.chip, { backgroundColor: v.couleur + '22' }]}
                  textStyle={{ color: v.couleur, fontSize: 11 }}
                >
                  {v.statut}
                </Chip>
              </View>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>
      <FAB icon="plus" style={styles.fab} onPress={() => {}} />
    </>
  );
}

import { View } from 'react-native';
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 16, paddingBottom: 80 },
  title: { fontWeight: 'bold', marginBottom: 16 },
  card: { marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  info: { flex: 1 },
  immat: { fontWeight: 'bold' },
  type: { color: '#666', marginBottom: 6 },
  chip: { alignSelf: 'flex-start' },
  fab: { position: 'absolute', right: 16, bottom: 16, backgroundColor: '#6200ee' },
});