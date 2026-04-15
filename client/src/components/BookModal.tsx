import React, { useState } from 'react';
import { XIcon, BarcodeIcon, SaveIcon, MapPinIcon, BookOpenIcon, LayersIcon } from 'lucide-react';
import api from '../api/axios';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const BookModal = ({ isOpen, onClose, onSuccess }: Props) => {
  const initialState = {
    title: '',
    author: '',
    isbn: '',
    category: 'Literatura',
    publisher: '',
    yearPublish: new Date().getFullYear().toString(),
    edition: '',
    language: 'Español',
    stockTotal: 1,
    barcode: '',
    description: '',
    location: {
      shelf: '',
      level: '',
      deweyCode: ''
    },
    section: 'Biblioteca General' // Valor por defecto
  };

  const [formData, setFormData] = useState(initialState);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/books', formData); 
      onSuccess();
      onClose();
      setFormData(initialState);
    } catch (error: any) {
      const msg = error.response?.data?.msg || "Error al registrar el libro";
      alert(msg);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col">
        
        {/* Header */}
        <div className="bg-gray-900 p-8 text-white flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/30">
              <BookOpenIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight">Registro de Acervo</h2>
              <p className="text-gray-400 text-sm font-medium uppercase tracking-widest">Gestión de Colecciones y Secciones</p>
            </div>
          </div>
          <button onClick={onClose} className="bg-white/10 hover:bg-white/20 p-3 rounded-2xl transition-all">
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-8 custom-scrollbar">
          
          {/* SECCIÓN 1: IDENTIFICACIÓN BÁSICA */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-black text-gray-400 uppercase mb-2 ml-2">Título del Recurso</label>
              <input 
                required
                placeholder="Ej: Cien años de soledad"
                className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-bold text-gray-800"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase mb-2 ml-2">ISBN / Código</label>
              <input 
                required
                placeholder="978-..."
                className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-mono"
                value={formData.isbn}
                onChange={(e) => setFormData({...formData, isbn: e.target.value})}
              />
            </div>
          </div>

          {/* SECCIÓN 2: DATOS TÉCNICOS Y SECCIÓN (CAMBIO AQUÍ) */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="md:col-span-1">
              <label className="block text-xs font-black text-gray-400 uppercase mb-2 ml-2">Autor</label>
              <input required className="w-full p-4 bg-gray-50 rounded-2xl outline-none"
                value={formData.author} onChange={(e) => setFormData({...formData, author: e.target.value})} />
            </div>
            <div className="md:col-span-1">
              <label className="block text-xs font-black text-gray-400 uppercase mb-2 ml-2">Año</label>
              <input type="number" className="w-full p-4 bg-gray-50 rounded-2xl outline-none"
                value={formData.yearPublish} onChange={(e) => setFormData({...formData, yearPublish: e.target.value})} />
            </div>
            <div className="md:col-span-1">
              <label className="block text-xs font-black text-gray-400 uppercase mb-2 ml-2">Categoría</label>
              <select className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold text-gray-600"
                value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                <option>Literatura</option>
                <option>Ingeniería</option>
                <option>Historia</option>
                <option>Ciencias</option>
              </select>
            </div>
            
            {/* NUEVO CAMPO: SECCIÓN DEL ACERVO */}
            <div className="md:col-span-2 bg-blue-50/50 p-1 rounded-2xl border-2 border-dashed border-blue-100">
              <label className="block text-[10px] font-black text-blue-500 uppercase mb-1 ml-3 mt-1">Sección Destino (Reglas de Préstamo)</label>
              <div className="flex items-center bg-white rounded-xl px-3">
                <LayersIcon className="w-4 h-4 text-blue-400" />
                <select 
                  className="w-full p-3 bg-transparent font-black text-blue-700 outline-none"
                  value={formData.section}
                  onChange={(e) => setFormData({...formData, section: e.target.value})}
                >
                  <option value="Biblioteca General">Biblioteca General</option>
                  <option value="Hemeroteca">Hemeroteca</option>
                  <option value="Referencia">Colección de Referencia</option>
                  <option value="Juvenil/Infantil">Sección Juvenil/Infantil</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECCIÓN 3: UBICACIÓN Y STOCK */}
          <div className="bg-orange-50/50 p-6 rounded-[2rem] border border-orange-100 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-4 mb-2">
              <h4 className="flex items-center gap-2 text-sm font-black text-orange-600 uppercase tracking-widest">
                <MapPinIcon className="w-4 h-4" /> Ubicación Física en Estantería
              </h4>
            </div>
            <div>
              <label className="block text-[10px] font-black text-orange-400 uppercase mb-1 ml-2">Estante</label>
              <input className="w-full p-4 bg-white rounded-xl outline-none border border-orange-100" placeholder="Ej: A-1"
                value={formData.location.shelf} onChange={(e) => setFormData({...formData, location: {...formData.location, shelf: e.target.value}})} />
            </div>
            <div>
              <label className="block text-[10px] font-black text-orange-400 uppercase mb-1 ml-2">Nivel</label>
              <input className="w-full p-4 bg-white rounded-xl outline-none border border-orange-100" placeholder="Ej: 2"
                value={formData.location.level} onChange={(e) => setFormData({...formData, location: {...formData.location, level: e.target.value}})} />
            </div>
            <div>
              <label className="block text-[10px] font-black text-orange-400 uppercase mb-1 ml-2">Código Dewey</label>
              <input className="w-full p-4 bg-white rounded-xl outline-none border border-orange-100 font-mono" placeholder="823.1"
                value={formData.location.deweyCode} onChange={(e) => setFormData({...formData, location: {...formData.location, deweyCode: e.target.value}})} />
            </div>
            <div className="bg-blue-600 rounded-2xl p-1 shadow-lg shadow-blue-200">
              <label className="block text-[10px] font-black text-white/70 uppercase mb-1 ml-3 mt-1">Existencia Inicial</label>
              <input type="number" required className="w-full p-3 bg-white rounded-xl outline-none font-black text-blue-600 text-center text-xl"
                value={formData.stockTotal} onChange={(e) => setFormData({...formData, stockTotal: parseInt(e.target.value)})} />
            </div>
          </div>

          {/* Botones */}
          <div className="pt-6 flex gap-4">
            <button type="button" onClick={onClose} className="flex-1 py-5 text-gray-400 font-bold hover:bg-gray-50 rounded-2xl transition-all uppercase text-xs tracking-widest">
              Cancelar
            </button>
            <button type="submit" className="flex-[2] py-5 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-200 flex items-center justify-center gap-3 uppercase text-sm tracking-tighter">
              <SaveIcon className="w-5 h-5" /> Confirmar Registro en Inventario
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookModal;