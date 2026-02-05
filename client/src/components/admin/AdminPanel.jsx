import { useState, useEffect } from 'react'; // Agrega useEffect
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
import PerfilUsuario from '../usuarios/PerfilUsuario';
import { deleteUsuario } from '../../services/usuarioService';

const AdminPanel = () => {
    const { user } = useAuth();

    const [usuarioEditar, setUsuarioEditar] = useState(null);

    // Lógica segura para determinar la pestaña inicial
    const getInitialTab = () => {
        if (user?.rol === 'ADMIN') return 'dashboard';
        return 'perfil';
    };

    const [activeTab, setActiveTab] = useState(getInitialTab());
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Efecto para redirigir si el usuario cambia (ej: recarga de página)
    useEffect(() => {
        setActiveTab(getInitialTab());
    }, [user]);

    const isAdmin = user?.rol === 'ADMIN';

    // MENÚ ESTRICTO
    const allMenuItems = [
        { id: 'dashboard', label: 'Resumen General', icon: '📊', roles: ['ADMIN'] }, // <--- SOLO ADMIN
        { id: 'perfil', label: 'Mi Perfil', icon: '👤', roles: ['ADMIN', 'SOCIO'] },
        { id: 'caja', label: 'Caja Diaria', icon: '💵', roles: ['ADMIN'] }, // <--- SOLO ADMIN
        { id: 'reservas', label: 'Gestión Reservas', icon: '📅', roles: ['ADMIN'] },
        { id: 'canchas', label: 'Canchas', icon: '🎾', roles: ['ADMIN'] },
        { id: 'usuarios', label: 'Socios', icon: '👥', roles: ['ADMIN'] },
    ];

    // Filtramos el menú
    const menuItems = allMenuItems.filter(item => item.roles.includes(user?.rol));

    const triggerRefresh = () => setRefreshTrigger(prev => prev + 1);

    // --- FUNCIONES DE ACCIÓN ---
    const handleEditar = (usuario) => {
        setUsuarioEditar(usuario); // Ponemos al usuario en el "escenario"
        // Hacemos scroll suave hacia arriba para ver el formulario
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleEliminar = async (id) => {
        // 1. Confirmación de seguridad
        if (window.confirm('⚠️ ¿Estás seguro de eliminar este usuario permanentemente?')) {
            try {
                // 2. Llamada al Backend
                await deleteUsuario(id);
                
                // 3. Refrescar la tabla
                triggerRefresh();
                
            } catch (error) {
                console.error("Error al eliminar:", error);
                alert("Hubo un error al intentar eliminar el usuario.");
            }
        }
    };

    const handleCancelarEdicion = () => {
        setUsuarioEditar(null); // Limpiamos el formulario
    };

    const handleExito = () => {
        triggerRefresh();
        setUsuarioEditar(null); // Si editó, limpiamos. Si creó, ya se limpia solo.
    };

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

                        {/* Renderizado Condicional Seguro */}

                        {/* SOLO ADMIN ve el Dashboard */}
                        {isAdmin && activeTab === 'dashboard' && <DashboardView setActiveTab={setActiveTab} />}

                        {/* TODOS ven Perfil */}
                        {activeTab === 'perfil' && <PerfilUsuario />}

                        {/* SOLO ADMIN ve Caja */}
                        {isAdmin && activeTab === 'caja' && <CajaView />}

                        {isAdmin && activeTab === 'canchas' && (
                            <div className="space-y-8 animate-in slide-in-from-bottom-4">
                                <FormularioCancha onCanchaCreada={triggerRefresh} />
                                <div className="overflow-x-auto pb-4"><ListaCanchas refreshKey={refreshTrigger} /></div>
                            </div>
                        )}

                        {isAdmin && activeTab === 'usuarios' && (
                            <div className="space-y-8 animate-in slide-in-from-bottom-4">
                                {/* Pasamos las nuevas props al formulario */}
                                <FormularioUsuario
                                    onUsuarioCreado={handleExito}
                                    usuarioAEditar={usuarioEditar} // <--- DATOS
                                    onCancelar={handleCancelarEdicion} // <--- CONTROL
                                />

                                <div className="overflow-x-auto pb-4">
                                    {/* Pasamos las funciones a la lista */}
                                    <ListaUsuarios
                                        refreshKey={refreshTrigger}
                                        onEditar={handleEditar}      // <--- Conexión Lápiz
                                        onEliminar={handleEliminar}  // <--- Conexión Basura
                                    />
                                </div>
                            </div>
                        )}

                        {isAdmin && activeTab === 'reservas' && (
                            <div className="space-y-8 animate-in slide-in-from-bottom-4">
                                <FormularioReserva onReservaCreada={triggerRefresh} />
                                <div className="overflow-x-auto pb-4"><GrillaReservas refreshKey={refreshTrigger} /></div>
                            </div>
                        )}

                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminPanel;