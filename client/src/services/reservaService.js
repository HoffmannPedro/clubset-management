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

// DELETE: Cancelar TODO el grupo (Turno Fijo)
export const cancelarGrupoReserva = async (id) => {
    const response = await api.delete(`/reservas/${id}/completo`);
    return response.data;
};

// NUEVO: Registrar un Pago (Caja)
export const registrarPago = async (id, datosPago) => {
    // datosPago espera: { monto, metodoPago, observacion }
    const response = await api.post(`/reservas/${id}/pagos`, datosPago);
    return response.data;
};

// Obtener pagos diarios
export const getPagosDiarios = async (fecha) => {
    const response = await api.get(`/pagos/diarios?fecha=${fecha}`)
    return response.data;
}

// Mantenemos por compatibilidad (opcional)
export const togglePago = async (id) => {
    const response = await api.put(`/reservas/${id}/pago`);
    return response.data;
};