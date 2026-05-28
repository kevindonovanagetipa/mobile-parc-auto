import { ScrollView, StyleSheet, View } from 'react-native';
import { Card, Text, List } from 'react-native-paper';
import { router } from 'expo-router';
import { ROUTES } from '@/constants/routes';

const sections = [
  {
    titre: 'Gestion',
    items: [
      { label: 'Courses', icon: 'map-marker-path', route: '/courses' },
      { label: 'Déplacements', icon: 'car-arrow-right', route: '/deplacements' },
      { label: 'Périodiques', icon: 'repeat', route: '/periodiques' },
    ],
  },
  {
    titre: 'Maintenance',
    items: [
      { label: 'Réparations', icon: 'wrench', route: '/reparations' },
      { label: 'Carburant', icon: 'gas-station', route: '/carburant' },
      { label: 'Kilométrage', icon: 'speedometer', route: '/kilometrage' },
    ],
  },
  {
    titre: 'Administration',
    items: [
      { label: 'Utilisateurs', icon: 'account-group', route: '/utilisateurs' },
      { label: 'Types de véhicules', icon: 'car-info', route: '/types-vehicules' },
    ],
  },
];

export default function More() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text variant="headlineMedium" style={styles.title}>Plus</Text>
      {sections.map((section) => (
        <View key={section.titre} style={styles.section}>
          <Text variant="labelLarge" style={styles.sectionTitle}>{section.titre.toUpperCase()}</Text>
          <Card>
            {section.items.map((item, index) => (
              <List.Item
                key={item.label}
                title={item.label}
                left={(props) => <List.Icon {...props} icon={item.icon} />}
                right={(props) => <List.Icon {...props} icon="chevron-right" />}
                onPress={() => {}}
                style={index < section.items.length - 1 ? styles.itemBorder : undefined}
              />
            ))}
          </Card>
        </View>
      ))}

      <Card style={styles.logoutCard}>
        <List.Item
          title="Se déconnecter"
          titleStyle={{ color: '#f44336' }}
          left={(props) => <List.Icon {...props} icon="logout" color="#f44336" />}
          onPress={() => router.replace(ROUTES.LOGIN)}
        />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 16, paddingBottom: 32 },
  title: { fontWeight: 'bold', marginBottom: 16 },
  section: { marginBottom: 20 },
  sectionTitle: { color: '#666', marginBottom: 6, marginLeft: 4 },
  itemBorder: { borderBottomWidth: 0.5, borderBottomColor: '#eee' },
  logoutCard: { marginTop: 8 },
});