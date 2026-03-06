import { useState } from 'react';
import { createCancha } from '../../services/canchaService';

const FormularioCancha = ({ onCanchaCreada }) => {
    const [formData, setFormData] = useState({ nombre: '', superficie: 'Polvo de Ladrillo' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createCancha(formData);
            setFormData({ nombre: '', superficie: 'Polvo de Ladrillo' });
            if (onCanchaCreada) onCanchaCreada(); // Esto ahora dispara el cambio automático a la pestaña de "Lista"
        } catch (error) {
            console.error("Error al crear cancha:", error);
        }
    };

    return (
        // 1. Ajustamos p-5 para móvil, p-8 para PC. Quitamos el mb-8. Usamos rounded-2xl
        <div className="bg-surface p-5 sm:p-8 border border-border rounded-2xl shadow-2xl relative overflow-hidden">
            
            <h3 className="text-textMuted text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
                {/* Le dimos un poco de brillo a la luz indicadora */}
                <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(47,168,110,0.8)] animate-pulse"></span> 
                Registro de nueva cancha
            </h3>

            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
                <input 
                    className="flex-1 p-3.5 bg-background border border-border rounded-xl text-text font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-textMuted/30"
                    name="nombre" 
                    placeholder="Ej: Pista Central" 
                    value={formData.nombre} 
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})} 
                    required 
                />
                
                {/* 2. Blindamos el select con appearance-none y le inyectamos una flecha SVG */}
                <div className="relative md:w-64 flex-shrink-0">
                    <select 
                        className="w-full p-3.5 bg-background border border-border rounded-xl text-text font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer appearance-none"
                        value={formData.superficie} 
                        onChange={(e) => setFormData({...formData, superficie: e.target.value})}
                    >
                        <option value="Polvo de Ladrillo">Polvo de Ladrillo</option>
                        <option value="Cemento">Cemento</option>
                        <option value="Césped">Césped</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-textMuted">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                </div>

                {/* 3. Botón unificado con el resto de la app (rounded-xl, sombras) */}
                <button 
                    type="submit" 
                    className="bg-primary text-btnText px-8 py-3.5 rounded-xl font-black hover:brightness-110 hover:scale-[1.02] active:scale-95 transition-all uppercase text-sm tracking-widest shadow-[0_10px_20px_rgba(47,168,110,0.2)] whitespace-nowrap"
                >
                    Añadir Cancha
                </button>
            </form>
        </div>
    );
};

export default FormularioCancha;