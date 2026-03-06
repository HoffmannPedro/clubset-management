import { useState } from 'react';
import { useReservaForm } from '../../hooks/useReservaForm';

const FormularioReserva = ({ onReservaCreada, preseleccion }) => {
    const {
        formData,
        usuarios,
        canchas,
        horariosDisponibles,
        handleChange,
        setModo,
        handleSubmit
    } = useReservaForm(onReservaCreada, preseleccion);

    const { modoReserva, usuarioId, nombreContacto, telefonoContacto, canchaId, fecha, hora, repetirSemanas, montoAbonado, metodoPago } = formData;
    
    // Estado para mostrar/ocultar el panel de pago adelantado
    const [registrarPago, setRegistrarPago] = useState(false);

    const inputClass = "w-full bg-background border border-border text-text rounded-xl p-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium h-[50px]";
    const labelClass = "block text-xs font-bold uppercase tracking-wider text-textMuted mb-2";

    return (
        <form onSubmit={handleSubmit} className="bg-surface p-8 rounded-2xl border border-border shadow-lg max-w-4xl mx-auto relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-4 border-b border-border relative z-10">
                <div className="flex items-center gap-3">
                    <span className="text-3xl">📅</span>
                    <div>
                        <h3 className="text-xl font-black italic tracking-tighter text-text">Nueva Reserva</h3>
                        <p className="text-xs text-textMuted font-bold uppercase tracking-widest">Panel de Control Manual</p>
                    </div>
                </div>

                <div className="bg-background p-1 rounded-xl border border-border flex shadow-sm">
                    <button type="button" onClick={() => setModo('SOCIO')} className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${modoReserva === 'SOCIO' ? 'bg-secondary text-white shadow-md' : 'text-textMuted hover:text-text'}`}>Socio</button>
                    <button type="button" onClick={() => setModo('INVITADO')} className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${modoReserva === 'INVITADO' ? 'bg-primary text-btnText shadow-md' : 'text-textMuted hover:text-text'}`}>Invitado</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">

                {/* COLUMNA IZQUIERDA */}
                <div className="space-y-5">
                    {modoReserva === 'SOCIO' ? (
                        <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                            <label className={labelClass}>Socio del Club</label>
                            <select name="usuarioId" className={inputClass} value={usuarioId} onChange={handleChange} required>
                                <option value="">-- Seleccionar Jugador --</option>
                                {usuarios.map(u => (<option key={u.id} value={u.id}>{u.nombre} {u.apellido}</option>))}
                            </select>
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-left-4 duration-300 space-y-5">
                            <div>
                                <label className={labelClass}>Nombre Completo</label>
                                <input name="nombreContacto" type="text" className={inputClass} placeholder="Ej: Juan Perez" value={nombreContacto} onChange={handleChange} autoFocus required />
                            </div>
                            <div>
                                <label className={labelClass}>Teléfono</label>
                                <input name="telefonoContacto" type="tel" className={inputClass} placeholder="Ej: 11 1234 5678" value={telefonoContacto} onChange={handleChange} required />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className={labelClass}>Cancha Asignada</label>
                        <select name="canchaId" className={inputClass} value={canchaId} onChange={handleChange} required>
                            <option value="">-- Seleccionar Cancha --</option>
                            {canchas.map(c => (<option key={c.id} value={c.id}>{c.nombre} ({c.superficie})</option>))}
                        </select>
                        {canchas.length === 0 && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">⚠ No hay canchas disponibles.</p>}
                    </div>
                </div>

                {/* COLUMNA DERECHA */}
                <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Fecha</label>
                            <input name="fecha" type="date" className={inputClass} value={fecha} onChange={handleChange} required />
                        </div>
                        <div>
                            <label className={labelClass}>Hora</label>
                            <select name="hora" className={inputClass} value={hora} onChange={handleChange} required>
                                <option value="">--</option>
                                {horariosDisponibles.map(h => (<option key={h.valor} value={h.valor}>{h.etiqueta}</option>))}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className={labelClass}>Repetición 🔁</label>
                        <select name="repetirSemanas" className={`${inputClass} font-bold ${repetirSemanas > 1 ? 'text-primary border-primary' : ''}`} value={repetirSemanas} onChange={handleChange}>
                            <option value="1">Una vez</option>
                            <option value="4">1 Mes (4 sem)</option>
                            <option value="12">3 Meses (12 sem)</option>
                        </select>
                    </div>
                </div>

                {/* --- NUEVA SECCIÓN: PAGO ADELANTADO --- */}
                <div className="col-span-1 md:col-span-2 mt-2 p-5 border border-border/50 rounded-xl bg-black/20">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={registrarPago} 
                            onChange={(e) => {
                                setRegistrarPago(e.target.checked);
                                if (!e.target.checked) {
                                    // Si desmarca, limpiamos el monto para que no se envíe al backend
                                    handleChange({ target: { name: 'montoAbonado', value: '' } });
                                }
                            }} 
                            className="w-5 h-5 accent-primary rounded bg-surface border-border" 
                        />
                        <span className="text-sm font-black text-white uppercase tracking-widest">
                            Registrar Pago Ahora 💵
                        </span>
                    </label>

                    {registrarPago && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5 animate-in slide-in-from-top-2">
                            <div>
                                <label className={labelClass}>Monto Entregado ($)</label>
                                <input 
                                    name="montoAbonado" 
                                    type="number" 
                                    min="1"
                                    className={`${inputClass} border-green-500/50 focus:border-green-500`} 
                                    placeholder="Ej: 2000" 
                                    value={montoAbonado} 
                                    onChange={handleChange} 
                                    required={registrarPago} 
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Método de Pago</label>
                                <select name="metodoPago" className={inputClass} value={metodoPago || 'EFECTIVO'} onChange={handleChange}>
                                    <option value="EFECTIVO">Efectivo</option>
                                    <option value="TRANSFERENCIA">Transferencia / Billetera</option>
                                    <option value="TARJETA_DEBITO">Tarjeta de Débito</option>
                                    <option value="TARJETA_CREDITO">Tarjeta de Crédito</option>
                                    <option value="MERCADO_PAGO">Mercado Pago</option>
                                </select>
                            </div>
                            
                            {/* Aviso inteligente del Método Cascada */}
                            {repetirSemanas > 1 && montoAbonado > 0 && (
                                <div className="col-span-1 md:col-span-2 text-[10px] text-green-400 font-bold bg-green-500/10 p-3 rounded-lg border border-green-500/20 uppercase tracking-widest">
                                    ℹ️ Método Cascada Activo: Los ${montoAbonado} cubrirán automáticamente las primeras fechas del mes.
                                </div>
                            )}
                        </div>
                    )}
                </div>

            </div>

            <div className="mt-8 pt-6 border-t border-border flex justify-end relative z-10">
                <button type="submit" className={`font-black uppercase tracking-widest py-3 px-8 rounded-xl hover:bg-opacity-90 hover:scale-105 transition-all shadow-lg ${modoReserva === 'SOCIO' ? 'bg-secondary text-white shadow-secondary/20' : 'bg-primary text-btnText shadow-primary/20'}`}>
                    {parseInt(repetirSemanas) > 1 ? `Confirmar Fijo` : 'Confirmar Reserva'}
                </button>
            </div>
        </form>
    );
};

export default FormularioReserva;