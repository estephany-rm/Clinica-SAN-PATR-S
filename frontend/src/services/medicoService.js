
import api from './api';

export const getMedicos   = (buscar = '') => api.get(`/medicos?buscar=${buscar}`);
export const getMedico    = (id)          => api.get(`/medicos/${id}`);
export const createMedico = (datos)       => api.post('/medicos', datos);
export const updateMedico = (id, datos)   => api.put(`/medicos/${id}`, datos);
export const deleteMedico = (id)          => api.delete(`/medicos/${id}`);

