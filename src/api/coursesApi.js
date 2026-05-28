import apiClient from './axiosConfig';
export const getAll = (params) => apiClient.get('/courses',{params}); export const getById=(id)=>apiClient.get(`/courses/${id}`);
export const create=(data)=>apiClient.post('/courses',data); export const update=(id,data)=>apiClient.put(`/courses/${id}`,data);
export const remove=(id)=>apiClient.delete(`/courses/${id}`); export const updateStatus=(id,statut)=>apiClient.patch(`/courses/${id}/statut`,{statut});
