import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { mostrarAlerta } from '../utils/alertas';

const Login = () => {
    const { login, register } = useAuth(); // Importamos register
    
    // Estado para saber si muestra Login o Registro
    const [isRegistering, setIsRegistering] = useState(false);
    const [loading, setLoading] = useState(false);

    // Estado del formulario unificado
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        nombre: '',
        apellido: '',
        telefono: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        let result;

        if (isRegistering) {
            // Lógica de Registro
            if (!formData.nombre || !formData.apellido || !formData.telefono) {
                mostrarAlerta('Datos Incompletos', 'Completa todos los campos para registrarte.', 'warning');
                setLoading(false);
                return;
            }
            // Llamamos a register con todos los datos
            result = await register(formData);
        } else {
            // Lógica de Login (Solo mandamos email y pass)
            result = await login(formData.email, formData.password);
        }

        if (result.success) {
            mostrarAlerta(
                isRegistering ? '¡Cuenta Creada!' : '¡Bienvenido!', 
                'Ingresando al sistema...', 
                'success'
            );
        } else {
            mostrarAlerta('Error', result.message, 'error');
        }
        setLoading(false);
    };

    // Estilos comunes
    const inputClass = "w-full bg-background border border-border text-white rounded-xl p-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm";
    const labelClass = "block text-[10px] font-bold text-textMuted uppercase tracking-wider mb-1 ml-1";

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
            {/* Decoración de fondo */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute -top-20 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-700"></div>
            </div>

            <div className="w-full max-w-md bg-surface border border-border rounded-2xl shadow-2xl p-8 relative z-10 animate-in fade-in zoom-in-95 duration-500">
                
                {/* Header Dinámico */}
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-black italic tracking-tighter text-white mb-1">
                        ClubSet <span className="text-primary">MGT</span>
                    </h1>
                    <p className="text-textMuted text-[10px] font-bold uppercase tracking-widest">
                        {isRegistering ? 'Crear Nueva Cuenta' : 'Acceso a Plataforma'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    {/* CAMPOS EXTRA SOLO PARA REGISTRO */}
                    {isRegistering && (
                        <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Nombre</label>
                                    <input name="nombre" type="text" className={inputClass} placeholder="Lionel" value={formData.nombre} onChange={handleChange} />
                                </div>
                                <div>
                                    <label className={labelClass}>Apellido</label>
                                    <input name="apellido" type="text" className={inputClass} placeholder="Messi" value={formData.apellido} onChange={handleChange} />
                                </div>
                            </div>
                            <div>
                                <label className={labelClass}>Teléfono</label>
                                <input name="telefono" type="tel" className={inputClass} placeholder="11 1234 5678" value={formData.telefono} onChange={handleChange} />
                            </div>
                        </div>
                    )}

                    {/* CAMPOS COMUNES */}
                    <div>
                        <label className={labelClass}>Correo Electrónico</label>
                        <input name="email" type="email" required className={inputClass} placeholder="usuario@clubset.com" value={formData.email} onChange={handleChange} />
                    </div>

                    <div>
                        <label className={labelClass}>Contraseña</label>
                        <input name="password" type="password" required className={inputClass} placeholder="••••••••" value={formData.password} onChange={handleChange} />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className={`w-full font-black uppercase tracking-widest py-3 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20 mt-2
                            ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                            ${isRegistering ? 'bg-secondary text-white' : 'bg-gradient-to-r from-primary to-green-600 text-black'}
                        `}
                    >
                        {loading ? 'Procesando...' : (isRegistering ? 'Registrarse' : 'Iniciar Sesión')}
                    </button>
                </form>

                {/* TOGGLE LOGIN/REGISTER */}
                <div className="mt-6 text-center pt-4 border-t border-white/5">
                    <p className="text-xs text-textMuted">
                        {isRegistering ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}
                        <button 
                            onClick={() => {
                                setIsRegistering(!isRegistering);
                                setFormData({ email: '', password: '', nombre: '', apellido: '', telefono: '' }); // Limpiar
                            }}
                            className="ml-2 text-white font-bold hover:underline focus:outline-none"
                        >
                            {isRegistering ? 'Inicia Sesión' : 'Regístrate aquí'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;