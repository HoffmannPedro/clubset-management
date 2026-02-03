import { useState } from 'react';
import Sidebar from '../layout/Sidebar';
import FormularioCancha from '../canchas/FormularioCancha';
import ListaCanchas from '../canchas/ListaCanchas';
import FormularioUsuario from '../Formulario';
import ListaUsuarios from '../usuarios/ListaUsuarios';
import FormularioReserva from '../reservas/FormularioReserva';
import GrillaReservas from '../reservas/GrillaReservas';
import CajaView from '../caja/CajaView';
import DashboardView from '../dashboard/DashboardView';

const AdminPanel = () => {
    const [activeTab, setActiveTab] = useState('dashboard');

    // Estados de UI Layout
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);

    // Estados de refresco (Aún útiles para comunicación entre hermanos, ej: reservar -> actualiza caja)
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const menuItems = [
        { id: 'dashboard', label: 'Resumen General', icon: '📊' },
        { id: 'caja', label: 'Caja Diaria', icon: '💵' },
        { id: 'reservas', label: 'Próximas Reservas', icon: '📅' },
        { id: 'canchas', label: 'Gestión de Canchas', icon: '🎾' },
        { id: 'usuarios', label: 'Base de Socios', icon: '👥' },
    ];

    const triggerRefresh = () => setRefreshTrigger(prev => prev + 1);

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
                {/* HEADERS (Puedes extraer esto a un componente <TopBar /> también) */}
                <header className="h-16 md:h-20 bg-surface/50 backdrop-blur-md border-b border-border sticky top-0 z-20 px-4 md:px-8 flex items-center justify-between">
                    <button onClick={() => setIsMobileOpen(true)} className="md:hidden p-2 text-textMuted">☰</button>
                    <h2 className="text-sm font-black uppercase tracking-[0.2em] text-textMuted hidden md:block">
                        {menuItems.find(i => i.id === activeTab)?.label}
                    </h2>
                    <span className="font-black italic md:hidden">ClubSet</span>
                </header>

                <div className="flex-1 p-4 md:p-10 overflow-x-hidden">
                    <div className="max-w-6xl mx-auto">

                        {/* RENDERIZADO CONDICIONAL LIMPIO */}
                        {activeTab === 'dashboard' && (
                            <DashboardView setActiveTab={setActiveTab} />
                        )}

                        {activeTab === 'caja' && (
                            <CajaView /> // <--- ¡QUÉ DIFERENCIA!
                        )}

                        {activeTab === 'canchas' && (
                            <div className="space-y-8 animate-in slide-in-from-bottom-4">
                                <FormularioCancha onCanchaCreada={triggerRefresh} />
                                <div className="overflow-x-auto pb-4"><ListaCanchas refreshKey={refreshTrigger} /></div>
                            </div>
                        )}

                        {activeTab === 'usuarios' && (
                            <div className="space-y-8 animate-in slide-in-from-bottom-4">
                                <FormularioUsuario onUsuarioCreado={triggerRefresh} />
                                <div className="overflow-x-auto pb-4"><ListaUsuarios refreshKey={refreshTrigger} /></div>
                            </div>
                        )}

                        {activeTab === 'reservas' && (
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