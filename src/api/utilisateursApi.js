import apiClient from './axiosConfig';
export const getAll = (params) => apiClient.get('/utilisateurs',{params}); export const getById=(id)=>apiClient.get(`/utilisateurs/${id}`);
export const create=(data)=>apiClient.post('/utilisateurs',data); export const update=(id,data)=>apiClient.put(`/utilisateurs/${id}`,data);
export const remove=(id)=>apiClient.delete(`/utilisateurs/${id}`);
