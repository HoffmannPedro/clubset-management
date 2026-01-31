import api from './api';

export const getUsuarios = async () => {
    const response = await api.get('/usuarios');
    return response.data;
};


export const createUsuario = async (usuarioData) => {
    // Enviamos el objeto con nombre, apellido, email, etc.
    const response = await api.post('/usuarios', usuarioData);
    return response.data;
};