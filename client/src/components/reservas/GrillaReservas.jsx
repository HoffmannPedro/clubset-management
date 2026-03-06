import { useState, useEffect } from 'react';

const GrillaReservas = ({ data, onEmptySlotClick }) => {
    const { canchas, horas, fechaSeleccionada, setFechaSeleccionada, buscarReserva, handleReservaClick } = data;

    // --- NUEVO: ESTADO PARA EL SELECTOR MÓVIL ---
    const [canchaMobileId, setCanchaMobileId] = useState('');

    // Cuando cargan las canchas, seleccionamos la primera por defecto para la vista móvil
    useEffect(() => {
        if (canchas.length > 0 && !canchaMobileId) {
            setCanchaMobileId(canchas[0].id);
        }
    }, [canchas, canchaMobileId]);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* HEADER ORIGINAL */}
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

            {/* --- NUEVO: SELECTOR DE CANCHAS (SOLO VISIBLE EN MÓVIL) --- */}
            {canchas.length > 0 && (
                <div className="md:hidden bg-surface p-4 rounded-2xl border border-border shadow-sm">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-textMuted mb-2">
                        Filtro de Cancha
                    </label>
                    <div className="relative">
                        <select 
                            className="w-full bg-background border border-border text-text rounded-xl p-3 focus:outline-none focus:border-primary transition-all font-bold uppercase appearance-none"
                            value={canchaMobileId}
                            onChange={(e) => setCanchaMobileId(Number(e.target.value))}
                        >
                            {canchas.map(c => (
                                <option key={c.id} value={c.id}>
                                    {c.nombre} - {c.superficie} {!c.disponible ? '(Cerrada)' : ''}
                                </option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-textMuted">
                            ▼
                        </div>
                    </div>
                </div>
            )}

            {/* GRILLA */}
            {/* Le sacamos el overflow-x-auto agresivo porque ahora siempre entra en pantalla */}
            <div className="bg-surface rounded-2xl border border-border shadow-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr>
                            <th className="sticky left-0 z-20 p-4 bg-background/95 backdrop-blur border-b border-r border-border min-w-[80px] text-center text-textMuted text-xs font-black uppercase">
                                HORA
                            </th>
                            {canchas.map(c => (
                                // LA MAGIA: Si estamos en celular, solo mostramos la columna que coincide con el select. En PC (md:table-cell), mostramos todas.
                                <th 
                                    key={c.id} 
                                    className={`p-4 bg-background border-b border-border text-center min-w-[140px] ${c.id === canchaMobileId ? 'table-cell' : 'hidden md:table-cell'}`}
                                >
                                    <div className="flex flex-col items-center">
                                        <p className={`font-black uppercase text-sm whitespace-nowrap ${c.disponible ? 'text-primary' : 'text-red-500 line-through'}`}>
                                            {c.nombre}
                                        </p>
                                        <p className="text-[10px] text-textMuted font-bold truncate px-2">{c.superficie}</p>
                                        {!c.disponible && <span className="text-[9px] bg-red-500 text-white px-1 rounded uppercase mt-1">Mantenimiento</span>}
                                    </div>
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
                                    
                                    // 🛑 1. BLOQUEO POR MANTENIMIENTO
                                    if (!c.disponible) {
                                        return (
                                            <td 
                                                key={`${c.id}-${hora}`} 
                                                className={`p-1 border-b border-border border-dashed h-[60px] bg-background/50 ${c.id === canchaMobileId ? 'table-cell' : 'hidden md:table-cell'}`}
                                            >
                                                <div className="h-full w-full flex items-center justify-center border border-transparent rounded-lg cursor-not-allowed opacity-40 select-none">
                                                    <span className="text-[10px] font-black text-textMuted uppercase -rotate-12 whitespace-nowrap">
                                                        ⛔ Cerrada
                                                    </span>
                                                </div>
                                            </td>
                                        );
                                    }

                                    // Si pasa el chequeo, buscamos si hay reserva
                                    const reserva = buscarReserva(c.id, hora);
                                    
                                    return (
                                        <td 
                                            key={`${c.id}-${hora}`} 
                                            className={`p-1 border-b border-border border-dashed h-[60px] ${c.id === canchaMobileId ? 'table-cell' : 'hidden md:table-cell'}`}
                                        >
                                            {reserva ? (
                                                /* --- RESERVA OCUPADA --- */
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
                                                    {reserva.codigoTurnoFijo && <div className="absolute top-0.5 right-1 text-[8px] opacity-50">🔁</div>}
                                                    <div className="w-full px-2 overflow-hidden pointer-events-none">
                                                        <p className="uppercase truncate text-[10px] leading-tight">{reserva.nombreUsuario}</p>
                                                        <p className="text-[8px] opacity-70 mt-0.5">
                                                            {reserva.pagado ? '✅ PAGADO' : (reserva.saldoPendiente > 0 ? `Deb: $${reserva.saldoPendiente}` : 'PENDIENTE')}
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : (
                                                /* --- ESPACIO VACÍO (DISPONIBLE) --- */
                                                <div 
                                                    onClick={() => onEmptySlotClick(c.id, hora, fechaSeleccionada)}
                                                    className="h-full w-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer group"
                                                >
                                                    <span className="bg-primary/20 text-primary px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider backdrop-blur-sm border border-primary/30">
                                                        + Reservar
                                                    </span>
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
            
            <p className="text-center text-[10px] text-textMuted sm:hidden italic mt-2">
                Usa el selector de arriba para cambiar de cancha.
            </p>
        </div>
    );
};

export default GrillaReservas;