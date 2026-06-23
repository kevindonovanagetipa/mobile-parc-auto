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
  Button,
  Card,
  IconButton,
  Text,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { ROUTES } from '@/constants/routes';
import { type AppColors, useAppColors } from '@/constants/colors';
import {
  NotificationItem,
  notificationService,
} from '@/services/notificationService';

function getNotificationTitle(notification: NotificationItem) {
  return notification?.titre || notification?.title || 'Notification';
}

function getNotificationIcon(type?: string) {
  if (type === 'reservation_validee' || type === 'reservation_validated') {
    return 'check-circle-outline';
  }

  if (type === 'reservation_created') {
    return 'calendar-plus';
  }

  if (type === 'course_validee' || type === 'course_validated') {
    return 'check-circle-outline';
  }

  return 'bell-outline';
}

function getNotificationDate(dateValue?: string) {
  if (!dateValue) return '';

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return '';

  const jour = String(date.getDate()).padStart(2, '0');
  const mois = String(date.getMonth() + 1).padStart(2, '0');
  const annee = date.getFullYear();
  const heure = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');

  return `${jour}/${mois}/${annee} à ${heure}:${minute}`;
}

function isCourseNotification(notification: NotificationItem) {
  const type = notification?.type;

  return (
    type === 'course_validee' ||
    type === 'course_validated' ||
    type === 'course_created' ||
    Boolean((notification as any)?.course_id)
  );
}

function isReservationNotification(notification: NotificationItem) {
  const type = notification?.type;

  return (
    type === 'reservation_validee' ||
    type === 'reservation_validated' ||
    type === 'reservation_created' ||
    Boolean((notification as any)?.reservation_id)
  );
}

export default function NotificationsScreen() {
  const COLORS = useAppColors();
  const styles = createStyles(COLORS);
  const router = useRouter();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [deletingIds, setDeletingIds] = useState<number[]>([]);

  const chargerNotifications = useCallback(async () => {
    try {
      setErrorMessage('');

      const data = await notificationService.getMesNotifications();

      setNotifications(data);
    } catch (error: any) {
      console.log('Erreur notifications :', error);

      setErrorMessage(
        error?.message || 'Impossible de charger les notifications.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    chargerNotifications();
  }, [chargerNotifications]);

  const handleRefresh = () => {
    setRefreshing(true);
    chargerNotifications();
  };

  const handleNotificationPress = (notification: NotificationItem) => {
    if (isCourseNotification(notification)) {
      router.push(ROUTES.COURSES);
      return;
    }

    if (isReservationNotification(notification)) {
      router.push(ROUTES.RESERVATIONS);
      return;
    }

    console.log('Type de notification non reconnu :', notification);
  };

  const supprimerNotification = async (notification: NotificationItem) => {
    const notificationId = Number(notification.id);

    if (!notificationId) {
      return;
    }

    Alert.alert(
      'Supprimer la notification',
      'Voulez-vous vraiment supprimer cette notification ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            const ancienneListe = notifications;

            try {
              setDeletingIds((prev) => [...prev, notificationId]);

              setNotifications((prev) =>
                prev.filter((item) => Number(item.id) !== notificationId)
              );

              await notificationService.deleteNotification(notificationId);
            } catch (error: any) {
              console.log('Erreur suppression notification :', error);

              setNotifications(ancienneListe);

              Alert.alert(
                'Erreur',
                error?.message || 'Impossible de supprimer cette notification.'
              );
            } finally {
              setDeletingIds((prev) =>
                prev.filter((id) => id !== notificationId)
              );
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />

        <Text variant="bodyMedium" style={styles.loadingText}>
          Chargement des notifications...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <Text variant="titleLarge" style={styles.title}>
        Notifications
      </Text>

      {!!errorMessage && (
        <Card style={styles.errorCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.errorTitle}>
              Erreur
            </Text>

            <Text variant="bodyMedium" style={styles.errorText}>
              {errorMessage}
            </Text>

            <Button
              mode="contained"
              onPress={chargerNotifications}
              style={styles.retryButton}
              buttonColor={COLORS.primary}
              textColor="#fff"
            >
              Réessayer
            </Button>
          </Card.Content>
        </Card>
      )}

      {!errorMessage && notifications.length === 0 && (
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.iconBox}>
              <MaterialCommunityIcons
                name="bell-outline"
                size={28}
                color={COLORS.primary}
              />
            </View>

            <View style={styles.textBox}>
              <Text variant="titleMedium" style={styles.cardTitle}>
                Aucune notification
              </Text>

              <Text variant="bodySmall" style={styles.dateText}>
                Les nouvelles notifications apparaîtront ici.
              </Text>
            </View>
          </Card.Content>
        </Card>
      )}

      {!errorMessage &&
        notifications.map((notification) => {
          const title = getNotificationTitle(notification);
          const icon = getNotificationIcon(notification.type);
          const date = getNotificationDate(notification.created_at);
          const notificationId = Number(notification.id);
          const isDeleting = deletingIds.includes(notificationId);

          return (
            <Card
              key={String(notification.id)}
              style={styles.card}
              onPress={() => handleNotificationPress(notification)}
            >
              <Card.Content style={styles.cardContent}>
                <View style={styles.iconBox}>
                  <MaterialCommunityIcons
                    name={icon}
                    size={28}
                    color={COLORS.primary}
                  />
                </View>

                <View style={styles.textBox}>
                  <Text variant="titleMedium" style={styles.cardTitle}>
                    {title}
                  </Text>

                  {!!date && (
                    <Text variant="bodySmall" style={styles.dateText}>
                      {date}
                    </Text>
                  )}
                </View>

                <IconButton
                  icon="trash-can-outline"
                  size={22}
                  iconColor="red"
                  disabled={isDeleting}
                  onPress={() => supprimerNotification(notification)}
                  style={styles.deleteButton}
                />

                <MaterialCommunityIcons
                  name="chevron-right"
                  size={24}
                  color={COLORS.textSecondary}
                />
              </Card.Content>
            </Card>
          );
        })}
    </ScrollView>
  );
}

const createStyles = (COLORS: AppColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 16,
    paddingBottom: 28,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  loadingText: {
    color: COLORS.textSecondary,
    marginTop: 12,
  },
  title: {
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginBottom: 16,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    marginBottom: 12,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBox: {
    flex: 1,
  },
  cardTitle: {
    fontWeight: '700',
    color: COLORS.text,
  },
  dateText: {
    color: COLORS.textSecondary,
    marginTop: 4,
    fontSize: 12,
  },
  deleteButton: {
    margin: 0,
  },
  errorCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    marginBottom: 12,
  },
  errorTitle: {
    fontWeight: '700',
    color: 'red',
  },
  errorText: {
    color: COLORS.textSecondary,
    marginTop: 6,
  },
  retryButton: {
    marginTop: 12,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
});