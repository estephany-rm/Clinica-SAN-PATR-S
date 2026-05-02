
// Funciones de autenticación que usan el cliente Axios
import api from './api';

export const loginService = async (usuario, password) => {
  const response = await api.post('/auth/login', { usuario, password });
  return response.data; // { success, data: { token, usuario, rol, imagen, id }, message }
};

export const perfilService = async () => {
  const response = await api.get('/auth/perfil');
  return response.data;
};

export const registroService = async (datos) => {
  const response = await api.post('/auth/registro', datos);
  return response.data;
};

