import { useState, useEffect } from 'react';
import FormularioReserva from './FormularioReserva';
import GrillaReservas from './GrillaReservas';
import VistaListaReservas from './VistaListaReservas';
import { useGrillaReservas } from '../../hooks/useGrillaReservas';

const GestionReservasView = ({ refreshKey, onReservaExitosa, preseleccion, onEmptySlotClick }) => {
    // Estado local para manejar las 3 sub-pestañas
    const [subTabActiva, setSubTabActiva] = useState('GRILLA'); // 'GRILLA', 'LISTA', 'FORMULARIO'

    // Extraemos los datos del hook AQUÍ arriba para poder compartirlos con Grilla y Lista
    const grillaData = useGrillaReservas(refreshKey);

    // Si el usuario hace clic en un hueco de la grilla (preseleccion cambia), lo mandamos al Formulario automáticamente
    useEffect(() => {
        if (preseleccion) {
            setSubTabActiva('FORMULARIO');
        }
    }, [preseleccion]);

    // Handler extendido para cuando se crea una reserva
    const handleFormSubmitExitoso = () => {
        onReservaExitosa(); // Llama al padre (AdminPanel) para limpiar la preselección
        setSubTabActiva('GRILLA'); // Lo devolvemos a la grilla para que vea su reserva creada
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4">
            
            {/* Navegación de Sub-pestañas (TABS) */}
            <div className="flex bg-surface p-2 rounded-2xl border border-border shadow-sm overflow-x-auto hide-scrollbar">
                <button 
                    onClick={() => setSubTabActiva('GRILLA')}
                    className={`flex-1 min-w-[120px] py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${subTabActiva === 'GRILLA' ? 'bg-primary/20 text-primary shadow-sm border border-primary/30' : 'text-textMuted hover:text-white hover:bg-white/5'}`}
                >
                    📅 Grilla Diaria
                </button>
                <button 
                    onClick={() => setSubTabActiva('LISTA')}
                    className={`flex-1 min-w-[120px] py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${subTabActiva === 'LISTA' ? 'bg-secondary/20 text-secondary shadow-sm border border-secondary/30' : 'text-textMuted hover:text-white hover:bg-white/5'}`}
                >
                    📋 Lista de Turnos
                </button>
                <button 
                    onClick={() => setSubTabActiva('FORMULARIO')}
                    className={`flex-1 min-w-[120px] py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${subTabActiva === 'FORMULARIO' ? 'bg-white/10 text-white shadow-sm border border-white/20' : 'text-textMuted hover:text-white hover:bg-white/5'}`}
                >
                    {preseleccion ? '✏️ Completar Reserva' : '➕ Nueva Reserva'}
                </button>
            </div>

            {/* Renderizado Condicional del Contenido */}
            <div className="mt-6">
                {subTabActiva === 'GRILLA' && (
                    <GrillaReservas 
                        // Le pasamos los datos pre-cargados al componente Grilla
                        data={grillaData} 
                        onEmptySlotClick={onEmptySlotClick} 
                    />
                )}

                {subTabActiva === 'LISTA' && (
                    <VistaListaReservas 
                        reservas={grillaData.reservas}
                        fechaSeleccionada={grillaData.fechaSeleccionada}
                        setFechaSeleccionada={grillaData.setFechaSeleccionada}
                        handleReservaClick={grillaData.handleReservaClick}
                    />
                )}

                {subTabActiva === 'FORMULARIO' && (
                    <FormularioReserva
                        onReservaCreada={handleFormSubmitExitoso}
                        preseleccion={preseleccion}
                    />
                )}
            </div>
        </div>
    );
};

export default GestionReservasView;