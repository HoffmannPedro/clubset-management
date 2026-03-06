import { useState, useEffect, useMemo } from 'react';
import { getPagosDiarios, registrarGastoManual } from '../../services/pagoService';

const CajaView = () => {
    const [pagosDelDia, setPagosDelDia] = useState([]);
    const [fechaCaja, setFechaCaja] = useState(new Date().toLocaleDateString('en-CA'));
    const [loading, setLoading] = useState(false);

    // Estados para el Modal de Gastos
    const [showGastoModal, setShowGastoModal] = useState(false);
    const [gastoData, setGastoData] = useState({ monto: '', metodoPago: 'EFECTIVO', observacion: '' });

    useEffect(() => {
        fetchPagos();
    }, [fechaCaja]);

    const fetchPagos = async () => {
        setLoading(true);
        try {
            const data = await getPagosDiarios(fechaCaja);
            // data ahora es el ResumenCajaDTO { movimientos: [], totalIngresos: ... }
            setPagosDelDia(data.movimientos || []);
        } catch (error) {
            console.error("Error cargando caja:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleGuardarGasto = async (e) => {
        e.preventDefault();
        if (!gastoData.monto || !gastoData.observacion) return alert("Por favor, completa el monto y la observación.");

        try {
            await registrarGastoManual({
                monto: parseFloat(gastoData.monto),
                metodoPago: gastoData.metodoPago,
                observacion: gastoData.observacion
            });

            setShowGastoModal(false);
            setGastoData({ monto: '', metodoPago: 'EFECTIVO', observacion: '' });
            fetchPagos();

        } catch (error) {
            alert("Hubo un error al registrar el gasto.");
            console.error(error);
        }
    };

    // --- CÁLCULO FINANCIERO REAL ---
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

        const totalCaja = ingresos - egresos;
        return { totalCaja, ingresos, egresos, efectivo, digital };
    }, [pagosDelDia]);

    return (
        <div className="space-y-6 md:space-y-8 animate-in slide-in-from-bottom-4 duration-500 relative">

            {/* 1. Filtro Fecha y Botón Gasto */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface p-4 md:p-5 rounded-2xl border border-border shadow-sm">
                <div className="flex flex-row items-center justify-between w-full sm:w-auto gap-4">
                    {/* El título ahora SIEMPRE se ve, le sacamos el hidden */}
                    <h3 className="text-xl md:text-2xl font-black italic text-text">Movimientos</h3>
                    <input
                        type="date"
                        value={fechaCaja}
                        onChange={(e) => setFechaCaja(e.target.value)}
                        className="bg-background border border-border rounded-xl p-3 text-sm text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none font-bold uppercase transition-all"
                    />
                </div>

                <button
                    onClick={() => setShowGastoModal(true)}
                    className="w-full sm:w-auto bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:scale-[1.02] active:scale-95 border border-red-500/30 font-black uppercase tracking-widest text-xs px-6 py-3.5 rounded-xl transition-all shadow-sm"
                >
                    - Registrar Gasto
                </button>
            </div>

            {/* 2. Tarjetas Resumen */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                <div className="bg-green-500/10 border border-green-500/30 p-4 md:p-5 rounded-2xl shadow-sm col-span-2 md:col-span-1">
                    <p className="text-green-500 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-1">Caja Neta (Real)</p>
                    <p className="text-3xl md:text-4xl font-black text-text">${resumenFinanciero.totalCaja.toLocaleString()}</p>
                </div>
                <div className="bg-surface border border-border p-4 md:p-5 rounded-2xl shadow-sm">
                    <p className="text-textMuted text-[10px] md:text-xs font-bold uppercase tracking-wider mb-1">En Efectivo</p>
                    <p className="text-xl md:text-2xl font-black text-secondary">${resumenFinanciero.efectivo.toLocaleString()}</p>
                </div>
                <div className="bg-surface border border-border p-4 md:p-5 rounded-2xl shadow-sm">
                    <p className="text-textMuted text-[10px] md:text-xs font-bold uppercase tracking-wider mb-1">Digital</p>
                    <p className="text-xl md:text-2xl font-black text-terciary">${resumenFinanciero.digital.toLocaleString()}</p>
                </div>
                <div className="bg-red-500/5 border border-red-500/20 p-4 md:p-5 rounded-2xl shadow-sm col-span-2 md:col-span-1">
                    <p className="text-red-500/70 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-1">Egresos Totales</p>
                    <p className="text-xl md:text-2xl font-black text-red-400">-${resumenFinanciero.egresos.toLocaleString()}</p>
                </div>
            </div>

            {/* 3. Vistas de Datos (Tabla PC / Cards Móvil) */}
            {loading ? (
                <div className="text-center p-12 text-textMuted font-bold animate-pulse tracking-widest uppercase bg-surface/30 rounded-2xl border border-dashed border-border">
                    Auditando caja...
                </div>
            ) : (
                <>
                    {/* MOBILE */}
                    <div className="md:hidden space-y-4">

                        {/* Título de sección para celular */}
                        <div className="flex items-center gap-3 pt-2">
                            <h4 className="text-xs font-black text-textMuted uppercase tracking-[0.2em]">Detalle Operativo</h4>
                            <div className="h-px bg-border flex-1"></div>
                        </div>

                        {pagosDelDia.length > 0 ? (
                            pagosDelDia.map((pago) => {
                                const esGasto = pago.tipoMovimiento === 'EGRESO';
                                return (
                                    // Cambiamos el padding a p-5 (clase estándar válida) y le dimos un diseño limpio de "Billetera Virtual"
                                    <div key={pago.id} className={`bg-surface p-5 rounded-2xl shadow-sm relative overflow-hidden flex flex-col gap-3 border ${esGasto ? 'border-red-500/30' : 'border-border'}`}>

                                        {/* Fila Superior: Info técnica y Monto */}
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <span className="text-text font-mono text-xs bg-background px-2 py-1 rounded-lg border border-border">
                                                    {pago.hora}
                                                </span>
                                                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border ${esGasto ? 'bg-red-500/10 text-red-500 border-red-500/30' : 'bg-primary/10 text-primary border-primary/30'}`}>
                                                    {pago.metodoPago.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <span className={`text-xl font-black ${esGasto ? 'text-red-500' : 'text-text'}`}>
                                                {esGasto ? '-' : ''}${pago.monto}
                                            </span>
                                        </div>

                                        {/* Fila Inferior: Cliente y Detalle */}
                                        <div className="flex flex-col">
                                            <p className={`font-black text-sm uppercase tracking-wide ${esGasto ? 'text-red-400' : 'text-text'}`}>
                                                {pago.nombreCliente}
                                            </p>
                                            <p className="text-xs text-textMuted font-medium mt-1">
                                                {pago.observacion || (pago.nombreCancha + ' • ' + pago.tipoCliente)}
                                            </p>
                                        </div>
                                    </div>
                                )
                            })
                        ) : (
                            <div className="bg-surface/30 p-8 rounded-2xl border border-dashed border-border text-center">
                                <p className="text-sm opacity-50 uppercase tracking-widest font-bold text-textMuted">Caja vacía.</p>
                            </div>
                        )}
                    </div>

                    {/* DESKTOP */}
                    <div className="hidden md:block bg-surface rounded-2xl border border-border overflow-hidden shadow-xl">
                        <table className="w-full text-left text-sm text-text">
                            <thead className="bg-background text-[10px] tracking-widest uppercase font-black text-textMuted border-b border-border">
                                <tr>
                                    <th className="p-5">Hora</th>
                                    <th className="p-5">Concepto / Cliente</th>
                                    <th className="p-5">Método</th>
                                    <th className="p-5">Observación</th>
                                    <th className="p-5 text-right">Monto</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {pagosDelDia.length === 0 && (
                                    <tr><td colSpan="5" className="p-10 text-center font-bold uppercase tracking-widest text-textMuted italic opacity-50">No hay movimientos en esta fecha.</td></tr>
                                )}
                                {pagosDelDia.map((pago) => {
                                    const esGasto = pago.tipoMovimiento === 'EGRESO';
                                    return (
                                        <tr key={pago.id} className="hover:bg-white/5 transition-colors">
                                            <td className="p-5 font-bold font-mono text-xs text-textMuted">{pago.hora}</td>
                                            <td className="p-5">
                                                <p className={`font-black text-sm uppercase ${esGasto ? 'text-red-400' : 'text-text'}`}>{pago.nombreCliente}</p>
                                                {!esGasto && <p className="text-[10px] text-textMuted font-bold uppercase tracking-widest mt-1">{pago.nombreCancha} • {pago.tipoCliente}</p>}
                                            </td>
                                            <td className="p-5 text-[10px] tracking-widest font-black uppercase text-textMuted">{pago.metodoPago.replace('_', ' ')}</td>
                                            <td className="p-5 font-medium text-textMuted text-xs">{pago.observacion || '-'}</td>
                                            <td className={`p-5 text-right font-black text-lg ${esGasto ? 'text-red-500' : 'text-green-500'}`}>
                                                {esGasto ? '-' : '+'}${pago.monto}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {/* --- MODAL PARA NUEVO GASTO --- */}
            {showGastoModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-surface border border-border rounded-2xl p-6 md:p-8 w-full max-w-md shadow-2xl relative max-h-[90vh] overflow-y-auto hide-scrollbar">
                        <h3 className="text-xl font-black italic text-text mb-1">Registrar Salida</h3>
                        <p className="text-xs text-textMuted uppercase tracking-widest mb-6">Nuevo Gasto Operativo</p>

                        <form onSubmit={handleGuardarGasto} className="space-y-5">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-textMuted mb-2 ml-1">Monto ($)</label>
                                <input
                                    type="number"
                                    min="1"
                                    step="0.01"
                                    required
                                    autoFocus
                                    className="w-full bg-background border border-border text-text rounded-xl p-3.5 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none font-black text-xl transition-all"
                                    placeholder="0.00"
                                    value={gastoData.monto}
                                    onChange={(e) => setGastoData({ ...gastoData, monto: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-textMuted mb-2 ml-1">Método de Extracción</label>
                                <div className="relative">
                                    <select
                                        className="w-full bg-background border border-border text-text rounded-xl p-3.5 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none font-bold text-sm appearance-none cursor-pointer transition-all"
                                        value={gastoData.metodoPago}
                                        onChange={(e) => setGastoData({ ...gastoData, metodoPago: e.target.value })}
                                    >
                                        <option value="EFECTIVO">Efectivo (Caja Física)</option>
                                        <option value="TRANSFERENCIA">Transferencia / Billetera Virtual</option>
                                        <option value="TARJETA_DEBITO">Tarjeta de Débito</option>
                                        <option value="TARJETA_CREDITO">Tarjeta de Crédito</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-textMuted">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-textMuted mb-2 ml-1">Concepto / Observación</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ej: Artículos de limpieza, Pago de luz..."
                                    className="w-full bg-background border border-border text-text rounded-xl p-3.5 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none text-sm font-medium transition-all"
                                    value={gastoData.observacion}
                                    onChange={(e) => setGastoData({ ...gastoData, observacion: e.target.value })}
                                />
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-border mt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowGastoModal(false)}
                                    className="flex-1 bg-transparent border border-border text-textMuted hover:text-text hover:bg-white/5 font-black text-xs uppercase tracking-widest py-3.5 rounded-xl transition-all order-2 sm:order-1"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-widest py-3.5 rounded-xl shadow-[0_10px_20px_rgba(220,38,38,0.2)] transition-all hover:scale-[1.02] active:scale-95 order-1 sm:order-2"
                                >
                                    Confirmar Gasto
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CajaView;