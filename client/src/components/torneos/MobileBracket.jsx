import { useState } from 'react';

const MobileBracket = ({ fases, onPartidoClick }) => {
    // Por defecto, la primera fase está expandida
    const [faseExpandida, setFaseExpandida] = useState(fases.length > 0 ? fases[0].clave : null);

    const toggleFase = (clave) => {
        setFaseExpandida(prev => prev === clave ? null : clave);
    };

    return (
        <div className="space-y-3">
            {fases.map((faseObj) => {
                const isOpen = faseExpandida === faseObj.clave;

                return (
                    <div key={faseObj.clave} className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm transition-all">
                        {/* Cabecera del Acordeón */}
                        <button
                            onClick={() => toggleFase(faseObj.clave)}
                            className="w-full bg-background flex justify-between items-center p-4 hover:bg-secondary/10 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded bg-secondary/20 flex items-center justify-center text-secondary font-black text-sm uppercase">
                                    {faseObj.nombre.charAt(0)}
                                </div>
                                <h3 className="text-text font-bold text-lg tracking-wide uppercase">{faseObj.nombre}</h3>
                            </div>
                            <span className="text-textMuted font-bold text-xs bg-surface px-3 py-1 rounded-full border border-border">
                                {faseObj.partidos.length} Partidos
                            </span>
                        </button>

                        {/* Contenido Expandible */}
                        {isOpen && (
                            <div className="p-4 bg-surface border-t border-border space-y-4 animate-in slide-in-from-top-2 duration-300">
                                {[...faseObj.partidos].sort((a, b) => a.ordenLlave - b.ordenLlave).map((partido, index) => {
                                    const hasEquipo1 = !!partido?.equipo1;
                                    const played = partido?.estadoResultado === 'CONFIRMADO' && partido?.resultado !== 'BYE';
                                    const isBye = partido?.resultado === 'BYE';
                                    const clickable = hasEquipo1 && !!partido?.equipo2 && !played && !isBye;

                                    return (
                                        <div
                                            key={partido.id || index}
                                            onClick={() => clickable && onPartidoClick(partido)}
                                            className={`relative border rounded-lg p-4 shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)] ${clickable ? 'cursor-pointer active:scale-[0.98] hover:border-secondary transition-all bg-background' : 'border-border bg-background'}`}
                                        >

                                            {/* Partido Info (Status / Resultado) */}
                                            <div className="flex justify-between items-center mb-3 border-b border-border pb-2">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-textMuted">Partido #{index + 1}</span>
                                                {partido.estadoResultado === "CONFIRMADO" && partido.huboWalkover ? (
                                                    <span className="text-xs font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded">WALKOVER</span>
                                                ) : partido.resultado ? (
                                                    <span className="text-sm font-bold text-primary tracking-widest">{partido.resultado}</span>
                                                ) : (
                                                    <span className="text-[10px] font-bold text-textMuted bg-border px-2 py-0.5 rounded">A Jugar</span>
                                                )}
                                            </div>

                                            {/* Equipo 1 */}
                                            <div className={`flex items-center justify-between p-2 rounded-md transition-colors ${partido.ganador && partido.ganador.id === partido.equipo1?.id ? 'bg-secondary/10 text-secondary' : 'text-text'}`}>
                                                <span className={`font-medium ${partido.ganador && partido.ganador.id === partido.equipo1?.id ? 'font-black' : ''}`}>
                                                    {partido.equipo1 ? partido.equipo1.nombreEquipo : 'POR DEFINIR'}
                                                </span>
                                                {partido.ganador && partido.ganador.id === partido.equipo1?.id && (
                                                    <span className="text-xs bg-secondary text-background px-1.5 py-0.5 rounded uppercase font-black">WIN</span>
                                                )}
                                            </div>

                                            {/* Separador vs */}
                                            <div className="flex items-center justify-center my-1 relative">
                                                <div className="h-px bg-border w-full absolute top-1/2 left-0 z-0"></div>
                                                <span className="bg-background text-textMuted text-[10px] uppercase font-black px-2 z-10 relative">VS</span>
                                            </div>

                                            {/* Equipo 2 (Bye Logic) */}
                                            <div className={`flex items-center justify-between p-2 rounded-md transition-colors ${partido.ganador && partido.equipo2 && partido.ganador.id === partido.equipo2.id ? 'bg-secondary/10 text-secondary' : 'text-text'}`}>
                                                {!partido.equipo2 ? (
                                                    <span className="text-textMuted italic text-sm align-middle flex gap-2 items-center">
                                                        <span className="w-2 h-2 rounded-full bg-border"></span>
                                                        Clasificación Directa (BYE)
                                                    </span>
                                                ) : (
                                                    <>
                                                        <span className={`font-medium ${partido.ganador && partido.ganador.id === partido.equipo2.id ? 'font-black' : ''}`}>
                                                            {partido.equipo2.nombreEquipo}
                                                        </span>
                                                        {partido.ganador && partido.ganador.id === partido.equipo2.id && (
                                                            <span className="text-xs bg-secondary text-background px-1.5 py-0.5 rounded uppercase font-black">WIN</span>
                                                        )}
                                                    </>
                                                )}
                                            </div>

                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default MobileBracket;
