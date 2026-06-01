export const ROUTES = { 
  // Auth
  LOGIN: '/(auth)/login' as const,

  // Tabs
  TABS: '/(tabs)' as const,
  DASHBOARD: '/(tabs)/' as const,
  VEHICULES: '/(tabs)/vehicules' as const,
  RESERVATIONS: '/(tabs)/reservations' as const,
  CHAUFFEURS: '/(tabs)/chauffeurs' as const,
  MORE: '/(tabs)/more' as const,

  // Reservations
  ADD_RESERVATION: '/(tabs)/reservations/ajouter' as const,
} as const;