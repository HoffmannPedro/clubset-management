import { useState, useEffect, useMemo } from 'react';
import { getPagosDiarios } from '../../services/reservaService';

const DashboardView = ({ setActiveTab }) => {
    const [pagosDelDia, setPagosDelDia] = useState([]);
    
    // Al montar, buscamos los pagos de HOY para el widget financiero
    useEffect(() => {
        const fetchPagosHoy = async () => {
            try {
                const hoy = new Date().toISOString().split('T')[0];
                const datos = await getPagosDiarios(hoy);
                setPagosDelDia(datos);
            } catch (error) {
                console.error("Error cargando widget caja:", error);
            }
        };
        fetchPagosHoy();
    }, []);

    // Calculamos totales en vivo
    const resumenFinanciero = useMemo(() => {
        const total = pagosDelDia.reduce((acc, p) => acc + p.monto, 0);
        const efectivo = pagosDelDia.filter(p => p.metodoPago === 'EFECTIVO').reduce((acc, p) => acc + p.monto, 0);
        const digital = total - efectivo;
        return { total, efectivo, digital };
    }, [pagosDelDia]);

    return (
        <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
            <h2 className="text-2xl font-black italic mb-6">Bienvenido al Panel</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {/* Widget 1: Socios (Estático por ahora) */}
                <div className="bg-surface p-6 rounded-2xl border border-border shadow-lg hover:scale-[1.02] transition-transform">
                    <p className="text-textMuted text-xs font-bold uppercase mb-2">Total Socios</p>
                    <p className="text-3xl md:text-4xl font-black text-secondary">42</p>
                </div>

                {/* Widget 2: Canchas (Estático por ahora) */}
                <div className="bg-surface p-6 rounded-2xl border border-border shadow-lg hover:scale-[1.02] transition-transform text-primary">
                    <p className="text-textMuted text-xs font-bold uppercase mb-2">Canchas Activas</p>
                    <p className="text-3xl md:text-4xl font-black">08</p>
                </div>

                {/* Widget 3: CAJA (Dinámico) - Clickeable para ir a la sección Caja */}
                <div 
                    className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg relative overflow-hidden group cursor-pointer hover:border-green-500/50 transition-all hover:scale-[1.02]" 
                    onClick={() => setActiveTab('caja')}
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <span className="text-6xl">💵</span>
                    </div>
                    <p className="text-green-400 text-xs font-bold uppercase mb-2">Caja Hoy ({new Date().toLocaleDateString()})</p>
                    <p className="text-3xl md:text-4xl font-black text-white tracking-tight">
                        ${resumenFinanciero.total.toLocaleString()}
                    </p>
                    <div className="mt-2 flex gap-3 text-[10px] font-bold uppercase tracking-wide text-gray-400">
                        <span>Efec: ${resumenFinanciero.efectivo.toLocaleString()}</span>
                        <span>Dig: ${resumenFinanciero.digital.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            <div className="bg-surface/30 p-8 md:p-12 rounded-3xl border border-dashed border-border text-center">
                <p className="text-textMuted italic text-sm md:text-base">
                    Panel optimizado para móvil y escritorio.
                </p>
            </div>
        </div>
    );
};

export default DashboardView;