import { useState, useEffect } from 'react';
import { getReservas, cancelarReserva, cancelarGrupoReserva, togglePago } from '../services/reservaService';
import { getCanchas } from '../services/canchaService';
import { mostrarAlerta, confirmarAccion, confirmarEliminacionGrupal } from '../utils/alertas';

const GrillaReservas = ({ refreshKey }) => {
    const [reservas, setReservas] = useState([]);
    const [canchas, setCanchas] = useState([]);
    const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date().toISOString().split('T')[0]);
    const horas = Array.from({ length: 14 }, (_, i) => i + 9);

    useEffect(() => {
        cargarDatos();
    }, [refreshKey, fechaSeleccionada]);

    const cargarDatos = async () => {
        try {
            const dataCanchas = await getCanchas();
            const dataReservas = await getReservas();
            setCanchas(dataCanchas);
            setReservas(dataReservas);
        } catch (error) {
            console.error("Error cargando grilla:", error);
        }
    };

    const handleCancelar = async (reserva) => {
        try {
            if (reserva.codigoTurnoFijo) {
                const result = await confirmarEliminacionGrupal();
                if (result.isConfirmed) {
                    await cancelarGrupoReserva(reserva.id);
                    mostrarAlerta('Eliminado', 'Se ha eliminado el turno fijo completo.', 'success');
                    cargarDatos();
                } else if (result.isDenied) {
                    await cancelarReserva(reserva.id);
                    mostrarAlerta('Eliminado', 'Se ha eliminado solo la reserva de esta fecha.', 'success');
                    cargarDatos();
                }
            } else {
                const confirmado = await confirmarAccion('¿Cancelar Reserva?', `Vas a liberar la cancha de ${reserva.nombreUsuario}.`);
                if (confirmado) {
                    await cancelarReserva(reserva.id);
                    mostrarAlerta('Cancelada', 'La reserva ha sido eliminada correctamente.', 'success');
                    cargarDatos();
                }
            }
        } catch (error) {
            console.error("Error al cancelar:", error);
            mostrarAlerta('Error', 'Hubo un error al intentar cancelar.', 'error');
        }
    };

    const handleTogglePago = async (e, reservaId) => {
        e.stopPropagation(); 
        try {
            await togglePago(reservaId);
            cargarDatos(); 
        } catch (error) {
            console.error("Error actualizando pago:", error);
        }
    };

    const buscarReserva = (canchaId, hora) => {
        return reservas.find(r => {
            const fechaReserva = r.fechaHora.split('T')[0];
            const horaReserva = parseInt(r.fechaHora.split('T')[1].split(':')[0]);
            return fechaReserva === fechaSeleccionada && horaReserva === hora && r.canchaId === canchaId;
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* HEADER */}
            <div className="bg-surface p-6 rounded-2xl border border-border flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm">
                <div className="text-center md:text-left">
                    <h3 className="text-xl font-black italic tracking-tighter text-text">Agenda Diaria</h3>
                    <p className="text-xs text-textMuted font-bold uppercase tracking-widest">Visualización de Turnos</p>
                </div>
                <div className="w-full md:w-auto">
                    <input
                        type="date"
                        className="w-full md:w-auto bg-background border border-border text-text rounded-xl p-3 focus:outline-none focus:border-primary transition-all font-bold uppercase"
                        value={fechaSeleccionada}
                        onChange={(e) => setFechaSeleccionada(e.target.value)}
                    />
                </div>
            </div>

            {/* GRILLA RESPONSIVE CON STICKY COLUMN */}
            <div className="relative overflow-x-auto bg-surface rounded-2xl border border-border shadow-xl">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr>
                            {/* Celda HORA (Sticky a la izquierda) */}
                            <th className="sticky left-0 z-20 p-4 bg-background/95 backdrop-blur border-b border-r border-border min-w-[80px] text-center text-textMuted text-xs font-black uppercase shadow-[2px_0_5px_rgba(0,0,0,0.1)]">
                                HORA
                            </th>
                            {/* Encabezados de Canchas */}
                            {canchas.map(c => (
                                <th key={c.id} className="p-4 bg-background border-b border-border text-center min-w-[140px]">
                                    <p className="text-primary font-black uppercase text-sm whitespace-nowrap">{c.nombre}</p>
                                    <p className="text-[10px] text-textMuted font-bold truncate px-2">{c.superficie}</p>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {horas.map(hora => (
                            <tr key={hora} className="hover:bg-background/30 transition-colors">
                                {/* Columna HORA (Sticky) */}
                                <td className="sticky left-0 z-10 p-3 bg-surface border-r border-b border-border text-center font-bold text-textMuted text-sm shadow-[2px_0_5px_rgba(0,0,0,0.1)]">
                                    {hora}:00
                                </td>

                                {/* Celdas */}
                                {canchas.map(c => {
                                    const reserva = buscarReserva(c.id, hora);
                                    return (
                                        <td key={`${c.id}-${hora}`} className="p-1 border-b border-border border-dashed h-[60px]">
                                            {reserva ? (
                                                <div 
                                                    onClick={() => handleCancelar(reserva)}
                                                    className={`
                                                        group relative cursor-pointer transition-all duration-300 h-full w-full
                                                        border rounded-lg text-xs font-bold text-center shadow-sm
                                                        flex items-center justify-center
                                                        ${reserva.pagado 
                                                            ? 'bg-green-500/10 border-green-500 text-green-600' 
                                                            : 'bg-terciary/10 border-terciary text-terciary'
                                                        }
                                                    `}
                                                >
                                                    {/* Indicadores flotantes */}
                                                    {reserva.codigoTurnoFijo && (
                                                        <div className="absolute top-0.5 right-1 text-[8px] opacity-50">🔁</div>
                                                    )}
                                                    
                                                    {/* Botón $ */}
                                                    <div 
                                                        onClick={(e) => handleTogglePago(e, reserva.id)} 
                                                        className={`absolute -left-1 -top-1 w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black z-10 border border-surface shadow-md ${reserva.pagado ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
                                                    >
                                                        $
                                                    </div>

                                                    {/* Contenido Texto */}
                                                    <div className="w-full px-2 overflow-hidden">
                                                        <p className="uppercase truncate text-[10px] leading-tight">{reserva.nombreUsuario}</p>
                                                        {/* En móvil ocultamos el "Pagado/Pendiente" para ganar espacio vertical */}
                                                        <p className="hidden sm:block text-[8px] opacity-70 mt-0.5">
                                                            {reserva.pagado ? 'PAGADO' : 'PENDIENTE'}
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-center h-full flex items-center justify-center opacity-20 hover:opacity-100 transition-opacity">
                                                    {/* Texto largo solo en escritorio */}
                                                    <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-widest text-border hover:text-primary cursor-pointer">
                                                        Disponible
                                                    </span>
                                                    {/* Punto simple en móvil */}
                                                    <span className="sm:hidden text-2xl text-border hover:text-primary leading-none">•</span>
                                                </div>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <p className="text-center text-[10px] text-textMuted sm:hidden italic">
                ← Desliza horizontalmente para ver más canchas →
            </p>
        </div>
    );
};

export default GrillaReservas;