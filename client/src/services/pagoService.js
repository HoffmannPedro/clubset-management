import api from './api';

// GET: Obtener movimientos de la caja diaria
export const getPagosDiarios = async (fecha) => {
    const response = await api.get(`/pagos/diarios?fecha=${fecha}`);
    return response.data;
};

// POST: Registrar un Gasto Manual (Egreso)
export const registrarGastoManual = async (datosGasto) => {
    const response = await api.post('/pagos/gasto', datosGasto);
    return response.data;
};