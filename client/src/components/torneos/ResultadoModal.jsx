import { useState } from 'react';
import { cargarResultado } from '../../services/torneoService';

const ResultadoModal = ({ partido, torneoId, onClose, onResultadoCargado }) => {
    const [ganadorId, setGanadorId] = useState('');
    const [scoresEq1, setScoresEq1] = useState(['', '', '']);
    const [scoresEq2, setScoresEq2] = useState(['', '', '']);
    const [walkover, setWalkover] = useState(false);
    const [enviando, setEnviando] = useState(false);
    const [error, setError] = useState(null);
    const [focusedRow, setFocusedRow] = useState(null);

    const eq1 = partido?.equipo1;
    const eq2 = partido?.equipo2;

    const handleScoreChange = (equipo, index, value) => {
        const val = value.replace(/[^0-9]/g, '').slice(0, 2);
        if (equipo === 1) {
            const newScores = [...scoresEq1];
            newScores[index] = val;
            setScoresEq1(newScores);
        } else {
            const newScores = [...scoresEq2];
            newScores[index] = val;
            setScoresEq2(newScores);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!ganadorId) {
            setError('Seleccioná un ganador.');
            return;
        }

        const sets = [];
        let setsWonEq1 = 0;
        let setsWonEq2 = 0;

        for (let i = 0; i < 3; i++) {
            const s1 = scoresEq1[i];
            const s2 = scoresEq2[i];
            
            if (s1 !== '' && s2 !== '') {
                sets.push(`${s1}-${s2}`);
                const n1 = parseInt(s1, 10);
                const n2 = parseInt(s2, 10);
                if (n1 > n2) setsWonEq1++;
                else if (n2 > n1) setsWonEq2++;
            } else if ((s1 !== '' && s2 === '') || (s1 === '' && s2 !== '')) {
                setError(`El Set ${i + 1} está incompleto.`);
                return;
            }
        }

        const resultado = walkover ? 'W.O.' : sets.join(' ');

        if (!walkover) {
            if (sets.length < 2) {
                setError('Ingresá al menos 2 sets completos.');
                return;
            }
            if (ganadorId === String(eq1?.id) && setsWonEq1 <= setsWonEq2) {
                setError('Las puntuaciones matemáticas no corresponden al Equipo 1 como ganador.');
                return;
            }
            if (ganadorId === String(eq2?.id) && setsWonEq2 <= setsWonEq1) {
                setError('Las puntuaciones matemáticas no corresponden al Equipo 2 como ganador.');
                return;
            }
        }

        try {
            setEnviando(true);
            await cargarResultado(torneoId, partido.id, {
                ganadorId: Number(ganadorId),
                resultado,
                walkover,
            });
            onResultadoCargado();
        } catch (err) {
            setError(err.message || 'Error al cargar resultado.');
        } finally {
            setEnviando(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-surface border border-border rounded-2xl shadow-2xl w-full max-w-lg animate-in fade-in zoom-in duration-300">
                <div className="p-6 border-b border-border">
                    <h2 className="text-xl font-black text-text uppercase tracking-wider">Cargar Resultado</h2>
                    <p className="text-sm text-textMuted mt-1">
                        {eq1?.nombreEquipo || '?'} vs {eq2?.nombreEquipo || '?'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Ganador */}
                    <div>
                        <label className="block text-sm font-bold text-textMuted mb-2">Seleccionar Ganador</label>
                        <div className="flex flex-col gap-2">
                            {eq1 && (
                                <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${ganadorId === String(eq1.id) ? 'border-secondary bg-secondary/10 text-secondary' : 'border-border text-text hover:bg-background'}`}>
                                    <input
                                        type="radio"
                                        name="ganador"
                                        value={eq1.id}
                                        checked={ganadorId === String(eq1.id)}
                                        onChange={(e) => setGanadorId(e.target.value)}
                                        className="accent-secondary h-4 w-4"
                                    />
                                    <span className="font-bold">{eq1.nombreEquipo}</span>
                                </label>
                            )}
                            {eq2 && (
                                <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${ganadorId === String(eq2.id) ? 'border-secondary bg-secondary/10 text-secondary' : 'border-border text-text hover:bg-background'}`}>
                                    <input
                                        type="radio"
                                        name="ganador"
                                        value={eq2.id}
                                        checked={ganadorId === String(eq2.id)}
                                        onChange={(e) => setGanadorId(e.target.value)}
                                        className="accent-secondary h-4 w-4"
                                    />
                                    <span className="font-bold">{eq2.nombreEquipo}</span>
                                </label>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center border-t border-border pt-4">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={walkover}
                                onChange={(e) => {
                                    setWalkover(e.target.checked);
                                    if (e.target.checked) setError(null);
                                }}
                                className="accent-secondary w-5 h-5"
                            />
                            <span className="text-sm text-text font-bold">Ganó por Walkover (W.O.)</span>
                        </label>
                    </div>

                    {/* Grilla de Scorings */}
                    {!walkover && (
                        <div className="bg-background rounded-xl border border-border overflow-hidden">
                            <div className="grid grid-cols-[1fr_80px_80px_80px] bg-surface border-b border-border">
                                <div className="p-3 text-xs font-black text-textMuted uppercase tracking-wider">Equipo</div>
                                <div className="p-3 text-xs font-black text-textMuted text-center uppercase">Set 1</div>
                                <div className="p-3 text-xs font-black text-textMuted text-center uppercase">Set 2</div>
                                <div className="p-3 text-xs font-black text-textMuted text-center uppercase">Set 3</div>
                            </div>
                            
                            {/* Fila Equipo 1 */}
                            <div 
                                className={`grid grid-cols-[1fr_80px_80px_80px] border-b border-border transition-colors duration-200 ${focusedRow === 'eq1' ? 'bg-secondary/5' : ''}`}
                            >
                                <div className="p-3 flex items-center font-bold text-sm text-text truncate">
                                    {eq1?.nombreEquipo || 'Equipo 1'}
                                </div>
                                {[0, 1, 2].map((i) => (
                                    <div key={`e1-s${i}`} className="p-2 border-l border-border/50 flex items-center justify-center">
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={2}
                                            value={scoresEq1[i]}
                                            onFocus={() => setFocusedRow('eq1')}
                                            onBlur={() => setFocusedRow(null)}
                                            onChange={(e) => handleScoreChange(1, i, e.target.value)}
                                            className={`w-12 h-10 text-center text-lg font-black bg-surface border rounded-md focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all ${focusedRow === 'eq1' ? 'border-secondary/50' : 'border-border text-textMuted'}`}
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Fila Equipo 2 */}
                            <div 
                                className={`grid grid-cols-[1fr_80px_80px_80px] transition-colors duration-200 ${focusedRow === 'eq2' ? 'bg-secondary/5' : ''}`}
                            >
                                <div className="p-3 flex items-center font-bold text-sm text-text truncate">
                                    {eq2?.nombreEquipo || 'Equipo 2'}
                                </div>
                                {[0, 1, 2].map((i) => (
                                    <div key={`e2-s${i}`} className="p-2 border-l border-border/50 flex items-center justify-center">
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={2}
                                            value={scoresEq2[i]}
                                            onFocus={() => setFocusedRow('eq2')}
                                            onBlur={() => setFocusedRow(null)}
                                            onChange={(e) => handleScoreChange(2, i, e.target.value)}
                                            className={`w-12 h-10 text-center text-lg font-black bg-surface border rounded-md focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all ${focusedRow === 'eq2' ? 'border-secondary/50' : 'border-border text-textMuted'}`}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 font-medium text-sm p-4 rounded-xl flex items-center gap-2">
                            <span className="text-xl">⚠️</span>
                            {error}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t border-border">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 bg-surface border border-border text-text font-bold rounded-xl hover:bg-background hover:text-textMuted transition-colors"
                        >
                            CANCELAR
                        </button>
                        <button
                            type="submit"
                            disabled={enviando}
                            className="flex-1 py-3 bg-secondary hover:bg-secondary/90 text-background font-black uppercase tracking-widest shadow-lg shadow-secondary/20 rounded-xl transition-all disabled:opacity-50"
                        >
                            {enviando ? 'GUARDANDO...' : 'CONFIRMAR'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResultadoModal;

