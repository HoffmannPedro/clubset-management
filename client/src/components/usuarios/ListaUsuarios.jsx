import { useEffect, useState, useCallback } from 'react';
import { getUsuarios } from '../../services/usuarioService';

// 1. Aceptamos la nueva prop onVerPerfil
const ListaUsuarios = ({ refreshKey, onEditar, onEliminar, onVerPerfil }) => {
    const [usuarios, setUsuarios] = useState([]);
    const [cargando, setCargando] = useState(true);

    const cargarUsuarios = useCallback(async () => {
        try {
            const data = await getUsuarios();
            setUsuarios(data);
        } catch (error) {
            console.error("Error al conectar con el backend:", error);
        } finally {
            setCargando(false);
        }
    }, []);

    useEffect(() => {
        cargarUsuarios();
    }, [cargarUsuarios, refreshKey]);

    if (cargando) return <p className="text-secondary font-bold animate-pulse text-center p-4">Sincronizando socios...</p>;

    if (usuarios.length === 0) return <p className="p-12 text-center text-textMuted/40 italic font-bold">No se registran socios activos.</p>;

    return (
        <div>
            {/* VISTA MÓVIL */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
                {usuarios.map(u => (
                    <div key={u.id} className="bg-surface border border-border rounded-xl p-5 shadow-sm relative overflow-hidden group">
                        
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-secondary/50 group-hover:bg-secondary transition-colors"></div>

                        <div className="flex items-start justify-between mb-3 pl-2">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary font-black text-sm border border-secondary/20">
                                    {u.nombre.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-bold text-text text-lg leading-none mb-1">{u.nombre} {u.apellido}</p>
                                    <span className="text-[10px] bg-border px-2 py-0.5 rounded text-textMuted uppercase font-bold tracking-wider">
                                        {u.rol}
                                    </span>
                                </div>
                            </div>
                            <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(47,168,110,0.8)] animate-pulse"></div>
                        </div>

                        <div className="pl-14 mb-4">
                            <p className="text-xs text-textMuted font-bold uppercase tracking-widest mb-1 opacity-50">Contacto</p>
                            <p className="text-sm text-text break-all font-medium">{u.email}</p>
                        </div>

                        {/* --- BOTONES DE ACCIÓN MÓVIL --- */}
                        <div className="pl-14 flex gap-3 border-t border-border pt-3">
                            {/* 2. Botón Nuevo Móvil */}
                            <button 
                                onClick={() => onVerPerfil(u.id)} 
                                className="flex-1 bg-purple-500/10 text-purple-400 text-xs font-bold py-2 rounded hover:bg-purple-500/20 transition-colors"
                            >
                                👁️ PERFIL
                            </button>
                            <button 
                                onClick={() => onEditar(u)} 
                                className="flex-1 bg-blue-500/10 text-blue-400 text-xs font-bold py-2 rounded hover:bg-blue-500/20 transition-colors"
                            >
                                ✏️ EDITAR
                            </button>
                            <button 
                                onClick={() => onEliminar(u.id)}
                                className="flex-1 bg-red-500/10 text-red-400 text-xs font-bold py-2 rounded hover:bg-red-500/20 transition-colors"
                            >
                                🗑️ BORRAR
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* VISTA ESCRITORIO */}
            <div className="hidden md:block bg-surface rounded-xl border border-border overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-background/50 border-b border-border text-textMuted uppercase text-[10px] font-black tracking-[0.2em]">
                                <th className="p-6">Identidad del Socio</th>
                                <th className="p-6">Canal de Comunicación</th>
                                <th className="p-6">Rol</th>
                                <th className="p-6 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {usuarios.map(u => (
                                <tr key={u.id} className="hover:bg-background/50 transition-colors group cursor-default">
                                    <td className="p-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded bg-secondary/10 flex items-center justify-center text-secondary font-black text-xs group-hover:scale-110 transition-transform">
                                                {u.nombre.charAt(0)}
                                            </div>
                                            <span className="font-bold text-text group-hover:text-secondary transition-colors">{u.nombre} {u.apellido}</span>
                                        </div>
                                    </td>
                                    <td className="p-6 text-textMuted font-medium text-sm">{u.email}</td>
                                    <td className="p-6">
                                        <span className="text-[10px] border border-border px-2 py-1 rounded text-textMuted uppercase font-bold tracking-wider group-hover:border-secondary/50 group-hover:text-secondary transition-colors">
                                            {u.rol}
                                        </span>
                                    </td>
                                    <td className="p-6 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            {/* 3. Botón Nuevo Escritorio */}
                                            <button 
                                                onClick={() => onVerPerfil(u.id)}
                                                className="p-2 hover:bg-purple-500/20 text-textMuted hover:text-purple-400 rounded-lg transition-all"
                                                title="Ver Ficha Completa"
                                            >
                                                👁️
                                            </button>
                                            <button 
                                                onClick={() => onEditar(u)}
                                                className="p-2 hover:bg-blue-500/20 text-textMuted hover:text-blue-400 rounded-lg transition-all"
                                                title="Editar Usuario"
                                            >
                                                ✏️
                                            </button>
                                            <button 
                                                onClick={() => onEliminar(u.id)}
                                                className="p-2 hover:bg-red-500/20 text-textMuted hover:text-red-400 rounded-lg transition-all"
                                                title="Eliminar Usuario"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ListaUsuarios;