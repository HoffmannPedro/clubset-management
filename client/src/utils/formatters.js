// src/utils/formatters.js

export const formatearConceptoMovimiento = (concepto) => {
    if (!concepto) return '';
    
    // Diccionario de mapeo: Enum Backend -> Texto UI
    const diccionario = {
        'EFECTIVO': 'Efectivo',
        'TRANSFERENCIA': 'Transferencia / Billetera',
        'TARJETA_DEBITO': 'Tarjeta de Débito',
        'TARJETA_CREDITO': 'Tarjeta de Crédito',
        'MERCADO_PAGO': 'Mercado Pago'
    };
    
    let conceptoFormateado = concepto;
    
    // Iteramos el diccionario y reemplazamos la coincidencia
    for (const [key, value] of Object.entries(diccionario)) {
        if (conceptoFormateado.includes(key)) {
            conceptoFormateado = conceptoFormateado.replace(key, value);
            break; // Optimizamos cortando el bucle al encontrar el match
        }
    }
    
    return conceptoFormateado;
};