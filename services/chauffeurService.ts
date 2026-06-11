import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@/constants/api';

export interface Chauffeur {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  numero_permis: string;
  categorie_permis: string;
  date_expiration_permis: string;
  adresse: string;
  disponibilite: string;
  statut: string;
  created_at?: string;
  updated_at?: string;
}

export const chauffeurService = {
  async getAll(): Promise<{ items: Chauffeur[]; pagination: any }> {
    const token = await AsyncStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/api/chauffeurs/disponibles`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    const json = await response.json();
    if (!response.ok) throw new Error(json.message || 'Erreur chargement chauffeurs');

    const items: Chauffeur[] = Array.isArray(json.data) ? json.data : [];
    return {
      items,
      pagination: { page: 1, limit: items.length, total: items.length },
    };
  },
};