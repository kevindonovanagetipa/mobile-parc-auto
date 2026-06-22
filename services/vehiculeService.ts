import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@/constants/api';

export type DisponibiliteVehicule =
  | 'disponible'
  | 'indisponible'
  | 'en_reparation'
  | 'reserve';

export type StatutVehicule = 'actif' | 'inactif';

export interface Vehicule {
  id: number;
  numero_vehicule: string;
  numero_immatriculation?: string | null;
  type_vehicule_id: number;
  marque: string;
  modele: string;
  nombre_place?: number | null;
  couleur?: string | null;
  date_mise_circulation?: string | null;
  date_acquisition?: string | null;
  kilometrage_actuel?: number | string | null;
  nombre_anomalie?: number | null;
  disponibilite: DisponibiliteVehicule | string;
  statut: StatutVehicule | string;
  created_at?: string;
  updated_at?: string;
}

export interface VehiculeListResponse {
  items: Vehicule[];
  total?: number;
}

async function getToken() {
  return (
    (await AsyncStorage.getItem('token')) ||
    (await AsyncStorage.getItem('accessToken')) ||
    (await AsyncStorage.getItem('authToken'))
  );
}

function normalizeListResponse(json: any): VehiculeListResponse {
  const payload = json?.data ?? json;

  if (Array.isArray(payload)) {
    return { items: payload };
  }

  if (Array.isArray(payload?.items)) {
    return {
      items: payload.items,
      total: payload.total,
    };
  }

  if (Array.isArray(payload?.data)) {
    return {
      items: payload.data,
      total: payload.total,
    };
  }

  return { items: [] };
}

export const vehiculeService = {
  async getAll(): Promise<VehiculeListResponse> {
    const token = await getToken();

    const response = await fetch(`${API_BASE_URL}/api/vehicules`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    const json = await response.json();

    if (!response.ok) {
      throw new Error(json?.message || 'Erreur lors du chargement des véhicules');
    }

    return normalizeListResponse(json);
  },

  async getById(id: number): Promise<Vehicule> {
    const token = await getToken();

    const response = await fetch(`${API_BASE_URL}/api/vehicules/${id}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    const json = await response.json();

    if (!response.ok) {
      throw new Error(json?.message || 'Erreur lors du chargement du véhicule');
    }

    return json?.data ?? json;
  },
};