import apiClient from './axiosConfig';
export const getAll = (params) => apiClient.get('/reservations',{params}); export const getById=(id)=>apiClient.get(`/reservations/${id}`);
export const create=(data)=>apiClient.post('/reservations',data); export const update=(id,data)=>apiClient.put(`/reservations/${id}`,data);
export const remove=(id)=>apiClient.delete(`/reservations/${id}`); export const updateStatus=(id,statut)=>apiClient.patch(`/reservations/${id}/statut`,{statut});
