import { useState } from 'react';
import FormularioCancha from './FormularioCancha';
import ListaCanchas from './ListaCanchas';

const GestionCanchasView = ({ refreshKey, onCanchaCreada }) => {
    // Estado local para manejar las pestañas
    const [subTabActiva, setSubTabActiva] = useState('LISTA'); // 'LISTA' o 'FORMULARIO'

    // Handler para cuando se crea una cancha con éxito
    const handleExito = () => {
        onCanchaCreada(); // Llama al padre (AdminPanel) para refrescar la base de datos
        setSubTabActiva('LISTA'); // Lo devuelve automáticamente a la vista de canchas
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4">
            
            {/* Navegación de Sub-pestañas (TABS) */}
            <div className="flex flex-col md:flex-row bg-surface p-2 rounded-2xl border border-border shadow-sm gap-2">
                <button 
                    onClick={() => setSubTabActiva('LISTA')}
                    className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${subTabActiva === 'LISTA' ? 'bg-secondary/20 text-secondary shadow-sm border border-secondary/30' : 'text-textMuted hover:text-white hover:bg-white/5'}`}
                >
                    🎾 Lista de Canchas
                </button>
                <button 
                    onClick={() => setSubTabActiva('FORMULARIO')}
                    className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${subTabActiva === 'FORMULARIO' ? 'bg-primary/20 text-primary shadow-sm border border-primary/30' : 'text-textMuted hover:text-white hover:bg-white/5'}`}
                >
                    ➕ Registrar Cancha
                </button>
            </div>

            {/* Renderizado Condicional del Contenido */}
            <div className="mt-6">
                {subTabActiva === 'LISTA' && (
                    <ListaCanchas refreshKey={refreshKey} />
                )}

                {subTabActiva === 'FORMULARIO' && (
                    <FormularioCancha onCanchaCreada={handleExito} />
                )}
            </div>
        </div>
    );
};

export default GestionCanchasView;