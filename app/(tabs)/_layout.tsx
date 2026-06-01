import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Image, Text, View } from 'react-native';

import { COLORS } from '@/constants/colors';

// @ts-ignore: Asset import type declarations
const logoParcAuto = require('../../assets/images/logo_parc_auto.png');

// @ts-ignore: Asset import type declarations
const logoAgetipa = require('../../assets/images/logo_agetipa.jpg');

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

function HeaderRightLogo() {
  return (
    <View
      style={{
        marginRight: 14,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Image
        source={logoAgetipa}
        style={{
          width: 78,
          height: 36,
        }}
        resizeMode="contain"
      />
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerTitle: () => <HeaderTitle />,
        headerRight: () => <HeaderRightLogo />,
        headerTitleAlign: 'left',
        headerStyle: {
          backgroundColor: COLORS.surface,
        },
        headerShadowVisible: true,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="view-dashboard"
              size={24}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="course"
        options={{
          title: 'Course',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="map-marker-path"
              size={24}
              color={color}
            />
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
            <MaterialCommunityIcons
              name="account-tie"
              size={24}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="more"
        options={{
          title: 'Plus',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="dots-horizontal"
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* Page cachée dans la barre de navigation */}
      <Tabs.Screen
        name="reservations/ajouter"
        options={{
          href: null,
          title: 'Nouvelle réservation',
        }}
      />

      <Tabs.Screen
        name="reservations/modifier/[id]"
        options={{
          href: null,
          title: 'Modifier la réservation',
        }}
      />

      <Tabs.Screen
        name="profil"
        options={{
          href: null,
          title: 'Profil utilisateur',
        }}
      />
    </Tabs>
  );
}