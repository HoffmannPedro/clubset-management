import { useState, useEffect, useMemo } from 'react';
import { getPagosDiarios } from '../../services/reservaService';

const CajaView = () => {
    const [pagosDelDia, setPagosDelDia] = useState([]);
    const [fechaCaja, setFechaCaja] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchPagos();
    }, [fechaCaja]);

    const fetchPagos = async () => {
        setLoading(true);
        try {
            const datosLimpios = await getPagosDiarios(fechaCaja);
            setPagosDelDia(datosLimpios);
        } catch (error) {
            console.error("Error cargando caja:", error);
        } finally {
            setLoading(false);
        }
    };

    const resumenFinanciero = useMemo(() => {
        const total = pagosDelDia.reduce((acc, p) => acc + p.monto, 0);
        const efectivo = pagosDelDia.filter(p => p.metodoPago === 'EFECTIVO').reduce((acc, p) => acc + p.monto, 0);
        const digital = total - efectivo;
        return { total, efectivo, digital };
    }, [pagosDelDia]);

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            {/* 1. Filtro Fecha */}
            <div className="flex justify-between items-center bg-surface p-4 rounded-xl border border-border shadow-sm">
                <h3 className="text-lg font-black italic text-white">Movimientos</h3>
                <input 
                    type="date" 
                    value={fechaCaja}
                    onChange={(e) => setFechaCaja(e.target.value)}
                    className="bg-background border border-border rounded-lg p-2 text-sm text-white focus:border-primary outline-none font-bold uppercase"
                />
            </div>

            {/* 2. Tarjetas Resumen */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-xl">
                    <p className="text-green-500 text-xs font-bold uppercase">Total Recaudado</p>
                    <p className="text-2xl font-black text-white">${resumenFinanciero.total}</p>
                </div>
                <div className="bg-surface border border-border p-4 rounded-xl">
                    <p className="text-textMuted text-xs font-bold uppercase">En Efectivo</p>
                    <p className="text-2xl font-black text-secondary">${resumenFinanciero.efectivo}</p>
                </div>
                <div className="bg-surface border border-border p-4 rounded-xl">
                    <p className="text-textMuted text-xs font-bold uppercase">Digital</p>
                    <p className="text-2xl font-black text-terciary">${resumenFinanciero.digital}</p>
                </div>
            </div>

            {/* 3. Vistas de Datos (Tabla PC / Cards Móvil) */}
            {loading ? (
                <div className="text-center p-10 text-textMuted">Cargando movimientos...</div>
            ) : (
                <>
                    {/* MOBILE */}
                    <div className="md:hidden space-y-3">
                        {pagosDelDia.length > 0 ? (
                            pagosDelDia.map((pago) => (
                                <div key={pago.id} className="bg-surface border border-border p-4 rounded-xl shadow-sm relative">
                                    <div className="flex justify-between items-start mb-3 border-b border-white/5 pb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-400 font-mono text-xs bg-black/20 px-2 py-1 rounded">{pago.hora}</span>
                                            <span className="text-[10px] font-bold uppercase bg-white/5 px-2 py-1 rounded text-primary">
                                                {pago.metodoPago.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <span className="text-xl font-black text-white">${pago.monto}</span>
                                    </div>
                                    <div>
                                        <p className="text-white font-bold text-sm uppercase">{pago.nombreCliente}</p>
                                        <p className="text-xs text-textMuted mt-0.5">{pago.nombreCancha} • {pago.tipoCliente}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-sm opacity-50">Sin movimientos.</p>
                        )}
                    </div>

                    {/* DESKTOP */}
                    <div className="hidden md:block bg-surface rounded-2xl border border-border overflow-hidden shadow-xl">
                        <table className="w-full text-left text-sm text-textMuted">
                            <thead className="bg-background text-xs uppercase font-black text-white border-b border-border">
                                <tr>
                                    <th className="p-4">Hora</th>
                                    <th className="p-4">Cliente / Cancha</th>
                                    <th className="p-4">Método</th>
                                    <th className="p-4">Obs</th>
                                    <th className="p-4 text-right">Monto</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {pagosDelDia.map((pago) => (
                                    <tr key={pago.id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4 font-bold font-mono text-xs">{pago.hora}</td>
                                        <td className="p-4">
                                            <p className="font-bold text-white text-xs uppercase">{pago.nombreCliente}</p>
                                            <p className="text-[10px] opacity-70">{pago.nombreCancha} • {pago.tipoCliente}</p>
                                        </td>
                                        <td className="p-4 text-xs font-bold uppercase">{pago.metodoPago.replace('_', ' ')}</td>
                                        <td className="p-4 italic opacity-50 text-xs">{pago.observacion || '-'}</td>
                                        <td className="p-4 text-right font-black text-white">${pago.monto}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
};

export default CajaView;