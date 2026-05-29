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
}

export const chauffeurService = {
  async getAll(page = 1, limit = 10): Promise<{ items: Chauffeur[]; pagination: any }> {
    const token = await AsyncStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/api/chauffeurs?page=${page}&limit=${limit}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    const json = await response.json();
    if (!response.ok) throw new Error(json.message || 'Erreur chargement chauffeurs');
    // Gère les deux structures : { data: { items } } ou { data: [] }
    const data = json.data;
    if (Array.isArray(data)) return { items: data, pagination: { page: 1, limit: data.length, total: data.length } };
    return data;
  },
};