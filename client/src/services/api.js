import axios from 'axios';

const getBaseUrl = () => {
    // Si estamos desarrollando en local...
    if (window.location.hostname === 'localhost') {
        return 'http://localhost:8080/api';
    }

    return 'https://clubset-backend.onrender.com/api';
};

const api = axios.create({
    baseURL: getBaseUrl(),
    headers: {
        'Content-Type': 'application/json',
    },
});

// --- INTERCEPTOR DE SEGURIDAD (JWT) ---
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// --- INTERCEPTOR DE ERRORES GLOBALES ---
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // 1. Manejo de Sesión
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            localStorage.removeItem('token');
            // window.location.href = '/login'; 
        }

        // 2. Extracción limpia del mensaje de error del Backend
        let mensajeLimpio = "Error de conexión con el servidor. Revisá tu red.";

        if (error.response && error.response.data) {
            if (error.response.data.message) {
                // Ataja nuestro nuevo ErrorResponseDTO de Spring Boot
                mensajeLimpio = error.response.data.message;
            } else if (typeof error.response.data === 'string') {
                // Fallback por si algún endpoint viejo devuelve texto
                mensajeLimpio = error.response.data;
            }
        }

        // 3. Rechazamos la promesa devolviendo SOLO el mensaje limpio
        return Promise.reject(new Error(mensajeLimpio));
    }
);

export default api;