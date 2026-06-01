import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Image, Text, View } from "react-native";

const BLUE = "#1565C0";
const BLUE_DARK = "#0D47A1";

// @ts-ignore: Asset import type declarations
const logoParcAuto = require("../../assets/images/logo_parc_auto.png");

function HeaderTitle() {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
      <Image
        source={logoParcAuto}
        style={{
          width: 38,
          height: 38,
          borderWidth: 1.5,
          borderColor: BLUE,
          borderRadius: 35,
          backgroundColor: "#ffffff",
        }}
        resizeMode="contain"
      />

      <Text
        style={{
          fontSize: 20,
          fontWeight: "700",
          color: BLUE_DARK,
          letterSpacing: 0.5,
        }}
      >
        Parc Auto
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerTitle: () => <HeaderTitle />,
        headerTitleAlign: "left",
        headerStyle: {
          backgroundColor: "#ffffff",
        },
        headerShadowVisible: true,
        tabBarActiveTintColor: "#1976d2",
        tabBarInactiveTintColor: "#777",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
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
          title: "Course",
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
          title: "Réservations",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="calendar" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="chauffeurs"
        options={{
          title: "Chauffeurs",
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
          title: "Plus",
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
          title: "Nouvelle réservation",
        }}
      />
      <Tabs.Screen
        name="reservations/modifier/[id]"
        options={{
          href: null,
          title: "Modifier la réservation",
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
