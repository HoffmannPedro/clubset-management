import { useState } from 'react';
import { crearTorneo } from '../../services/torneoService';

const TorneoForm = ({ onClose, onCreado }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        fechaInicio: '',
        fechaFin: '',
        formato: 'ELIMINACION_DIRECTA',
        modalidad: 'SINGLES',
        categoriaEsperada: 'LIBRE',
        costoInscripcion: 0,
        premiosAdicionales: '',
        puntosCampeon: 1000,
        puntosFinalista: 600,
        puntosSemi: 360
    });

    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name.includes('costo') || name.includes('puntos') ? Number(value) : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setCargando(true);

        try {
            // Adaptar el DTO para el backend: Si es "LIBRE", enviamos null
            const payload = {
                ...formData,
                categoriaEsperada: formData.categoriaEsperada === 'LIBRE' ? null : formData.categoriaEsperada
            };

            await crearTorneo(payload);
            onCreado();
            onClose();
        } catch (err) {
            console.error("Error al crear Torneo:", err);
            setError(err.response?.data?.message || "Ocurrió un error al guardar el campeonato.");
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-surface border border-border w-full max-w-2xl rounded-2xl shadow-2xl max-h-[90dvh] overflow-y-auto custom-scrollbar animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-6 border-b border-border bg-background">
                    <h2 className="text-xl font-black uppercase tracking-widest text-text">Lanzar Nuevo Torneo</h2>
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Básicos */}
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-textMuted">Nombre Comercial</label>
                            <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required className="w-full bg-background border border-border text-text rounded-lg p-3 focus:outline-none focus:border-secondary transition-colors" placeholder="Ej: Abierto de Primavera 2026" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-textMuted">Inicio</label>
                            <input type="date" name="fechaInicio" value={formData.fechaInicio} onChange={handleChange} required className="w-full bg-background border border-border text-text rounded-lg p-3 focus:outline-none focus:border-secondary" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-textMuted">Finalización (Estimada)</label>
                            <input type="date" name="fechaFin" value={formData.fechaFin} onChange={handleChange} required className="w-full bg-background border border-border text-text rounded-lg p-3 focus:outline-none focus:border-secondary" />
                        </div>

                        {/* Motor Deportivo */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-textMuted">Modalidad</label>
                            <select name="modalidad" value={formData.modalidad} onChange={handleChange} className="w-full bg-background border border-border text-text rounded-lg p-3 focus:outline-none focus:border-secondary">
                                <option value="SINGLES">Singles (1 vs 1)</option>
                                <option value="DOBLES">Dobles (2 vs 2)</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-textMuted">Formato de Llaves</label>
                            <select name="formato" value={formData.formato} onChange={handleChange} className="w-full bg-background border border-border text-text rounded-lg p-3 focus:outline-none focus:border-secondary">
                                <option value="ELIMINACION_DIRECTA">Eliminación Directa (Playoffs)</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-textMuted">Nivel Restrictivo</label>
                            <select name="categoriaEsperada" value={formData.categoriaEsperada} onChange={handleChange} className="w-full bg-background border border-border text-text rounded-lg p-3 focus:outline-none focus:border-secondary">
                                <option value="LIBRE">Libre (Cualquier Nivel)</option>
                                <option value="PRIMERA">Primera</option>
                                <option value="SEGUNDA">Segunda</option>
                                <option value="TERCERA">Tercera</option>
                                <option value="CUARTA">Cuarta</option>
                                <option value="QUINTA">Quinta</option>
                                <option value="SEXTA">Sexta</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-textMuted">Valor Inscripción ($)</label>
                            <input type="number" name="costoInscripcion" value={formData.costoInscripcion} onChange={handleChange} min="0" step="100" className="w-full bg-background border border-border text-text rounded-lg p-3 focus:outline-none focus:border-secondary" />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-border">
                        <button type="button" onClick={onClose} className="px-6 py-3 rounded-lg font-bold text-textMuted hover:bg-surface transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" disabled={cargando} className="px-6 py-3 rounded-lg font-bold bg-secondary hover:bg-secondary/90 text-background transition-shadow shadow-[0_0_15px_rgba(183,99,57,0.2)] disabled:opacity-50">
                            {cargando ? 'Generando Contrato...' : 'Crear Pizarra'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TorneoForm;
