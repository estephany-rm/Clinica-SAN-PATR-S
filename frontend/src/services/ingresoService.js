
import api from './api';

export const estadisticasService = async () => {
  const response = await api.get('/ingresos/estadisticas');
  return response.data;
};

