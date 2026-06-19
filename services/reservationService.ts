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

  // Modifié : accepte null
  vehicule_id: number | null;
  utilisateur_id: number | null;
  chauffeur_id: number | null;

  statut: 'en_attente' | 'validee' | 'terminee' | 'annulee';
  created_at: string;
}

export interface CreateReservationPayload {
  objet_deplacement: string;
  date_depart: string;
  heure_depart: string;
  lieu_depart: string;
  destination_itineraire: string;
  date_retour: string;
  heure_retour: string;
  nombre_passager: number;
  passagers: string;

  // Modifié : accepte null
  vehicule_id?: number | null;
  utilisateur_id?: number | null;
  chauffeur_id?: number | null;

  statut: 'en_attente' | 'validee' | 'terminee' | 'annulee';
}

export interface UpdateReservationPayload extends CreateReservationPayload {}

const getAuthHeaders = async () => {
  const token =
    (await AsyncStorage.getItem('token')) ||
    (await AsyncStorage.getItem('accessToken')) ||
    (await AsyncStorage.getItem('authToken'));

  return {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

const extractOne = (json: any) => {
  return json?.data || json?.item || json?.reservation || json;
};

const extractList = (json: any) => {
  if (Array.isArray(json)) return json;
  if (Array.isArray(json?.data)) return json.data;
  if (Array.isArray(json?.items)) return json.items;
  if (Array.isArray(json?.data?.items)) return json.data.items;
  if (Array.isArray(json?.rows)) return json.rows;
  if (Array.isArray(json?.data?.rows)) return json.data.rows;

  return [];
};

const parseResponse = async (response: Response) => {
  const text = await response.text();

  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return {};
  }
};

/**
 * Important :
 * JSON.stringify supprime les champs undefined.
 * Donc on force vehicule_id et chauffeur_id à null
 * pour que le backend reçoive quand même les champs.
 */
const normalizeReservationPayload = (
  data: CreateReservationPayload | UpdateReservationPayload
) => {
  return {
    objet_deplacement: data.objet_deplacement,
    date_depart: data.date_depart,
    heure_depart: data.heure_depart,
    lieu_depart: data.lieu_depart,
    destination_itineraire: data.destination_itineraire,
    date_retour: data.date_retour,
    heure_retour: data.heure_retour,
    nombre_passager: Number(data.nombre_passager || 0),
    passagers: data.passagers,

    // Ici on garde les champs, même s'ils sont vides
    vehicule_id: data.vehicule_id ?? null,
    utilisateur_id: data.utilisateur_id ?? null,
    chauffeur_id: data.chauffeur_id ?? null,

    statut: data.statut || 'en_attente',
  };
};

export const reservationService = {
  // Liste les réservations de l'utilisateur connecté → GET /api/reservations/me
  async getMesReservations(): Promise<Reservation[]> {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_BASE_URL}/api/reservations/me`, {
      method: 'GET',
      headers,
    });

    const json = await parseResponse(response);

    if (!response.ok) {
      throw new Error(json.message || 'Erreur chargement réservations');
    }

    return extractList(json);
  },

  // Récupérer une réservation par ID → GET /api/reservations/:id
  async getReservationById(id: number | string): Promise<Reservation> {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_BASE_URL}/api/reservations/${id}`, {
      method: 'GET',
      headers,
    });

    const json = await parseResponse(response);

    if (!response.ok) {
      throw new Error(
        json.message || 'Erreur lors du chargement de la réservation'
      );
    }

    return extractOne(json);
  },

  // Ajouter une réservation → POST /api/reservations
  async createReservation(data: CreateReservationPayload): Promise<Reservation> {
    const headers = await getAuthHeaders();

    const payload = normalizeReservationPayload(data);

    console.log('Payload réservation envoyé :', payload);

    const response = await fetch(`${API_BASE_URL}/api/reservations`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    const json = await parseResponse(response);

    if (!response.ok) {
      throw new Error(
        json.message || 'Erreur lors de la création de la réservation'
      );
    }

    return extractOne(json);
  },

  // Modifier une réservation → PUT /api/reservations/:id
  async updateReservation(
    id: number | string,
    data: UpdateReservationPayload
  ): Promise<Reservation> {
    const headers = await getAuthHeaders();

    const payload = normalizeReservationPayload(data);

    console.log('Payload modification réservation envoyé :', payload);

    const response = await fetch(`${API_BASE_URL}/api/reservations/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(payload),
    });

    const json = await parseResponse(response);

    if (!response.ok) {
      throw new Error(
        json.message || 'Erreur lors de la modification de la réservation'
      );
    }

    return extractOne(json);
  },
};