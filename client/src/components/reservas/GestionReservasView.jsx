import { useState } from 'react';
import FormularioReserva from './FormularioReserva';
import GrillaReservas from './GrillaReservas';
import VistaListaReservas from './VistaListaReservas';
import { useGrillaReservas } from '../../hooks/useGrillaReservas';

const GestionReservasView = () => {
    // Estado local para manejar las 3 sub-pestañas
    const [subTabActiva, setSubTabActiva] = useState('GRILLA'); // 'GRILLA', 'LISTA', 'FORMULARIO'

    // ESTADOS MUDADOS DESDE EL ADMIN PANEL PARA EVITAR PROP DRILLING Y RE-RENDERS MASIVOS
    const [refreshKey, setRefreshKey] = useState(0);
    const [preseleccion, setPreseleccion] = useState(null);

    const triggerRefresh = () => setRefreshKey(prev => prev + 1);

    // Extraemos los datos del hook AQUÍ arriba para poder compartirlos con Grilla y Lista
    const grillaData = useGrillaReservas(refreshKey);

    // Click en un hueco vacío de la grilla
    const handleEmptySlotClickWrapper = (canchaId, hora, fecha) => {
        setPreseleccion({ canchaId, hora, fecha });
        setSubTabActiva('FORMULARIO');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Handler cuando se crea una reserva
    const handleFormSubmitExitoso = () => {
        triggerRefresh();
        setPreseleccion(null);
        setSubTabActiva('GRILLA');
    };


    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4">

            {/* Navegación de Sub-pestañas (TABS) */}
            {/* Cambiamos a flex-col en móvil y flex-row en PC. Eliminamos el scroll. */}
            <div className="flex flex-col md:flex-row bg-surface p-2 rounded-2xl border border-border shadow-sm gap-2">
                <button
                    onClick={() => setSubTabActiva('GRILLA')}
                    className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${subTabActiva === 'GRILLA' ? 'bg-primary/20 text-primary shadow-sm border border-primary/30' : 'text-textMuted hover:text-white hover:bg-white/5'}`}
                >
                    📅 Grilla Diaria
                </button>
                <button
                    onClick={() => setSubTabActiva('LISTA')}
                    className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${subTabActiva === 'LISTA' ? 'bg-secondary/20 text-secondary shadow-sm border border-secondary/30' : 'text-textMuted hover:text-white hover:bg-white/5'}`}
                >
                    📋 Lista de Turnos
                </button>
                <button
                    onClick={() => setSubTabActiva('FORMULARIO')}
                    className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${subTabActiva === 'FORMULARIO' ? 'bg-white/10 text-white shadow-sm border border-white/20' : 'text-textMuted hover:text-white hover:bg-white/5'}`}
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
                        onEmptySlotClick={handleEmptySlotClickWrapper}
                    />
                )}

                {subTabActiva === 'LISTA' && (
                    <VistaListaReservas
                        fechaSeleccionada={grillaData.fechaSeleccionada}
                        setFechaSeleccionada={grillaData.setFechaSeleccionada}
                        handleReservaClick={grillaData.handleReservaClick}
                        refreshKey={refreshKey}  // Pasamos esto para que la lista también reaccione a nuevas reservas
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