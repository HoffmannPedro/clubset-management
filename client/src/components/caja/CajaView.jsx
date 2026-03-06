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
            const datosLimpios = await getPagosDiarios(fechaCaja);
            setPagosDelDia(datosLimpios);
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
            fetchPagos(); // Recargamos la caja para ver el impacto inmediato
            
        } catch (error) {
            alert("Hubo un error al registrar el gasto.");
            console.error(error);
        }
    };

    // --- CÁLCULO FINANCIERO REAL (Ingresos - Egresos) ---
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
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 relative">
            
            {/* 1. Filtro Fecha y Botón Gasto */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface p-4 rounded-xl border border-border shadow-sm">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <h3 className="text-lg font-black italic text-white">Movimientos</h3>
                    <input 
                        type="date" 
                        value={fechaCaja}
                        onChange={(e) => setFechaCaja(e.target.value)}
                        className="bg-background border border-border rounded-lg p-2 text-sm text-white focus:border-primary outline-none font-bold uppercase"
                    />
                </div>
                
                {/* Botón para abrir modal de gastos */}
                <button 
                    onClick={() => setShowGastoModal(true)}
                    className="w-full sm:w-auto bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/30 font-black uppercase tracking-widest text-xs px-6 py-3 rounded-xl transition-all"
                >
                    - Registrar Gasto
                </button>
            </div>

            {/* 2. Tarjetas Resumen */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-xl">
                    <p className="text-green-500 text-xs font-bold uppercase mb-1">Caja Neta (Real)</p>
                    <p className="text-3xl font-black text-white">${resumenFinanciero.totalCaja.toLocaleString()}</p>
                </div>
                <div className="bg-surface border border-border p-4 rounded-xl">
                    <p className="text-textMuted text-xs font-bold uppercase mb-1">En Efectivo</p>
                    <p className="text-xl font-black text-secondary">${resumenFinanciero.efectivo.toLocaleString()}</p>
                </div>
                <div className="bg-surface border border-border p-4 rounded-xl">
                    <p className="text-textMuted text-xs font-bold uppercase mb-1">Digital</p>
                    <p className="text-xl font-black text-terciary">${resumenFinanciero.digital.toLocaleString()}</p>
                </div>
                <div className="bg-red-500/5 border border-red-500/20 p-4 rounded-xl">
                    <p className="text-red-500/70 text-xs font-bold uppercase mb-1">Egresos Totales</p>
                    <p className="text-xl font-black text-red-400">-${resumenFinanciero.egresos.toLocaleString()}</p>
                </div>
            </div>

            {/* 3. Vistas de Datos (Tabla PC / Cards Móvil) */}
            {loading ? (
                <div className="text-center p-10 text-textMuted font-bold animate-pulse tracking-widest uppercase">Contando billetes...</div>
            ) : (
                <>
                    {/* MOBILE */}
                    <div className="md:hidden space-y-3">
                        {pagosDelDia.length > 0 ? (
                            pagosDelDia.map((pago) => {
                                const esGasto = pago.tipoMovimiento === 'EGRESO';
                                return (
                                    <div key={pago.id} className={`bg-surface border p-4 rounded-xl shadow-sm relative ${esGasto ? 'border-red-500/30' : 'border-border'}`}>
                                        <div className="flex justify-between items-start mb-3 border-b border-white/5 pb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-400 font-mono text-xs bg-black/20 px-2 py-1 rounded">{pago.hora}</span>
                                                <span className={`text-[10px] font-bold uppercase bg-white/5 px-2 py-1 rounded ${esGasto ? 'text-red-400' : 'text-primary'}`}>
                                                    {pago.metodoPago.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <span className={`text-xl font-black ${esGasto ? 'text-red-500' : 'text-white'}`}>
                                                {esGasto ? '-' : ''}${pago.monto}
                                            </span>
                                        </div>
                                        <div>
                                            <p className={`font-bold text-sm uppercase ${esGasto ? 'text-red-400' : 'text-white'}`}>{pago.nombreCliente}</p>
                                            <p className="text-xs text-textMuted mt-0.5">{pago.observacion || (pago.nombreCancha + ' • ' + pago.tipoCliente)}</p>
                                        </div>
                                    </div>
                                )
                            })
                        ) : (
                            <div className="bg-surface/30 p-8 rounded-2xl border border-dashed border-border text-center">
                                <p className="text-sm opacity-50 uppercase tracking-widest font-bold">Caja vacía.</p>
                            </div>
                        )}
                    </div>

                    {/* DESKTOP */}
                    <div className="hidden md:block bg-surface rounded-2xl border border-border overflow-hidden shadow-xl">
                        <table className="w-full text-left text-sm text-textMuted">
                            <thead className="bg-background text-[10px] tracking-widest uppercase font-black text-textMuted border-b border-border">
                                <tr>
                                    <th className="p-4">Hora</th>
                                    <th className="p-4">Concepto / Cliente</th>
                                    <th className="p-4">Método</th>
                                    <th className="p-4">Observación</th>
                                    <th className="p-4 text-right">Monto</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {pagosDelDia.length === 0 && (
                                    <tr><td colSpan="5" className="p-8 text-center italic opacity-50">No hay movimientos en esta fecha.</td></tr>
                                )}
                                {pagosDelDia.map((pago) => {
                                    const esGasto = pago.tipoMovimiento === 'EGRESO';
                                    return (
                                        <tr key={pago.id} className="hover:bg-white/5 transition-colors">
                                            <td className="p-4 font-bold font-mono text-xs">{pago.hora}</td>
                                            <td className="p-4">
                                                <p className={`font-bold text-xs uppercase ${esGasto ? 'text-red-400' : 'text-white'}`}>{pago.nombreCliente}</p>
                                                {!esGasto && <p className="text-[10px] opacity-70">{pago.nombreCancha} • {pago.tipoCliente}</p>}
                                            </td>
                                            <td className="p-4 text-[10px] tracking-wider font-bold uppercase">{pago.metodoPago.replace('_', ' ')}</td>
                                            <td className="p-4 italic opacity-70 text-xs">{pago.observacion || '-'}</td>
                                            <td className={`p-4 text-right font-black ${esGasto ? 'text-red-500' : 'text-green-400'}`}>
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-surface border border-border rounded-2xl p-8 w-full max-w-md shadow-2xl relative">
                        <h3 className="text-xl font-black italic text-white mb-1">Registrar Salida</h3>
                        <p className="text-xs text-textMuted uppercase tracking-widest mb-6">Nuevo Gasto Operativo</p>
                        
                        <form onSubmit={handleGuardarGasto} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-textMuted mb-2">Monto ($)</label>
                                <input 
                                    type="number" 
                                    min="1"
                                    step="0.01"
                                    required
                                    autoFocus
                                    className="w-full bg-background border border-border text-white rounded-xl p-3 focus:border-red-500 outline-none font-black text-xl"
                                    placeholder="0.00"
                                    value={gastoData.monto}
                                    onChange={(e) => setGastoData({...gastoData, monto: e.target.value})}
                                />
                            </div>
                            
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-textMuted mb-2">Método de Extracción</label>
                                <select 
                                    className="w-full bg-background border border-border text-white rounded-xl p-3 focus:border-red-500 outline-none font-bold text-sm"
                                    value={gastoData.metodoPago}
                                    onChange={(e) => setGastoData({...gastoData, metodoPago: e.target.value})}
                                >
                                    <option value="EFECTIVO">Efectivo (Caja Física)</option>
                                    <option value="TRANSFERENCIA">Transferencia / Billetera Virtual</option>
                                    <option value="TARJETA_DEBITO">Tarjeta de Débito</option>
                                    <option value="TARJETA_CREDITO">Tarjeta de Crédito</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-textMuted mb-2">Concepto / Observación</label>
                                <input 
                                    type="text" 
                                    required
                                    placeholder="Ej: Artículos de limpieza, Pago de luz..."
                                    className="w-full bg-background border border-border text-white rounded-xl p-3 focus:border-red-500 outline-none text-sm"
                                    value={gastoData.observacion}
                                    onChange={(e) => setGastoData({...gastoData, observacion: e.target.value})}
                                />
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-border mt-6">
                                <button 
                                    type="button"
                                    onClick={() => setShowGastoModal(false)}
                                    className="flex-1 bg-background border border-border text-textMuted hover:text-white font-bold text-xs uppercase py-3 rounded-xl transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-1 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase py-3 rounded-xl shadow-[0_0_15px_rgba(220,38,38,0.3)] transition-all hover:scale-105"
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