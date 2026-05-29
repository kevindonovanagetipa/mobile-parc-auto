import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@/constants/api';

export interface Reservation {
  id: number;
  objet_deplacement: string;
  date_depart: string;
  heure_depart: string;
  lieu_depart: string;
  destination_itineraire: string;
  date_retour: string;
  heure_retour: string;
  nombre_passager: number;
  passagers: string;
  vehicule_id: number;
  utilisateur_id: number | null;
  chauffeur_id: number;
  statut: 'en_attente' | 'validee' | 'terminee' | 'annulee';
  created_at: string;
}

export const reservationService = {

  // Liste les réservations de l'utilisateur connecté → GET /api/reservations/me
  async getMesReservations(): Promise<Reservation[]> {
    const token = await AsyncStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/api/reservations/me`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    const json = await response.json();
    if (!response.ok) throw new Error(json.message || 'Erreur chargement réservations');
    // /me retourne un tableau direct dans json.data
    return Array.isArray(json.data) ? json.data : [];
  },

};