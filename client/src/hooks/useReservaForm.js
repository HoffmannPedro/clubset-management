import { useState, useEffect } from 'react';
import { getUsuarios } from '../services/usuarioService';
import { getCanchas } from '../services/canchaService';
import { crearReserva } from '../services/reservaService'; // <--- Usamos tu función correcta
import { mostrarAlerta } from '../utils/alertas';

// Aceptamos el nuevo parámetro 'dataPreseleccionada'
export const useReservaForm = (onReservaCreada, dataPreseleccionada) => {
    
    // 1. ESTADOS
    const [usuarios, setUsuarios] = useState([]);
    const [canchas, setCanchas] = useState([]);

    const [formData, setFormData] = useState({
        modoReserva: 'SOCIO',
        usuarioId: '',
        nombreContacto: '',
        telefonoContacto: '',
        canchaId: '',
        fecha: '',
        hora: '',
        repetirSemanas: 1
    });

    // 2. CARGA DE DATOS (Mantenemos igual)
    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const [listaUsuarios, listaCanchas] = await Promise.all([
                    getUsuarios(),
                    getCanchas()
                ]);
                setUsuarios(listaUsuarios);
                setCanchas(listaCanchas.filter(c => c.disponible));
            } catch (error) {
                console.error("Error cargando datos:", error);
                mostrarAlerta('Error', 'No se pudieron cargar los datos.', 'error');
            }
        };
        cargarDatos();
    }, []);

    // --- NUEVO: EFECTO PARA AUTOCOMPLETAR ---
    // Si dataPreseleccionada cambia (click en grilla), actualizamos el form
    useEffect(() => {
        if (dataPreseleccionada) {
            setFormData(prev => ({
                ...prev,
                canchaId: dataPreseleccionada.canchaId,
                fecha: dataPreseleccionada.fecha,
                hora: dataPreseleccionada.hora
            }));
        }
    }, [dataPreseleccionada]);
    // ----------------------------------------

    // 3. HANDLERS (Mantenemos igual)
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const setModo = (modo) => {
        setFormData(prev => ({
            ...prev,
            modoReserva: modo,
            usuarioId: '',
            nombreContacto: '',
            telefonoContacto: ''
        }));
    };

    // 4. LÓGICA DE ENVÍO
    const handleSubmit = async (e) => {
        e.preventDefault();
        const { canchaId, fecha, hora, modoReserva, usuarioId, nombreContacto, telefonoContacto, repetirSemanas } = formData;

        if (!canchaId || !fecha || !hora) {
            mostrarAlerta('Faltan Datos', 'Selecciona cancha, fecha y hora.', 'warning');
            return;
        }
        if (modoReserva === 'SOCIO' && !usuarioId) {
            mostrarAlerta('Faltan Datos', 'Selecciona un socio.', 'warning');
            return;
        }
        if (modoReserva === 'INVITADO' && (!nombreContacto.trim() || !telefonoContacto.trim())) {
            mostrarAlerta('Faltan Datos', 'Completa los datos del invitado.', 'warning');
            return;
        }

        const horaFormateada = hora.toString().padStart(2, '0');
        const fechaHoraISO = `${fecha}T${horaFormateada}:00:00`;

        try {
            const payload = {
                canchaId: parseInt(canchaId),
                fechaHora: fechaHoraISO,
                repetirSemanas: parseInt(repetirSemanas),
                usuarioId: modoReserva === 'SOCIO' ? parseInt(usuarioId) : null,
                nombreContacto: modoReserva === 'INVITADO' ? nombreContacto : null,
                telefonoContacto: modoReserva === 'INVITADO' ? telefonoContacto : null
            };

            await crearReserva(payload); // <--- Tu función original

            const msg = parseInt(repetirSemanas) > 1
                ? `Turno fijo generado por ${repetirSemanas} semanas.`
                : "Reserva registrada correctamente.";
            mostrarAlerta('¡Éxito!', msg, 'success');

            setFormData(prev => ({ ...prev, usuarioId: '', nombreContacto: '', telefonoContacto: '' }));

            if (onReservaCreada) onReservaCreada();

        } catch (error) {
            console.error(error);
            // MEJORA: Intentamos leer el mensaje del backend si existe
            const mensajeBackend = error.response?.data || 'No se pudo crear la reserva.';
            // A veces el backend manda un objeto, a veces un string. Nos aseguramos de mostrar texto.
            const mensajeFinal = typeof mensajeBackend === 'string' ? mensajeBackend : JSON.stringify(mensajeBackend);
            
            mostrarAlerta('Atención', mensajeFinal, 'error');
        }
    };

    const horariosDisponibles = Array.from({ length: 14 }, (_, i) => {
        const h = i + 9;
        return { valor: h, etiqueta: `${h < 10 ? '0' + h : h}:00 hs` };
    });

    return {
        formData,
        usuarios,
        canchas,
        horariosDisponibles,
        handleChange,
        setModo,
        handleSubmit
    };
};