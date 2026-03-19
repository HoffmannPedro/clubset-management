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

// --- MANEJO DE REFRESH TOKEN ---
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// --- INTERCEPTOR DE ERRORES GLOBALES ---
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // 1. Manejo de Sesión y Refresh Token transparent
        if (error.response && (error.response.status === 401 || error.response.status === 403) && !originalRequest._retry) {
            if (originalRequest.url === '/auth/login' || originalRequest.url === '/auth/refresh') {
                return Promise.reject(error);
            }

            if (isRefreshing) {
                return new Promise(function(resolve, reject) {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers['Authorization'] = 'Bearer ' + token;
                    return api(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
                isRefreshing = false;
                localStorage.removeItem('token');
                window.location.href = '/login';
                return Promise.reject(error);
            }

            try {
                // Instancia limpia para evitar interceptores en loop
                const { data } = await axios.post(`${api.defaults.baseURL}/auth/refresh`, {
                    refreshToken: refreshToken
                });

                localStorage.setItem('token', data.token);
                if (data.refreshToken) {
                    localStorage.setItem('refreshToken', data.refreshToken);
                }

                api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
                originalRequest.headers['Authorization'] = `Bearer ${data.token}`;

                processQueue(null, data.token);
                return api(originalRequest);
            } catch (err) {
                processQueue(err, null);
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }

        // 2. Extracción limpia del mensaje de error del Backend
        let mensajeLimpio = "Error de conexión con el servidor. Revisá tu red.";

        if (error.response && error.response.data) {
            if (error.response.data.message) {
                mensajeLimpio = error.response.data.message;
            } else if (typeof error.response.data === 'string') {
                mensajeLimpio = error.response.data;
            }
        }

        return Promise.reject(new Error(mensajeLimpio));
    }
);

export default api;