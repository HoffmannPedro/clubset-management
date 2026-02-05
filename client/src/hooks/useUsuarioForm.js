import { useState, useEffect } from 'react'; // Agregamos useEffect
// Importamos updateUsuario (asegúrate de tenerlo en el servicio, ver paso 2)
import { createUsuario, updateUsuario } from '../services/usuarioService'; 
import { mostrarAlerta } from '../utils/alertas';

export const useUsuarioForm = (onSuccess, usuarioAEditar) => {
    
    const initialState = {
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        password: '',
        rol: 'SOCIO',
        categoria: 'PRINCIPIANTE',
        genero: 'MASCULINO',
        manoHabil: 'DIESTRO'
    };

    const [formData, setFormData] = useState(initialState);

    // --- EFECTO: RELLENAR DATOS SI VAMOS A EDITAR ---
    useEffect(() => {
        if (usuarioAEditar) {
            // Si hay usuario para editar, llenamos el form con sus datos
            setFormData({
                ...usuarioAEditar,
                password: '' // IMPORTANTE: La contraseña siempre empieza vacía por seguridad
            });
        } else {
            // Si no hay usuario (se canceló o terminó), reseteamos a cero
            setFormData(initialState);
        }
    }, [usuarioAEditar]); // Se ejecuta cada vez que cambia el usuario seleccionado
    // -----------------------------------------------

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // 1. Validaciones
        if (!formData.nombre || !formData.apellido || !formData.email) {
            mostrarAlerta('Datos incompletos', 'Nombre, Apellido y Email son obligatorios.', 'warning');
            return;
        }

        // Validación especial de contraseña:
        // - Si es CREACIÓN: Obligatoria.
        // - Si es EDICIÓN: Opcional (si está vacía, no se toca).
        if (!usuarioAEditar && !formData.password) {
            mostrarAlerta('Falta Contraseña', 'Debes asignar una contraseña para el nuevo usuario.', 'warning');
            return;
        }

        try {
            if (usuarioAEditar) {
                // --- MODO EDICIÓN (PUT) ---
                // Preparamos los datos. Si la password está vacía, la quitamos para no enviarla vacía al back
                const dataToSend = { ...formData };
                if (!dataToSend.password) delete dataToSend.password;

                await updateUsuario(usuarioAEditar.id, dataToSend);
                
                mostrarAlerta('¡Cambios Guardados!', `El perfil de ${formData.nombre} ha sido actualizado.`, 'success');
            } else {
                // --- MODO CREACIÓN (POST) ---
                await createUsuario(formData);
                mostrarAlerta('¡Socio Registrado!', `${formData.nombre} ${formData.apellido} ha sido añadido correctamente.`, 'success');
                setFormData(initialState); // Solo limpiamos form si creamos uno nuevo
            }
            
            // Notificamos al padre para que recargue la lista
            if (onSuccess) onSuccess();
            
        } catch (error) {
            console.error("Error en operación:", error);
            mostrarAlerta('Error', 'Hubo un problema al procesar la solicitud.', 'error');
        }
    };

    return {
        formData,
        handleChange,
        handleSubmit
    };
};