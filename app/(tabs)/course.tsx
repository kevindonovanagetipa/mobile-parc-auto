import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Button,
  Card,
  Chip,
  FAB,
  Text,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Course, courseService } from '@/services/courseService';

const BLUE_LIGHT = '#E3F2FD';
type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

const getStatutColor = (statut: string) => {
  switch (statut) {
    case 'validee':
      return '#4caf50';
    case 'terminee':
      return '#1976d2';
    case 'annulee':
      return '#f44336';
    case 'en_attente':
    default:
      return '#ff9800';
  }
};

const getStatutLabel = (statut: string) => {
  switch (statut) {
    case 'validee':
      return 'Validée';
    case 'terminee':
      return 'Terminée';
    case 'annulee':
      return 'Annulée';
    case 'en_attente':
    default:
      return 'En attente';
  }
};

const getMoyenIcon = (moyen: string): IconName => {
  switch (moyen) {
    case 'voiture':
      return 'car';
    case 'moto':
      return 'motorbike';
    case 'bus':
      return 'bus';
    case 'à pied':
    case 'a pied':
    default:
      return 'walk';
  }
};

const formatDate = (date?: string) => {
  if (!date) return '-';

  const value = date.split('T')[0];

  if (!value) return '-';

  const [year, month, day] = value.split('-');

  if (!year || !month || !day) return '-';

  return `${day}/${month}/${year}`;
};

const formatHeure = (heure?: string) => {
  if (!heure) return '-';

  if (heure.includes('T')) {
    return heure.split('T')[1]?.substring(0, 5) || '-';
  }

  return heure.substring(0, 5);
};

export default function CourseScreen() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const loadCourses = async () => {
    try {
      setErrorMessage('');

      const data = await courseService.getCourses();

      setCourses(data);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erreur lors du chargement des courses';

      setErrorMessage(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadCourses();
  }, []);

  useEffect(() => {
    loadCourses();
  }, []);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (errorMessage) {
    return (
      <View style={styles.centerContainer}>
        <MaterialCommunityIcons
          name="alert-circle-outline"
          size={48}
          color="#f44336"
        />

        <Text style={styles.errorText}>{errorMessage}</Text>

        <Button
          mode="contained"
          onPress={() => {
            setLoading(true);
            loadCourses();
          }}
          style={styles.retryButton}
          labelStyle={styles.retryButtonLabel}
        >
          Réessayer
        </Button>
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {courses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="map-marker-off-outline"
              size={48}
              color="#999"
            />

            <Text style={styles.emptyText}>Aucune course disponible</Text>
          </View>
        ) : (
          courses.map((course) => {
            const statutColor = getStatutColor(course.statut);

            return (
              <Card key={course.id} style={styles.card}>
                <Card.Content>
                  <View style={styles.headerRow}>
                    <View style={styles.iconBox}>
                      <MaterialCommunityIcons
                        name={getMoyenIcon(course.moyen_locomotion)}
                        size={34}
                        color="#1976d2"
                      />
                    </View>

                    <View style={styles.info}>
                      <Text variant="titleMedium" style={styles.objet}>
                        {course.objet_course}
                      </Text>

                      <Text variant="bodySmall" style={styles.destination}>
                        {course.destination_itineraire}
                      </Text>
                    </View>

                    <Chip
                      style={[
                        styles.chip,
                        {
                          backgroundColor: `${statutColor}22`,
                        },
                      ]}
                      textStyle={{
                        color: statutColor,
                        fontSize: 11,
                        fontWeight: '600',
                      }}
                    >
                      {getStatutLabel(course.statut)}
                    </Chip>
                  </View>

                  <View style={styles.details}>
                    <View style={styles.detailRow}>
                      <MaterialCommunityIcons
                        name="calendar"
                        size={18}
                        color="#666"
                      />

                      <Text variant="bodySmall" style={styles.detailText}>
                        Date : {formatDate(course.date_course)}
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <MaterialCommunityIcons
                        name="clock-outline"
                        size={18}
                        color="#666"
                      />

                      <Text variant="bodySmall" style={styles.detailText}>
                        Départ : {formatHeure(course.heure_depart)}
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <MaterialCommunityIcons
                        name="clock-check-outline"
                        size={18}
                        color="#666"
                      />

                      <Text variant="bodySmall" style={styles.detailText}>
                        Retour prévu : {formatHeure(course.heure_retour_prevue)}
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <MaterialCommunityIcons
                        name="account-tie"
                        size={18}
                        color="#666"
                      />

                      <Text variant="bodySmall" style={styles.detailText}>
                        Responsable : {course.responsable}
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <MaterialCommunityIcons
                        name="account"
                        size={18}
                        color="#666"
                      />

                      <Text variant="bodySmall" style={styles.detailText}>
                        Coursier : {course.coursier}
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <MaterialCommunityIcons
                        name="map-marker-path"
                        size={18}
                        color="#666"
                      />

                      <Text variant="bodySmall" style={styles.detailText}>
                        Moyen : {course.moyen_locomotion}
                      </Text>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            );
          })
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BLUE_LIGHT,
    paddingTop: 5,
  },
  content: {
    padding: 16,
    paddingBottom: 90,
  },
  card: {
    marginBottom: 12,
    borderRadius: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#1976d222',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
  },
  objet: {
    fontWeight: 'bold',
    color: '#1f2937',
  },
  destination: {
    color: '#666',
    marginTop: 2,
  },
  chip: {
    alignSelf: 'flex-start',
  },
  details: {
    marginTop: 14,
    gap: 7,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    color: '#555',
    flex: 1,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#1976d2',
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
  },
  errorText: {
    marginTop: 12,
    textAlign: 'center',
    color: '#f44336',
  },
  retryButton: {
    marginTop: 16,
    borderRadius: 10,
    backgroundColor: '#1976d2',
  },
  retryButtonLabel: {
    color: '#ffffff',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 12,
    color: '#777',
    fontSize: 15,
  },
});