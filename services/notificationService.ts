import AsyncStorage from '@react-native-async-storage/async-storage';

import { API_BASE_URL } from '@/constants/api';

export interface NotificationItem {
  id: number | string;
  utilisateur_id?: number | string;
  user_id?: number | string;
  titre?: string;
  title?: string;
  message?: string;
  type?: string;
  lu?: boolean;
  is_read?: boolean;
  created_at?: string;
  updated_at?: string;
  reservation?: {
    id?: number | string;
    objet_deplacement?: string;
    date_depart?: string;
    heure_depart?: string;
    statut?: string;
  };
}

export const notificationService = {
  async getMesNotifications(): Promise<NotificationItem[]> {
    const token = await AsyncStorage.getItem('token');

    const response = await fetch(`${API_BASE_URL}/api/notifications/me`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const json = await response.json();

    if (!response.ok) {
      throw new Error(
        json?.message || 'Erreur lors du chargement des notifications'
      );
    }

    const data =
      json?.data?.notifications ||
      json?.data ||
      json?.notifications ||
      json;

    return Array.isArray(data) ? data : [];
  },
  async deleteNotification(id: number) {
  const token = await AsyncStorage.getItem('token');

  const response = await fetch(`${API_BASE_URL}/api/notifications/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json?.message || 'Erreur lors de la suppression');
  }

  return json;
}
};