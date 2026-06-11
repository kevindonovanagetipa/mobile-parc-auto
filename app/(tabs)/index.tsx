import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Card, Text, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { API_BASE_URL } from '@/constants/api';
import { COLORS } from '@/constants/colors';

type DashboardStats = {
  totalVehicules: number;
  vehiculesDisponibles: number;
  vehiculesIndisponibles: number;
  vehiculesEnReparation: number;
  totalReservations: number;
  reservationsEnAttente: number;
  reservationsValidees: number;
  totalChauffeurs: number;
  chauffeursDisponibles: number;
  totalCourses: number;
  coursesEnCours: number;
  totalCarburantMois: number;
  totalReparations: number;
};

type StatCardItem = {
  label: string;
  value: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
};

type QuickActionItem = {
  label: string;
  description: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
  route: string;
};

export default function Dashboard() {
  const [stats, setStats] = useState<StatCardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const quickActions: QuickActionItem[] = [
    {
      label: 'Mes réservations',
      description: 'Voir vos demandes de réservation',
      icon: 'calendar-check',
      color: '#ff6d00',
      route: '/reservations',
    },
    {
      label: 'Mes courses',
      description: 'Consulter vos courses',
      icon: 'map-marker-path',
      color: '#d50000',
      route: '/courses',
    },
    {
      label: 'Notifications',
      description: 'Voir les dernières notifications',
      icon: 'bell-outline',
      color: '#1565c0',
      route: '/notifications',
    },
    {
      label: 'Nouvelle réservation',
      description: 'Créer une demande rapidement',
      icon: 'plus-circle',
      color: '#2e7d32',
      route: '/reservations/ajout',
    },
  ];

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError('');

      const token = await AsyncStorage.getItem('token');

      if (!token) {
        setError('Token introuvable. Veuillez vous reconnecter.');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/dashboard/stats`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          setError('Session expirée ou non autorisée. Veuillez vous reconnecter.');
        } else {
          setError(
            result.message ||
              'Impossible de charger les statistiques du tableau de bord.'
          );
        }

        return;
      }

      if (result.success) {
        const data: DashboardStats = result.data;

        const statsFormatees: StatCardItem[] = [
          {
            label: 'Véhicules',
            value: String(data.totalVehicules ?? 0),
            icon: 'car',
            color: '#3e0096',
          },
          {
            label: 'Chauffeurs',
            value: String(data.totalChauffeurs ?? 0),
            icon: 'account-tie',
            color: '#000b68',
          },
          {
            label: 'Réservations',
            value: String(data.totalReservations ?? 0),
            icon: 'calendar',
            color: '#ff6d00',
          },
          {
            label: 'Courses',
            value: String(data.totalCourses ?? 0),
            icon: 'map-marker-path',
            color: '#d50000',
          },
        ];

        setStats(statsFormatees);
      } else {
        setError(result.message || 'Erreur lors du chargement des statistiques.');
      }
    } catch (err) {
      console.log('Erreur API dashboard mobile :', err);
      setError('Impossible de contacter le serveur.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Chargement des statistiques...</Text>
        </View>
      )}

      {!loading && error !== '' && (
        <Card style={styles.errorCard}>
          <Card.Content>
            <Text style={styles.errorText}>{error}</Text>
          </Card.Content>
        </Card>
      )}

      {!loading && error === '' && (
        <>
          <View style={styles.grid}>
            {stats.map((stat) => (
              <Card key={stat.label} style={styles.card}>
                <Card.Content style={styles.cardContent}>
                  <MaterialCommunityIcons
                    name={stat.icon}
                    size={32}
                    color={stat.color}
                  />

                  <Text variant="headlineMedium" style={styles.value}>
                    {stat.value}
                  </Text>

                  <Text variant="bodySmall" style={styles.label}>
                    {stat.label}
                  </Text>
                </Card.Content>
              </Card>
            ))}
          </View>

          <Text variant="titleMedium" style={styles.sectionTitle}>
            Actions rapides
          </Text>

          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <Card
                key={action.label}
                style={styles.quickActionCard}
                onPress={() => router.push(action.route as never)}
              >
                <Card.Content style={styles.quickActionContent}>
                  <View
                    style={[
                      styles.quickActionIconContainer,
                      { backgroundColor: action.color + '20' },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={action.icon}
                      size={24}
                      color={action.color}
                    />
                  </View>

                  <View style={styles.quickActionTextContainer}>
                    <Text variant="titleSmall" style={styles.quickActionTitle}>
                      {action.label}
                    </Text>

                    <Text variant="bodySmall" style={styles.quickActionDescription}>
                      {action.description}
                    </Text>
                  </View>

                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={22}
                    color={COLORS.textSecondary}
                  />
                </Card.Content>
              </Card>
            ))}
          </View>
        </>
      )}
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
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  card: {
    width: '47%',
    borderRadius: 14,
    backgroundColor: COLORS.surface,
  },
  cardContent: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  value: {
    fontWeight: 'bold',
    marginTop: 8,
    color: COLORS.text,
  },
  label: {
    color: COLORS.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
    color: COLORS.primaryDark,
  },
  quickActionsGrid: {
    gap: 10,
  },
  quickActionCard: {
    borderRadius: 12,
    backgroundColor: COLORS.surface,
  },
  quickActionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quickActionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionTextContainer: {
    flex: 1,
  },
  quickActionTitle: {
    fontWeight: '700',
    color: COLORS.text,
  },
  quickActionDescription: {
    marginTop: 2,
    color: COLORS.textSecondary,
  },
  loadingContainer: {
    paddingVertical: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: COLORS.textSecondary,
  },
  errorCard: {
    backgroundColor: '#ffebee',
    borderRadius: 12,
  },
  errorText: {
    color: COLORS.error,
    fontWeight: '600',
  },
});