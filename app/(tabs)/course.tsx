import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  ActivityIndicator,
  Button,
  Card,
  Chip,
  Divider,
  FAB,
  Menu,
  Text,
  TextInput,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { router } from 'expo-router';

import { COLORS } from '@/constants/colors';
import { ROUTES } from '@/constants/routes';
import { Course, courseService } from '@/services/courseService';

const BLUE_LIGHT = '#e6fde3';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

type SortOption = 'date_desc' | 'date_asc' | 'nom_asc' | 'nom_desc';

const getStatutColor = (statut?: string) => {
  switch (statut) {
    case 'validee':
      return '#4caf50';

    case 'terminee':
      return '#1976d2';

    case 'annulee':
      return '#f44336';

    case 'refusee':
      return '#9e9e9e';

    case 'en_attente':
    default:
      return '#ff9800';
  }
};

const getStatutLabel = (statut?: string) => {
  switch (statut) {
    case 'validee':
      return 'Validée';

    case 'terminee':
      return 'Terminée';

    case 'annulee':
      return 'Annulée';

    case 'refusee':
      return 'Refusée';

    case 'en_attente':
    default:
      return 'En attente';
  }
};

const getMoyenIcon = (moyen?: string): IconName => {
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

const formatHeure = (heure?: string | null) => {
  if (!heure) return '-';

  if (heure.includes('T')) {
    return heure.split('T')[1]?.substring(0, 5) || '-';
  }

  return heure.substring(0, 5);
};

const getCourseDate = (course: Course) => {
  return course.date_course || course.date || '';
};

const getTimeFromDate = (date?: string) => {
  if (!date) return 0;

  const time = new Date(date).getTime();

  return Number.isNaN(time) ? 0 : time;
};

const getSortLabel = (sortOption: SortOption) => {
  switch (sortOption) {
    case 'date_desc':
      return 'Date récente';

    case 'date_asc':
      return 'Date ancienne';

    case 'nom_asc':
      return 'Nom A-Z';

    case 'nom_desc':
      return 'Nom Z-A';

    default:
      return 'Trier';
  }
};

export default function CourseScreen() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('date_desc');
  const [sortMenuVisible, setSortMenuVisible] = useState(false);

  const loadCourses = async () => {
    try {
      setErrorMessage('');
      const data = await courseService.getCourses();
      setCourses(Array.isArray(data) ? data : []);
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

  const filteredAndSortedCourses = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filteredCourses = courses.filter((course) => {
      const searchableText = [
        course.objet_course,
        course.destination_itineraire,
        course.responsable,
        course.coursier,
        course.moyen_locomotion,
        getStatutLabel(course.statut),
        formatDate(getCourseDate(course)),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchableText.includes(query);
    });

    return [...filteredCourses].sort((a, b) => {
      if (sortOption === 'date_desc') {
        return getTimeFromDate(getCourseDate(b)) - getTimeFromDate(getCourseDate(a));
      }

      if (sortOption === 'date_asc') {
        return getTimeFromDate(getCourseDate(a)) - getTimeFromDate(getCourseDate(b));
      }

      if (sortOption === 'nom_asc') {
        return String(a.objet_course || '').localeCompare(String(b.objet_course || ''));
      }

      if (sortOption === 'nom_desc') {
        return String(b.objet_course || '').localeCompare(String(a.objet_course || ''));
      }

      return 0;
    });
  }, [courses, searchQuery, sortOption]);

  const handleSelectSort = (option: SortOption) => {
    setSortOption(option);
    setSortMenuVisible(false);
  };

  const goToAddCourse = () => {
    router.push(ROUTES.ADD_COURSE);
  };

  const goToUpdateCourse = (id: number) => {
    router.push({
      pathname: '/(tabs)/course/modifier/[id]',
      params: { id: String(id) },
    });
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary}/>
        <Text style={styles.loadingText}>Chargement des courses...</Text>
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
        <View style={styles.filterContainer}>
          <TextInput
            mode="outlined"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Rechercher une course..."
            left={<TextInput.Icon icon="magnify" />}
            right={
              searchQuery ? (
                <TextInput.Icon
                  icon="close"
                  onPress={() => setSearchQuery('')}
                />
              ) : undefined
            }
            style={styles.searchInput}
            outlineStyle={styles.searchInputOutline}
          />

          <Menu
            visible={sortMenuVisible}
            onDismiss={() => setSortMenuVisible(false)}
            anchor={
              <Button
                mode="outlined"
                icon="sort"
                onPress={() => setSortMenuVisible(true)}
                style={styles.sortButton}
                labelStyle={styles.sortButtonLabel}
              >
                {getSortLabel(sortOption)}
              </Button>
            }
          >
            <Menu.Item
              onPress={() => handleSelectSort('date_desc')}
              title="Date récente"
              leadingIcon="sort-calendar-descending"
            />

            <Menu.Item
              onPress={() => handleSelectSort('date_asc')}
              title="Date ancienne"
              leadingIcon="sort-calendar-ascending"
            />

            <Divider />

            <Menu.Item
              onPress={() => handleSelectSort('nom_asc')}
              title="Nom A-Z"
              leadingIcon="sort-alphabetical-ascending"
            />

            <Menu.Item
              onPress={() => handleSelectSort('nom_desc')}
              title="Nom Z-A"
              leadingIcon="sort-alphabetical-descending"
            />
          </Menu>
        </View>

        <Text style={styles.resultText}>
          {filteredAndSortedCourses.length} course
          {filteredAndSortedCourses.length > 1 ? 's' : ''} trouvée
          {filteredAndSortedCourses.length > 1 ? 's' : ''}
        </Text>

        {filteredAndSortedCourses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="map-marker-off-outline"
              size={48}
              color="#999"
            />

            <Text style={styles.emptyText}>
              {searchQuery
                ? 'Aucune course ne correspond à votre recherche'
                : 'Aucune course disponible'}
            </Text>
          </View>
        ) : (
          filteredAndSortedCourses.map((course) => {
            const statutColor = getStatutColor(course.statut);

            return (
              <TouchableOpacity
                key={course.id}
                activeOpacity={0.8}
                onPress={() => goToUpdateCourse(course.id)}
              >
                <Card style={styles.card}>
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
                          {course.objet_course || 'Course sans objet'}
                        </Text>

                        <Text variant="bodySmall" style={styles.destination}>
                          {course.destination_itineraire || '-'}
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
                          Date : {formatDate(getCourseDate(course))}
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
                          Responsable : {course.responsable || '-'}
                        </Text>
                      </View>

                      <View style={styles.detailRow}>
                        <MaterialCommunityIcons
                          name="account"
                          size={18}
                          color="#666"
                        />

                        <Text variant="bodySmall" style={styles.detailText}>
                          Coursier : {course.coursier || '-'}
                        </Text>
                      </View>

                      <View style={styles.detailRow}>
                        <MaterialCommunityIcons
                          name="map-marker-path"
                          size={18}
                          color="#666"
                        />

                        <Text variant="bodySmall" style={styles.detailText}>
                          Moyen : {course.moyen_locomotion || '-'}
                        </Text>
                      </View>
                    </View>
                  </Card.Content>
                </Card>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        color={COLORS.surface}
        onPress={goToAddCourse}
      />
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

  filterContainer: {
    gap: 10,
    marginBottom: 8,
  },

  searchInput: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  searchInputOutline: {
    borderRadius: 14,
    borderColor: '#d6e4f0',
  },

  sortButton: {
    alignSelf: 'flex-start',
    borderRadius: 14,
    borderColor: '#1976d2',
    backgroundColor: '#ffffff',
  },

  sortButtonLabel: {
    color: '#1976d2',
    fontSize: 12,
    fontWeight: '600',
  },

  resultText: {
    marginBottom: 12,
    color: '#607d8b',
    fontSize: 13,
    fontWeight: '500',
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

  centerContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingVertical: 50,
    alignItems: 'center',
    justifyContent: 'center',
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
    textAlign: 'center',
  },

  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
  },
});