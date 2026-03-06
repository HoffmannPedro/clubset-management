import { useState, useEffect } from 'react';
// --- IMPORTAMOS REACT ROUTER ---
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';
import Sidebar from '../layout/Sidebar';
import FormularioCancha from '../canchas/FormularioCancha';
import ListaCanchas from '../canchas/ListaCanchas';
import FormularioUsuario from '../usuarios/FormularioUsuario';
import ListaUsuarios from '../usuarios/ListaUsuarios';
import CajaView from '../caja/CajaView';
import DashboardView from '../dashboard/DashboardView';
import PerfilUsuario from '../usuarios/PerfilUsuario';
import { deleteUsuario } from '../../services/usuarioService';
import GestionReservasView from '../reservas/GestionReservasView';

const AdminPanel = () => {
    const { user } = useAuth();
    
    // --- HOOKS DE NAVEGACIÓN ---
    const location = useLocation();
    const navigate = useNavigate();
    
    // Extraemos la pestaña actual de la URL (ej: de "/canchas" sacamos "canchas")
    // Si estamos en "/", activeTab será vacío.
    const activeTab = location.pathname.split('/')[1] || '';

    const [usuarioEditar, setUsuarioEditar] = useState(null);
    const [seleccionGrilla, setSeleccionGrilla] = useState(null);
    const [usuarioInspeccionado, setUsuarioInspeccionado] = useState(null);

    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

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

    const handleCancelarEdicion = () => setUsuarioEditar(null);

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

    const handleVerPerfil = (id) => {
        setUsuarioInspeccionado(id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleVolverALista = () => setUsuarioInspeccionado(null);

    return (
        <div className="flex min-h-screen bg-background text-text font-sans">
            <Sidebar
                menuItems={menuItems}
                activeTab={activeTab}
                // Magia: El Sidebar cree que cambia un estado, pero en realidad navega la URL
                setActiveTab={(tabId) => navigate(`/${tabId}`)}
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
                        
                        {/* --- EL CORAZÓN DEL ENRUTAMIENTO --- */}
                        <Routes>
                            {/* Ruta por defecto: Redirige según el rol */}
                            <Route path="/" element={<Navigate to={isAdmin ? "/dashboard" : "/perfil"} replace />} />

                            {/* Rutas para ADMIN */}
                            {isAdmin && (
                                <>
                                    <Route path="/dashboard" element={<DashboardView setActiveTab={(tabId) => navigate(`/${tabId}`)} />} />
                                    <Route path="/caja" element={<CajaView />} />
                                    <Route path="/canchas" element={
                                        <div className="space-y-8 animate-in slide-in-from-bottom-4">
                                            <FormularioCancha onCanchaCreada={triggerRefresh} />
                                            <div className="overflow-x-auto pb-4"><ListaCanchas refreshKey={refreshTrigger} /></div>
                                        </div>
                                    } />
                                    <Route path="/usuarios" element={
                                        <div className="space-y-8 animate-in slide-in-from-bottom-4">
                                            {usuarioInspeccionado ? (
                                                <div>
                                                    <button onClick={handleVolverALista} className="mb-6 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-textMuted hover:text-primary transition-colors">
                                                        ← Volver a la Lista de Socios
                                                    </button>
                                                    <PerfilUsuario usuarioId={usuarioInspeccionado} />
                                                </div>
                                            ) : (
                                                <>
                                                    <FormularioUsuario onUsuarioCreado={handleExito} usuarioAEditar={usuarioEditar} onCancelar={handleCancelarEdicion} />
                                                    <div className="overflow-x-auto pb-4">
                                                        <ListaUsuarios refreshKey={refreshTrigger} onEditar={handleEditar} onEliminar={handleEliminar} onVerPerfil={handleVerPerfil} />
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    } />
                                    <Route path="/reservas" element={
                                        <GestionReservasView refreshKey={refreshTrigger} onReservaExitosa={handleReservaExitosa} preseleccion={seleccionGrilla} onEmptySlotClick={handleSlotClick} />
                                    } />
                                </>
                            )}

                            {/* Ruta compartida (Admin y Socios) */}
                            <Route path="/perfil" element={<PerfilUsuario />} />

                            {/* Ruta de rescate (404 oculto): Si tipean cualquier cosa, los devuelve a su inicio */}
                            <Route path="*" element={<Navigate to={isAdmin ? "/dashboard" : "/perfil"} replace />} />
                        </Routes>

                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminPanel;