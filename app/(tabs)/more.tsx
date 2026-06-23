import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Card, Text, List, ActivityIndicator } from 'react-native-paper';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ROUTES } from '@/constants/routes';
import { COLORS } from '@/constants/colors';

type User = {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  privilege: string;
};

const sections = [
  {
    titre: 'Compte',
    adminOnly: false,
    items: [
      { label: 'Profil utilisateur', icon: 'account-circle', route: '/profil' },
    ],
  },
  {
    titre: 'Gestion',
    adminOnly: false,
    items: [
      { label: 'Véhicules', icon: 'car', route: '/vehicules' },
    ],
  },
  {
    titre: 'Maintenance',
    adminOnly: true,
    items: [
      { label: 'Déplacements', icon: 'car-arrow-right', route: '/deplacements' },
      { label: 'Périodiques', icon: 'repeat', route: '/periodiques' },
      { label: 'Réparations', icon: 'wrench', route: '/reparations' },
      { label: 'Carburant', icon: 'gas-station', route: '/carburant' },
      { label: 'Kilométrage', icon: 'speedometer', route: '/kilometrage' },
    ],
  },
  {
    titre: 'Administration',
    adminOnly: true,
    items: [
      { label: 'Utilisateurs', icon: 'account-group', route: '/utilisateurs' },
      { label: 'Types de véhicules', icon: 'car-info', route: '/types-vehicules' },
    ],
  },
];

export default function More() {
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const rawUser = await AsyncStorage.getItem('user');

        if (rawUser) {
          setUser(JSON.parse(rawUser));
        }
      } catch (error) {
        console.log('Erreur lecture utilisateur :', error);
      } finally {
        setLoadingUser(false);
      }
    };

    loadUser();
  }, []);

  const isAdmin = user?.privilege === 'admin';

  const visibleSections = sections.filter((section) => {
    if (section.adminOnly) {
      return isAdmin;
    }

    return true;
  });

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');

      router.replace(ROUTES.LOGIN);
    } catch (error) {
      console.log('Erreur lors de la déconnexion :', error);
    }
  };

  if (loadingUser) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />

        <Text style={styles.loadingText}>
          Chargement...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {visibleSections.map((section) => (
        <View key={section.titre} style={styles.section}>
          <Text variant="labelLarge" style={styles.sectionTitle}>
            {section.titre.toUpperCase()}
          </Text>

          <Card style={styles.card}>
            {section.items.map((item, index) => (
              <List.Item
                key={item.label}
                title={item.label}
                titleStyle={styles.itemTitle}
                left={(props) => (
                  <List.Icon
                    {...props}
                    icon={item.icon}
                    color={COLORS.primary}
                  />
                )}
                right={(props) => (
                  <List.Icon
                    {...props}
                    icon="chevron-right"
                    color={COLORS.textSecondary}
                  />
                )}
                onPress={() => router.push(item.route as any)}
                style={
                  index < section.items.length - 1
                    ? styles.itemBorder
                    : undefined
                }
              />
            ))}
          </Card>
        </View>
      ))}

      <Card style={styles.logoutCard}>
        <List.Item
          title="Se déconnecter"
          titleStyle={styles.logoutTitle}
          left={(props) => (
            <List.Icon
              {...props}
              icon="logout"
              color={COLORS.error}
            />
          )}
          onPress={handleLogout}
        />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: 5,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  centered: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingVertical: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    color: COLORS.primaryDark,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 16,
    color: COLORS.primaryDark,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: COLORS.textSecondary,
    marginBottom: 6,
    marginLeft: 4,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
  },
  itemTitle: {
    color: COLORS.text,
  },
  itemBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  logoutCard: {
    marginTop: 8,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
  },
  logoutTitle: {
    color: COLORS.error,
  },
});