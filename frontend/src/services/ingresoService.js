import api from './api';

export const getIngresos      = ()          => api.get('/ingresos');
export const getIngreso       = (id)        => api.get(`/ingresos/${id}`);
export const createIngreso    = (datos)     => api.post('/ingresos', datos);
export const updateIngreso    = (id, datos) => api.put(`/ingresos/${id}`, datos);
export const deleteIngreso    = (id)        => api.delete(`/ingresos/${id}`);
export const estadisticasService = ()       => api.get('/ingresos/estadisticas');

