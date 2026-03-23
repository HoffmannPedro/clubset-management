import { useState, useEffect } from 'react';
import { inscribirEquipo } from '../../services/torneoService';
import api from '../../services/api';

const InscripcionModal = ({ torneo, equipos = [], onClose, onInscrito }) => {
    const isDobles = torneo.modalidad === 'DOBLES';

    const [usuarios, setUsuarios] = useState([]);
    const [cargandoUsuarios, setCargandoUsuarios] = useState(true);
    
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState(null);

    // SINGLES State (Multi-select)
    const [selectedUsers, setSelectedUsers] = useState(new Set());

    // DOBLES State (Dynamic rows builder)
    const [parejas, setParejas] = useState([{ usuario1Id: '', usuario2Id: '', nombreEquipo: '' }]);

    useEffect(() => {
        const fetchUsuarios = async () => {
            try {
                const resp = await api.get('/usuarios');
                let filtrados = resp.data;

                // 1. Filtrar por categoría (si aplica)
                if (torneo.categoriaEsperada && torneo.categoriaEsperada !== 'LIBRE') {
                    filtrados = filtrados.filter(u => u.categoria === torneo.categoriaEsperada);
                }

                // 2. Excluir usuarios ya inscriptos en este torneo
                const inscriptosIds = new Set();
                equipos.forEach(eq => {
                    if (eq.usuario1?.id) inscriptosIds.add(eq.usuario1.id);
                    if (eq.usuario2?.id) inscriptosIds.add(eq.usuario2.id);
                });

                filtrados = filtrados.filter(u => !inscriptosIds.has(u.id));

                setUsuarios(filtrados);
            } catch (err) {
                console.error("Error al cargar usuarios:", err);
                setError("No se pudieron cargar los usuarios del club.");
            } finally {
                setCargandoUsuarios(false);
            }
        };
        fetchUsuarios();
    }, [torneo.categoriaEsperada, equipos]);

    const toggleUser = (id) => {
        const newSet = new Set(selectedUsers);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedUsers(newSet);
    };

    const updatePareja = (index, field, value) => {
        const newParejas = [...parejas];
        newParejas[index][field] = value;
        setParejas(newParejas);
    };

    const addParejaRow = () => {
        setParejas([...parejas, { usuario1Id: '', usuario2Id: '', nombreEquipo: '' }]);
    };

    const removeParejaRow = (index) => {
        if (parejas.length > 1) {
            setParejas(parejas.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setCargando(true);

        try {
            if (!isDobles) {
                if (selectedUsers.size === 0) throw new Error("Debes seleccionar al menos un jugador para inscribir.");
                
                // Enroll multiple singles players concurrently
                const promises = Array.from(selectedUsers).map(id => 
                    inscribirEquipo(torneo.id, { usuario1Id: Number(id), usuario2Id: null, nombreEquipo: '' })
                );
                await Promise.all(promises);

            } else {
                // DOBLES validation and bulk enroll
                const promesas = parejas.map((p, idx) => {
                    if (!p.usuario1Id || !p.usuario2Id) {
                        throw new Error(`Faltan jugadores en la pareja #${idx + 1}.`);
                    }
                    if (p.usuario1Id === p.usuario2Id) {
                        throw new Error(`La pareja #${idx + 1} tiene al mismo jugador duplicado.`);
                    }
                    
                    // Validate that the same user is not selected in two different pairs in this form
                    return inscribirEquipo(torneo.id, {
                        usuario1Id: Number(p.usuario1Id),
                        usuario2Id: Number(p.usuario2Id),
                        nombreEquipo: p.nombreEquipo || ''
                    });
                });

                await Promise.all(promesas);
            }

            onInscrito();
            onClose();
        } catch (err) {
            console.error("Error en inscripción en lote:", err);
            setError(err.response?.data?.message || err.message);
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-surface border border-border w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-6 border-b border-border bg-background shrink-0">
                    <div>
                        <h2 className="text-xl font-black uppercase tracking-widest text-text">Inscripción Masiva</h2>
                        <p className="text-xs font-bold text-textMuted mt-1">
                            {torneo.modalidad} | {torneo.categoriaEsperada}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-surface hover:bg-red-500/20 text-textMuted hover:text-red-400 rounded-lg transition-colors">
                        ✕
                    </button>
                </div>

                <div className="overflow-y-auto flex-1 p-6 custom-scrollbar">
                    {error && (
                        <div className="p-4 mb-6 bg-red-500/10 border border-red-500/30 text-red-500 rounded-lg text-sm font-bold flex items-center gap-2">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    {cargandoUsuarios ? (
                        <div className="p-10 text-center animate-pulse text-textMuted font-bold">
                            Cargando padrón filtrado de socios...
                        </div>
                    ) : usuarios.length === 0 ? (
                        <div className="text-center p-8 border border-border border-dashed rounded-lg bg-background">
                            No quedan socios elegibles para inscribir en esta categoría.
                        </div>
                    ) : (
                        <form id="enrollForm" onSubmit={handleSubmit} className="space-y-6">
                            
                            {/* VISTA SINGLES (Checkboxes) */}
                            {!isDobles && (
                                <div className="space-y-3">
                                    <p className="text-xs font-bold uppercase tracking-wider text-textMuted border-b border-border pb-2">
                                        Seleccioná los jugadores a inscribir ({selectedUsers.size} seleccionados)
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                                        {usuarios.map(u => (
                                            <label 
                                                key={u.id} 
                                                className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-colors ${selectedUsers.has(u.id) ? 'bg-secondary/10 border-secondary' : 'bg-background border-border hover:bg-surface'}`}
                                            >
                                                <input 
                                                    type="checkbox"
                                                    checked={selectedUsers.has(u.id)}
                                                    onChange={() => toggleUser(u.id)}
                                                    className="w-5 h-5 accent-secondary"
                                                />
                                                <div className="flex flex-col">
                                                    <span className={`font-bold text-sm ${selectedUsers.has(u.id) ? 'text-secondary' : 'text-text'}`}>
                                                        {u.nombre} {u.apellido}
                                                    </span>
                                                    <span className="text-[10px] uppercase text-textMuted">Raking Pts: 0</span>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* VISTA DOBLES (Filas Dinámicas) */}
                            {isDobles && (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center border-b border-border pb-2">
                                        <p className="text-xs font-bold uppercase tracking-wider text-textMuted">
                                            Constructor de Parejas
                                        </p>
                                        <button 
                                            type="button" 
                                            onClick={addParejaRow}
                                            className="text-xs font-black uppercase tracking-widest text-secondary hover:text-white transition-colors"
                                        >
                                            + Otra Pareja
                                        </button>
                                    </div>

                                    <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                                        {parejas.map((pareja, idx) => (
                                            <div key={idx} className="p-4 bg-background border border-border rounded-xl relative">
                                                {parejas.length > 1 && (
                                                    <button 
                                                        type="button"
                                                        onClick={() => removeParejaRow(idx)}
                                                        className="absolute -top-3 -right-3 w-7 h-7 bg-surface border border-border hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-400 flex items-center justify-center rounded-full text-textMuted text-xs font-black shadow-md transition-all"
                                                        aria-label="Remove row"
                                                    >
                                                        ✕
                                                    </button>
                                                )}
                                                
                                                <div className="mb-2">
                                                    <h4 className="text-[10px] font-black uppercase text-secondary tracking-widest">Pareja #{idx + 1}</h4>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <select 
                                                        value={pareja.usuario1Id}
                                                        onChange={(e) => updatePareja(idx, 'usuario1Id', e.target.value)}
                                                        className="bg-surface border border-border text-sm text-text rounded-lg p-2 focus:border-secondary focus:outline-none"
                                                    >
                                                        <option value="">-- Jugador 1 --</option>
                                                        {usuarios.map(u => <option key={u.id} value={u.id}>{u.nombre} {u.apellido}</option>)}
                                                    </select>
                                                    <select 
                                                        value={pareja.usuario2Id}
                                                        onChange={(e) => updatePareja(idx, 'usuario2Id', e.target.value)}
                                                        className="bg-surface border border-border text-sm text-text rounded-lg p-2 focus:border-secondary focus:outline-none"
                                                    >
                                                        <option value="">-- Jugador 2 --</option>
                                                        {usuarios.map(u => <option key={u.id} value={u.id}>{u.nombre} {u.apellido}</option>)}
                                                    </select>
                                                    <input 
                                                        type="text"
                                                        value={pareja.nombreEquipo}
                                                        onChange={(e) => updatePareja(idx, 'nombreEquipo', e.target.value)}
                                                        placeholder="Nombre del Equipo (Opcional)"
                                                        className="col-span-1 sm:col-span-2 bg-surface border border-border text-sm text-text rounded-lg p-2 focus:border-secondary focus:outline-none placeholder:text-textMuted/40"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </form>
                    )}
                </div>

                <div className="shrink-0 flex justify-end gap-3 p-6 border-t border-border bg-background">
                    <button type="button" onClick={onClose} className="px-6 py-3 rounded-lg font-bold text-textMuted hover:bg-surface transition-colors">
                        Cancelar
                    </button>
                    <button 
                        form="enrollForm"
                        type="submit" 
                        disabled={cargando || cargandoUsuarios || usuarios.length === 0} 
                        className="px-6 py-3 rounded-lg font-black tracking-wider uppercase bg-secondary hover:bg-secondary/90 text-background transition-shadow shadow-[0_0_15px_rgba(47,168,110,0.5)] disabled:opacity-50 disabled:shadow-none"
                    >
                        {cargando ? 'PROCESANDO...' : 'CONFIRMAR LOTE'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InscripcionModal;
