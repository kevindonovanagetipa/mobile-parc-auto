import { ScrollView, StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { COLORS } from '@/constants/colors';

export default function NotificationsScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text variant="titleLarge" style={styles.title}>
        Notifications
      </Text>

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

            <Text variant="bodyMedium" style={styles.cardText}>
              Les nouvelles réservations apparaîtront ici.
            </Text>
          </View>
        </Card.Content>
      </Card>
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
  },
  title: {
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginBottom: 16,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
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
  cardTitle: {
    fontWeight: '700',
    color: COLORS.text,
  },
  cardText: {
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});