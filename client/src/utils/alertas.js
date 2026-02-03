import Swal from 'sweetalert2';

// Configuración Estética Premium
const baseConfig = {
    background: '#1e293b',
    color: '#f8fafc',
    customClass: {
        popup: 'rounded-3xl shadow-2xl border border-gray-700',
        title: 'text-2xl font-heading font-black italic tracking-tighter text-white mb-2',
        htmlContainer: 'text-gray-400 font-light tracking-wide',
        confirmButton: 'rounded-xl px-6 py-3 font-bold uppercase tracking-widest shadow-lg transition-transform hover:scale-105',
        cancelButton: 'rounded-xl px-6 py-3 font-bold uppercase tracking-widest shadow-none hover:bg-opacity-80',
        denyButton: 'rounded-xl px-6 py-3 font-bold uppercase tracking-widest'
    },
    buttonsStyling: false,
    showClass: { popup: 'animate__animated animate__fadeInUp animate__slower' },
    hideClass: { popup: 'animate__animated animate__fadeOutDown animate__slower' }
};

export const mostrarAlerta = (titulo, mensaje, icono = 'success') => {
    let btnColor = 'bg-primary text-btnText';
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
        iconColor: '#fbbf24',
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
        iconColor: '#01FA30',
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

// --- NUEVO HUB DE DETALLES ---
// Muestra info y botones de acción. Retorna 'pay' o 'cancel' según la elección.
export const mostrarDetallesReserva = async (reserva) => {
    const saldo = reserva.saldoPendiente !== undefined ? reserva.saldoPendiente : 0;
    const esPagado = reserva.pagado;

    // Construimos HTML bonito
    const html = `
        <div class="text-left space-y-3">
            <div class="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                <div class="flex justify-between items-center mb-2">
                    <span class="text-xs font-bold text-gray-500 uppercase">Cliente</span>
                    <span class="text-sm font-bold text-white">${reserva.nombreUsuario}</span>
                </div>
                <div class="flex justify-between items-center mb-2">
                    <span class="text-xs font-bold text-gray-500 uppercase">Cancha</span>
                    <span class="text-sm text-gray-300">${reserva.nombreCancha}</span>
                </div>
                <div class="flex justify-between items-center">
                    <span class="text-xs font-bold text-gray-500 uppercase">Contacto</span>
                    <span class="text-xs text-gray-400">${reserva.telefonoContacto || '-'}</span>
                </div>
            </div>

            <div class="flex gap-2">
                <div class="flex-1 bg-gray-800/50 p-3 rounded-xl border border-gray-700 text-center">
                    <p class="text-[10px] font-bold text-gray-500 uppercase">Precio</p>
                    <p class="text-lg font-bold text-white">$${reserva.precio || 0}</p>
                </div>
                <div class="flex-1 bg-gray-800/50 p-3 rounded-xl border border-gray-700 text-center">
                    <p class="text-[10px] font-bold text-gray-500 uppercase">Debe</p>
                    <p class="text-lg font-bold ${saldo > 0 ? 'text-red-400' : 'text-green-400'}">
                        $${saldo}
                    </p>
                </div>
            </div>
            
            ${reserva.codigoTurnoFijo ? '<p class="text-center text-xs text-primary font-bold italic">🔁 Es un Turno Fijo</p>' : ''}
        </div>
    `;

    // Botón Confirmar = PAGAR (Solo si debe plata)
    // Botón Deny = CANCELAR RESERVA
    const result = await Swal.fire({
        ...baseConfig,
        title: 'DETALLES DEL TURNO',
        html: html,
        showCancelButton: true,
        showDenyButton: true,
        showConfirmButton: !esPagado, // Si ya pagó, ocultamos el botón de pagar
        confirmButtonText: '💵 REGISTRAR PAGO',
        denyButtonText: '🗑️ CANCELAR RESERVA',
        cancelButtonText: 'CERRAR',
        customClass: {
            ...baseConfig.customClass,
            confirmButton: `${baseConfig.customClass.confirmButton} bg-green-600 text-white w-auto mb-2`,
            denyButton: `${baseConfig.customClass.denyButton} bg-red-600/80 hover:bg-red-600 text-white w-auto`,
            cancelButton: `${baseConfig.customClass.cancelButton} text-gray-500 hover:text-white`
        }
    });

    if (result.isConfirmed) return 'PAY';
    if (result.isDenied) return 'CANCEL';
    return null;
};

// --- MODAL DE COBRO (CON VALIDACIÓN) ---
export const mostrarModalCobro = async (reserva) => {
    const saldoPendiente = reserva.saldoPendiente !== undefined ? reserva.saldoPendiente : 0;
    
    const htmlContent = `
        <div class="flex flex-col gap-4 text-left">
            <div class="bg-gray-800 p-3 rounded-lg border border-gray-600">
                <p class="text-xs text-gray-400 uppercase">Saldo Pendiente</p>
                <p class="text-2xl font-bold text-white">$${saldoPendiente}</p>
            </div>

            <div>
                <label class="text-xs text-gray-400 uppercase font-bold block mb-1">Monto a cobrar</label>
                <input id="swal-input-monto" type="number" 
                    class="w-full bg-gray-900 border border-gray-600 text-white rounded-lg p-2 focus:ring-2 focus:ring-primary outline-none" 
                    value="${saldoPendiente}" 
                    max="${saldoPendiente}" 
                    min="1">
            </div>

            <div>
                <label class="text-xs text-gray-400 uppercase font-bold block mb-1">Método de Pago</label>
                <select id="swal-input-metodo" class="w-full bg-gray-900 border border-gray-600 text-white rounded-lg p-2 focus:ring-2 focus:ring-primary outline-none">
                    <option value="EFECTIVO">💵 Efectivo</option>
                    <option value="MERCADO_PAGO">📱 Mercado Pago</option>
                    <option value="TRANSFERENCIA">🏦 Transferencia</option>
                    <option value="DEBITO">💳 Débito</option>
                    <option value="CREDITO">💳 Crédito</option>
                </select>
            </div>

            <div>
                <label class="text-xs text-gray-400 uppercase font-bold block mb-1">Observación</label>
                <input id="swal-input-obs" type="text" class="w-full bg-gray-900 border border-gray-600 text-white rounded-lg p-2 focus:ring-2 focus:ring-primary outline-none" placeholder="Opcional">
            </div>
        </div>
    `;

    const result = await Swal.fire({
        ...baseConfig,
        title: 'COBRAR',
        html: htmlContent,
        showCancelButton: true,
        confirmButtonText: 'CONFIRMAR',
        cancelButtonText: 'VOLVER',
        focusConfirm: false,
        preConfirm: () => {
            const monto = parseFloat(document.getElementById('swal-input-monto').value);
            const metodo = document.getElementById('swal-input-metodo').value;
            const obs = document.getElementById('swal-input-obs').value;

            // VALIDACIÓN FRONTEND
            if (!monto || monto <= 0) {
                Swal.showValidationMessage('Ingresa un monto válido');
                return false;
            }
            if (monto > saldoPendiente) {
                Swal.showValidationMessage(`No puedes cobrar más de $${saldoPendiente}`);
                return false;
            }

            return { monto, metodoPago: metodo, observacion: obs };
        },
        customClass: {
            ...baseConfig.customClass,
            confirmButton: `${baseConfig.customClass.confirmButton} bg-green-600 text-white`,
            cancelButton: `${baseConfig.customClass.cancelButton} text-gray-400 hover:text-white`
        }
    });

    return result;
};