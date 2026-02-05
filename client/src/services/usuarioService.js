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

export const updateUsuario = async (id, usuario) => {
    // PUT /api/usuarios/{id}
    // Nota: Necesitas crear este endpoint en Java si no lo tienes (ver abajo)
    const response = await api.put(`/usuarios/${id}`, usuario); 
    return response.data;
};

export const deleteUsuario = async (id) => {
    // DELETE /api/usuarios/{id}
    const response = await api.delete(`/usuarios/${id}`);
    return response.data;
};