export const ROUTES = { 
  // Auth
  LOGIN: '/(auth)/login' as const,

  // Tabs
  TABS: '/(tabs)' as const,
  DASHBOARD: '/(tabs)/' as const,
  VEHICULES: '/(tabs)/vehicules' as const,
  RESERVATIONS: '/(tabs)/reservations' as const,
  COURSES: '/(tabs)/course' as const,
  CHAUFFEURS: '/(tabs)/chauffeurs' as const,
  MORE: '/(tabs)/more' as const,

  // Reservations
  ADD_RESERVATION: '/(tabs)/reservations/ajouter' as const,

  // Courses
  ADD_COURSE: '/(tabs)/course/ajouter' as const,
} as const;
