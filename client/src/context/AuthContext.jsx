import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Al cargar la app, verificamos token Y pedimos el rol al backend
    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    // Pedimos los datos frescos del usuario (incluido el ROL)
                    const { data } = await api.get('/usuarios/me');
                    setUser({ ...data, token }); 
                } catch (error) {
                    console.error("Token inválido o expirado", error);
                    localStorage.removeItem('token');
                    setUser(null);
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            const { token } = response.data;
            localStorage.setItem('token', token);
            
            // Inmediatamente después de obtener token, pedimos el perfil completo
            const profileResponse = await api.get('/usuarios/me');
            setUser({ ...profileResponse.data, token });
            
            return { success: true };
        } catch (error) {
            return { 
                success: false, 
                message: error.response?.status === 403 ? "Credenciales incorrectas" : "Error de conexión" 
            };
        }
    };

    const register = async (userData) => {
        try {
            const response = await api.post('/auth/register', userData);
            const { token } = response.data;
            localStorage.setItem('token', token);
            
            // Pedimos perfil (aunque sabemos que al registrarse es SOCIO, es buena práctica)
            const profileResponse = await api.get('/usuarios/me');
            setUser({ ...profileResponse.data, token });

            return { success: true };
        } catch (error) {
            return { success: false, message: "Error al registrarse." };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);