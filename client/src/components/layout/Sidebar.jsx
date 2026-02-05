import React from 'react';
import { useAuth } from '../../context/AuthContext'; // Importamos el contexto

const Sidebar = ({ 
    menuItems, // Ahora confiamos ciegamente en lo que nos manda el padre
    activeTab, 
    setActiveTab, 
    isMobileOpen, 
    setIsMobileOpen, 
    isDesktopCollapsed, 
    setIsDesktopCollapsed 
}) => {
    
    // Obtenemos datos reales del usuario y la función de salir
    const { user, logout } = useAuth();

    return (
        <>
            {/* OVERLAY PARA MÓVIL */}
            {isMobileOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* SIDEBAR */}
            <aside className={`
                fixed md:sticky top-0 h-screen bg-surface border-r border-border z-50 flex flex-col transition-all duration-300 ease-in-out
                ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} 
                ${isDesktopCollapsed ? 'md:w-20' : 'md:w-72'}
                w-72
            `}>
                {/* HEADER */}
                <div className={`p-6 border-b border-border flex items-center ${isDesktopCollapsed ? 'justify-center' : 'justify-between'}`}>
                    {!isDesktopCollapsed && (
                        <h1 className="text-xl font-black tracking-tighter italic whitespace-nowrap overflow-hidden">
                            ClubSet <span className="text-primary text-sm not-italic tracking-widest">MGT</span>
                        </h1>
                    )}
                    <button 
                        onClick={() => setIsDesktopCollapsed(!isDesktopCollapsed)}
                        className="hidden md:flex w-8 h-8 items-center justify-center rounded-lg bg-background border border-border text-textMuted hover:text-primary transition-colors"
                    >
                        {isDesktopCollapsed ? '→' : '←'}
                    </button>
                    
                    <button 
                        onClick={() => setIsMobileOpen(false)}
                        className="md:hidden text-textMuted hover:text-white"
                    >
                        ✕
                    </button>
                </div>

                {/* NAVEGACIÓN */}
                <nav className="flex-1 p-3 space-y-2 mt-2 overflow-y-auto">
                    {/* USAMOS DIRECTAMENTE menuItems SIN INYECTAR NADA RARO */}
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            disabled={item.disabled}
                            onClick={() => {
                                setActiveTab(item.id);
                                setIsMobileOpen(false);
                            }}
                            className={`
                                w-full flex items-center gap-4 px-3 py-3 rounded-lg font-bold text-sm transition-all duration-300 relative group
                                ${activeTab === item.id
                                    ? 'bg-primary text-btnText shadow-[0_0_15px_rgba(47,168,110,0.3)]'
                                    : 'text-textMuted hover:bg-white/5 hover:text-text'
                                }
                                ${isDesktopCollapsed ? 'justify-center' : ''}
                            `}
                            title={isDesktopCollapsed ? item.label : ''}
                        >
                            <span className="text-xl flex-shrink-0">{item.icon}</span>
                            
                            {!isDesktopCollapsed && (
                                <span className="whitespace-nowrap overflow-hidden">{item.label}</span>
                            )}

                            {isDesktopCollapsed && (
                                <div className="absolute left-full ml-4 px-2 py-1 bg-surface border border-border rounded text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                                    {item.label}
                                </div>
                            )}
                        </button>
                    ))}
                </nav>

                {/* FOOTER USUARIO (AHORA DINÁMICO) */}
                <div className="p-4 border-t border-border">
                    <div className={`flex items-center gap-3 p-2 rounded-xl border border-transparent transition-all ${!isDesktopCollapsed ? 'bg-background border-border' : 'justify-center'}`}>
                        
                        {/* Avatar con iniciales reales */}
                        <div className="w-8 h-8 rounded-full bg-terciary flex items-center justify-center font-black text-btnText text-xs flex-shrink-0 uppercase">
                            {user?.nombre?.charAt(0)}{user?.apellido?.charAt(0)}
                        </div>
                        
                        {!isDesktopCollapsed && (
                            <div className="overflow-hidden flex-1 min-w-0">
                                <p className="text-xs font-black truncate">{user?.nombre} {user?.apellido}</p>
                                <p className="text-[9px] text-textMuted uppercase truncate">{user?.rol}</p>
                            </div>
                        )}

                        {/* Botón Logout */}
                        {!isDesktopCollapsed && (
                            <button 
                                onClick={logout}
                                className="text-textMuted hover:text-red-500 transition-colors p-1"
                                title="Cerrar Sesión"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                            </button>
                        )}
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;