import { useState, useEffect } from 'react';
import { getUsuarios } from '../services/usuarioService';
import { getCanchas } from '../services/canchaService';
import { crearReserva } from '../services/reservaService';
import { mostrarAlerta } from '../utils/alertas';

export const useReservaForm = (onReservaCreada) => {
    // 1. ESTADOS
    const [usuarios, setUsuarios] = useState([]);
    const [canchas, setCanchas] = useState([]);

    // Form Data
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

    // 2. CARGA DE DATOS
    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const [listaUsuarios, listaCanchas] = await Promise.all([
                    getUsuarios(),
                    getCanchas()
                ]);
                setUsuarios(listaUsuarios);
                // Filtramos solo disponibles
                setCanchas(listaCanchas.filter(c => c.disponible));
            } catch (error) {
                console.error("Error cargando datos:", error);
                mostrarAlerta('Error', 'No se pudieron cargar los datos.', 'error');
            }
        };
        cargarDatos();
    }, []);

    // 3. HANDLERS (Manejadores de cambios)
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const setModo = (modo) => {
        setFormData(prev => ({
            ...prev,
            modoReserva: modo,
            usuarioId: '',        // Limpiamos al cambiar
            nombreContacto: '',
            telefonoContacto: ''
        }));
    };

    // 4. LÓGICA DE ENVÍO
    const handleSubmit = async (e) => {
        e.preventDefault();
        const { canchaId, fecha, hora, modoReserva, usuarioId, nombreContacto, telefonoContacto, repetirSemanas } = formData;

        // Validaciones
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

        // Formateo
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

            await crearReserva(payload);

            const msg = parseInt(repetirSemanas) > 1
                ? `Turno fijo generado por ${repetirSemanas} semanas.`
                : "Reserva registrada correctamente.";
            mostrarAlerta('¡Éxito!', msg, 'success');

            // Limpieza inteligente (Mantenemos fecha/cancha por si quiere seguir cargando)
            setFormData(prev => ({ ...prev, usuarioId: '', nombreContacto: '', telefonoContacto: '' }));

            if (onReservaCreada) onReservaCreada();

        } catch (error) {
            console.error(error);
            mostrarAlerta('Error', 'No se pudo crear la reserva.', 'error');
        }
    };

    // 5. HELPER PARA HORARIOS
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