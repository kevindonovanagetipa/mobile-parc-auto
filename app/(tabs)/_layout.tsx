import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index"
        options={{ title: 'Dashboard',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="view-dashboard" size={24} color={color} /> }}
      />
      <Tabs.Screen name="vehicules"
        options={{ title: 'Véhicules',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="car" size={24} color={color} /> }}
      />
      <Tabs.Screen name="reservations"
        options={{ title: 'Réservations',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="calendar" size={24} color={color} /> }}
      />
      <Tabs.Screen name="chauffeurs"
        options={{ title: 'Chauffeurs',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="account-tie" size={24} color={color} /> }}
      />
      <Tabs.Screen name="more"
        options={{ title: 'Plus',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="dots-horizontal" size={24} color={color} /> }}
      />
    </Tabs>
  );
}