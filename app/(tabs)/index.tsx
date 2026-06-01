import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Card, Text, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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

export default function Dashboard() {
  const [stats, setStats] = useState<StatCardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
    color: '#6200ee',
  },
  {
    label: 'Chauffeurs',
    value: String(data.totalChauffeurs ?? 0),
    icon: 'account-tie',
    color: '#03dac6',
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
            Activité récente
          </Text>

          <Card style={styles.activityCard}>
            <Card.Content style={styles.activityRow}>
              <MaterialCommunityIcons
                name="calendar-clock"
                size={18}
                color={COLORS.primary}
              />
              <Text variant="bodyMedium" style={styles.activityText}>
                Tableau de bord mis à jour avec les dernières statistiques.
              </Text>
            </Card.Content>
          </Card>

          <Card style={styles.activityCard}>
            <Card.Content style={styles.activityRow}>
              <MaterialCommunityIcons
                name="car"
                size={18}
                color={COLORS.primary}
              />
              <Text variant="bodyMedium" style={styles.activityText}>
                Suivi global du parc automobile disponible.
              </Text>
            </Card.Content>
          </Card>

          <Card style={styles.activityCard}>
            <Card.Content style={styles.activityRow}>
              <MaterialCommunityIcons
                name="map-marker-path"
                size={18}
                color={COLORS.primary}
              />
              <Text variant="bodyMedium" style={styles.activityText}>
                Les réservations et courses sont synchronisées avec le serveur.
              </Text>
            </Card.Content>
          </Card>
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
  activityCard: {
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  activityText: {
    flex: 1,
    color: COLORS.text,
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