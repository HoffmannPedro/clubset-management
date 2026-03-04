import { useState, useEffect } from 'react';

const ColdStartLoader = ({ isLoading }) => {
    const [isColdStart, setIsColdStart] = useState(false);

    useEffect(() => {
        let timer;
        if (isLoading) {
            // Si después de 6 segundos sigue cargando, activamos el mensaje de "Despertando"
            timer = setTimeout(() => {
                setIsColdStart(true);
            }, 6000);
        } else {
            // Si termina de cargar rápido, reseteamos
            setIsColdStart(false);
        }

        return () => clearTimeout(timer);
    }, [isLoading]);

    if (!isLoading) return null;

    return (
        <div className="flex flex-col items-center justify-center p-6 space-y-4 animate-in fade-in duration-500">
            {/* Animación del spinner */}
            <div className="relative w-16 h-16">
                <div className="absolute inset-0 border-4 border-surface rounded-full"></div>
                <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center text-xl">
                    {isColdStart ? '☕' : '🎾'}
                </div>
            </div>

            {/* Mensaje Dinámico */}
            <div className="text-center max-w-sm">
                <h3 className="text-lg font-black italic text-white mb-2 transition-all duration-300">
                    {isColdStart ? 'Despertando el Servidor...' : 'Conectando...'}
                </h3>
                
                {isColdStart && (
                    <div className="animate-in slide-in-from-bottom-2 fade-in duration-700">
                        <p className="text-xs text-textMuted font-medium leading-relaxed">
                            Como este es un entorno de demostración, la base de datos entra en hibernación por inactividad. 
                        </p>
                        <p className="text-[10px] text-primary font-bold uppercase tracking-widest mt-3 bg-primary/10 py-2 px-3 rounded-lg border border-primary/20">
                            El arranque puede demorar hasta 2 minutos. ¡Gracias por esperar!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ColdStartLoader;