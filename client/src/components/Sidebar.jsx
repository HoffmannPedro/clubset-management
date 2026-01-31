import React from 'react';

const Sidebar = ({ 
    menuItems, 
    activeTab, 
    setActiveTab, 
    isMobileOpen, 
    setIsMobileOpen, 
    isDesktopCollapsed, 
    setIsDesktopCollapsed 
}) => {
    return (
        <>
            {/* OVERLAY PARA MÓVIL (Fondo oscuro al abrir menú) */}
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
                {/* HEADER DEL SIDEBAR */}
                <div className={`p-6 border-b border-border flex items-center ${isDesktopCollapsed ? 'justify-center' : 'justify-between'}`}>
                    {!isDesktopCollapsed && (
                        <h1 className="text-xl font-black tracking-tighter italic whitespace-nowrap overflow-hidden">
                            ClubSet <span className="text-primary text-sm not-italic tracking-widest">MGT</span>
                        </h1>
                    )}
                    {/* Botón para colapsar en Escritorio */}
                    <button 
                        onClick={() => setIsDesktopCollapsed(!isDesktopCollapsed)}
                        className="hidden md:flex w-8 h-8 items-center justify-center rounded-lg bg-background border border-border text-textMuted hover:text-primary transition-colors"
                    >
                        {isDesktopCollapsed ? '→' : '←'}
                    </button>
                    
                    {/* Botón cerrar en Móvil */}
                    <button 
                        onClick={() => setIsMobileOpen(false)}
                        className="md:hidden text-textMuted hover:text-white"
                    >
                        ✕
                    </button>
                </div>

                {/* NAVEGACIÓN */}
                <nav className="flex-1 p-3 space-y-2 mt-2 overflow-y-auto">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            disabled={item.disabled}
                            onClick={() => {
                                setActiveTab(item.id);
                                setIsMobileOpen(false); // Cerrar menú al elegir en móvil
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

                            {/* Tooltip flotante cuando está colapsado */}
                            {isDesktopCollapsed && (
                                <div className="absolute left-full ml-4 px-2 py-1 bg-surface border border-border rounded text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                                    {item.label}
                                </div>
                            )}
                        </button>
                    ))}
                </nav>

                {/* FOOTER USUARIO */}
                <div className="p-4 border-t border-border">
                    <div className={`flex items-center gap-3 p-2 rounded-xl border border-transparent ${!isDesktopCollapsed ? 'bg-background border-border' : 'justify-center'}`}>
                        <div className="w-8 h-8 rounded-full bg-terciary flex items-center justify-center font-black text-btnText text-xs flex-shrink-0">
                            AD
                        </div>
                        {!isDesktopCollapsed && (
                            <div className="overflow-hidden">
                                <p className="text-xs font-black truncate">Admin</p>
                                <p className="text-[9px] text-textMuted uppercase truncate">Root</p>
                            </div>
                        )}
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;