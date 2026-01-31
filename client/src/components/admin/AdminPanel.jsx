import { useState } from 'react';
import FormularioCancha from '../FormularioCancha';
import ListaCanchas from '../ListaCanchas';
import Formulario from '../Formulario';
import ListaUsuarios from '../ListaUsuarios';
import FormularioReserva from '../FormularioReserva';
import GrillaReservas from '../GrillaReservas';
import Sidebar from '../Sidebar'; // <--- Importamos el componente extraído

const AdminPanel = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    
    // Estados para controlar el refresco de datos
    const [refreshCanchas, setRefreshCanchas] = useState(0);
    const [refreshUsuarios, setRefreshUsuarios] = useState(0);
    const [refreshReservas, setRefreshReservas] = useState(0);

    // Estados de UI (Responsive)
    const [isMobileOpen, setIsMobileOpen] = useState(false);       // Menú móvil abierto/cerrado
    const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false); // Menú PC expandido/colapsado

    const menuItems = [
        { id: 'dashboard', label: 'Resumen General', icon: '📊' },
        { id: 'canchas', label: 'Gestión de Canchas', icon: '🎾' },
        { id: 'usuarios', label: 'Base de Socios', icon: '👥' },
        { id: 'reservas', label: 'Próximas Reservas', icon: '📅' },
    ];

    return (
        <div className="flex min-h-screen bg-background text-text font-sans">
            
            {/* SIDEBAR INTELIGENTE */}
            <Sidebar 
                menuItems={menuItems}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                isMobileOpen={isMobileOpen}
                setIsMobileOpen={setIsMobileOpen}
                isDesktopCollapsed={isDesktopCollapsed}
                setIsDesktopCollapsed={setIsDesktopCollapsed}
            />

            {/* ÁREA DE CONTENIDO PRINCIPAL */}
            <main className="flex-1 flex flex-col min-w-0 transition-all duration-300">
                
                {/* HEADER MÓVIL (Solo visible en pantallas chicas) */}
                <header className="h-16 bg-surface/80 backdrop-blur-md border-b border-border flex items-center justify-between px-4 sticky top-0 z-30 md:hidden">
                    <button 
                        onClick={() => setIsMobileOpen(true)}
                        className="p-2 text-textMuted hover:text-primary"
                    >
                        <span className="text-2xl">☰</span>
                    </button>
                    <span className="font-black italic tracking-tighter">ClubSet MGT</span>
                    <div className="w-8"></div> {/* Espaciador para centrar título */}
                </header>

                {/* HEADER ESCRITORIO (Visible en md en adelante) */}
                <header className="hidden md:flex h-20 bg-surface/50 backdrop-blur-md border-b border-border sticky top-0 z-20 px-8 items-center justify-between">
                    <h2 className="text-sm font-black uppercase tracking-[0.2em] text-textMuted">
                        {menuItems.find(i => i.id === activeTab)?.label}
                    </h2>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-xs text-primary font-bold">ONLINE</span>
                    </div>
                </header>

                {/* CONTENIDO SCROLLABLE */}
                <div className="flex-1 p-4 md:p-10 overflow-x-hidden">
                    <div className="max-w-6xl mx-auto">
                        
                        {/* VISTA: DASHBOARD */}
                        {activeTab === 'dashboard' && (
                            <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                                    {/* Tarjetas Dashboard Responsive */}
                                    <div className="bg-surface p-6 rounded-2xl border border-border shadow-lg">
                                        <p className="text-textMuted text-xs font-bold uppercase mb-2">Total Socios</p>
                                        <p className="text-3xl md:text-4xl font-black text-secondary">42</p>
                                    </div>
                                    <div className="bg-surface p-6 rounded-2xl border border-border shadow-lg text-primary">
                                        <p className="text-textMuted text-xs font-bold uppercase mb-2">Canchas Activas</p>
                                        <p className="text-3xl md:text-4xl font-black">08</p>
                                    </div>
                                    <div className="bg-surface p-6 rounded-2xl border border-border shadow-lg text-terciary">
                                        <p className="text-textMuted text-xs font-bold uppercase mb-2">Reservas Hoy</p>
                                        <p className="text-3xl md:text-4xl font-black">12</p>
                                    </div>
                                </div>
                                <div className="bg-surface/30 p-8 md:p-12 rounded-3xl border border-dashed border-border text-center">
                                    <p className="text-textMuted italic text-sm md:text-base">
                                        Panel optimizado para móvil y escritorio.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* VISTA: CANCHAS */}
                        {activeTab === 'canchas' && (
                            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                                <FormularioCancha onCanchaCreada={() => setRefreshCanchas(p => p + 1)} />
                                <div className="overflow-x-auto pb-4"> {/* Wrapper para tabla responsive */}
                                    <ListaCanchas refreshKey={refreshCanchas} />
                                </div>
                            </div>
                        )}

                        {/* VISTA: USUARIOS */}
                        {activeTab === 'usuarios' && (
                            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                                <Formulario onUsuarioCreado={() => setRefreshUsuarios(p => p + 1)} />
                                <div className="overflow-x-auto pb-4">
                                    <ListaUsuarios refreshKey={refreshUsuarios} />
                                </div>
                            </div>
                        )}

                        {/* VISTA: RESERVAS */}
                        {activeTab === 'reservas' && (
                            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                                <FormularioReserva onReservaCreada={() => setRefreshReservas(p => p + 1)} />
                                <div className="overflow-x-auto pb-4">
                                    <GrillaReservas refreshKey={refreshReservas} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminPanel;