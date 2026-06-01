// services/authService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@/constants/api';

export interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  fonction?: string;
  privilege: string;
  etat_compte?: string;
  status?: string;
  created_at?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

const extractData = (data: any) => {
  return data?.data || data?.user || data;
};

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erreur de connexion');
    }

    await AsyncStorage.setItem('token', data.data.token);
    await AsyncStorage.setItem('user', JSON.stringify(data.data.user));

    return data.data;
  },

  async getMe(): Promise<User> {
    const token = await AsyncStorage.getItem('token');

    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || data.error || 'Erreur lors du chargement du profil'
      );
    }

    const user = extractData(data);

    await AsyncStorage.setItem('user', JSON.stringify(user));

    return user;
  },

  async logout() {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
  },

  async getToken(): Promise<string | null> {
    return AsyncStorage.getItem('token');
  },

  async getLocalUser(): Promise<User | null> {
    const raw = await AsyncStorage.getItem('user');

    if (!raw) return null;

    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },
};