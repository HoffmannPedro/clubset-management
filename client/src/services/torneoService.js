import api from './api';

export const getTorneos = async () => {
    const response = await api.get('/torneos');
    return response.data;
};

export const crearTorneo = async (torneoData) => {
    const response = await api.post('/torneos', torneoData);
    return response.data;
};

export const getPartidosTorneo = async (torneoId) => {
    const response = await api.get(`/torneos/${torneoId}/partidos`);
    return response.data;
};

export const generarFixtureAleatorio = async (torneoId) => {
    const response = await api.post(`/torneos/${torneoId}/fixture/aleatorio`);
    return response.data;
};

export const generarFixtureManual = async (torneoId, data) => {
    const response = await api.post(`/torneos/${torneoId}/fixture/manual`, data);
    return response.data;
};

export const getEquiposTorneo = async (torneoId) => {
    const response = await api.get(`/torneos/${torneoId}/equipos`);
    return response.data;
};

export const inscribirEquipo = async (torneoId, equipoData) => {
    const response = await api.post(`/torneos/${torneoId}/equipos`, equipoData);
    return response.data;
};

export const cambiarEstadoTorneo = async (torneoId, estado) => {
    const response = await api.put(`/torneos/${torneoId}/estado?estado=${estado}`);
    return response.data;
};

export const eliminarTorneo = async (torneoId) => {
    await api.delete(`/torneos/${torneoId}`);
};

export const cargarResultado = async (torneoId, partidoId, data) => {
    const response = await api.put(`/torneos/${torneoId}/partidos/${partidoId}/resultado`, data);
    return response.data;
};

