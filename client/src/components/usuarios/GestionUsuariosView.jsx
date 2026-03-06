import { useState, useEffect } from 'react';
import FormularioUsuario from './FormularioUsuario';
import ListaUsuarios from './ListaUsuarios';
import PerfilUsuario from './PerfilUsuario';

const GestionUsuariosView = ({ refreshKey, onEditar, onEliminar, onVerPerfil, onUsuarioModificado, usuarioAEditar, usuarioInspeccionado, onVolverALista }) => {
    // Estado local para manejar las sub-pestañas
    const [subTabActiva, setSubTabActiva] = useState('LISTA'); // 'LISTA', 'FORMULARIO', 'PERFIL'

    // Efectos para saltar de pestaña automáticamente cuando vienen props desde el AdminPanel
    useEffect(() => {
        if (usuarioAEditar) {
            setSubTabActiva('FORMULARIO');
        }
    }, [usuarioAEditar]);

    useEffect(() => {
        if (usuarioInspeccionado) {
            setSubTabActiva('PERFIL');
        }
    }, [usuarioInspeccionado]);

    // Handler para cuando se crea o edita un usuario con éxito
    const handleExito = () => {
        onUsuarioModificado(); // Llama al padre para refrescar
        setSubTabActiva('LISTA'); // Lo devuelve a la lista
    };

    // Handler para cancelar edición o volver del perfil
    const handleVolver = () => {
        if (subTabActiva === 'PERFIL') onVolverALista();
        if (subTabActiva === 'FORMULARIO' && usuarioAEditar) onUsuarioModificado(); // Limpia la edición en el padre
        setSubTabActiva('LISTA');
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4">
            
            {/* Navegación de Sub-pestañas (TABS) */}
            {/* Si estamos viendo el PERFIL, mostramos un botón de volver. Si no, mostramos las TABS */}
            {subTabActiva === 'PERFIL' ? (
                <div className="bg-surface p-2 rounded-2xl border border-border shadow-sm">
                    <button 
                        onClick={handleVolver}
                        className="flex items-center gap-2 py-3 px-4 w-full md:w-auto text-xs font-black uppercase tracking-widest text-textMuted hover:text-white transition-colors"
                    >
                        ← Volver a la Lista
                    </button>
                </div>
            ) : (
                <div className="flex flex-col md:flex-row bg-surface p-2 rounded-2xl border border-border shadow-sm gap-2">
                    <button 
                        onClick={() => setSubTabActiva('LISTA')}
                        className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${subTabActiva === 'LISTA' ? 'bg-secondary/20 text-secondary shadow-sm border border-secondary/30' : 'text-textMuted hover:text-white hover:bg-white/5'}`}
                    >
                        👥 Lista de Socios
                    </button>
                    <button 
                        onClick={() => setSubTabActiva('FORMULARIO')}
                        className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${subTabActiva === 'FORMULARIO' ? 'bg-primary/20 text-primary shadow-sm border border-primary/30' : 'text-textMuted hover:text-white hover:bg-white/5'}`}
                    >
                        {usuarioAEditar ? '✏️ Editar Socio' : '➕ Registrar Socio'}
                    </button>
                </div>
            )}

            {/* Renderizado Condicional del Contenido */}
            <div className="mt-6">
                {subTabActiva === 'LISTA' && (
                    <ListaUsuarios 
                        refreshKey={refreshKey}
                        onEditar={onEditar}
                        onEliminar={onEliminar}
                        onVerPerfil={onVerPerfil}
                    />
                )}

                {subTabActiva === 'FORMULARIO' && (
                    <FormularioUsuario
                        onUsuarioCreado={handleExito}
                        usuarioAEditar={usuarioAEditar}
                        onCancelar={handleVolver}
                    />
                )}

                {subTabActiva === 'PERFIL' && usuarioInspeccionado && (
                    <PerfilUsuario usuarioId={usuarioInspeccionado} />
                )}
            </div>
        </div>
    );
};

export default GestionUsuariosView;