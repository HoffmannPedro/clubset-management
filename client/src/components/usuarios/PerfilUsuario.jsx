import { useState, useEffect } from 'react';
import api from '../../services/api';

const PerfilUsuario = () => {
    const [perfil, setPerfil] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargarPerfil();
    }, []);

    const cargarPerfil = async () => {
        try {
            const res = await api.get('/usuarios/me');
            setPerfil(res.data);
        } catch (error) {
            console.error("Error cargando perfil", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-10 text-center text-textMuted animate-pulse">Cargando ficha de jugador...</div>;
    if (!perfil) return <div className="p-10 text-center text-red-400">No se pudieron cargar los datos.</div>;

    // Función auxiliar para colores de categoría
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
        <div className="space-y-6 animate-in fade-in duration-500">

            {/* 1. HEADER / TARJETA DE JUGADOR */}
            <div className="relative bg-gradient-to-r from-surface to-background rounded-2xl p-6 md:p-8 border border-border shadow-2xl overflow-hidden">
                {/* Fondo decorativo */}
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <span className="text-9xl">🎾</span>
                </div>

                <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
                    {/* Avatar con Iniciales */}
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
                            <span className={`px-3 py-1 rounded text-[10px] font-black uppercase border ${getBadgeColor(perfil.categoria)}`}>
                                {perfil.categoria}
                            </span>
                            <span className="px-3 py-1 rounded text-[10px] font-black uppercase border border-border text-textMuted bg-surface">
                                {perfil.rol}
                            </span>
                        </div>
                    </div>

                    {/* KPI Ranking */}
                    <div className="bg-black/40 p-4 rounded-xl border border-white/5 text-center min-w-[120px]">
                        <p className="text-[10px] text-textMuted uppercase font-bold tracking-widest">Ranking</p>
                        <p className="text-4xl font-black text-white">{perfil.puntosRanking || 0}</p>
                        <p className="text-[9px] text-primary font-bold">PUNTOS</p>
                    </div>
                </div>
            </div>

            {/* 2. GRILLA DE DATOS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Datos Personales */}
                <div className="bg-surface p-6 rounded-2xl border border-border shadow-lg">
                    <h3 className="text-xs font-black text-secondary uppercase border-b border-border pb-2 mb-4">Información de Contacto</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-textMuted uppercase font-bold">Email</span>
                            <span className="text-sm font-medium text-text">{perfil.email}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-textMuted uppercase font-bold">Teléfono</span>
                            <span className="text-sm font-medium text-text">{perfil.telefono || '-'}</span>
                        </div>
                    </div>
                </div>

                {/* Ficha Técnica */}
                <div className="bg-surface p-6 rounded-2xl border border-border shadow-lg">
                    <h3 className="text-xs font-black text-primary uppercase border-b border-border pb-2 mb-4">Ficha Técnica</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-textMuted uppercase font-bold">Mano Hábil</span>
                            <span className="text-sm font-medium text-text">{perfil.manoHabil}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-textMuted uppercase font-bold">Género</span>
                            <span className="text-sm font-medium text-text">{perfil.genero}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-textMuted uppercase font-bold">ID Socio</span>
                            <span className="text-sm font-medium text-text font-mono">#{perfil.id}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PerfilUsuario;