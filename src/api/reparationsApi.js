import apiClient from './axiosConfig';
export const getAll = (params) => apiClient.get('/reparations',{params}); export const getById=(id)=>apiClient.get(`/reparations/${id}`);
export const create=(data)=>apiClient.post('/reparations',data); export const update=(id,data)=>apiClient.put(`/reparations/${id}`,data);
export const remove=(id)=>apiClient.delete(`/reparations/${id}`);
