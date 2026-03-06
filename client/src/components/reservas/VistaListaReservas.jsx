import { useState, useMemo } from 'react';

const VistaListaReservas = ({ reservas, fechaSeleccionada, setFechaSeleccionada, handleReservaClick }) => {
    const [filtroTiempo, setFiltroTiempo] = useState('DIA'); // 'DIA' o 'SEMANA'

    // Filtramos las reservas dependiendo si el admin quiere ver solo el día o toda la semana
    const reservasFiltradas = useMemo(() => {
        if (!reservas) return [];
        
        return reservas.filter(r => {
            if (filtroTiempo === 'DIA') {
                // Comparamos directamente el texto "YYYY-MM-DD" para evitar bugs de zona horaria
                return r.fechaHora.startsWith(fechaSeleccionada);
            } else {
                // Lógica de semana: Comparamos fechas de forma segura
                const fechaReserva = new Date(r.fechaHora);
                // Le agregamos T00:00:00 para forzar la hora local correcta
                const fechaTarget = new Date(fechaSeleccionada + 'T00:00:00'); 
                
                const diferenciaDias = Math.abs((fechaReserva - fechaTarget) / (1000 * 60 * 60 * 24));
                return diferenciaDias <= 3;
            }
        }).sort((a, b) => new Date(a.fechaHora) - new Date(b.fechaHora)); // Orden cronológico
        
    }, [reservas, fechaSeleccionada, filtroTiempo]);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* HEADER CONTROLES */}
            <div className="bg-surface p-6 rounded-2xl border border-border flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm">
                <div className="flex bg-background p-1 rounded-xl border border-border">
                    <button
                        onClick={() => setFiltroTiempo('DIA')}
                        className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filtroTiempo === 'DIA' ? 'bg-primary text-black' : 'text-textMuted hover:text-white'}`}
                    >
                        Día Exacto
                    </button>
                    <button
                        onClick={() => setFiltroTiempo('SEMANA')}
                        className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filtroTiempo === 'SEMANA' ? 'bg-secondary text-white' : 'text-textMuted hover:text-white'}`}
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

            {/* TABLA DE RESULTADOS */}
            <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-xl">
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
                                                {new Date(reserva.fechaHora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}hs
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