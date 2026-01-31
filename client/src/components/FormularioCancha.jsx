import { useState } from 'react';
import { createCancha } from '../services/canchaService';

const FormularioCancha = ({ onCanchaCreada }) => {
  const [formData, setFormData] = useState({ nombre: '', superficie: 'Polvo de Ladrillo' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createCancha(formData);
      setFormData({ nombre: '', superficie: 'Polvo de Ladrillo' });
      if (onCanchaCreada) onCanchaCreada();
    } catch (error) {
      console.error("Error al crear cancha:", error);
    }
  };

  return (
    <div className="bg-surface p-8 border border-border rounded-lg shadow-2xl mb-8">
      <h3 className="text-textMuted text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span> Registro de nueva cancha
      </h3>
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
        <input 
          className="flex-1 p-3 bg-background border border-border rounded text-text focus:outline-none focus:border-primary transition-colors placeholder:text-textMuted/30"
          name="nombre" placeholder="Identificador de la cancha" 
          value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} required 
        />
        <select 
          className="p-3 bg-background border border-border rounded text-text focus:outline-none focus:border-primary cursor-pointer"
          value={formData.superficie} onChange={(e) => setFormData({...formData, superficie: e.target.value})}
        >
          <option value="Polvo de Ladrillo">Polvo de Ladrillo</option>
          <option value="Cemento">Cemento</option>
          <option value="Césped">Césped</option>
        </select>
        <button type="submit" className="bg-btn text-btnText px-8 py-3 rounded font-black hover:bg-btnHover transition-all uppercase text-sm tracking-tighter">
          Añadir Cancha
        </button>
      </form>
    </div>
  );
};

export default FormularioCancha;