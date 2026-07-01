import AsyncStorage from '@react-native-async-storage/async-storage';

import { API_BASE_URL } from '@/constants/api';

export type MoyenLocomotion = 'à pied' | 'a pied' | 'moto' | 'bus' | 'voiture';

export type StatutCourse =
  | 'en_attente'
  | 'validee'
  | 'refusee'
  | 'annulee'
  | 'terminee';

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

  /**
   * Le backend met "en_attente" par défaut si statut n'est pas envoyé.
   */
  statut?: StatutCourse;
}

function getBaseUrl() {
  return API_BASE_URL.endsWith('/')
    ? API_BASE_URL.slice(0, -1)
    : API_BASE_URL;
}

async function getToken() {
  return (
    (await AsyncStorage.getItem('token')) ||
    (await AsyncStorage.getItem('accessToken')) ||
    (await AsyncStorage.getItem('authToken'))
  );
}

async function getAuthHeaders() {
  const token = await getToken();

  if (!token) {
    throw new Error('Token introuvable. Veuillez vous reconnecter.');
  }

  return {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

async function parseResponse(response: Response) {
  const text = await response.text();

  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return {};
  }
}

function extractArrayResponse(json: any): Course[] {
  const data =
    json?.data?.courses ||
    json?.data?.items ||
    json?.data?.rows ||
    json?.data?.recordset ||
    json?.data ||
    json?.courses ||
    json?.items ||
    json?.rows ||
    json?.recordset ||
    json;

  return Array.isArray(data) ? data : [];
}

function extractOneResponse(json: any): Course {
  return (
    json?.data?.course ||
    json?.data?.item ||
    json?.data ||
    json?.course ||
    json?.item ||
    json
  );
}

function normalizeCoursePayload(payload: CoursePayload) {
  return {
    date_course: payload.date_course,
    heure_depart: payload.heure_depart,
    heure_retour_prevue: payload.heure_retour_prevue || null,
    objet_course: payload.objet_course,
    destination_itineraire: payload.destination_itineraire,
    responsable: payload.responsable,
    coursier: payload.coursier,
    moyen_locomotion: payload.moyen_locomotion,
    ...(payload.statut ? { statut: payload.statut } : {}),
  };
}

export const courseService = {
  /**
   * Liste toutes les courses.
   * Backend : GET /api/courses
   *
   * Tu ne passes plus par /api/courses/me.
   */
  async getCourses(page = 1, limit = 100): Promise<Course[]> {
  const url = `${getBaseUrl()}/api/courses?page=${page}&limit=${limit}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: await getAuthHeaders(),
  });

  const json = await parseResponse(response);

  if (!response.ok) {
    throw new Error(
      json?.message ||
        json?.error ||
        'Erreur lors du chargement des courses'
    );
  }

  return extractArrayResponse(json);
},

  /**
   * Alias conservé pour éviter de casser les anciens imports.
   * Attention : cette méthode retourne maintenant toutes les courses,
   * car elle appelle getCourses().
   */
  async getMesCourses(): Promise<Course[]> {
    return this.getCourses();
  },

  /**
   * Récupérer une course par son ID.
   * Backend : GET /api/courses/:id
   */
  async getCourseById(id: number | string): Promise<Course> {
    const response = await fetch(`${getBaseUrl()}/api/courses/${id}`, {
      method: 'GET',
      headers: await getAuthHeaders(),
    });

    const json = await parseResponse(response);

    if (!response.ok) {
      throw new Error(
        json?.message ||
          json?.error ||
          'Erreur lors du chargement de la course'
      );
    }

    return extractOneResponse(json);
  },

  /**
   * Ajouter une nouvelle course.
   * Backend : POST /api/courses
   *
   * Le backend ajoute automatiquement utilisateur_id avec req.user.id.
   */
  async createCourse(payload: CoursePayload): Promise<Course> {
    const response = await fetch(`${getBaseUrl()}/api/courses`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify(normalizeCoursePayload(payload)),
    });

    const json = await parseResponse(response);

    if (!response.ok) {
      throw new Error(
        json?.message ||
          json?.error ||
          "Erreur lors de l'ajout de la course"
      );
    }

    return extractOneResponse(json);
  },

  /**
   * Modifier une course.
   * Backend : PUT /api/courses/:id
   *
   * Ton backend attend tous les champs de la course.
   */
  async updateCourse(
    id: number | string,
    payload: CoursePayload
  ): Promise<Course> {
    const response = await fetch(`${getBaseUrl()}/api/courses/${id}`, {
      method: 'PUT',
      headers: await getAuthHeaders(),
      body: JSON.stringify(normalizeCoursePayload(payload)),
    });

    const json = await parseResponse(response);

    if (!response.ok) {
      throw new Error(
        json?.message ||
          json?.error ||
          'Erreur lors de la modification de la course'
      );
    }

    return extractOneResponse(json);
  },

  /**
   * Modifier uniquement le statut d'une course.
   * Backend : PATCH /api/courses/:id/statut
   *
   * Statuts acceptés par ton backend :
   * en_attente, validee, refusee, annulee, terminee
   */
  async updateCourseStatus(
    id: number | string,
    statut: StatutCourse
  ): Promise<Course> {
    const response = await fetch(`${getBaseUrl()}/api/courses/${id}/statut`, {
      method: 'PATCH',
      headers: await getAuthHeaders(),
      body: JSON.stringify({ statut }),
    });

    const json = await parseResponse(response);

    if (!response.ok) {
      throw new Error(
        json?.message ||
          json?.error ||
          'Erreur lors de la mise à jour du statut de la course'
      );
    }

    return extractOneResponse(json);
  },

  /**
   * Supprimer une course.
   * Backend : DELETE /api/courses/:id
   */
  async deleteCourse(id: number | string): Promise<void> {
    const response = await fetch(`${getBaseUrl()}/api/courses/${id}`, {
      method: 'DELETE',
      headers: await getAuthHeaders(),
    });

    const json = await parseResponse(response);

    if (!response.ok) {
      throw new Error(
        json?.message ||
          json?.error ||
          'Erreur lors de la suppression de la course'
      );
    }
  },
};