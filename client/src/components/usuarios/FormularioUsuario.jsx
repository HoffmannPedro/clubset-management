import { useUsuarioForm } from '../../hooks/useUsuarioForm';

// Aceptamos las nuevas props para manejar la edición
const FormularioUsuario = ({ onUsuarioCreado, usuarioAEditar, onCancelar }) => {
    
    // Pasamos el usuario a editar al Hook para que él se encargue de rellenar los campos
    const { formData, handleChange, handleSubmit } = useUsuarioForm(onUsuarioCreado, usuarioAEditar);

    const isEditing = !!usuarioAEditar; // Bandera para saber en qué modo estamos

    const inputClass = "w-full bg-background border border-border text-text rounded-xl p-3 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all font-medium placeholder:text-textMuted/30";
    const labelClass = "block text-[10px] font-bold uppercase tracking-wider text-textMuted mb-2 ml-1";

    return (
        <div className={`bg-surface p-6 md:p-10 border border-border shadow-2xl rounded-2xl max-w-4xl mx-auto transition-all duration-500 ${isEditing ? 'ring-2 ring-secondary/50' : ''}`}>
            
            {/* ENCABEZADO DINÁMICO */}
            <div className="flex items-center gap-4 mb-8 pb-4 border-b border-border">
                <div className={`h-10 w-1.5 rounded-full shadow-[0_0_10px_rgba(201,106,61,0.5)] transition-colors ${isEditing ? 'bg-blue-500 shadow-blue-500/50' : 'bg-secondary'}`}></div>
                <div>
                    <h3 className="text-2xl font-black text-text uppercase italic tracking-tighter leading-none">
                        {isEditing ? 'Editar Miembro' : 'Alta de Miembro'}
                    </h3>
                    <p className="text-xs text-textMuted font-bold uppercase tracking-widest mt-1">
                        {isEditing ? `Modificando ID: #${usuarioAEditar.id}` : 'Registro en Base de Datos'}
                    </p>
                </div>
            </div>

            {/* FORMULARIO */}
            <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* SECCIÓN 1: DATOS PERSONALES */}
                <div className="space-y-4">
                    <h4 className="text-xs font-black text-secondary uppercase border-b border-white/5 pb-1 mb-4">Datos Personales</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className={labelClass}>Nombre</label>
                            <input className={inputClass} name="nombre" placeholder="Ej: Lionel" value={formData.nombre} onChange={handleChange} />
                        </div>
                        <div>
                            <label className={labelClass}>Apellido</label>
                            <input className={inputClass} name="apellido" placeholder="Ej: Messi" value={formData.apellido} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className={labelClass}>Correo Electrónico</label>
                            <input 
                                className={`${inputClass} ${isEditing ? 'opacity-50 cursor-not-allowed' : ''}`} 
                                name="email" 
                                type="email" 
                                placeholder="usuario@email.com" 
                                value={formData.email} 
                                onChange={handleChange}
                                readOnly={isEditing} // El email suele ser el ID único, mejor no editarlo por error
                                title={isEditing ? "El email no se puede modificar por seguridad" : ""}
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Teléfono / WhatsApp</label>
                            <input className={inputClass} name="telefono" type="tel" placeholder="11 1234 5678" value={formData.telefono} onChange={handleChange} />
                        </div>
                    </div>
                </div>

                {/* SECCIÓN 2: PERFIL DEPORTIVO */}
                <div className="space-y-4">
                    <h4 className="text-xs font-black text-primary uppercase border-b border-white/5 pb-1 mb-4">Perfil Deportivo</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Categoría */}
                        <div>
                            <label className={labelClass}>Categoría</label>
                            <div className="relative">
                                <select className={`${inputClass} appearance-none cursor-pointer`} name="categoria" value={formData.categoria} onChange={handleChange}>
                                    <option value="PRIMERA">1ra - Profesional</option>
                                    <option value="SEGUNDA">2da - Avanzado</option>
                                    <option value="TERCERA">3ra - Competitivo</option>
                                    <option value="CUARTA">4ta - Intermedio</option>
                                    <option value="QUINTA">5ta - Amateur</option>
                                    <option value="SEXTA">6ta - Recreativo</option>
                                    <option value="SEPTIMA">7ma - Inicial</option>
                                    <option value="PRINCIPIANTE">Principiante</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-textMuted"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg></div>
                            </div>
                        </div>

                        {/* Mano Hábil */}
                        <div>
                            <label className={labelClass}>Mano Hábil</label>
                            <div className="relative">
                                <select className={`${inputClass} appearance-none cursor-pointer`} name="manoHabil" value={formData.manoHabil} onChange={handleChange}>
                                    <option value="DIESTRO">Diestro</option>
                                    <option value="ZURDO">Zurdo</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-textMuted"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg></div>
                            </div>
                        </div>

                         {/* Género */}
                         <div>
                            <label className={labelClass}>Género</label>
                            <div className="relative">
                                <select className={`${inputClass} appearance-none cursor-pointer`} name="genero" value={formData.genero} onChange={handleChange}>
                                    <option value="MASCULINO">Masculino</option>
                                    <option value="FEMENINO">Femenino</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-textMuted"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SECCIÓN 3: SEGURIDAD */}
                <div className="space-y-4">
                    <h4 className="text-xs font-black text-red-500 uppercase border-b border-white/5 pb-1 mb-4">Seguridad de Cuenta</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className={labelClass}>
                                Contraseña {isEditing && <span className="text-[9px] text-textMuted normal-case">(Dejar vacío para mantener actual)</span>}
                            </label>
                            <input 
                                className={inputClass} 
                                name="password" 
                                type="password" 
                                placeholder={isEditing ? "Sin cambios" : "••••••••"} 
                                value={formData.password} 
                                onChange={handleChange} 
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Privilegios</label>
                            <div className="relative">
                                <select className={`${inputClass} appearance-none cursor-pointer`} name="rol" value={formData.rol} onChange={handleChange}>
                                    <option value="SOCIO">Socio del Club</option>
                                    <option value="ADMIN">Administrador de Sistema</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-textMuted"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* BOTONERA DE ACCIÓN */}
                <div className="pt-4 flex flex-col md:flex-row justify-end gap-4">
                    {/* Botón Cancelar (Solo en edición) */}
                    {isEditing && (
                        <button 
                            type="button"
                            onClick={onCancelar}
                            className="w-full md:w-auto bg-transparent border border-border text-textMuted font-bold py-3 px-6 uppercase tracking-widest hover:bg-white/5 hover:text-text transition-all rounded-xl"
                        >
                            Cancelar
                        </button>
                    )}

                    <button 
                        type="submit" 
                        className={`
                            w-full md:w-auto font-black py-3 px-8 uppercase tracking-[0.2em] hover:brightness-110 hover:scale-105 transition-all rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.2)]
                            ${isEditing ? 'bg-blue-600 text-white shadow-blue-600/20' : 'bg-secondary text-text shadow-secondary/20'}
                        `}
                    >
                        {isEditing ? 'Guardar Cambios' : 'Finalizar Inscripción'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default FormularioUsuario;