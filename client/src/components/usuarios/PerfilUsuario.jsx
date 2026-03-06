import { useState, useEffect } from 'react';
import api from '../../services/api';
// Asegurate de importar la función que creaste o hacer la llamada axios directa
// import { actualizarMiPerfil } from '../../services/usuarioService'; 

const PerfilUsuario = ({ usuarioId = null }) => {
    const [perfil, setPerfil] = useState(null);
    const [loading, setLoading] = useState(true);

    // Estados para el Modal de Edición
    const [showEditModal, setShowEditModal] = useState(false);
    const [editData, setEditData] = useState({ nombre: '', apellido: '', telefono: '', fotoPerfilUrl: '' });
    const [uploadingImage, setUploadingImage] = useState(false);

    // --- CONFIGURACIÓN DE CLOUDINARY ---
    const CLOUDINARY_CLOUD_NAME = "dlvxoftyv";
    const CLOUDINARY_UPLOAD_PRESET = "clubset_perfiles";

    useEffect(() => {
        cargarPerfil();
    }, [usuarioId]);

    const cargarPerfil = async () => {
        setLoading(true);
        try {
            const endpoint = usuarioId ? `/usuarios/${usuarioId}` : '/usuarios/me';
            const res = await api.get(endpoint);
            setPerfil(res.data);
            // Pre-cargamos los datos en el form por si quiere editar
            setEditData({
                nombre: res.data.nombre || '',
                apellido: res.data.apellido || '',
                telefono: res.data.telefono || '',
                fotoPerfilUrl: res.data.fotoPerfilUrl || ''
            });
        } catch (error) {
            console.error("Error cargando perfil", error);
        } finally {
            setLoading(false);
        }
    };

    // Subida de imagen a Cloudinary
    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingImage(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

        try {
            const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            setEditData({ ...editData, fotoPerfilUrl: data.secure_url });
        } catch (error) {
            console.error("Error subiendo imagen", error);
            alert("Hubo un error subiendo la foto.");
        } finally {
            setUploadingImage(false);
        }
    };

    // Guardar los cambios en el backend
    const handleGuardarCambios = async (e) => {
        e.preventDefault();
        try {
            // Llamamos al endpoint seguro /usuarios/me
            await api.put('/usuarios/me', editData);
            setShowEditModal(false);
            cargarPerfil(); // Recargamos para ver los cambios
        } catch (error) {
            console.error("Error guardando perfil", error);
            alert("Error al guardar los cambios.");
        }
    };

    if (loading) return <div className="p-10 text-center text-textMuted animate-pulse">Cargando ficha de jugador...</div>;
    if (!perfil) return <div className="p-10 text-center text-red-400">No se pudieron cargar los datos.</div>;

    const getBadgeColor = (cat) => {
        const colors = {
            'PRIMERA': 'bg-yellow-500/20 text-yellow-500 border-yellow-500',
            'SEGUNDA': 'bg-yellow-500/20 text-yellow-500 border-yellow-500',
            'TERCERA': 'bg-blue-500/20 text-blue-500 border-blue-500',
            'PRINCIPIANTE': 'bg-green-500/20 text-green-500 border-green-500'
        };
        return colors[cat] || 'bg-gray-500/20 text-gray-400 border-gray-500';
    };

    // ¿Es el perfil del usuario logueado? (Si no le pasamos usuarioId por prop, es "me")
    const isMiPerfil = !usuarioId;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">

            {/* 1. HEADER */}
            <div className="relative bg-gradient-to-r from-surface to-background rounded-2xl p-6 md:p-8 border border-border shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><span className="text-9xl">🎾</span></div>

                <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
                    {/* Avatar Dinámico */}
                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary to-secondary p-1 shadow-[0_0_20px_rgba(201,106,61,0.3)] shrink-0 overflow-hidden">
                        <div className="w-full h-full rounded-full bg-surface flex items-center justify-center text-3xl font-black text-white uppercase overflow-hidden">
                            {perfil.fotoPerfilUrl ? (
                                <img src={perfil.fotoPerfilUrl} alt="Perfil" className="w-full h-full object-cover" />
                            ) : (
                                <>{perfil.nombre?.charAt(0)}{perfil.apellido?.charAt(0)}</>
                            )}
                        </div>
                    </div>

                    {/* Info Central + Botón */}
                    <div className="text-center md:text-left flex-1 flex flex-col items-center md:items-start">
                        <h2 className="text-3xl font-black text-text italic tracking-tighter uppercase">
                            {perfil.nombre} <span className="text-primary">{perfil.apellido}</span>
                        </h2>

                        <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-3">
                            <span className={`px-3 py-1 rounded text-[10px] font-black uppercase border ${getBadgeColor(perfil.categoria)}`}>{perfil.categoria}</span>
                            <span className="px-3 py-1 rounded text-[10px] font-black uppercase border border-border text-textMuted bg-surface">{perfil.rol}</span>
                        </div>

                        {/* Botón reubicado debajo de las etiquetas (en flujo natural) */}
                        {isMiPerfil && (
                            <button
                                onClick={() => setShowEditModal(true)}
                                className="mt-5 bg-surface hover:bg-white/5 border border-border hover:border-primary/50 text-textMuted hover:text-white px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2"
                            >
                                ✏️ Modificar Datos
                            </button>
                        )}
                    </div>

                    {/* Ranking (siempre a la derecha en PC, abajo en celular) */}
                    <div className="bg-black/40 p-4 rounded-xl border border-white/5 text-center min-w-[120px] shrink-0 mt-2 md:mt-0">
                        <p className="text-[10px] text-textMuted uppercase font-bold tracking-widest">Ranking</p>
                        <p className="text-4xl font-black text-white">{perfil.puntosRanking || 0}</p>
                        <p className="text-[9px] text-primary font-bold">PUNTOS</p>
                    </div>
                </div>
            </div>

            {/* ... ACÁ SIGUE TODO EL RESTO INTACTO (ESTADÍSTICAS Y TABLA DE ÚLTIMOS MOVIMIENTOS) ... */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={`p-6 rounded-2xl border flex flex-col justify-center items-center relative overflow-hidden ${perfil.deudaTotal > 0 ? 'bg-red-500/10 border-red-500/50' : 'bg-green-500/10 border-green-500/50'}`}>
                    <h3 className="text-xs font-black uppercase tracking-widest mb-1 opacity-70">Estado de Cuenta</h3>
                    <p className={`text-3xl font-black ${perfil.deudaTotal > 0 ? 'text-red-500' : 'text-green-500'}`}>
                        ${perfil.deudaTotal || 0}
                    </p>
                    <span className="text-[10px] font-bold uppercase mt-1">
                        {perfil.deudaTotal > 0 ? 'Saldo Pendiente' : 'Al día'}
                    </span>
                </div>

                <div className="p-6 bg-surface rounded-2xl border border-border flex flex-col justify-center items-center">
                    <h3 className="text-xs font-black text-textMuted uppercase tracking-widest mb-1">Partidos Jugados</h3>
                    <p className="text-3xl font-black text-text">{perfil.partidosJugados || 0}</p>
                    <span className="text-[10px] text-primary font-bold uppercase mt-1">Trayectoria</span>
                </div>

                <div className="p-6 bg-surface rounded-2xl border border-border flex flex-col justify-center items-center">
                    <h3 className="text-xs font-black text-textMuted uppercase tracking-widest mb-1">Ficha Técnica</h3>
                    <p className="text-sm font-bold text-text">{perfil.manoHabil} / {perfil.genero === 'MASCULINO' ? 'Masculino' : 'Femenino'}</p>
                    <span className="text-[10px] text-textMuted font-mono mt-1">ID SOCIO: #{perfil.id}</span>
                </div>
            </div>

            <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-lg">
                <div className="p-6 border-b border-border bg-black/20">
                    <h3 className="text-lg font-black text-text italic">Últimos Movimientos</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="text-xs text-textMuted uppercase bg-white/5 font-black">
                            <tr>
                                <th className="px-6 py-4">Fecha</th>
                                <th className="px-6 py-4">Cancha</th>
                                <th className="px-6 py-4 text-center">Estado</th>
                                <th className="px-6 py-4 text-right">Saldo</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {perfil.ultimasReservas && perfil.ultimasReservas.length > 0 ? (
                                perfil.ultimasReservas.map((reserva) => (
                                    <tr key={reserva.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 font-bold">
                                            {new Date(reserva.fechaHora).toLocaleDateString()}
                                            <span className="text-textMuted ml-2 font-normal">
                                                {new Date(reserva.fechaHora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}hs
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-primary font-bold uppercase">{reserva.nombreCancha}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2 py-1 rounded text-[9px] font-black uppercase ${reserva.pagado ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                                                {reserva.pagado ? 'Pagado' : 'Pendiente'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono text-textMuted">
                                            {reserva.saldoPendiente > 0 ? `$${reserva.saldoPendiente}` : '-'}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-textMuted italic">
                                        Sin actividad reciente.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- MODAL DE EDICIÓN DE PERFIL --- */}
            {showEditModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    {/* Contenedor principal con max-h y overflow para teclados móviles */}
                    <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl relative">

                        <form onSubmit={handleGuardarCambios} className="space-y-4">

                            {/* Input de Foto */}
                            <div className="flex flex-col items-center mb-6">
                                <div className="w-20 h-20 rounded-full bg-background border border-border overflow-hidden mb-3">
                                    {editData.fotoPerfilUrl ? (
                                        <img src={editData.fotoPerfilUrl} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-textMuted text-[10px] font-bold uppercase">Sin foto</div>
                                    )}
                                </div>
                                <label className="cursor-pointer bg-black/20 hover:bg-black/40 border border-white/10 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-lg transition-colors text-white">
                                    {uploadingImage ? 'Subiendo...' : 'Cambiar Foto'}
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} />
                                </label>
                            </div>

                            {/* Inputs flexibles: 1 columna en móvil, 2 en PC */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase text-textMuted mb-2">Nombre</label>
                                    <input
                                        type="text" required
                                        className="w-full bg-background border border-border text-white rounded-xl p-3 focus:border-primary outline-none text-sm"
                                        value={editData.nombre} onChange={(e) => setEditData({ ...editData, nombre: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase text-textMuted mb-2">Apellido</label>
                                    <input
                                        type="text" required
                                        className="w-full bg-background border border-border text-white rounded-xl p-3 focus:border-primary outline-none text-sm"
                                        value={editData.apellido} onChange={(e) => setEditData({ ...editData, apellido: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold uppercase text-textMuted mb-2">Teléfono</label>
                                <input
                                    type="tel"
                                    className="w-full bg-background border border-border text-white rounded-xl p-3 focus:border-primary outline-none text-sm"
                                    value={editData.telefono} onChange={(e) => setEditData({ ...editData, telefono: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-3 pt-6 mt-2 border-t border-border/50">
                                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 bg-background text-textMuted hover:text-white font-bold text-xs uppercase py-3 rounded-xl border border-border transition-colors">
                                    Cancelar
                                </button>
                                <button type="submit" disabled={uploadingImage} className={`flex-1 font-black text-xs uppercase py-3 rounded-xl transition-all ${uploadingImage ? 'bg-primary/50 text-white/50 cursor-not-allowed' : 'bg-primary text-black hover:scale-[1.02]'}`}>
                                    Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PerfilUsuario;