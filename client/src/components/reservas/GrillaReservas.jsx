import { useGrillaReservas } from '../../hooks/useGrillaReservas';

const GrillaReservas = ({ refreshKey }) => {
    // Toda la magia viene de aquí ⬇️
    const {
        canchas,
        horas,
        fechaSeleccionada,
        setFechaSeleccionada,
        buscarReserva,
        handleReservaClick
    } = useGrillaReservas(refreshKey);

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

            {/* GRILLA */}
            <div className="relative overflow-x-auto bg-surface rounded-2xl border border-border shadow-xl">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr>
                            <th className="sticky left-0 z-20 p-4 bg-background/95 backdrop-blur border-b border-r border-border min-w-[80px] text-center text-textMuted text-xs font-black uppercase shadow-[2px_0_5px_rgba(0,0,0,0.1)]">
                                HORA
                            </th>
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
                                <td className="sticky left-0 z-10 p-3 bg-surface border-r border-b border-border text-center font-bold text-textMuted text-sm shadow-[2px_0_5px_rgba(0,0,0,0.1)]">
                                    {hora}:00
                                </td>

                                {canchas.map(c => {
                                    const reserva = buscarReserva(c.id, hora);
                                    return (
                                        <td key={`${c.id}-${hora}`} className="p-1 border-b border-border border-dashed h-[60px]">
                                            {reserva ? (
                                                <div 
                                                    onClick={() => handleReservaClick(reserva)}
                                                    className={`
                                                        group relative cursor-pointer transition-all duration-300 h-full w-full
                                                        border rounded-lg text-xs font-bold text-center shadow-sm
                                                        flex items-center justify-center hover:scale-[1.02] hover:shadow-lg
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
                                                    
                                                    {/* Contenido Texto */}
                                                    <div className="w-full px-2 overflow-hidden pointer-events-none">
                                                        <p className="uppercase truncate text-[10px] leading-tight">{reserva.nombreUsuario}</p>
                                                        <p className="hidden sm:block text-[8px] opacity-70 mt-0.5">
                                                            {reserva.pagado 
                                                                ? '✅ PAGADO' 
                                                                : (reserva.saldoPendiente > 0 ? `Deb: $${reserva.saldoPendiente}` : 'PENDIENTE')
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-center h-full flex items-center justify-center opacity-20 hover:opacity-100 transition-opacity">
                                                    <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-widest text-border hover:text-primary cursor-pointer">
                                                        Disponible
                                                    </span>
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