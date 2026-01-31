import { useState, useEffect } from 'react';
import { getUsuarios } from '../services/usuarioService';
import { getCanchas } from '../services/canchaService';
import { crearReserva } from '../services/reservaService';
import { mostrarAlerta } from '../utils/alertas'; // <--- Importamos la utilidad

const FormularioReserva = ({ onReservaCreada }) => {
    const [usuarios, setUsuarios] = useState([]);
    const [canchas, setCanchas] = useState([]);
    const [usuarioId, setUsuarioId] = useState('');
    const [canchaId, setCanchaId] = useState('');
    const [fecha, setFecha] = useState('');
    const [hora, setHora] = useState('');
    const [repetirSemanas, setRepetirSemanas] = useState(1);

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            const listaUsuarios = await getUsuarios();
            const listaCanchas = await getCanchas();
            setUsuarios(listaUsuarios);
            setCanchas(listaCanchas);
        } catch (error) {
            console.error("Error cargando datos:", error);
        }
    };

    const horariosDisponibles = [];
    for (let i = 9; i <= 22; i++) {
        const horaFormateada = i < 10 ? `0${i}:00` : `${i}:00`;
        horariosDisponibles.push(horaFormateada);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!usuarioId || !canchaId || !fecha || !hora) {
            // ALERTA LINDA
            mostrarAlerta('Faltan Datos', 'Por favor completa todos los campos del formulario.', 'warning');
            return;
        }

        const fechaHoraISO = `${fecha}T${hora}:00`;

        try {
            await crearReserva({
                usuarioId: parseInt(usuarioId),
                canchaId: parseInt(canchaId),
                fechaHora: fechaHoraISO,
                repetirSemanas: parseInt(repetirSemanas)
            });
            
            const msg = parseInt(repetirSemanas) > 1 
                ? `Se ha generado el turno fijo por ${repetirSemanas} semanas.` 
                : "La reserva se ha registrado correctamente.";
            
            // ALERTA LINDA
            mostrarAlerta('¡Reserva Exitosa!', msg, 'success');
            
            setFecha('');
            setHora('');
            setRepetirSemanas(1);
            if (onReservaCreada) onReservaCreada();
        } catch (error) {
            // ALERTA LINDA DE ERROR
            mostrarAlerta('Error', error.response?.data || "Hubo un problema al crear la reserva", 'error');
        }
    };

    const inputClass = "w-full bg-background border border-border text-text rounded-xl p-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all";
    const labelClass = "block text-xs font-bold uppercase tracking-wider text-textMuted mb-2";

    return (
        <form onSubmit={handleSubmit} className="bg-surface p-8 rounded-2xl border border-border shadow-lg max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-border">
                <span className="text-3xl">📅</span>
                <div>
                    <h3 className="text-xl font-black italic tracking-tighter text-text">Nueva Reserva</h3>
                    <p className="text-xs text-textMuted font-bold uppercase tracking-widest">Panel de Control Manual</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div>
                        <label className={labelClass}>Socio del Club</label>
                        <select className={inputClass} value={usuarioId} onChange={(e) => setUsuarioId(e.target.value)}>
                            <option value="">-- Seleccionar Jugador --</option>
                            {usuarios.map(u => (<option key={u.id} value={u.id}>{u.nombre} {u.apellido}</option>))}
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>Cancha Asignada</label>
                        <select className={inputClass} value={canchaId} onChange={(e) => setCanchaId(e.target.value)}>
                            <option value="">-- Seleccionar Cancha --</option>
                            {canchas.map(c => (<option key={c.id} value={c.id}>{c.nombre} ({c.superficie})</option>))}
                        </select>
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className={labelClass}>Fecha de Inicio</label>
                        <input type="date" className={inputClass} value={fecha} onChange={(e) => setFecha(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Horario</label>
                            <select className={inputClass} value={hora} onChange={(e) => setHora(e.target.value)}>
                                <option value="">-- Hora --</option>
                                {horariosDisponibles.map(h => (<option key={h} value={h}>{h} hs</option>))}
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Repetición 🔁</label>
                            <select className={`${inputClass} font-bold ${repetirSemanas > 1 ? 'text-primary border-primary' : ''}`} value={repetirSemanas} onChange={(e) => setRepetirSemanas(e.target.value)}>
                                <option value="1">Una vez</option>
                                <option value="2">2 Semanas</option>
                                <option value="4">1 Mes (4 sem)</option>
                                <option value="8">2 Meses (8 sem)</option>
                                <option value="12">3 Meses (12 sem)</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-8 pt-6 border-t border-border flex justify-end">
                <button type="submit" className="bg-primary text-btnText font-black uppercase tracking-widest py-3 px-8 rounded-xl hover:bg-opacity-90 hover:scale-105 transition-all shadow-[0_0_15px_rgba(47,168,110,0.4)]">
                    {parseInt(repetirSemanas) > 1 ? `Confirmar Fijo (${repetirSemanas} sem)` : 'Confirmar Reserva'}
                </button>
            </div>
        </form>
    );
};

export default FormularioReserva;