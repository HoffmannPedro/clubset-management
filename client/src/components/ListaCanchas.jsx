import { useEffect, useState, useCallback } from 'react';
import { getCanchas } from '../services/canchaService';

const ListaCanchas = ({ refreshKey }) => {
    const [canchas, setCanchas] = useState([]);
    const [loading, setLoading] = useState(false);

    const cargarCanchas = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getCanchas();
            setCanchas(data);
        } catch (error) {
            console.error("Error cargando canchas:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        cargarCanchas();
    }, [cargarCanchas, refreshKey]);

    if (loading && canchas.length === 0) return <div className="text-primary animate-pulse font-bold">ACCEDIENDO A LOS SERVIDORES...</div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {canchas.map(c => (
                <div key={c.id} className="bg-surface border border-border p-8 rounded-2xl hover:border-primary transition-all group relative">
                    <div className="flex justify-between items-start mb-6">
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Pista S-0{c.id}</span>
                        <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_#2FA86E]"></div>
                    </div>
                    <h4 className="text-2xl font-bold text-text mb-1 group-hover:text-primary transition-colors">{c.nombre}</h4>
                    <p className="text-xs font-bold text-textMuted uppercase tracking-widest">{c.superficie}</p>
                </div>
            ))}
        </div>
    );
};

export default ListaCanchas;