import { useEffect, useState, useCallback } from 'react';
import { getCanchas, toggleCancha } from '../../services/canchaService'; 
import { mostrarAlerta } from '../../utils/alertas'; 

// DICCIONARIO DE IMÁGENES
// DEUDA TÉCNICA: Reemplazar estas URLs por assets locales (ej: '/img/cemento.jpg')
// guardados en tu carpeta 'public' para no depender de servidores externos.
const getImagenSuperficie = (superficie) => {
    const sup = superficie?.toLowerCase() || '';
    
    // Textura Polvo de Ladrillo (Arcilla roja con línea)
    if (sup.includes('polvo') || sup.includes('ladrillo')) {
        return '/img/polvo.webp'; 
    }
    // Textura Césped (Pasto sintético/natural verde)
    if (sup.includes('césped') || sup.includes('cesped')) {
        return '/img/cesped.webp'; 
    }
    // Textura Cemento / Rápida (Superficie azul lisa con línea)
    if (sup.includes('cemento') || sup.includes('rápida')) {
        return '/img/cemento.webp'; 
    }
    
    // Fallback genérico (Textura de polvo de ladrillo oscuro)
    return 'https://images.unsplash.com/photo-1542144612-1b3641ec3459?q=80&w=800&auto=format&fit=crop'; 
};

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

    const handleToggle = async (cancha) => {
        const estadoAnterior = canchas;
        const nuevoEstado = !cancha.disponible;

        setCanchas(prev => prev.map(c => c.id === cancha.id ? { ...c, disponible: nuevoEstado } : c));

        try {
            await toggleCancha(cancha.id);
        } catch (error) {
            console.error("Error al cambiar estado:", error);
            setCanchas(estadoAnterior);
            mostrarAlerta("Error", "No se pudo cambiar el estado de la cancha.", "error");
        }
    };

    if (loading && canchas.length === 0) return <div className="text-textMuted animate-pulse font-bold p-12 text-center tracking-widest uppercase">Obteniendo estado de las pistas...</div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {canchas.map(c => {
                const isActiva = c.disponible !== false; 

                return (
                    <div 
                        key={c.id} 
                        className={`
                            flex flex-col rounded-2xl transition-all duration-300 group relative overflow-hidden border
                            ${isActiva 
                                ? 'bg-surface border-border hover:border-primary hover:-translate-y-1 hover:shadow-xl' 
                                : 'bg-background border-dashed border-textMuted/30 opacity-80 grayscale-[40%]'
                            }
                        `}
                    >
                        {/* --- MITAD SUPERIOR: IMAGEN Y CONTROLES --- */}
                        <div className="relative h-48 w-full overflow-hidden bg-gray-900 border-b border-border">
                            {/* Imagen de fondo con efecto zoom */}
                            <img 
                                src={getImagenSuperficie(c.superficie)} 
                                alt={c.nombre}
                                className={`w-full h-full object-cover transition-transform duration-700 ease-out ${isActiva ? 'group-hover:scale-110' : ''}`}
                            />
                            
                            {/* Gradiente oscuro para que el texto e iconos sean legibles */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/40"></div>

                            {/* Switch de Activación (Flotando arriba a la derecha) */}
                            <div className="absolute top-4 right-4 z-10">
                                <button
                                    onClick={() => handleToggle(c)}
                                    className={`
                                        relative w-12 h-6 rounded-full transition-colors duration-300 ease-in-out focus:outline-none shadow-lg border border-white/20
                                        ${isActiva ? 'bg-primary' : 'bg-red-500/80'}
                                    `}
                                    title={isActiva ? "Poner en mantenimiento" : "Habilitar Cancha"}
                                >
                                    <span
                                        className={`
                                            absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 transform shadow-sm
                                            ${isActiva ? 'translate-x-6' : 'translate-x-0'}
                                        `}
                                    />
                                </button>
                            </div>

                            {/* Badge de Superficie (Flotando abajo a la izquierda sobre la foto) */}
                            <div className="absolute bottom-3 left-4">
                                <span className="text-[9px] font-black text-white uppercase tracking-widest bg-black/50 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-white/10 shadow-sm">
                                    {c.superficie}
                                </span>
                            </div>
                        </div>

                        {/* --- MITAD INFERIOR: INFORMACIÓN --- */}
                        <div className="p-5 flex flex-col justify-between flex-1 relative z-10 bg-surface">
                            <div>
                                <span className="text-[10px] font-black text-textMuted uppercase tracking-[0.2em] block mb-1">
                                    Pista S-0{c.id}
                                </span>
                                <h4 className={`text-xl font-black mb-4 transition-colors ${isActiva ? 'text-text group-hover:text-primary' : 'text-textMuted line-through decoration-red-500 decoration-2'}`}>
                                    {c.nombre}
                                </h4>
                            </div>
                            
                            {/* Footer del estado */}
                            <div className="pt-4 border-t border-border flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${isActiva ? 'bg-primary animate-pulse shadow-[0_0_8px_rgba(47,168,110,0.8)]' : 'bg-red-500'}`}></div>
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${isActiva ? 'text-primary' : 'text-red-500'}`}>
                                        {isActiva ? 'Disponible' : 'Mantenimiento'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* --- CAPA DE BLOQUEO (Si está inactiva) --- */}
                        {!isActiva && (
                            <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none bg-black/30 backdrop-blur-[2px]">
                                <span className="text-3xl font-black uppercase border-4 border-red-500 text-red-500 bg-black/80 px-6 py-2 rounded-2xl -rotate-12 shadow-[0_10px_30px_rgba(239,68,68,0.4)] backdrop-blur-sm tracking-widest">
                                    Cerrado
                                </span>
                            </div>
                        )}
                    </div>
                );
            })}
            
            {canchas.length === 0 && !loading && (
                <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-surface/30 border border-dashed border-border rounded-2xl p-12 text-center">
                    <p className="text-textMuted font-bold uppercase tracking-widest opacity-50">No hay canchas registradas en el sistema.</p>
                </div>
            )}
        </div>
    );
};

export default ListaCanchas;