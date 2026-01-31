import Swal from 'sweetalert2';

// Configuración Estética Premium
const baseConfig = {
    background: '#1e293b', // Mismo color que tus tarjetas (bg-surface)
    color: '#f8fafc',      // Texto claro
    
    // Quitamos bordes y redondeamos mucho
    customClass: {
        popup: 'rounded-3xl shadow-2xl border border-gray-700', // Borde sutil oscuro
        title: 'text-2xl font-heading font-black italic tracking-tighter text-white mb-2',
        htmlContainer: 'text-gray-400 font-light tracking-wide',
        confirmButton: 'rounded-xl px-6 py-3 font-bold uppercase tracking-widest shadow-lg transition-transform hover:scale-105',
        cancelButton: 'rounded-xl px-6 py-3 font-bold uppercase tracking-widest shadow-none hover:bg-opacity-80',
        denyButton: 'rounded-xl px-6 py-3 font-bold uppercase tracking-widest'
    },
    
    buttonsStyling: false, // Desactivamos estilos default para usar clases Tailwind arriba
    showClass: {
        popup: 'animate__animated animate__fadeInUp animate__slower' // Animación suave entrada
    },
    hideClass: {
        popup: 'animate__animated animate__fadeOutDown animate__slower' // Animación suave salida
    }
};

export const mostrarAlerta = (titulo, mensaje, icono = 'success') => {
    // Definimos color del botón según el icono
    let btnColor = 'bg-primary text-btnText'; // Verde por defecto
    if (icono === 'error') btnColor = 'bg-red-500 text-white';
    if (icono === 'warning') btnColor = 'bg-yellow-500 text-black';

    return Swal.fire({
        ...baseConfig,
        title: titulo,
        text: mensaje,
        icon: icono,
        iconColor: icono === 'success' ? '#2fa86e' : undefined,
        confirmButtonText: 'ENTENDIDO',
        customClass: {
            ...baseConfig.customClass,
            confirmButton: `${baseConfig.customClass.confirmButton} ${btnColor}`
        }
    });
};

export const confirmarAccion = async (titulo, mensaje) => {
    const result = await Swal.fire({
        ...baseConfig,
        title: titulo,
        text: mensaje,
        icon: 'warning',
        iconColor: '#fbbf24', // Amarillo warning
        showCancelButton: true,
        confirmButtonText: 'SÍ, CONFIRMAR',
        cancelButtonText: 'CANCELAR',
        reverseButtons: true,
        customClass: {
            ...baseConfig.customClass,
            confirmButton: `${baseConfig.customClass.confirmButton} bg-primary text-btnText`,
            cancelButton: `${baseConfig.customClass.cancelButton} bg-transparent border border-gray-600 text-gray-400 mr-4`
        }
    });
    return result.isConfirmed;
};

export const confirmarEliminacionGrupal = async () => {
    const result = await Swal.fire({
        ...baseConfig,
        title: 'ELIMINAR TURNO FIJO',
        html: `
            <div class="text-left bg-gray-900/50 p-4 rounded-xl border border-gray-700 mb-4">
                <p class="text-sm text-gray-300 mb-2">⚠️ Esta reserva se repite en el tiempo.</p>
                <ul class="text-xs text-gray-500 list-disc list-inside">
                    <li>Si borras <b>TODO EL GRUPO</b>, se liberarán todas las fechas futuras.</li>
                    <li>Si borras <b>SOLO ESTA FECHA</b>, el resto del turno fijo sigue activo.</li>
                </ul>
            </div>
        `,
        icon: 'question',
        iconColor: '#01FA30', // Un rosa/violeta para diferenciar
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: 'BORRAR TODO EL GRUPO',
        denyButtonText: 'SOLO ESTA FECHA',
        cancelButtonText: 'CANCELAR',
        customClass: {
            ...baseConfig.customClass,
            confirmButton: `${baseConfig.customClass.confirmButton} bg-red-600 text-white mb-2`,
            denyButton: `${baseConfig.customClass.denyButton} bg-yellow-600 text-white mr-2 ml-2`,
            cancelButton: `${baseConfig.customClass.cancelButton} text-gray-500 hover:text-white`
        }
    });
    
    return result;
};