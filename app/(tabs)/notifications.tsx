import { useCallback, useEffect, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  ActivityIndicator,
  Button,
  Card,
  Text,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { COLORS } from '@/constants/colors';
import {
  NotificationItem,
  notificationService,
} from '@/services/notificationService';

function getNotificationTitle(notification: NotificationItem) {
  return notification?.titre || notification?.title || 'Notification';
}

function getNotificationMessage(notification: NotificationItem) {
  if (notification?.message) return notification.message;
  if (notification?.type === 'reservation_validee') return 'Votre réservation a été validée.';
  if (notification?.type === 'reservation_created') return 'Une nouvelle réservation a été ajoutée.';
  return 'Vous avez reçu une nouvelle notification.';
}

function getNotificationIcon(type?: string) {
  if (type === 'reservation_validee' || type === 'reservation_validated') return 'check-circle-outline';
  if (type === 'reservation_created') return 'calendar-plus';
  return 'bell-outline';
}

function getNotificationDate(dateValue?: string) {
  if (!dateValue) return '';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return '';
  const jour   = String(date.getDate()).padStart(2, '0');
  const mois   = String(date.getMonth() + 1).padStart(2, '0');
  const annee  = date.getFullYear();
  const heure  = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${jour}/${mois}/${annee} à ${heure}:${minute}`;
}

function isNotificationRead(notification: NotificationItem) {
  if (typeof notification.lu === 'boolean') return notification.lu;
  if (typeof notification.is_read === 'boolean') return notification.is_read;
  return false;
}

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const chargerNotifications = useCallback(async () => {
    try {
      setErrorMessage('');
      const data = await notificationService.getMesNotifications();
      setNotifications(data);
    } catch (error: any) {
      console.log('Erreur notifications :', error);
      setErrorMessage(error?.message || 'Impossible de charger les notifications.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    chargerNotifications();
  }, [chargerNotifications]);

  // Marque toutes les notifications non lues comme lues à l'ouverture de la page
  useEffect(() => {
    const marquerCommeLues = async () => {
      const nonLues = notifications.filter((n) => !isNotificationRead(n));
      if (nonLues.length === 0) return;

      // Mise à jour locale immédiate (UX fluide)
      setNotifications((prev) =>
        prev.map((n) =>
          isNotificationRead(n) ? n : { ...n, lu: true, is_read: true }
        )
      );

      // Appel API en arrière-plan pour chaque notification non lue
      for (const n of nonLues) {
        try {
          await (notificationService as any).marquerCommeLue(n.id);
        } catch (error) {
          console.log(`Erreur marquage notification ${n.id} :`, error);
        }
      }
    };

    if (notifications.length > 0) {
      marquerCommeLues();
    }
  }, [notifications.length]);

  const handleRefresh = () => {
    setRefreshing(true);
    chargerNotifications();
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
            <Text variant="titleMedium" style={styles.errorTitle}>Erreur</Text>
            <Text variant="bodyMedium" style={styles.errorText}>{errorMessage}</Text>
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
              <MaterialCommunityIcons name="bell-outline" size={28} color={COLORS.primary} />
            </View>
            <View style={styles.textBox}>
              <Text variant="titleMedium" style={styles.cardTitle}>Aucune notification</Text>
              <Text variant="bodyMedium" style={styles.cardText}>
                Les nouvelles notifications apparaîtront ici.
              </Text>
            </View>
          </Card.Content>
        </Card>
      )}

      {!errorMessage &&
        notifications.map((notification) => {
          const title   = getNotificationTitle(notification);
          const message = getNotificationMessage(notification);
          const icon    = getNotificationIcon(notification.type);
          const date    = getNotificationDate(notification.created_at);
          const isRead  = isNotificationRead(notification);

          return (
            <Card key={String(notification.id)} style={styles.card}>
              <Card.Content style={styles.cardContent}>
                <View style={styles.iconBox}>
                  <MaterialCommunityIcons name={icon} size={28} color={COLORS.primary} />
                </View>
                <View style={styles.textBox}>
                  <View style={styles.titleRow}>
                    <Text variant="titleMedium" style={styles.cardTitle}>
                      {title}
                    </Text>
                    {/* Point rouge uniquement si non lue */}
                    {!isRead && <View style={styles.unreadDot} />}
                  </View>
                  <Text variant="bodyMedium" style={styles.cardText}>{message}</Text>
                  {!!date && (
                    <Text variant="bodySmall" style={styles.dateText}>{date}</Text>
                  )}
                </View>
              </Card.Content>
            </Card>
          );
        })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
    alignItems: 'flex-start',
    gap: 12,
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    flex: 1,
    fontWeight: '700',
    color: COLORS.text,
  },
  cardText: {
    color: COLORS.textSecondary,
    marginTop: 3,
    lineHeight: 20,
  },
  dateText: {
    color: COLORS.textSecondary,
    marginTop: 8,
    fontSize: 12,
  },
  unreadDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: 'red',
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