import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@/constants/api';

export interface Course {
  id: number;
  date_course: string;
  heure_depart: string;
  heure_retour_prevue: string;
  objet_course: string;
  destination_itineraire: string;
  responsable: string;
  coursier: string;
  moyen_locomotion: 'à pied' | 'moto' | 'bus' | 'voiture' | string;
  statut: 'en_attente' | 'validee' | 'terminee' | 'annulee' | string;
  created_at: string;
  updated_at?: string;
}

export const courseService = {
  // Liste les courses → GET /api/courses
  async getCourses(): Promise<Course[]> {
    const token = await AsyncStorage.getItem('token');

    const response = await fetch(`${API_BASE_URL}/api/courses`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const json = await response.json();

    if (!response.ok) {
      throw new Error(json.message || 'Erreur chargement courses');
    }

    // Ton backend retourne : json.data.items
    if (Array.isArray(json.data?.items)) {
      return json.data.items;
    }

    // Sécurité si le backend retourne directement json.data
    if (Array.isArray(json.data)) {
      return json.data;
    }

    return [];
  },
};