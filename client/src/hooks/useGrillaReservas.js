import { useState, useEffect } from 'react';
import { getReservas, cancelarReserva, cancelarGrupoReserva, registrarPago } from '../services/reservaService';
import { getCanchas } from '../services/canchaService';
import { mostrarAlerta, confirmarEliminacionGrupal, mostrarDetallesReserva, mostrarModalCobro, confirmarAccion } from '../utils/alertas';

export const useGrillaReservas = (refreshKey) => {
    const [reservas, setReservas] = useState([]);
    const [canchas, setCanchas] = useState([]);
    const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date().toISOString().split('T')[0]);

    // Generamos las horas de 09:00 a 22:00
    const horas = Array.from({ length: 14 }, (_, i) => i + 9);

    useEffect(() => {
        cargarDatos();
    }, [refreshKey, fechaSeleccionada]);

    const cargarDatos = async () => {
        try {
            // Usamos Promise.all para cargar todo en paralelo (más rápido)
            const [dataCanchas, dataReservas] = await Promise.all([
                getCanchas(),
                getReservas()
            ]);
            setCanchas(dataCanchas);
            setReservas(dataReservas);
        } catch (error) {
            console.error("Error cargando grilla:", error);
        }
    };

    // --- LÓGICA DE INTERACCIÓN ---
    const handleReservaClick = async (reserva) => {
        const accion = await mostrarDetallesReserva(reserva);

        if (accion === 'PAY') {
            await procesarPago(reserva);
        } else if (accion === 'CANCEL') {
            await procesarCancelacion(reserva);
        }
    };

    const procesarPago = async (reserva) => {
        try {
            const result = await mostrarModalCobro(reserva);
            if (result.isConfirmed) {
                const datosPago = result.value;
                await registrarPago(reserva.id, datosPago);
                mostrarAlerta('Pago Registrado', `Se cobraron $${datosPago.monto} correctamente.`, 'success');
                cargarDatos();
            }
        } catch (error) {
            console.error("Error procesando pago:", error);
            mostrarAlerta('Error', 'No se pudo registrar el pago. Verifique el monto.', 'error');
        }
    };

    const procesarCancelacion = async (reserva) => {
        try {
            if (reserva.codigoTurnoFijo) {
                const result = await confirmarEliminacionGrupal();
                if (result.isConfirmed) {
                    await cancelarGrupoReserva(reserva.id);
                    mostrarAlerta('Eliminado', 'Turno fijo completo eliminado.', 'success');
                    cargarDatos();
                } else if (result.isDenied) {
                    await cancelarReserva(reserva.id);
                    mostrarAlerta('Eliminado', 'Reserva individual eliminada.', 'success');
                    cargarDatos();
                }
            } else {
                const confirmado = await confirmarAccion('¿Seguro?', `Se cancelará la reserva de ${reserva.nombreUsuario}.`);
                if (confirmado) {
                    await cancelarReserva(reserva.id);
                    mostrarAlerta('Cancelada', 'La reserva ha sido eliminada.', 'success');
                    cargarDatos();
                }
            }
        } catch (error) {
            console.error("Error al cancelar:", error);
            mostrarAlerta('Error', 'No se pudo cancelar la reserva.', 'error');
        }
    };

    // Helper para encontrar la reserva en la celda
    const buscarReserva = (canchaId, hora) => {
        return reservas.find(r => {
            const fechaReserva = r.fechaHora.split('T')[0];
            const horaReserva = parseInt(r.fechaHora.split('T')[1].split(':')[0]);
            return fechaReserva === fechaSeleccionada && horaReserva === hora && r.canchaId === canchaId;
        });
    };

    return {
        canchas,
        horas,
        fechaSeleccionada,
        setFechaSeleccionada,
        buscarReserva,
        handleReservaClick
    };
};