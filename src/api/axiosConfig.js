import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, STORAGE_TOKEN_KEY } from '../constants/config';

const apiClient = axios.create({ baseURL: API_BASE_URL, timeout: 15000 });
apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem(STORAGE_TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
apiClient.interceptors.response.use((r) => r, (error) => {
  if (!error.response) return Promise.reject(new Error('Serveur indisponible ou problème réseau.'));
  const msg = error.response?.data?.message || 'Une erreur est survenue.';
  return Promise.reject(new Error(msg));
});
export default apiClient;
