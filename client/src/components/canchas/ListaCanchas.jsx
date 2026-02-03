import { useEffect, useState, useCallback } from 'react';
import { getCanchas, toggleCancha } from '../../services/canchaService'; // Importamos toggle
import { mostrarAlerta } from '../../utils/alertas'; // Asumo que tienes esto disponible

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
        // 1. Guardamos el estado anterior por si falla
        const estadoAnterior = canchas;
        
        // 2. Calculamos el nuevo estado
        const nuevoEstado = !cancha.disponible;

        // 3. Actualizamos la UI inmediatamente (Optimismo)
        setCanchas(prev => prev.map(c => c.id === cancha.id ? { ...c, disponible: nuevoEstado } : c));

        try {
            // 4. Llamada al Backend
            await toggleCancha(cancha.id);
        } catch (error) {
            // 5. Si falla, revertimos y avisamos
            console.error("Error al cambiar estado:", error);
            setCanchas(estadoAnterior);
            mostrarAlerta("Error", "No se pudo cambiar el estado de la cancha.", "error");
        }
    };

    if (loading && canchas.length === 0) return <div className="text-primary animate-pulse font-bold p-10 text-center">ACCEDIENDO A LOS SERVIDORES...</div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {canchas.map(c => {
                // Estado de la cancha (por defecto true si viene null)
                const isActiva = c.disponible !== false; 

                return (
                    <div 
                        key={c.id} 
                        className={`
                            border p-8 rounded-2xl transition-all group relative overflow-hidden flex flex-col justify-between
                            ${isActiva 
                                ? 'bg-surface border-border hover:border-primary hover:-translate-y-1 hover:shadow-lg' 
                                : 'bg-background border-dashed border-textMuted/40 opacity-80'
                            }
                        `}
                    >
                        {/* HEADER DE LA TARJETA */}
                        <div className="flex justify-between items-start mb-6">
                            <span className="text-[10px] font-black text-textMuted uppercase tracking-[0.2em]">Pista S-0{c.id}</span>
                            
                            {/* SWITCH DE ACTIVACIÓN */}
                            <button
                                onClick={() => handleToggle(c)}
                                className={`
                                    relative w-11 h-6 rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary z-10
                                    ${isActiva ? 'bg-primary' : 'bg-textMuted'}
                                `}
                                title={isActiva ? "Desactivar Cancha" : "Activar Cancha"}
                            >
                                <span
                                    className={`
                                        absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 transform shadow-sm
                                        ${isActiva ? 'translate-x-5' : 'translate-x-0'}
                                    `}
                                />
                            </button>
                        </div>

                        <div>
                            <h4 className={`text-2xl font-bold mb-1 transition-colors ${isActiva ? 'text-text group-hover:text-primary' : 'text-textMuted line-through decoration-red-500 decoration-2'}`}>
                                {c.nombre}
                            </h4>
                            <p className="text-xs font-bold text-textMuted uppercase tracking-widest">{c.superficie}</p>
                        </div>
                        
                        {/* FOOTER CON ESTADO TEXTUAL */}
                        <div className="mt-4 pt-4 border-t border-border flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${isActiva ? 'bg-primary animate-pulse' : 'bg-red-500'}`}></div>
                            <span className={`text-[10px] font-black uppercase ${isActiva ? 'text-primary' : 'text-red-500'}`}>
                                {isActiva ? 'Disponible' : 'Mantenimiento'}
                            </span>
                        </div>

                        {/* Decoración Visual de Fondo si está cerrada */}
                        {!isActiva && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 -rotate-12">
                                <span className="text-5xl font-black uppercase border-4 border-textMuted text-textMuted p-4 rounded-xl">Cerrado</span>
                            </div>
                        )}
                    </div>
                );
            })}
            
            {canchas.length === 0 && !loading && (
                <p className="col-span-3 text-center text-textMuted italic py-10 opacity-50">No hay canchas registradas en el sistema.</p>
            )}
        </div>
    );
};

export default ListaCanchas;