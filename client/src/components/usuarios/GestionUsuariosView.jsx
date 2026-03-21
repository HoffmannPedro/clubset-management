import { useState, useEffect } from 'react';
import FormularioUsuario from './FormularioUsuario';
import ListaUsuarios from './ListaUsuarios';
import PerfilUsuario from './PerfilUsuario';

import { deleteUsuario } from '../../services/usuarioService';

const GestionUsuariosView = () => {
    const [subTabActiva, setSubTabActiva] = useState('LISTA'); // 'LISTA', 'FORMULARIO', 'PERFIL'
    
    // ESTADOS MUDADOS DESDE EL ADMIN PANEL PARA EVITAR PROP DRILLING Y RE-RENDERS MASIVOS
    const [refreshKey, setRefreshKey] = useState(0);
    const [usuarioAEditar, setUsuarioAEditar] = useState(null);
    const [usuarioInspeccionado, setUsuarioInspeccionado] = useState(null);

    const triggerRefresh = () => setRefreshKey(prev => prev + 1);

    const handleEditar = (usuario) => {
        setUsuarioAEditar(usuario);
        setSubTabActiva('FORMULARIO');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleEliminar = async (id) => {
        if (window.confirm('⚠️ ¿Estás seguro de eliminar este socio permanentemente?')) {
            try {
                await deleteUsuario(id);
                triggerRefresh();
            } catch (error) {
                console.error("Error al eliminar:", error);
                alert("Hubo un error al intentar eliminar el socio.");
            }
        }
    };

    const handleVerPerfil = (id) => {
        setUsuarioInspeccionado(id);
        setSubTabActiva('PERFIL');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Handler para cuando se crea o edita un usuario con éxito
    const handleExito = () => {
        triggerRefresh();
        setUsuarioAEditar(null);
        setSubTabActiva('LISTA');
    };

    // Handler para cancelar edición o volver del perfil
    const handleVolver = () => {
        setUsuarioAEditar(null);
        setUsuarioInspeccionado(null);
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
                        onEditar={handleEditar}
                        onEliminar={handleEliminar}
                        onVerPerfil={handleVerPerfil}
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