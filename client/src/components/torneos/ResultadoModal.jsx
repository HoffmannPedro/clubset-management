import { useState } from 'react';
import { cargarResultado } from '../../services/torneoService';

const ResultadoModal = ({ partido, torneoId, onClose, onResultadoCargado }) => {
    const [ganadorId, setGanadorId] = useState('');
    const [set1, setSet1] = useState('');
    const [set2, setSet2] = useState('');
    const [set3, setSet3] = useState('');
    const [walkover, setWalkover] = useState(false);
    const [enviando, setEnviando] = useState(false);
    const [error, setError] = useState(null);

    const eq1 = partido?.equipo1;
    const eq2 = partido?.equipo2;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!ganadorId) {
            setError('Seleccioná un ganador.');
            return;
        }

        // Armar string de resultado; ej: "6-3 6-2" o "6-3 4-6 7-5"
        const sets = [set1, set2, set3].filter(s => s.trim() !== '');
        const resultado = walkover ? 'W.O.' : sets.join(' ');

        if (!walkover && sets.length < 2) {
            setError('Ingresá al menos 2 sets (ej: 6-3).');
            return;
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
            <div className="bg-surface border border-border rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-300">
                <div className="p-6 border-b border-border">
                    <h2 className="text-xl font-black text-text uppercase tracking-wider">Cargar Resultado</h2>
                    <p className="text-sm text-textMuted mt-1">
                        {eq1?.nombreEquipo || '?'} vs {eq2?.nombreEquipo || '?'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Ganador */}
                    <div>
                        <label className="block text-sm font-bold text-textMuted mb-2">Ganador</label>
                        <div className="flex flex-col gap-2">
                            {eq1 && (
                                <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${ganadorId === String(eq1.id) ? 'border-secondary bg-secondary/10 text-secondary' : 'border-border text-text hover:bg-background'}`}>
                                    <input
                                        type="radio"
                                        name="ganador"
                                        value={eq1.id}
                                        checked={ganadorId === String(eq1.id)}
                                        onChange={(e) => setGanadorId(e.target.value)}
                                        className="accent-secondary"
                                    />
                                    <span className="font-bold text-sm">{eq1.nombreEquipo}</span>
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
                                        className="accent-secondary"
                                    />
                                    <span className="font-bold text-sm">{eq2.nombreEquipo}</span>
                                </label>
                            )}
                        </div>
                    </div>

                    {/* Walkover toggle */}
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={walkover}
                            onChange={(e) => setWalkover(e.target.checked)}
                            className="accent-secondary w-4 h-4"
                        />
                        <span className="text-sm text-textMuted font-medium">Walkover (W.O.)</span>
                    </label>

                    {/* Sets */}
                    {!walkover && (
                        <div>
                            <label className="block text-sm font-bold text-textMuted mb-2">Sets (ej: 6-3)</label>
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    placeholder="Set 1"
                                    value={set1}
                                    onChange={(e) => setSet1(e.target.value)}
                                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text text-sm placeholder:text-textMuted/50 focus:border-secondary focus:outline-none"
                                />
                                <input
                                    type="text"
                                    placeholder="Set 2"
                                    value={set2}
                                    onChange={(e) => setSet2(e.target.value)}
                                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text text-sm placeholder:text-textMuted/50 focus:border-secondary focus:outline-none"
                                />
                                <input
                                    type="text"
                                    placeholder="Set 3"
                                    value={set3}
                                    onChange={(e) => setSet3(e.target.value)}
                                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text text-sm placeholder:text-textMuted/50 focus:border-secondary focus:outline-none"
                                />
                            </div>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 border border-border text-textMuted font-bold rounded-lg hover:bg-background transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={enviando}
                            className="flex-1 py-2.5 bg-secondary hover:bg-secondary/90 text-background font-black uppercase tracking-wider rounded-lg transition-all disabled:opacity-50"
                        >
                            {enviando ? 'Cargando...' : 'Confirmar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResultadoModal;
