import { useState, useEffect } from 'react';
import api from '../../services/api';

// Aceptamos 'usuarioId' como prop opcional. 
// Si viene, mostramos ESE usuario. Si es null, mostramos el propio ("me").
const PerfilUsuario = ({ usuarioId = null }) => {
    const [perfil, setPerfil] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargarPerfil();
    }, [usuarioId]); // Recargamos si cambia el ID

    const cargarPerfil = async () => {
        setLoading(true);
        try {
            // Lógica polimórfica de endpoints
            const endpoint = usuarioId ? `/usuarios/${usuarioId}` : '/usuarios/me';
            const res = await api.get(endpoint);
            setPerfil(res.data);
        } catch (error) {
            console.error("Error cargando perfil", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-10 text-center text-textMuted animate-pulse">Cargando ficha de jugador...</div>;
    if (!perfil) return <div className="p-10 text-center text-red-400">No se pudieron cargar los datos.</div>;

    const getBadgeColor = (cat) => {
        const colors = {
            'PRIMERA': 'bg-yellow-500/20 text-yellow-500 border-yellow-500',
            'SEGUNDA': 'bg-yellow-500/20 text-yellow-500 border-yellow-500',
            'TERCERA': 'bg-blue-500/20 text-blue-500 border-blue-500',
            'PRINCIPIANTE': 'bg-green-500/20 text-green-500 border-green-500'
        };
        return colors[cat] || 'bg-gray-500/20 text-gray-400 border-gray-500';
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
            
            {/* 1. HEADER (Igual que antes) */}
            <div className="relative bg-gradient-to-r from-surface to-background rounded-2xl p-6 md:p-8 border border-border shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><span className="text-9xl">🎾</span></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary to-secondary p-1 shadow-[0_0_20px_rgba(201,106,61,0.3)]">
                        <div className="w-full h-full rounded-full bg-surface flex items-center justify-center text-3xl font-black text-white uppercase">
                            {perfil.nombre?.charAt(0)}{perfil.apellido?.charAt(0)}
                        </div>
                    </div>
                    <div className="text-center md:text-left flex-1">
                        <h2 className="text-3xl font-black text-text italic tracking-tighter uppercase">
                            {perfil.nombre} <span className="text-primary">{perfil.apellido}</span>
                        </h2>
                        <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-3">
                            <span className={`px-3 py-1 rounded text-[10px] font-black uppercase border ${getBadgeColor(perfil.categoria)}`}>{perfil.categoria}</span>
                            <span className="px-3 py-1 rounded text-[10px] font-black uppercase border border-border text-textMuted bg-surface">{perfil.rol}</span>
                        </div>
                    </div>
                    <div className="bg-black/40 p-4 rounded-xl border border-white/5 text-center min-w-[120px]">
                        <p className="text-[10px] text-textMuted uppercase font-bold tracking-widest">Ranking</p>
                        <p className="text-4xl font-black text-white">{perfil.puntosRanking || 0}</p>
                        <p className="text-[9px] text-primary font-bold">PUNTOS</p>
                    </div>
                </div>
            </div>

            {/* 2. ESTADÍSTICAS FINANCIERAS (NUEVO) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Deuda */}
                <div className={`p-6 rounded-2xl border flex flex-col justify-center items-center relative overflow-hidden ${perfil.deudaTotal > 0 ? 'bg-red-500/10 border-red-500/50' : 'bg-green-500/10 border-green-500/50'}`}>
                    <h3 className="text-xs font-black uppercase tracking-widest mb-1 opacity-70">Estado de Cuenta</h3>
                    <p className={`text-3xl font-black ${perfil.deudaTotal > 0 ? 'text-red-500' : 'text-green-500'}`}>
                        ${perfil.deudaTotal || 0}
                    </p>
                    <span className="text-[10px] font-bold uppercase mt-1">
                        {perfil.deudaTotal > 0 ? 'Saldo Pendiente' : 'Al día'}
                    </span>
                </div>

                {/* Partidos */}
                <div className="p-6 bg-surface rounded-2xl border border-border flex flex-col justify-center items-center">
                    <h3 className="text-xs font-black text-textMuted uppercase tracking-widest mb-1">Partidos Jugados</h3>
                    <p className="text-3xl font-black text-text">{perfil.partidosJugados || 0}</p>
                    <span className="text-[10px] text-primary font-bold uppercase mt-1">Trayectoria</span>
                </div>

                {/* ID */}
                <div className="p-6 bg-surface rounded-2xl border border-border flex flex-col justify-center items-center">
                    <h3 className="text-xs font-black text-textMuted uppercase tracking-widest mb-1">Ficha Técnica</h3>
                    <p className="text-sm font-bold text-text">{perfil.manoHabil} / {perfil.genero === 'MASCULINO' ? 'Masculino' : 'Femenino'}</p>
                    <span className="text-[10px] text-textMuted font-mono mt-1">ID SOCIO: #{perfil.id}</span>
                </div>
            </div>

            {/* 3. HISTORIAL DE RESERVAS (NUEVO) */}
            <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-lg">
                <div className="p-6 border-b border-border bg-black/20">
                    <h3 className="text-lg font-black text-text italic">Últimos Movimientos</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="text-xs text-textMuted uppercase bg-white/5 font-black">
                            <tr>
                                <th className="px-6 py-4">Fecha</th>
                                <th className="px-6 py-4">Cancha</th>
                                <th className="px-6 py-4 text-center">Estado</th>
                                <th className="px-6 py-4 text-right">Saldo</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {perfil.ultimasReservas && perfil.ultimasReservas.length > 0 ? (
                                perfil.ultimasReservas.map((reserva) => (
                                    <tr key={reserva.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 font-bold">
                                            {new Date(reserva.fechaHora).toLocaleDateString()} 
                                            <span className="text-textMuted ml-2 font-normal">
                                                {new Date(reserva.fechaHora).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}hs
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-primary font-bold uppercase">{reserva.nombreCancha}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2 py-1 rounded text-[9px] font-black uppercase ${reserva.pagado ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                                                {reserva.pagado ? 'Pagado' : 'Pendiente'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono text-textMuted">
                                            {reserva.saldoPendiente > 0 ? `$${reserva.saldoPendiente}` : '-'}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-textMuted italic">
                                        Sin actividad reciente.
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

export default PerfilUsuario;