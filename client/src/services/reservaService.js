import api from './api';

// GET: Traer todas las reservas
export const getReservas = async () => {
    const response = await api.get('/reservas');
    return response.data;
};

// POST: Crear una nueva reserva
export const crearReserva = async (reservaNueva) => {
    const response = await api.post('/reservas', reservaNueva);
    return response.data;
};

// DELETE: Cancelar una reserva INDIVIDUAL por ID
export const cancelarReserva = async (id) => {
    const response = await api.delete(`/reservas/${id}`);
    return response.data;
};

// DELETE: Cancelar TODO el grupo (Turno Fijo) usando el ID de una reserva como referencia
export const cancelarGrupoReserva = async (id) => {
    const response = await api.delete(`/reservas/${id}/completo`);
    return response.data;
};

// PUT: Alternar estado de pago
export const togglePago = async (id) => {
    const response = await api.put(`/reservas/${id}/pago`);
    return response.data;
};