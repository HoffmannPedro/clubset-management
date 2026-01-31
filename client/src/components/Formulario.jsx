import { useState } from 'react';
import { createUsuario } from '../services/usuarioService';
import { mostrarAlerta } from '../utils/alertas'; // Importamos las alertas lindas

const Formulario = ({ onUsuarioCreado }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        email: '',
        password: '',
        rol: 'SOCIO'
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validación simple
        if (!formData.nombre || !formData.apellido || !formData.email || !formData.password) {
            mostrarAlerta('Datos incompletos', 'Por favor completa todos los campos obligatorios.', 'warning');
            return;
        }

        try {
            await createUsuario(formData);
            
            mostrarAlerta('¡Socio Registrado!', `${formData.nombre} ${formData.apellido} ha sido añadido correctamente.`, 'success');
            
            setFormData({ nombre: '', apellido: '', email: '', password: '', rol: 'SOCIO' });
            if (onUsuarioCreado) onUsuarioCreado();
        } catch (error) {
            console.error("Error al crear usuario:", error);
            mostrarAlerta('Error', 'No se pudo registrar al usuario. Verifica los datos.', 'error');
        }
    };

    // Estilos reutilizables para consistencia
    const inputClass = "w-full bg-background border border-border text-text rounded-xl p-3 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all font-medium placeholder:text-textMuted/30";
    const labelClass = "block text-[10px] font-bold uppercase tracking-wider text-textMuted mb-2 ml-1";

    return (
        <div className="bg-surface p-6 md:p-10 border border-border shadow-2xl rounded-2xl max-w-4xl mx-auto">
            
            {/* ENCABEZADO (Separado del form) */}
            <div className="flex items-center gap-4 mb-8 pb-4 border-b border-border">
                <div className="h-10 w-1.5 bg-secondary rounded-full shadow-[0_0_10px_rgba(201,106,61,0.5)]"></div>
                <div>
                    <h3 className="text-2xl font-black text-text uppercase italic tracking-tighter leading-none">Alta de Miembro</h3>
                    <p className="text-xs text-textMuted font-bold uppercase tracking-widest mt-1">Registro en Base de Datos</p>
                </div>
            </div>

            {/* FORMULARIO */}
            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Grid para Nombre y Apellido */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className={labelClass}>Nombre</label>
                        <input 
                            className={inputClass} 
                            name="nombre" 
                            placeholder="Ej: Lionel"
                            value={formData.nombre} 
                            onChange={handleChange} 
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Apellido</label>
                        <input 
                            className={inputClass} 
                            name="apellido" 
                            placeholder="Ej: Messi"
                            value={formData.apellido} 
                            onChange={handleChange} 
                        />
                    </div>
                </div>

                {/* Email (Ancho completo en móvil, compartido en PC) */}
                <div>
                    <label className={labelClass}>Correo Electrónico</label>
                    <input 
                        className={inputClass} 
                        name="email" 
                        type="email" 
                        placeholder="usuario@email.com"
                        value={formData.email} 
                        onChange={handleChange} 
                    />
                </div>

                {/* Grid para Password y Rol */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className={labelClass}>Contraseña</label>
                        <input 
                            className={inputClass} 
                            name="password" 
                            type="password" 
                            placeholder="••••••••"
                            value={formData.password} 
                            onChange={handleChange} 
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Privilegios de cuenta</label>
                        <div className="relative">
                            <select 
                                className={`${inputClass} appearance-none cursor-pointer`} 
                                name="rol" 
                                value={formData.rol} 
                                onChange={handleChange}
                            >
                                <option value="SOCIO">Socio del Club</option>
                                <option value="ADMIN">Administrador de Sistema</option>
                            </select>
                            {/* Flecha decorativa */}
                            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-textMuted">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* BOTÓN DE ACCIÓN */}
                <div className="pt-4 flex justify-end">
                    <button 
                        type="submit" 
                        className="w-full md:w-auto bg-secondary text-text font-black py-3 px-8 uppercase tracking-[0.2em] hover:brightness-110 hover:scale-105 transition-all rounded-xl shadow-[0_10px_30px_rgba(201,106,61,0.2)]"
                    >
                        Finalizar Inscripción
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Formulario;