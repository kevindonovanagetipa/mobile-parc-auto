import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  ActivityIndicator,
  Avatar,
  Button,
  Card,
  Divider,
  List,
  Text,
} from 'react-native-paper';
import { router } from 'expo-router';

import { authService, User } from '@/services/authService';
import { ROUTES } from '@/constants/routes';

const BLUE = '#1565C0';
const BLUE_LIGHT = '#E3F2FD';
const BLUE_DARK = '#0D47A1';

const getInitials = (user?: User | null) => {
  if (!user) return 'U';

  const prenom = user.prenom?.trim()?.charAt(0) || '';
  const nom = user.nom?.trim()?.charAt(0) || '';

  const initials = `${prenom}${nom}`.toUpperCase();

  return initials || 'U';
};

const getFullName = (user?: User | null) => {
  if (!user) return 'Utilisateur';

  const fullName = [user.prenom, user.nom].filter(Boolean).join(' ').trim();

  return fullName || 'Utilisateur';
};

const formatPrivilege = (privilege?: string) => {
  if (!privilege) return 'Non renseigné';

  if (privilege === 'admin') return 'Administrateur';
  if (privilege === 'utilisateur') return 'Utilisateur';

  return privilege;
};

export default function ProfilUtilisateur() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadProfile = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);

      const localUser = await authService.getLocalUser();

      if (localUser && showLoader) {
        setUser(localUser);
      }

      const currentUser = await authService.getMe();

      setUser(currentUser);
    } catch (error: any) {
      console.log('Erreur profil utilisateur :', error);

      Alert.alert(
        'Erreur',
        error.message || 'Impossible de charger le profil utilisateur'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadProfile(false);
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();

      router.replace(ROUTES.LOGIN);
    } catch (error) {
      console.log('Erreur lors de la déconnexion :', error);
      Alert.alert('Erreur', 'Impossible de se déconnecter');
    }
  };

  if (loading && !user) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={BLUE} />
        <Text style={styles.loadingText}>Chargement du profil...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Card style={styles.headerCard}>
        <Card.Content style={styles.headerContent}>
          <Avatar.Text
            size={82}
            label={getInitials(user)}
            style={styles.avatar}
            labelStyle={styles.avatarLabel}
          />

          <Text variant="titleLarge" style={styles.name}>
            {getFullName(user)}
          </Text>

          <Text variant="bodyMedium" style={styles.email}>
            {user?.email || 'Email non renseigné'}
          </Text>

          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {formatPrivilege(user?.privilege)}
            </Text>
          </View>
        </Card.Content>
      </Card>

      <View style={styles.section}>
        <Text variant="labelLarge" style={styles.sectionTitle}>
          INFORMATIONS DU COMPTE
        </Text>

        <Card style={styles.card}>
          <List.Item
            title="Nom"
            description={user?.nom || 'Non renseigné'}
            left={(props) => (
              <List.Icon {...props} icon="account" color={BLUE} />
            )}
          />

          <Divider />

          <List.Item
            title="Prénom"
            description={user?.prenom || 'Non renseigné'}
            left={(props) => (
              <List.Icon {...props} icon="account-outline" color={BLUE} />
            )}
          />

          <Divider />

          <List.Item
            title="Email"
            description={user?.email || 'Non renseigné'}
            left={(props) => (
              <List.Icon {...props} icon="email-outline" color={BLUE} />
            )}
          />

          <Divider />

          <List.Item
            title="Fonction"
            description={user?.fonction || 'Non renseignée'}
            left={(props) => (
              <List.Icon {...props} icon="briefcase-outline" color={BLUE} />
            )}
          />

          <Divider />

          <List.Item
            title="Privilège"
            description={formatPrivilege(user?.privilege)}
            left={(props) => (
              <List.Icon {...props} icon="shield-account" color={BLUE} />
            )}
          />
        </Card>
      </View>

      <View style={styles.section}>
        <Text variant="labelLarge" style={styles.sectionTitle}>
          STATUT
        </Text>

        <Card style={styles.card}>
          <List.Item
            title="État du compte"
            description={user?.etat_compte || user?.status || 'Actif'}
            left={(props) => (
              <List.Icon {...props} icon="check-circle-outline" color="#4CAF50" />
            )}
          />

          {user?.created_at ? (
            <>
              <Divider />

              <List.Item
                title="Date de création"
                description={user.created_at}
                left={(props) => (
                  <List.Icon {...props} icon="calendar" color={BLUE} />
                )}
              />
            </>
          ) : null}
        </Card>
      </View>

      <Button
        mode="outlined"
        icon="refresh"
        onPress={() => loadProfile()}
        style={styles.refreshButton}
        textColor={BLUE_DARK}
        disabled={loading || refreshing}
      >
        Actualiser le profil
      </Button>

      <Button
        mode="contained"
        icon="logout"
        onPress={handleLogout}
        style={styles.logoutButton}
        buttonColor="#f44336"
      >
        Se déconnecter
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BLUE_LIGHT,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  centered: {
    flex: 1,
    backgroundColor: BLUE_LIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: BLUE_DARK,
  },
  headerCard: {
    borderRadius: 18,
    marginBottom: 22,
    backgroundColor: '#ffffff',
    elevation: 4,
  },
  headerContent: {
    alignItems: 'center',
    paddingVertical: 28,
  },
  avatar: {
    backgroundColor: BLUE,
    marginBottom: 14,
  },
  avatarLabel: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  name: {
    color: BLUE_DARK,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  email: {
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  badge: {
    marginTop: 12,
    backgroundColor: BLUE_LIGHT,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    color: BLUE_DARK,
    fontWeight: '700',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#666',
    marginBottom: 6,
    marginLeft: 4,
  },
  card: {
    borderRadius: 14,
    backgroundColor: '#ffffff',
  },
  refreshButton: {
    borderRadius: 10,
    marginBottom: 12,
    borderColor: BLUE,
  },
  logoutButton: {
    borderRadius: 10,
  },
});