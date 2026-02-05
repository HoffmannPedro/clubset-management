import axios from 'axios';

// 1. Definimos la URL del Backend
// Lo ideal es usar variables de entorno (VITE_API_URL), pero tu lógica de hostname 
// es perfecta para empezar sin complicarse con configuraciones de Vercel por ahora.
const getBaseUrl = () => {
    // Si estamos desarrollando en local...
    if (window.location.hostname === 'localhost') {
        return 'http://localhost:8080/api';
    }
    
    return 'https://clubset-backend.onrender.com';
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

// --- INTERCEPTOR DE ERRORES (Opcional pero recomendado) ---
// Si el token expira (Error 403/401), cerramos sesión automáticamente
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            // Si el backend nos rechaza por token inválido, limpiamos y redirigimos
            localStorage.removeItem('token');
            // Opcional: window.location.href = '/'; 
        }
        return Promise.reject(error);
    }
);

export default api;