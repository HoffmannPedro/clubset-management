import { useState, useEffect } from 'react';
import { getTorneos, eliminarTorneo } from '../../services/torneoService';
import TorneoBracketContainer from './TorneoBracketContainer';
import TorneoForm from './TorneoForm';

const GestionTorneosView = () => {
    const [torneos, setTorneos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [torneoSeleccionado, setTorneoSeleccionado] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        cargarData();
    }, []);

    const cargarData = async () => {
        try {
            setCargando(true);
            const data = await getTorneos();
            setTorneos(data);
        } catch (err) {
            console.error("Error al cargar torneos:", err);
        } finally {
            setCargando(false);
        }
    };

    const handleEliminar = async (torneo) => {
        const confirmar = window.confirm(`¿Segús que querés CANCELAR el torneo "${torneo.nombre}"? Esta acción no se puede deshacer.`);
        if (!confirmar) return;
        try {
            await eliminarTorneo(torneo.id);
            await cargarData();
        } catch (err) {
            console.error("Error al eliminar torneo:", err);
            alert("No se pudo cancelar el torneo. Intentá de nuevo.");
        }
    };

    // Si hay un torneo seleccionado, mostramos solo su cuadro
    if (torneoSeleccionado) {
        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex items-center gap-4 border-b border-border pb-4">
                    <button
                        onClick={() => setTorneoSeleccionado(null)}
                        className="p-2 bg-surface hover:bg-secondary/10 border border-border rounded-lg text-textMuted transition-colors"
                    >
                        ← Volver a Torneos
                    </button>
                    <div>
                        <h1 className="text-2xl font-black uppercase text-text tracking-wider">{torneoSeleccionado.nombre}</h1>
                        <p className="text-sm text-secondary font-bold">Modo Cuadro (Bracket)</p>
                    </div>
                </div>

                {/* Visualizador Mágico del Fixture */}
                <TorneoBracketContainer
                    torneoId={torneoSeleccionado.id}
                    torneoData={torneoSeleccionado}
                    className="m-auto w-full"
                />
            </div>
        );
    }

    // Vista por defecto: Lista de Torneos
    return (
        <div className="space-y-6 animate-in fade-in duration-500 relative">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-widest text-text">Campañas & Torneos</h1>
                    <p className="text-textMuted">Administra cuadros deportivos y fixtures del club.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-secondary hover:bg-secondary/90 text-background font-black uppercase px-5 py-3 rounded-xl tracking-wider shadow-[0_0_15px_rgba(183,99,57,0.2)] transition-all transform hover:scale-105"
                >
                    + Nuevo Torneo
                </button>
            </div>

            {/* Modal de Creación */}
            {isModalOpen && (
                <TorneoForm
                    onClose={() => setIsModalOpen(false)}
                    onCreado={cargarData}
                />
            )}

            {cargando ? (
                <div className="text-center p-10 font-bold text-textMuted animate-pulse">Cargando certámenes...</div>
            ) : torneos.length === 0 ? (
                <div className="p-8 text-center bg-surface border border-border rounded-xl">
                    <p className="text-textMuted">Aún no hay torneos creados. (Usa Postman o Swagger para crear uno de prueba).</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {torneos.map(t => (
                        <div key={t.id} className="bg-surface border border-border rounded-xl p-5 flex flex-col justify-between gap-4">
                            <div>
                                <h3 className="text-xl font-bold text-text">{t.nombre}</h3>
                                <p className="text-sm text-textMuted mt-1">Inicio: {t.fechaInicio || 'Por Definir'}</p>
                            </div>
                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={() => setTorneoSeleccionado(t)}
                                    className="w-full bg-secondary/10 hover:bg-secondary/20 border border-secondary/30 text-secondary font-bold py-2 rounded-lg transition-colors"
                                >
                                    VER CUADRO E INSCRIPTOS
                                </button>
                                <button
                                    onClick={() => handleEliminar(t)}
                                    className="w-full bg-red-500/5 hover:bg-red-500/15 border border-red-500/30 text-red-500 font-bold py-2 rounded-lg transition-colors text-sm"
                                >
                                    🗑 CANCELAR TORNEO
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default GestionTorneosView;
