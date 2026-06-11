import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@/constants/api';

export type MoyenLocomotion = 'à pied' | 'moto' | 'bus' | 'voiture' | string;

export interface Course {
  id: number;
  date_course: string;
  date?: string;
  heure_depart: string;
  heure_retour_prevue?: string;
  objet_course: string;
  destination_itineraire: string;
  responsable: string;
  coursier: string;
  moyen_locomotion: MoyenLocomotion;
  statut: 'en_attente' | 'validee' | 'terminee' | 'annulee' | string;
  created_at: string;
  updated_at?: string;
}

export interface CoursePayload {
  date_course: string;
  heure_depart: string;
  heure_retour_prevue?: string;
  objet_course: string;
  destination_itineraire: string;
  responsable: string;
  coursier: string;
  moyen_locomotion: MoyenLocomotion;
}

const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem('token');

  return {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

const extractOne = (json: any) => {
  return json?.data || json?.item || json?.course || json;
};

const extractList = (json: any) => {
  if (Array.isArray(json)) return json;
  if (Array.isArray(json?.data)) return json.data;
  if (Array.isArray(json?.items)) return json.items;
  if (Array.isArray(json?.data?.items)) return json.data.items;
  if (Array.isArray(json?.rows)) return json.rows;
  if (Array.isArray(json?.data?.rows)) return json.data.rows;
  if (Array.isArray(json?.courses)) return json.courses;

  return [];
};

const readJson = async (response: Response) => {
  const text = await response.text();

  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
};

export const courseService = {
  // Liste les courses → GET /api/courses
  async getCourses(): Promise<Course[]> {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_BASE_URL}/api/courses`, {
      method: 'GET',
      headers,
    });

    const json = await readJson(response);

    if (!response.ok) {
      throw new Error(json.message || 'Impossible de charger les courses.');
    }

    return extractList(json);
  },

  // Récupérer une course par ID → GET /api/courses/:id
  async getCourseById(id: number | string): Promise<Course> {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_BASE_URL}/api/courses/${id}`, {
      method: 'GET',
      headers,
    });

    const json = await readJson(response);

    if (!response.ok) {
      throw new Error(json.message || 'Impossible de charger la course.');
    }

    return extractOne(json);
  },

  // Ajouter une course → POST /api/courses
  async createCourse(data: CoursePayload): Promise<Course> {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_BASE_URL}/api/courses`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    const json = await readJson(response);

    if (!response.ok) {
      throw new Error(json.message || "Impossible d'ajouter la course.");
    }

    return extractOne(json);
  },

  // Modifier une course → PUT /api/courses/:id
  async updateCourse(
    id: number | string,
    data: CoursePayload
  ): Promise<Course> {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_BASE_URL}/api/courses/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });

    const json = await readJson(response);

    if (!response.ok) {
      throw new Error(json.message || 'Impossible de modifier la course.');
    }

    return extractOne(json);
  },
};
