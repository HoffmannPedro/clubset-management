import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../layout/Sidebar';
import FormularioCancha from '../canchas/FormularioCancha';
import ListaCanchas from '../canchas/ListaCanchas';
import FormularioUsuario from '../usuarios/FormularioUsuario';
import ListaUsuarios from '../usuarios/ListaUsuarios';
import FormularioReserva from '../reservas/FormularioReserva';
import GrillaReservas from '../reservas/GrillaReservas';
import CajaView from '../caja/CajaView';
import DashboardView from '../dashboard/DashboardView';
import PerfilUsuario from '../usuarios/PerfilUsuario'; // <--- 1. Importado
import { deleteUsuario } from '../../services/usuarioService';

const AdminPanel = () => {
    const { user } = useAuth();
    const [usuarioEditar, setUsuarioEditar] = useState(null);
    const [seleccionGrilla, setSeleccionGrilla] = useState(null);

    // --- 2. Nuevo Estado para Inspección ---
    const [usuarioInspeccionado, setUsuarioInspeccionado] = useState(null);

    const getInitialTab = () => {
        if (user?.rol === 'ADMIN') return 'dashboard';
        return 'perfil';
    };

    const [activeTab, setActiveTab] = useState(getInitialTab());
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useEffect(() => {
        setActiveTab(getInitialTab());
    }, [user]);

    const isAdmin = user?.rol === 'ADMIN';

    const allMenuItems = [
        { id: 'dashboard', label: 'Resumen General', icon: '📊', roles: ['ADMIN'] },
        { id: 'perfil', label: 'Mi Perfil', icon: '👤', roles: ['ADMIN', 'SOCIO'] },
        { id: 'caja', label: 'Caja Diaria', icon: '💵', roles: ['ADMIN'] },
        { id: 'reservas', label: 'Gestión Reservas', icon: '📅', roles: ['ADMIN'] },
        { id: 'canchas', label: 'Canchas', icon: '🎾', roles: ['ADMIN'] },
        { id: 'usuarios', label: 'Socios', icon: '👥', roles: ['ADMIN'] },
    ];

    const menuItems = allMenuItems.filter(item => item.roles.includes(user?.rol));

    const triggerRefresh = () => setRefreshTrigger(prev => prev + 1);

    const handleEditar = (usuario) => {
        setUsuarioEditar(usuario);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleEliminar = async (id) => {
        if (window.confirm('⚠️ ¿Estás seguro de eliminar este usuario permanentemente?')) {
            try {
                await deleteUsuario(id);
                triggerRefresh();
            } catch (error) {
                console.error("Error al eliminar:", error);
                alert("Hubo un error al intentar eliminar el usuario.");
            }
        }
    };

    const handleCancelarEdicion = () => {
        setUsuarioEditar(null);
    };

    const handleExito = () => {
        triggerRefresh();
        setUsuarioEditar(null);
    };

    const handleSlotClick = (canchaId, hora, fecha) => {
        setSeleccionGrilla({ canchaId, hora, fecha });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleReservaExitosa = () => {
        triggerRefresh();
        setSeleccionGrilla(null);
    };

    // --- 3. Nuevos Handlers para Perfil ---
    const handleVerPerfil = (id) => {
        setUsuarioInspeccionado(id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleVolverALista = () => {
        setUsuarioInspeccionado(null);
    };
    // -------------------------------------

    return (
        <div className="flex min-h-screen bg-background text-text font-sans">
            <Sidebar
                menuItems={menuItems}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                isMobileOpen={isMobileOpen}
                setIsMobileOpen={setIsMobileOpen}
                isDesktopCollapsed={isDesktopCollapsed}
                setIsDesktopCollapsed={setIsDesktopCollapsed}
            />

            <main className="flex-1 flex flex-col min-w-0 transition-all duration-300">
                <header className="h-16 md:h-20 bg-surface/50 backdrop-blur-md border-b border-border sticky top-0 z-20 px-4 md:px-8 flex items-center justify-between">
                    <button onClick={() => setIsMobileOpen(true)} className="md:hidden p-2 text-textMuted">☰</button>
                    <h2 className="text-sm font-black uppercase tracking-[0.2em] text-textMuted hidden md:block">
                        {menuItems.find(i => i.id === activeTab)?.label || 'ClubSet'}
                    </h2>
                    <span className="font-black italic md:hidden">ClubSet</span>
                </header>

                <div className="flex-1 p-4 md:p-10 overflow-x-hidden">
                    <div className="max-w-6xl mx-auto">

                        {isAdmin && activeTab === 'dashboard' && <DashboardView setActiveTab={setActiveTab} />}

                        {activeTab === 'perfil' && <PerfilUsuario />}

                        {isAdmin && activeTab === 'caja' && <CajaView />}

                        {isAdmin && activeTab === 'canchas' && (
                            <div className="space-y-8 animate-in slide-in-from-bottom-4">
                                <FormularioCancha onCanchaCreada={triggerRefresh} />
                                <div className="overflow-x-auto pb-4"><ListaCanchas refreshKey={refreshTrigger} /></div>
                            </div>
                        )}

                        {isAdmin && activeTab === 'usuarios' && (
                            <div className="space-y-8 animate-in slide-in-from-bottom-4">
                                
                                {/* 4. Renderizado Condicional: Lista o Perfil */}
                                {usuarioInspeccionado ? (
                                    <div>
                                        <button 
                                            onClick={handleVolverALista}
                                            className="mb-6 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-textMuted hover:text-primary transition-colors"
                                        >
                                            ← Volver a la Lista de Socios
                                        </button>
                                        <PerfilUsuario usuarioId={usuarioInspeccionado} />
                                    </div>
                                ) : (
                                    <>
                                        <FormularioUsuario
                                            onUsuarioCreado={handleExito}
                                            usuarioAEditar={usuarioEditar}
                                            onCancelar={handleCancelarEdicion}
                                        />

                                        <div className="overflow-x-auto pb-4">
                                            <ListaUsuarios
                                                refreshKey={refreshTrigger}
                                                onEditar={handleEditar}
                                                onEliminar={handleEliminar}
                                                onVerPerfil={handleVerPerfil} // <--- Pasamos la función
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {isAdmin && activeTab === 'reservas' && (
                            <div className="space-y-8 animate-in slide-in-from-bottom-4">
                                <FormularioReserva
                                    onReservaCreada={handleReservaExitosa}
                                    preseleccion={seleccionGrilla}
                                />
                                <GrillaReservas
                                    refreshKey={refreshTrigger}
                                    onEmptySlotClick={handleSlotClick}
                                />
                            </div>
                        )}

                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminPanel;