import { useAuth } from '../../context/AuthContext';

const Sidebar = ({
    menuItems,
    activeTab,
    setActiveTab,
    isMobileOpen,
    setIsMobileOpen,
    isDesktopCollapsed,
    setIsDesktopCollapsed
}) => {

    const { user, logout } = useAuth();

    return (
        <>
            {/* OVERLAY PARA MÓVIL (Fondo oscuro borroso) */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-background/80 z-40 md:hidden backdrop-blur-sm animate-in fade-in duration-300"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* SIDEBAR */}
            {/* Agregamos overflow-x-hidden para matar definitivamente el scroll horizontal */}
            <aside className={`
                fixed md:sticky top-0 h-screen bg-surface border-r border-border z-50 flex flex-col transition-all duration-300 ease-in-out shadow-2xl md:shadow-none overflow-x-hidden
                ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} 
                ${isDesktopCollapsed ? 'md:w-20' : 'md:w-72'}
                w-72
            `}>
                {/* HEADER & LOGO */}
                <div className={`p-6 border-b border-border flex items-center h-20 shrink-0 justify-between ${isDesktopCollapsed ? 'md:justify-center' : ''}`}>

                    {/* El logo SIEMPRE se ve en móvil. Solo se oculta en PC si está colapsado (md:hidden) */}
                    <h1 className={`text-2xl font-black tracking-tighter italic whitespace-nowrap overflow-hidden text-text transition-all ${isDesktopCollapsed ? 'md:hidden' : 'block'}`}>
                        ClubSet <span className="text-primary text-sm not-italic tracking-widest bg-primary/10 px-2 py-1 rounded ml-1">MGT</span>
                    </h1>

                    {/* Botón Colapsar (Solo PC). Cambiado por un ícono de flecha SVG profesional */}
                    <button
                        onClick={() => setIsDesktopCollapsed(!isDesktopCollapsed)}
                        className={`hidden md:flex w-8 h-8 items-center justify-center rounded-lg bg-background border border-border text-textMuted hover:text-primary hover:border-primary/50 transition-all ${!isDesktopCollapsed ? 'absolute right-4' : ''}`}
                        title={isDesktopCollapsed ? "Expandir menú" : "Colapsar menú"}
                    >
                        <svg className={`w-4 h-4 transition-transform ${isDesktopCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"></path></svg>
                    </button>

                    {/* Botón Cerrar (Solo Móvil) - Ahora arrinconado a la derecha automáticamente */}
                    <button
                        onClick={() => setIsMobileOpen(false)}
                        className="md:hidden p-2 text-textMuted hover:text-white bg-background/50 rounded-lg border border-border flex-shrink-0 ml-auto"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                {/* NAVEGACIÓN PRINCIPAL */}
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto overflow-x-hidden hide-scrollbar">
                    {menuItems.map((item) => {
                        const isActive = activeTab === item.id;

                        return (
                            <button
                                key={item.id}
                                disabled={item.disabled}
                                onClick={() => {
                                    setActiveTab(item.id);
                                    setIsMobileOpen(false);
                                }}
                                className={`
                                    w-full flex items-center px-4 py-3.5 rounded-xl font-bold text-sm transition-all duration-300 relative group min-h-[48px]
                                    ${isActive
                                        ? 'bg-primary/15 text-primary border border-primary/30 shadow-sm'
                                        : 'text-textMuted hover:bg-white/5 hover:text-white border border-transparent'
                                    }
                                    gap-4 ${isDesktopCollapsed ? 'md:justify-center md:px-0' : ''}
                                `}
                                title={isDesktopCollapsed ? item.label : ''}
                            >
                                {/* Indicador lateral activo */}
                                {isActive && (
                                    <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-primary rounded-r-full ${isDesktopCollapsed ? 'md:hidden' : 'block'}`}></div>
                                )}

                                <span className={`text-xl flex-shrink-0 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                                    {item.icon}
                                </span>

                                {/* Texto SIEMPRE visible en móvil. Solo se oculta en PC colapsado */}
                                <span className={`whitespace-nowrap overflow-hidden tracking-wide text-left flex-1 ${isDesktopCollapsed ? 'md:hidden' : 'block'}`}>
                                    {item.label}
                                </span>

                                {/* Tooltip para versión colapsada en PC */}
                                {isDesktopCollapsed && (
                                    <div className="hidden md:block absolute left-full ml-4 px-3 py-2 bg-surface border border-border rounded-lg text-xs font-black text-white uppercase tracking-widest shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                                        {item.label}
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* FOOTER USUARIO */}
                <div className="p-4 border-t border-border bg-background/30 mt-auto shrink-0 overflow-hidden">
                    <div className={`flex items-center gap-3 p-2 rounded-xl border transition-all bg-surface border-border shadow-sm ${isDesktopCollapsed ? 'md:flex-col md:border-transparent md:bg-transparent md:shadow-none' : ''}`}>

                        {/* Avatar Dinámico Blindado */}
                        {user?.fotoPerfilUrl ? (
                            <img
                                src={user.fotoPerfilUrl}
                                alt={`Perfil de ${user.nombre}`}
                                className="w-10 h-10 min-w-[44px] min-h-[40px] rounded-full object-cover border border-border shrink-0 shadow-sm"
                            />
                        ) : (
                            <div className="w-10 h-10 min-w-[44px] min-h-[40px] rounded-full bg-terciary/20 flex items-center justify-center font-black text-terciary text-sm shrink-0 uppercase border border-terciary/30">
                                {user?.nombre?.charAt(0)}{user?.apellido?.charAt(0)}
                            </div>
                        )}

                        {/* Info SIEMPRE visible en móvil. Solo se oculta en PC colapsado */}
                        <div className={`overflow-hidden flex-1 min-w-0 ${isDesktopCollapsed ? 'md:hidden' : 'block'}`}>
                            <p className="text-sm font-black text-text truncate leading-tight">{user?.nombre} {user?.apellido}</p>
                            <p className="text-[10px] text-textMuted uppercase tracking-widest truncate">{user?.rol}</p>
                        </div>

                        {/* Botón Logout */}
                        <button
                            onClick={logout}
                            className={`
                                flex items-center justify-center text-textMuted hover:text-red-400 hover:bg-red-400/10 transition-colors rounded-lg flex-shrink-0
                                ${isDesktopCollapsed ? 'md:w-10 md:h-10 md:border md:border-border md:bg-surface md:mt-2' : 'p-2 mr-1'}
                            `}
                            title="Cerrar Sesión"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;