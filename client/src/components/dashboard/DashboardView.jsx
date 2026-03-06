import { useState, useEffect, useMemo } from 'react';
import { getPagosDiarios } from '../../services/pagoService';
import { getUsuarios } from '../../services/usuarioService';
import { getCanchas } from '../../services/canchaService';
import { getReservasByFecha } from '../../services/reservaService';

const DashboardView = ({ setActiveTab }) => {
    // Estados para los datos
    const [pagosDelDia, setPagosDelDia] = useState([]);
    const [totalSocios, setTotalSocios] = useState(0);
    const [canchasActivas, setCanchasActivas] = useState(0);
    const [reservasHoy, setReservasHoy] = useState([]);
    const [cargando, setCargando] = useState(true);

    // Al montar, disparamos todas las peticiones en paralelo
    useEffect(() => {
        const fetchDatosDashboard = async () => {
            setCargando(true);
            try {
                // Generamos la fecha de hoy cuidando el Timezone de Argentina (por las dudas)
                const hoy = new Date();
                hoy.setMinutes(hoy.getMinutes() - hoy.getTimezoneOffset());
                const hoyStr = hoy.toISOString().split('T')[0];

                // Promesas en paralelo para mayor velocidad
                const [pagos, usuarios, canchas, reservas] = await Promise.all([
                    getPagosDiarios(hoyStr).catch(() => []), 
                    getUsuarios().catch(() => []),
                    getCanchas().catch(() => []),
                    getReservasByFecha(hoyStr).catch(() => [])
                ]);

                setPagosDelDia(pagos.movimientos || []);
                setTotalSocios(usuarios.length);
                setCanchasActivas(canchas.filter(c => c.disponible).length);

                // 4. Reservas (Filtramos solo las de HOY y ordenamos por hora)
                const reservasDeHoy = reservas
                    .filter(r => r.fechaHora.startsWith(hoyStr))
                    .sort((a, b) => new Date(a.fechaHora) - new Date(b.fechaHora));

                setReservasHoy(reservasDeHoy);

            } catch (error) {
                console.error("Error cargando dashboard:", error);
            } finally {
                setCargando(false);
            }
        };

        fetchDatosDashboard();
    }, []);

    // Calculamos totales en vivo
    const resumenFinanciero = useMemo(() => {
        let ingresos = 0;
        let egresos = 0;
        let efectivo = 0;
        let digital = 0;

        pagosDelDia.forEach(p => {
            const esIngreso = p.tipoMovimiento !== 'EGRESO';
            const monto = parseFloat(p.monto);

            if (esIngreso) {
                ingresos += monto;
                if (p.metodoPago === 'EFECTIVO') efectivo += monto;
                else digital += monto;
            } else {
                egresos += monto;
                if (p.metodoPago === 'EFECTIVO') efectivo -= monto;
                else digital -= monto;
            }
        });

        const total = ingresos - egresos;
        return { total, efectivo, digital };
    }, [pagosDelDia]);

    if (cargando) {
        return <div className="p-10 text-center text-textMuted animate-pulse font-bold tracking-widest uppercase mt-20">Analizando Datos del Club...</div>;
    }

    return (
        <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">

            {/* HEADER DASHBOARD */}
            <div className="flex justify-between items-end mb-6 border-b border-border pb-4">
                <div>
                    <h2 className="text-2xl font-black italic">Resumen Operativo</h2>
                    <p className="text-xs text-textMuted font-bold uppercase tracking-widest">Actividad en Tiempo Real</p>
                </div>
                <div className="text-right hidden sm:block">
                    <p className="text-xs text-primary font-bold uppercase tracking-widest">{new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                </div>
            </div>

            {/* --- WIDGETS SUPERIORES --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                
                {/* Widget 1: Socios */}
                <div
                    onClick={() => setActiveTab('usuarios')}
                    className="bg-surface p-5 md:p-6 rounded-2xl border border-border shadow-sm hover:scale-[1.02] hover:shadow-lg hover:border-secondary/50 transition-all cursor-pointer group"
                >
                    <p className="text-textMuted text-xs font-bold uppercase mb-1 md:mb-2 group-hover:text-secondary transition-colors">Total Socios</p>
                    <p className="text-3xl md:text-4xl font-black text-text">{totalSocios}</p>
                </div>

                {/* Widget 2: Canchas */}
                <div
                    onClick={() => setActiveTab('canchas')}
                    className="bg-surface p-5 md:p-6 rounded-2xl border border-border shadow-sm hover:scale-[1.02] hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer group"
                >
                    <p className="text-textMuted text-xs font-bold uppercase mb-1 md:mb-2 group-hover:text-primary transition-colors">Canchas Activas</p>
                    <p className="text-3xl md:text-4xl font-black text-text">
                        {canchasActivas} <span className="text-xs font-normal text-textMuted">disponibles</span>
                    </p>
                </div>

                {/* Widget 3: CAJA */}
                <div
                    className="bg-gradient-to-br from-gray-900 to-gray-800 p-5 md:p-6 rounded-2xl border border-gray-700 shadow-lg relative overflow-hidden group cursor-pointer hover:border-green-500/50 transition-all hover:scale-[1.02] sm:col-span-2 md:col-span-1"
                    onClick={() => setActiveTab('caja')}
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <span className="text-5xl md:text-6xl">💵</span>
                    </div>
                    <p className="text-green-400 text-xs font-bold uppercase mb-1 md:mb-2 group-hover:text-white transition-colors">Caja Hoy</p>
                    <p className="text-3xl md:text-4xl font-black text-white tracking-tight">
                        ${resumenFinanciero.total.toLocaleString()}
                    </p>
                    <div className="mt-2 flex gap-3 text-[10px] md:text-xs font-bold uppercase tracking-wide text-gray-400">
                        <span>Efec: ${resumenFinanciero.efectivo.toLocaleString()}</span>
                        <span>Dig: ${resumenFinanciero.digital.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* --- SECCIÓN INFERIOR: PRÓXIMOS TURNOS --- */}
            <div className="bg-surface rounded-2xl border border-border shadow-xl overflow-hidden">
                <div className="p-5 md:p-6 border-b border-border flex justify-between items-center bg-background/30">
                    <h3 className="text-base md:text-lg font-black text-text italic flex items-center gap-2">
                        <span>🎾</span> Agenda del Día
                    </h3>
                    <button
                        onClick={() => setActiveTab('reservas')}
                        className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-primary hover:text-white transition-colors bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-lg"
                    >
                        Ver Grilla →
                    </button>
                </div>

                {reservasHoy.length === 0 ? (
                    <div className="p-10 md:p-12 text-center border-t border-border/50 bg-background/10">
                        <p className="text-textMuted text-xs md:text-sm font-bold uppercase tracking-widest">No hay reservas para el día de hoy.</p>
                    </div>
                ) : (
                    <>
                        {/* --- VISTA MÓVIL (TARJETAS) --- */}
                        <div className="md:hidden flex flex-col gap-3 p-4">
                            {reservasHoy.map(reserva => {
                                const horaFormateada = new Date(reserva.fechaHora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                return (
                                    <div 
                                        key={reserva.id} 
                                        onClick={() => setActiveTab('reservas')}
                                        className="bg-background/50 border border-border rounded-xl p-4 flex flex-col gap-3 hover:border-primary/50 transition-colors cursor-pointer active:scale-[0.98]"
                                    >
                                        <div className="flex justify-between items-center border-b border-border/50 pb-3">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xl font-black text-text">{horaFormateada}</span>
                                                <span className="text-[10px] font-black uppercase text-primary bg-primary/10 px-2 py-1 rounded">
                                                    {reserva.nombreCancha}
                                                </span>
                                            </div>
                                            {reserva.codigoTurnoFijo && <span className="text-[10px] opacity-70" title="Turno Fijo">🔁</span>}
                                        </div>
                                        
                                        <div className="flex justify-between items-end">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] text-textMuted uppercase font-bold tracking-widest mb-0.5">Titular</span>
                                                <span className="text-sm font-bold text-text truncate max-w-[150px]">
                                                    {reserva.nombreUsuario}
                                                </span>
                                            </div>
                                            
                                            <div>
                                                {reserva.pagado ? (
                                                    <span className="px-2 py-1.5 rounded text-[9px] font-black uppercase tracking-widest bg-green-500/10 text-green-500 border border-green-500/20 shadow-sm">
                                                        ✅ Pagado
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-1.5 rounded text-[9px] font-black uppercase tracking-widest bg-red-500/10 text-red-500 border border-red-500/20 shadow-sm">
                                                        Debe ${reserva.saldoPendiente}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* --- VISTA ESCRITORIO (TABLA) --- */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="text-[10px] text-textMuted uppercase font-black bg-background/50 border-b border-border tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">Horario</th>
                                        <th className="px-6 py-4">Cancha</th>
                                        <th className="px-6 py-4">Titular</th>
                                        <th className="px-6 py-4 text-right">Estado de Pago</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {reservasHoy.map(reserva => {
                                        const horaFormateada = new Date(reserva.fechaHora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                        return (
                                            <tr 
                                                key={reserva.id} 
                                                onClick={() => setActiveTab('reservas')}
                                                className="hover:bg-background/40 transition-colors group cursor-pointer"
                                            >
                                                <td className="px-6 py-4 font-black text-text text-lg">{horaFormateada}</td>
                                                <td className="px-6 py-4 font-bold text-primary uppercase text-sm">{reserva.nombreCancha}</td>
                                                <td className="px-6 py-4 font-bold text-text text-sm flex items-center gap-2">
                                                    {reserva.nombreUsuario}
                                                    {reserva.codigoTurnoFijo && <span className="text-[10px] bg-secondary/20 text-secondary px-2 py-0.5 rounded uppercase" title="Turno Fijo">🔁</span>}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {reserva.pagado ? (
                                                        <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-green-500/10 text-green-500 border border-green-500/20 shadow-sm">
                                                            ✅ Pagado
                                                        </span>
                                                    ) : (
                                                        <div className="flex flex-col items-end">
                                                            <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-red-500/10 text-red-500 border border-red-500/20 shadow-sm">
                                                                Debe ${reserva.saldoPendiente}
                                                            </span>
                                                            <span className="text-[9px] text-textMuted uppercase font-bold tracking-widest mt-1 mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                Cobrar en recepción
                                                            </span>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>

        </div>
    );
};

export default DashboardView;