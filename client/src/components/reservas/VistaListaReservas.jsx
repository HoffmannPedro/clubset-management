import { useState, useMemo } from 'react';

const VistaListaReservas = ({ reservas, fechaSeleccionada, setFechaSeleccionada, handleReservaClick }) => {
    const [filtroTiempo, setFiltroTiempo] = useState('DIA'); // 'DIA' o 'SEMANA'

    // Filtramos las reservas dependiendo si el admin quiere ver solo el día o toda la semana
    const reservasFiltradas = useMemo(() => {
        if (!reservas) return [];
        
        return reservas.filter(r => {
            if (filtroTiempo === 'DIA') {
                return r.fechaHora.startsWith(fechaSeleccionada);
            } else {
                const fechaReserva = new Date(r.fechaHora);
                const fechaTarget = new Date(fechaSeleccionada + 'T00:00:00'); 
                
                const diferenciaDias = Math.abs((fechaReserva - fechaTarget) / (1000 * 60 * 60 * 24));
                return diferenciaDias <= 3;
            }
        }).sort((a, b) => new Date(a.fechaHora) - new Date(b.fechaHora));
        
    }, [reservas, fechaSeleccionada, filtroTiempo]);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* HEADER CONTROLES */}
            <div className="bg-surface p-4 md:p-6 rounded-2xl border border-border flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm">
                <div className="flex w-full md:w-auto bg-background p-1 rounded-xl border border-border">
                    <button 
                        onClick={() => setFiltroTiempo('DIA')} 
                        className={`flex-1 md:flex-none px-4 py-3 md:py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filtroTiempo === 'DIA' ? 'bg-primary text-black' : 'text-textMuted hover:text-white'}`}
                    >
                        Día Exacto
                    </button>
                    <button 
                        onClick={() => setFiltroTiempo('SEMANA')} 
                        className={`flex-1 md:flex-none px-4 py-3 md:py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filtroTiempo === 'SEMANA' ? 'bg-secondary text-white' : 'text-textMuted hover:text-white'}`}
                    >
                        Semana Completa
                    </button>
                </div>
                
                <input
                    type="date"
                    className="w-full md:w-auto bg-background border border-border text-text rounded-xl p-3 focus:outline-none focus:border-primary transition-all font-bold uppercase"
                    value={fechaSeleccionada}
                    onChange={(e) => setFechaSeleccionada(e.target.value)}
                />
            </div>

            {/* --- VISTA MÓVIL (TARJETAS) --- */}
            <div className="md:hidden space-y-3">
                {reservasFiltradas.length > 0 ? (
                    reservasFiltradas.map((reserva) => (
                        <div 
                            key={reserva.id} 
                            onClick={() => handleReservaClick(reserva)}
                            className="bg-surface border border-border rounded-xl p-4 flex flex-col gap-3 shadow-sm cursor-pointer hover:border-primary transition-colors active:scale-[0.98]"
                        >
                            {/* Fila 1: Fecha, Hora y Cancha */}
                            <div className="flex justify-between items-center border-b border-border/50 pb-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-text">
                                        {new Date(reserva.fechaHora).toLocaleDateString('es-AR', { weekday: 'short', day: '2-digit' })}
                                    </span>
                                    <span className="text-primary bg-primary/10 px-2 py-1 rounded text-xs font-black tracking-wider">
                                        {new Date(reserva.fechaHora).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}hs
                                    </span>
                                    {reserva.codigoTurnoFijo && <span className="text-[10px] opacity-70" title="Turno Fijo">🔁</span>}
                                </div>
                                <span className="font-black uppercase text-[10px] tracking-widest text-textMuted bg-background px-2 py-1 rounded">
                                    {reserva.nombreCancha}
                                </span>
                            </div>
                            
                            {/* Fila 2: Usuario y Estado/Plata */}
                            <div className="flex justify-between items-end">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-textMuted uppercase font-bold tracking-widest mb-0.5">Jugador</span>
                                    <span className="text-sm font-medium text-text truncate max-w-[150px]">
                                        {reserva.nombreUsuario}
                                    </span>
                                </div>
                                
                                <div className="flex flex-col items-end gap-1">
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${reserva.pagado ? 'bg-green-500/10 text-green-500 border-green-500/30' : 'bg-red-500/10 text-red-500 border-red-500/30'}`}>
                                        {reserva.pagado ? 'Saldado' : 'Deudor'}
                                    </span>
                                    {reserva.saldoPendiente > 0 && (
                                        <span className="text-xs font-mono font-bold text-red-400">
                                            ${reserva.saldoPendiente}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="bg-surface border border-border rounded-xl p-8 text-center">
                        <p className="text-textMuted italic font-bold text-sm">No hay reservas para mostrar en este período.</p>
                    </div>
                )}
            </div>

            {/* --- VISTA ESCRITORIO (TABLA CLÁSICA) --- */}
            <div className="hidden md:block bg-surface rounded-2xl border border-border overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="text-xs text-textMuted uppercase bg-background font-black border-b border-border">
                            <tr>
                                <th className="px-6 py-4">Día y Hora</th>
                                <th className="px-6 py-4">Cancha</th>
                                <th className="px-6 py-4">Jugador</th>
                                <th className="px-6 py-4 text-center">Estado</th>
                                <th className="px-6 py-4 text-right">Saldo</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {reservasFiltradas.length > 0 ? (
                                reservasFiltradas.map((reserva) => (
                                    <tr 
                                        key={reserva.id} 
                                        onClick={() => handleReservaClick(reserva)}
                                        className="hover:bg-white/5 transition-colors cursor-pointer group"
                                    >
                                        <td className="px-6 py-4 font-bold">
                                            {new Date(reserva.fechaHora).toLocaleDateString('es-AR', { weekday: 'short', day: '2-digit', month: 'short' })} 
                                            <span className="text-primary ml-2 bg-primary/10 px-2 py-1 rounded">
                                                {new Date(reserva.fechaHora).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}hs
                                            </span>
                                            {reserva.codigoTurnoFijo && <span className="ml-2 text-[10px] text-textMuted" title="Turno Fijo">🔁</span>}
                                        </td>
                                        <td className="px-6 py-4 font-bold uppercase">{reserva.nombreCancha}</td>
                                        <td className="px-6 py-4 text-textMuted">{reserva.nombreUsuario}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${reserva.pagado ? 'bg-green-500/10 text-green-500 border-green-500/30' : 'bg-red-500/10 text-red-500 border-red-500/30'}`}>
                                                {reserva.pagado ? 'Saldado' : 'Deudor'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono font-bold">
                                            {reserva.saldoPendiente > 0 ? `$${reserva.saldoPendiente}` : '-'}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-textMuted italic font-bold">
                                        No hay reservas para mostrar en este período.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default VistaListaReservas;