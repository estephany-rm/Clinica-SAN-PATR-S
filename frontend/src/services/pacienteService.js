
import api from './api';

export const getPacientes   = (buscar = '') => api.get(`/pacientes?buscar=${buscar}`);
export const getPaciente    = (id)          => api.get(`/pacientes/${id}`);
export const createPaciente = (datos)       => api.post('/pacientes', datos);
export const updatePaciente = (id, datos)   => api.put(`/pacientes/${id}`, datos);
export const deletePaciente = (id)          => api.delete(`/pacientes/${id}`);
