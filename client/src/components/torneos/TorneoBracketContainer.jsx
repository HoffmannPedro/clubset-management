import { useEffect, useState, useCallback, useMemo } from 'react';
import { getPartidosTorneo, generarFixtureAleatorio, getEquiposTorneo, cambiarEstadoTorneo } from '../../services/torneoService';
import DesktopBracket from './DesktopBracket';
import MobileBracket from './MobileBracket';
import InscripcionModal from './InscripcionModal';
import ResultadoModal from './ResultadoModal';

// Diccionario para ordenar cronológicamente las fases de un torneo
const ORDEN_FASES = {
    'RONDA_PRELIMINAR': 1,
    'DIECISEISAVOS': 2,
    'OCTAVOS': 3,
    'CUARTOS': 4,
    'SEMI': 5,
    'TERCER_PUESTO': 6,
    'FINAL': 7
};

// Diccionario visual de fases
const NOMBRES_FASES = {
    'RONDA_PRELIMINAR': 'Ronda Preliminar',
    'DIECISEISAVOS': '16avos de Final',
    'OCTAVOS': 'Octavos de Final',
    'CUARTOS': 'Cuartos de Final',
    'SEMI': 'Semifinal',
    'TERCER_PUESTO': '3er Puesto',
    'FINAL': 'Final'
};

const TorneoBracketContainer = ({ torneoId, torneoData }) => {
    const [partidos, setPartidos] = useState([]);
    const [equipos, setEquipos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [generando, setGenerando] = useState(false);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [partidoSeleccionado, setPartidoSeleccionado] = useState(null);

    const cargarFixtureYEquipos = useCallback(async () => {
        try {
            setCargando(true);
            const [partidosData, equiposData] = await Promise.all([
                getPartidosTorneo(torneoId),
                getEquiposTorneo(torneoId)
            ]);
            setPartidos(partidosData);
            setEquipos(equiposData);
        } catch (err) {
            console.error("Error cargando torneo:", err);
            setError("No se pudieron cargar los datos del torneo.");
        } finally {
            setCargando(false);
        }
    }, [torneoId]);

    const handleSortearLlaves = async () => {
        try {
            setGenerando(true);
            setError(null);
            await generarFixtureAleatorio(torneoId);
            await cargarFixtureYEquipos();
        } catch (err) {
            console.error("Error sorteando llaves:", err);
            setError(err.message || "Ocurrió un error al sortear el fixture.");
        } finally {
            setGenerando(false);
        }
    };

    const handleCerrarInscripcionYReintentar = async () => {
        try {
            setGenerando(true);
            setError(null);
            await cambiarEstadoTorneo(torneoId, 'INSCRIPCION_CERRADA');
            await generarFixtureAleatorio(torneoId);
            await cargarFixtureYEquipos();
        } catch (err) {
            console.error("Error al cerrar inscripción y sortear:", err);
            setError(err.message || "Ocurrió un error al cerrar o sortear el fixture.");
        } finally {
            setGenerando(false);
        }
    };

    useEffect(() => {
        cargarFixtureYEquipos();
    }, [cargarFixtureYEquipos]);

    // Agrupación de partidos por fase
    const fasesAgrupadas = useMemo(() => {
        if (!partidos || partidos.length === 0) return [];
        
        const grupos = partidos.reduce((acc, partido) => {
            const fase = partido.fase;
            if (!acc[fase]) acc[fase] = [];
            acc[fase].push(partido);
            return acc;
        }, {});

        // Convertir objeto en un array de fases ordenadas
        const arregloFases = Object.keys(grupos).map(fase => ({
            clave: fase,
            nombre: NOMBRES_FASES[fase] || fase,
            orden: ORDEN_FASES[fase] || 99,
            partidos: grupos[fase]
        }));

        // Ordenar según el cronograma lógico del campeonato
        return arregloFases.sort((a, b) => a.orden - b.orden);
    }, [partidos]);

    if (cargando) return (
        <div className="flex justify-center items-center py-20 animate-pulse">
            <div className="text-secondary font-bold text-lg border border-secondary p-4 rounded-xl bg-surface">
                Dibujando llaves deportivas...
            </div>
        </div>
    );

    if (error) {
        const isInscripcionAbiertaError = error.includes("INSCRIPCION_CERRADA");
        const formattedError = error.replace("INSCRIPCION_CERRADA", "Inscripción Cerrada");
        
        return (
            <div className="p-8 flex flex-col items-center justify-center bg-surface border border-red-500/30 rounded-xl space-y-6 animate-in fade-in">
                <div className="flex flex-col items-center gap-2">
                    <span className="text-4xl">⚠️</span>
                    <h3 className="text-xl font-bold text-red-500">Aviso del Sistema</h3>
                    <p className="text-text font-medium text-center">{formattedError}</p>
                </div>

                {isInscripcionAbiertaError && (
                    <div className="flex flex-col items-center gap-3 w-full max-w-sm mt-4">
                        <button 
                            onClick={handleCerrarInscripcionYReintentar}
                            disabled={generando}
                            className="w-full bg-red-500/10 border border-red-500/50 hover:bg-red-500 text-red-500 hover:text-white font-bold px-6 py-3 rounded-xl transition-all disabled:opacity-50"
                        >
                            {generando ? 'Procesando...' : '🔒 Cerrar Inscripciones y Sortear'}
                        </button>
                        <p className="text-xs text-textMuted text-center">
                            Esta acción cerrará el padrón y no se permitirán más altas de cara al torneo.
                        </p>
                    </div>
                )}
                
                <button 
                    onClick={() => setError(null)}
                    className="text-textMuted hover:text-text underline text-sm"
                >
                    Volver atrás
                </button>
            </div>
        );
    }

    if (fasesAgrupadas.length === 0) return (
        <div className="flex flex-col gap-6 animate-in fade-in">
            {/* Padrón de Inscriptos */}
            <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-xl font-black uppercase text-text tracking-widest">Padrón de Inscriptos</h3>
                        <p className="text-sm text-textMuted">Administra los jugadores antes de sortear las llaves.</p>
                    </div>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-secondary/10 text-secondary hover:bg-secondary hover:text-background font-bold px-4 py-2 rounded-lg transition-colors border border-secondary/30 uppercase text-xs tracking-wider"
                    >
                        + Inscribir
                    </button>
                </div>

                {equipos.length === 0 ? (
                    <div className="text-center p-8 bg-background rounded-lg border border-border border-dashed">
                        <p className="text-textMuted font-medium">No hay jugadores inscriptos todavía.</p>
                        <p className="text-xs text-textMuted/60 mt-1">Usa el botón de arriba para enrolar al primer equipo.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {equipos.map(eq => (
                            <div key={eq.id} className="bg-background border border-border rounded-lg p-4 flex items-center justify-between">
                                <div>
                                    <div className="font-bold text-text truncate max-w-[200px]">{eq.nombreEquipo}</div>
                                    <div className="text-xs text-textMuted mt-1">
                                        {eq.usuario1?.nombre} {eq.usuario1?.apellido}
                                        {eq.usuario2 && ` & ${eq.usuario2?.nombre} ${eq.usuario2?.apellido}`}
                                    </div>
                                </div>
                                <div className="bg-secondary/10 text-secondary font-black text-xs px-2 py-1 rounded">Ok</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Sorteador */}
            <div className="p-8 flex flex-col items-center justify-center bg-surface border border-border rounded-xl space-y-6">
                <p className="text-text font-bold text-lg text-center">
                    Las llaves aún no han sido sorteadas.<br/> <span className="text-textMuted text-sm">Hay {equipos.length} equipo(s) esperando entrar a la cancha.</span>
                </p>
                <button 
                    onClick={handleSortearLlaves}
                    disabled={generando || equipos.length < 2}
                    className="bg-primary hover:bg-primary/90 text-background font-black uppercase tracking-widest px-8 py-4 rounded-xl shadow-[0_0_20px_rgba(47,168,110,0.5)] transition-all transform hover:scale-105 disabled:opacity-50 disabled:scale-100 disabled:shadow-none"
                >
                    {generando ? '🎲 Mezclando Bolilleros...' : '🎲 Sortear Fixture Automático'}
                </button>
                {equipos.length < 2 && (
                    <p className="text-xs text-red-400 font-bold uppercase tracking-wider">Se requieren al menos 2 inscriptos para sortear.</p>
                )}
                <p className="text-xs text-textMuted max-w-sm text-center">
                    El motor armará las llaves de Eliminación Directa y resolverá automáticamente los "Byes" (clasificaciones directas) si la cantidad de jugadores es impar o asimétrica.
                </p>
            </div>

            {isModalOpen && (
                <InscripcionModal 
                    torneo={torneoData} 
                    onClose={() => setIsModalOpen(false)} 
                    onInscrito={cargarFixtureYEquipos} 
                />
            )}
        </div>
    );

    const handlePartidoClick = (partido) => {
        // Solo abrir modal si el partido tiene 2 equipos y no está confirmado
        if (partido?.equipo1 && partido?.equipo2 && partido?.estadoResultado !== 'CONFIRMADO') {
            setPartidoSeleccionado(partido);
        }
    };

    return (
        <div className="w-full h-full animate-in fade-in duration-500">
            {/* VISTA MÓVIL PREDOMINANTE (Cartas Colapsables) */}
            <div className="block lg:hidden">
                <MobileBracket fases={fasesAgrupadas} onPartidoClick={handlePartidoClick} />
            </div>

            {/* VISTA ESCRITORIO (Diagrama Bracket Tree) */}
            <div className="hidden lg:block overflow-x-auto overflow-y-auto pb-4 custom-scrollbar">
                <DesktopBracket fases={fasesAgrupadas} onPartidoClick={handlePartidoClick} />
            </div>

            {/* Modal de Resultado */}
            {partidoSeleccionado && (
                <ResultadoModal
                    partido={partidoSeleccionado}
                    torneoId={torneoId}
                    onClose={() => setPartidoSeleccionado(null)}
                    onResultadoCargado={() => {
                        setPartidoSeleccionado(null);
                        cargarFixtureYEquipos();
                    }}
                />
            )}
        </div>
    );
};

export default TorneoBracketContainer;
