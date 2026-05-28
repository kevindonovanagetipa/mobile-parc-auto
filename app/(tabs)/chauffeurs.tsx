import { ScrollView, StyleSheet, View } from 'react-native';
import { Card, Text, Avatar, Chip, FAB } from 'react-native-paper';

const chauffeurs = [
  { id: 1, nom: 'Jean Rakoto', telephone: '+261 34 00 000 01', statut: 'Disponible', couleur: '#4caf50' },
  { id: 2, nom: 'Hery Andria', telephone: '+261 34 00 000 02', statut: 'En course', couleur: '#ff9800' },
  { id: 3, nom: 'Fara Rabe',   telephone: '+261 34 00 000 03', statut: 'Congé', couleur: '#9e9e9e' },
];

export default function Chauffeurs() {
  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {chauffeurs.map((c) => (
          <Card key={c.id} style={styles.card}>
            <Card.Content style={styles.row}>
              <Avatar.Text size={48} label={c.nom.slice(0, 2).toUpperCase()} />
              <View style={styles.info}>
                <Text variant="titleMedium" style={styles.nom}>{c.nom}</Text>
                <Text variant="bodySmall" style={styles.tel}>{c.telephone}</Text>
                <Chip
                  style={{ backgroundColor: c.couleur + '22', alignSelf: 'flex-start', marginTop: 4 }}
                  textStyle={{ color: c.couleur, fontSize: 11 }}
                >
                  {c.statut}
                </Chip>
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
  container: { flex: 1, backgroundColor: '#f5f5f5', paddingTop: 40 },
  content: { padding: 16, paddingBottom: 80 },
  title: { fontWeight: 'bold', marginBottom: 16 },
  card: { marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  info: { flex: 1 },
  nom: { fontWeight: 'bold' },
  tel: { color: '#666' },
  fab: { position: 'absolute', right: 16, bottom: 16, backgroundColor: '#6200ee' },
});