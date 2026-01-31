import api from './api';

export const getCanchas = async () => {
  const response = await api.get('/canchas');
  return response.data; // Devuelve List<CanchaDTO>
};

export const createCancha = async (canchaData) => {
  const response = await api.post('/canchas', canchaData);
  return response.data; // Devuelve CanchaDTO
};