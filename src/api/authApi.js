import apiClient from './axiosConfig';
export const login = (data) => apiClient.post('/auth/login', data);
export const register = (data) => apiClient.post('/auth/register', data);
export const getMe = () => apiClient.get('/auth/me');
