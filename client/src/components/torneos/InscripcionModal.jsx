import { useState, useEffect } from 'react';
import { inscribirEquipo } from '../../services/torneoService';
import api from '../../services/api'; // Necesitamos recuperar usuarios

const InscripcionModal = ({ torneo, onClose, onInscrito }) => {
    const isDobles = torneo.modalidad === 'DOBLES';

    const [usuarios, setUsuarios] = useState([]);
    const [cargandoUsuarios, setCargandoUsuarios] = useState(true);
    
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        usuario1Id: '',
        usuario2Id: '',
        nombreEquipo: ''
    });

    useEffect(() => {
        const fetchUsuarios = async () => {
            try {
                // Fetch todos los usuarios para armar el combo
                const resp = await api.get('/usuarios');
                setUsuarios(resp.data);
            } catch (err) {
                console.error("Error al cargar usuarios:", err);
                setError("No se pudieron cargar los usuarios del club.");
            } finally {
                setCargandoUsuarios(false);
            }
        };
        fetchUsuarios();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setCargando(true);

        // Validaciones Frontend
        if (!formData.usuario1Id) {
            setError("Debes seleccionar al menos un jugador principal.");
            setCargando(false);
            return;
        }

        if (isDobles && !formData.usuario2Id) {
            setError("La modalidad Dobles exige seleccionar al compañero.");
            setCargando(false);
            return;
        }

        if (isDobles && formData.usuario1Id === formData.usuario2Id) {
            setError("No puedes elegir a la misma persona dos veces.");
            setCargando(false);
            return;
        }

        try {
            const payload = {
                usuario1Id: Number(formData.usuario1Id),
                usuario2Id: isDobles ? Number(formData.usuario2Id) : null,
                nombreEquipo: formData.nombreEquipo
            };
            
            await inscribirEquipo(torneo.id, payload);
            onInscrito();
            onClose();
        } catch (err) {
            console.error("Error en inscripción:", err);
            setError(err.response?.data?.message || err.message);
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-surface border border-border w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-6 border-b border-border bg-background">
                    <h2 className="text-xl font-black uppercase tracking-widest text-text">Inscripción Administrativa</h2>
                    <button onClick={onClose} className="p-2 bg-surface hover:bg-red-500/20 text-textMuted hover:text-red-400 rounded-lg transition-colors">
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-500 rounded-lg text-sm font-bold">
                            ⚠️ {error}
                        </div>
                    )}

                    {!cargandoUsuarios && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-textMuted">
                                    Jugador 1 {isDobles ? "(Capitán)" : ""}
                                </label>
                                <select 
                                    name="usuario1Id" 
                                    value={formData.usuario1Id} 
                                    onChange={handleChange} 
                                    required 
                                    className="w-full bg-background border border-border text-text rounded-lg p-3 focus:outline-none focus:border-secondary"
                                >
                                    <option value="">-- Seleccionar Socio --</option>
                                    {usuarios.map(u => (
                                        <option key={u.id} value={u.id}>{u.nombre} {u.apellido}</option>
                                    ))}
                                </select>
                            </div>

                            {isDobles && (
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-textMuted">Jugador 2 (Compañero)</label>
                                    <select 
                                        name="usuario2Id" 
                                        value={formData.usuario2Id} 
                                        onChange={handleChange} 
                                        required 
                                        className="w-full bg-background border border-border text-text rounded-lg p-3 focus:outline-none focus:border-secondary"
                                    >
                                        <option value="">-- Seleccionar Socio --</option>
                                        {usuarios.map(u => (
                                            <option key={u.id} value={u.id}>{u.nombre} {u.apellido}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {isDobles && (
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-textMuted">Nombre del Equipo (Opcional)</label>
                                    <input 
                                        type="text" 
                                        name="nombreEquipo" 
                                        value={formData.nombreEquipo} 
                                        onChange={handleChange} 
                                        className="w-full bg-background border border-border text-text rounded-lg p-3 focus:outline-none focus:border-secondary" 
                                        placeholder="Ej: Los Imbatibles" 
                                    />
                                    <p className="text-[10px] text-textMuted">Si se deja vacío, se autogenerará con los apellidos.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {cargandoUsuarios && (
                        <div className="p-10 text-center animate-pulse text-textMuted font-bold">
                            Cargando padrón de socios...
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4 border-t border-border">
                        <button type="button" onClick={onClose} className="px-6 py-3 rounded-lg font-bold text-textMuted hover:bg-surface transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" disabled={cargando || cargandoUsuarios} className="px-6 py-3 rounded-lg font-bold bg-secondary hover:bg-secondary/90 text-background transition-shadow shadow-[0_0_15px_rgba(47,168,110,0.5)] disabled:opacity-50">
                            {cargando ? 'Inscribiendo...' : 'Confirmar Enrolamiento'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InscripcionModal;
