import { useEffect, useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs, router } from 'expo-router';
import { Image, Platform, Pressable, Text, View } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

import { COLORS } from '@/constants/colors';
import { connectSocketWithAuth, socket } from '@/services/socket';

// @ts-ignore: Asset import type declarations
const logoParcAuto = require('../../assets/images/logo_parc_auto.png');
// @ts-ignore: Asset import type declarations
const logoAgetipa = require('../../assets/images/logo_agetipa.jpg');

// Uniquement les notifications locales — pas de token distant
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

type HeaderRightLogoProps = {
  notificationCount: number;
  onPressNotification: () => void;
};

function HeaderTitle() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <Image
        source={logoParcAuto}
        style={{
          width: 38,
          height: 38,
          borderWidth: 1.5,
          borderColor: COLORS.primary,
          borderRadius: 35,
          backgroundColor: COLORS.surface,
        }}
        resizeMode="contain"
      />
      <Text
        style={{
          fontSize: 20,
          fontWeight: '700',
          color: COLORS.primaryDark,
          letterSpacing: 0.5,
        }}
      >
        Parc Auto
      </Text>
    </View>
  );
}

function HeaderRightLogo({ notificationCount, onPressNotification }: HeaderRightLogoProps) {
  return (
    <View
      style={{
        marginRight: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 14,
      }}
    >
      <Pressable
        onPress={onPressNotification}
        style={{
          width: 38,
          height: 38,
          borderRadius: 19,
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <MaterialCommunityIcons name="bell-outline" size={26} color={COLORS.primaryDark} />
        {notificationCount > 0 && (
          <View
            style={{
              position: 'absolute',
              top: 2,
              right: 2,
              minWidth: 18,
              height: 18,
              borderRadius: 9,
              paddingHorizontal: 4,
              backgroundColor: 'red',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1.5,
              borderColor: COLORS.surface,
            }}
          >
            <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>
              {notificationCount > 99 ? '99+' : notificationCount}
            </Text>
          </View>
        )}
      </Pressable>

      <Image
        source={logoAgetipa}
        style={{ width: 78, height: 36 }}
        resizeMode="contain"
      />
    </View>
  );
}

// Vérifie si on tourne dans Expo Go (pas de push distant possible)
const isExpoGo = Constants.appOwnership === 'expo';

async function demanderPermissionNotification() {
  // Dans Expo Go SDK 53+, on demande uniquement la permission locale
  // sans tenter d'obtenir un token push distant
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('reservations', {
      name: 'Réservations',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF0000',
    });
  }

  const permissionActuelle = await Notifications.getPermissionsAsync();
  if (permissionActuelle.status !== 'granted') {
    const nouvellePermission = await Notifications.requestPermissionsAsync();
    if (nouvellePermission.status !== 'granted') {
      console.log('Permission notification refusée');
      return false;
    }
  }

  // NE PAS appeler getExpoPushTokenAsync() dans Expo Go SDK 53+
  // Uniquement dans un development build ou production build
  if (!isExpoGo) {
    try {
      const tokenData = await Notifications.getExpoPushTokenAsync();
      console.log('Push token:', tokenData.data);
    } catch (error) {
      console.log('Token push non disponible:', error);
    }
  }

  return true;
}

async function afficherNotificationLocale(notification: any, type: string) {
  const reservation = notification?.reservation;

  let titre = notification?.title || notification?.titre || 'Notification';
  let message = notification?.message || 'Vous avez reçu une nouvelle notification.';

  if (type === 'reservation_created') {
    titre = notification?.title || notification?.titre || 'Nouvelle réservation';
    message = reservation?.objet_deplacement
      ? `Nouvelle réservation : ${reservation.objet_deplacement}`
      : notification?.message || 'Une nouvelle réservation a été ajoutée.';
  }

  if (type === 'reservation_validee' || type === 'reservation_validated') {
    titre = notification?.title || notification?.titre || 'Réservation validée';
    message = reservation?.objet_deplacement
      ? `Votre réservation pour ${reservation.objet_deplacement} a été validée.`
      : notification?.message || 'Votre réservation a été validée.';
  }

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: titre,
        body: message,
        data: {
          type,
          notificationId: notification?.id,
          reservationId: reservation?.id,
        },
        sound: true,
      },
      trigger: null,
    });
  } catch (error) {
    // Les notifications locales peuvent aussi échouer dans certains contextes Expo Go
    console.log('Notification locale non affichée (Expo Go) — compteur mis à jour');
  }
}

export default function TabsLayout() {
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    demanderPermissionNotification();

    const handleReservationCreated = async (notification: any) => {
      console.log('Nouvelle notification réservation :', notification);
      setNotificationCount((prev) => prev + 1);
      await afficherNotificationLocale(notification, 'reservation_created');
    };

    const handleReservationValidated = async (notification: any) => {
      console.log('Réservation validée :', notification);
      setNotificationCount((prev) => prev + 1);
      await afficherNotificationLocale(notification, 'reservation_validee');
    };

    const handleGenericNotification = async (notification: any) => {
      console.log('Notification reçue :', notification);
      const type = notification?.type || 'notification';
      setNotificationCount((prev) => prev + 1);
      await afficherNotificationLocale(notification, type);
    };

    const handleConnect = () => console.log('Connecté au WebSocket :', socket.id);
    const handleDisconnect = () => console.log('Déconnecté du WebSocket');

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('reservation:created', handleReservationCreated);
    socket.on('reservation:validated', handleReservationValidated);
    socket.on('notification', handleGenericNotification);

    connectSocketWithAuth();

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('reservation:created', handleReservationCreated);
      socket.off('reservation:validated', handleReservationValidated);
      socket.off('notification', handleGenericNotification);
    };
  }, []);

  const handleNotificationPress = () => {
    setNotificationCount(0);
    router.push('/notifications');
  };

  return (
    <Tabs
  screenOptions={{
    headerShown: true,
    headerTitle: () => <HeaderTitle />,
    headerRight: () => (
      <HeaderRightLogo
        notificationCount={notificationCount}
        onPressNotification={handleNotificationPress}
      />
    ),
    headerTitleAlign: 'left',
    headerStyle: { backgroundColor: COLORS.surface },
    headerShadowVisible: true,
    tabBarActiveTintColor: COLORS.primary,
    tabBarInactiveTintColor: COLORS.textSecondary,

    tabBarStyle: {
      backgroundColor: COLORS.surface,
      borderTopColor: COLORS.border,
    },

    tabBarLabelStyle: {
      fontSize: 12,
      marginBottom: 4,
    },
  }}
>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="view-dashboard" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="course"
        options={{
          title: 'Course',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="map-marker-path" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="reservations"
        options={{
          title: 'Réservations',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="calendar" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chauffeurs"
        options={{
          title: 'Chauffeurs',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="account-tie" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'Plus',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="dots-horizontal" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen name="notifications" options={{ href: null, title: 'Notifications' }} />
      <Tabs.Screen name="reservations/ajouter" options={{ href: null, title: 'Nouvelle réservation' }} />
      <Tabs.Screen name="reservations/modifier/[id]" options={{ href: null, title: 'Modifier la réservation' }} />
      <Tabs.Screen name="course/ajouter" options={{ href: null, title: 'Nouvelle course' }} />
      <Tabs.Screen name="course/modifier/[id]" options={{ href: null, title: 'Modifier la course' }} />
      <Tabs.Screen name="profil" options={{ href: null, title: 'Profil utilisateur' }} />
      <Tabs.Screen name="vehicules" options={{ href: null, title: 'Véhicules' }} />
    </Tabs>
  );
}