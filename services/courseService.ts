import AsyncStorage from '@react-native-async-storage/async-storage';

import { API_BASE_URL } from '@/constants/api';

export type MoyenLocomotion = 'à pied' | 'moto' | 'bus' | 'voiture';

export type StatutCourse = 'en_attente' | 'validee' | 'terminee' | 'annulee';

export interface Course {
  id: number;
  date_course?: string;
  date?: string;
  heure_depart: string;
  heure_retour_prevue?: string | null;
  objet_course: string;
  destination_itineraire: string;
  responsable: string;
  coursier: string;
  moyen_locomotion: MoyenLocomotion;
  statut: StatutCourse;
  utilisateur_id?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface CoursePayload {
  date_course: string;
  heure_depart: string;
  heure_retour_prevue?: string | null;
  objet_course: string;
  destination_itineraire: string;
  responsable: string;
  coursier: string;
  moyen_locomotion: MoyenLocomotion;
}

function getBaseUrl() {
  return API_BASE_URL.endsWith('/')
    ? API_BASE_URL.slice(0, -1)
    : API_BASE_URL;
}

async function getAuthHeaders() {
  const token = await AsyncStorage.getItem('token');

  return {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

function extractArrayResponse(json: any): Course[] {
  const data =
    json?.data?.courses ||
    json?.data ||
    json?.courses ||
    json;

  return Array.isArray(data) ? data : [];
}

function extractOneResponse(json: any): Course {
  return (
    json?.data?.course ||
    json?.data ||
    json?.course ||
    json
  );
}

async function parseResponse(response: Response) {
  const text = await response.text();

  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return {};
  }
}

export const courseService = {
  /**
   * Liste uniquement les courses de l'utilisateur connecté.
   * Endpoint backend : GET /api/courses/me
   */
  async getCourses(): Promise<Course[]> {
  const response = await fetch(`${getBaseUrl()}/api/courses/me`, {
    method: 'GET',
    headers: await getAuthHeaders(),
  });

  const json = await parseResponse(response);
  console.log('Response status:', response.status);
  console.log('Response JSON:', JSON.stringify(json, null, 2)); // ← ajoutez ça

  if (!response.ok) {
    throw new Error(json?.message || 'Erreur lors du chargement de vos courses');
  }

  return extractArrayResponse(json);
},

  /**
   * Alias si tu veux appeler explicitement les courses personnelles.
   */
  async getMesCourses(): Promise<Course[]> {
    return this.getCourses();
  },

  /**
   * Récupérer une course par son ID.
   * Endpoint backend : GET /api/courses/:id
   */
  async getCourseById(id: number | string): Promise<Course> {
    const response = await fetch(`${getBaseUrl()}/api/courses/${id}`, {
      method: 'GET',
      headers: await getAuthHeaders(),
    });

    const json = await parseResponse(response);

    if (!response.ok) {
      throw new Error(
        json?.message || 'Erreur lors du chargement de la course'
      );
    }

    return extractOneResponse(json);
  },

  /**
   * Ajouter une nouvelle course.
   * Endpoint backend : POST /api/courses
   */
  async createCourse(payload: CoursePayload): Promise<Course> {
    const response = await fetch(`${getBaseUrl()}/api/courses`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    const json = await parseResponse(response);

    if (!response.ok) {
      throw new Error(
        json?.message || "Erreur lors de l'ajout de la course"
      );
    }

    return extractOneResponse(json);
  },

  /**
   * Modifier une course.
   * Endpoint backend : PUT /api/courses/:id
   */
  async updateCourse(
    id: number | string,
    payload: CoursePayload
  ): Promise<Course> {
    const response = await fetch(`${getBaseUrl()}/api/courses/${id}`, {
      method: 'PUT',
      headers: await getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    const json = await parseResponse(response);

    if (!response.ok) {
      throw new Error(
        json?.message || 'Erreur lors de la modification de la course'
      );
    }

    return extractOneResponse(json);
  },

  /**
   * Supprimer une course si ton backend possède cette API.
   * Endpoint backend : DELETE /api/courses/:id
   */
  async deleteCourse(id: number | string): Promise<void> {
    const response = await fetch(`${getBaseUrl()}/api/courses/${id}`, {
      method: 'DELETE',
      headers: await getAuthHeaders(),
    });

    const json = await parseResponse(response);

    if (!response.ok) {
      throw new Error(
        json?.message || 'Erreur lors de la suppression de la course'
      );
    }
  },
};