import React, { useState, useEffect } from 'react';
import { Book, useBooks } from '../hooks/useBooks';
import {
  SearchIcon, MapPinIcon, Trash2Icon,
  Edit3Icon, PlusIcon, XIcon, BookOpenIcon, SaveIcon,
  FilterIcon, LayersIcon, ChevronDownIcon,
  BarcodeIcon
} from 'lucide-react';

const InventoryPage = () => {
  const { books, addBook, deleteBook, editBook } = useBooks();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSection, setSelectedSection] = useState('Todos');
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentBookId, setCurrentBookId] = useState<string | null>(null);

  const sections = ['Todos', 'Biblioteca General', 'Hemeroteca', 'Referencia', 'Juvenil/Infantil'];

  const initialFormState = {
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
      callNumber: ''
    },
    section: 'Biblioteca General'
  };

  const [formData, setFormData] = useState(initialFormState);

  const handleEditClick = (book: Book) => {
    setFormData({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      category: book.category,
      publisher: book.publisher || '',
      yearPublish: book.yearPublish?.toString() || '',
      edition: book.edition || '',
      language: book.language || 'Español',
      stockTotal: book.stockTotal,
      barcode: book.barcode || '',
      description: book.description || '',
      location: {
        shelf: book.location?.shelf || '',
        level: book.location?.level || '',
        callNumber: book.location?.callNumber || ''
      },
      // NORMALIZACIÓN AL EDITAR: Si viene vacío de la DB, ponemos el default
      section: book.section && book.section.trim() !== "" ? book.section : 'Biblioteca General'
    });
    setCurrentBookId(book._id);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSubmit = {
      ...formData,
      yearPublish: Number(formData.yearPublish),
      stockTotal: Number(formData.stockTotal)
    };

    const result = isEditing
      ? await editBook(currentBookId!, dataToSubmit)
      : await addBook(dataToSubmit);

    if (result.success) {
      setShowModal(false);
      setIsEditing(false);
      setCurrentBookId(null);
      setFormData(initialFormState);
    } else {
      alert(result.error);
    }
  };

  const filteredBooks = books.filter(book => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.isbn.includes(searchTerm);

    // NORMALIZACIÓN EN FILTRO
    const bookSection = book.section && book.section.trim() !== "" ? book.section : 'Biblioteca General';
    const matchesSection = selectedSection === 'Todos' || bookSection === selectedSection;

    return matchesSearch && matchesSection;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-800 tracking-tight">Inventario General</h1>
          <p className="text-gray-500 font-medium mt-1 text-lg">Control de Acervo y Secciones Especializadas</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80 group">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              placeholder="Buscar material..."
              className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button
            onClick={() => { setIsEditing(false); setFormData(initialFormState); setShowModal(true); }}
            className="flex items-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
          >
            <PlusIcon className="w-6 h-6" />
            <span className="hidden md:inline">Añadir Recurso</span>
          </button>
        </div>
      </div>

      {/* FILTROS DE SECCIÓN */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-3 rounded-[2rem] border border-gray-100 shadow-sm">
        <div className="px-4 flex items-center gap-2 text-gray-400 border-r border-gray-100 mr-2">
          <FilterIcon size={16} />
          <span className="text-[10px] font-black uppercase tracking-widest">Secciones</span>
        </div>
        {sections.map((sec) => (
          <button
            key={sec}
            onClick={() => setSelectedSection(sec)}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${selectedSection === sec
                ? 'bg-gray-900 text-white shadow-lg'
                : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
              }`}
          >
            {sec}
          </button>
        ))}
      </div>

      {/* TABLA DE RESULTADOS */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Identificación del Recurso</th>
              <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Estado Stock</th>
              <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Localización Física</th>
              <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredBooks.map((book) => {
              // DETERMINAMOS LA SECCIÓN REAL PARA EL RENDER
              const currentSection = book.section && book.section.trim() !== "" ? book.section : 'Biblioteca General';

              return (
                <tr key={book._id} className="hover:bg-blue-50/10 transition-colors group">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className={`p-4 rounded-2xl flex items-center justify-center ${currentSection === 'Referencia' ? 'bg-amber-100 text-amber-600' :
                          currentSection === 'Hemeroteca' ? 'bg-purple-100 text-purple-600' :
                            currentSection === 'Juvenil/Infantil' ? 'bg-pink-100 text-pink-600' : 'bg-blue-100 text-blue-600'
                        }`}>
                        <BookOpenIcon size={22} />
                      </div>
                      <div>
                        <span className="block font-black text-gray-800 text-lg leading-tight">{book.title}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm font-bold text-gray-400">{book.author}</span>
                          <span className="text-gray-300">•</span>

                          {/* BADGE DINÁMICO CORREGIDO */}
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase border ${currentSection === 'Hemeroteca' ? 'border-purple-200 text-purple-600' :
                              currentSection === 'Referencia' ? 'border-amber-200 text-amber-600' :
                                'border-blue-200 text-blue-600'
                            }`}>
                            {currentSection}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="p-6 text-center">
                    <div className="flex flex-col items-center">
                      <span className={`px-4 py-1 rounded-full font-black text-xs ${book.stockAvailable > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {book.stockAvailable} / {book.stockTotal}
                      </span>
                      <span className="text-[9px] font-bold text-gray-300 uppercase mt-1">Disponibles</span>
                    </div>
                  </td>

                  <td className="p-6">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                      <MapPinIcon size={14} className="text-orange-500" />
                      Estante {book.location?.shelf || '-'}, Nivel {book.location?.level || '-'}
                    </div>
                    <p className="text-[10px] text-gray-400 font-mono mt-1 ml-5">{book.location?.callNumber || 'Sin Signatura'}</p>
                  </td>

                  <td className="p-6 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEditClick(book)} className="p-3 bg-white border border-gray-100 text-gray-400 hover:text-blue-600 rounded-xl transition-all shadow-sm">
                        <Edit3Icon size={18} />
                      </button>
                      <button onClick={() => { if (window.confirm('¿Borrar registro?')) deleteBook(book._id) }} className="p-3 bg-white border border-gray-100 text-gray-400 hover:text-red-600 rounded-xl transition-all shadow-sm">
                        <Trash2Icon size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* MODAL DE REGISTRO / EDICIÓN */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-gray-900/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in duration-300">

            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                  <PlusIcon size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-800 tracking-tight">{isEditing ? 'Actualizar Ficha' : 'Nueva Ficha Técnica'}</h2>
                  <p className="text-sm text-gray-500 font-medium tracking-wide">Clasificación de Material Bibliográfico</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="p-3 hover:bg-white rounded-2xl transition-all">
                <XIcon size={24} className="text-gray-400" />
              </button>
            </div>

            <form id="bookForm" onSubmit={handleSubmit} className="p-10 overflow-y-auto space-y-10 custom-scrollbar">

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase ml-2">Título del Libro</label>
                  <input required className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold"
                    value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase ml-2">ISBN</label>
                  <input required className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono"
                    value={formData.isbn} onChange={e => setFormData({ ...formData, isbn: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-blue-500 uppercase ml-2 flex items-center gap-1">
                    <BarcodeIcon size={14} /> Barcode
                  </label>
                  <input
                    placeholder="Escanear o digitar..."
                    className="w-full p-4 bg-blue-50/30 border border-blue-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono text-blue-700"
                    value={formData.barcode}
                    onChange={e => setFormData({ ...formData, barcode: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase ml-2">Autor</label>
                  <input required className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.author} onChange={e => setFormData({ ...formData, author: e.target.value })} />
                </div>

                {/* SELECT DE SECCIÓN */}
                <div className="space-y-2 relative">
                  <label className="text-xs font-black text-blue-600 uppercase ml-2">Sección Destino</label>
                  <div className="relative">
                    <select required className="w-full p-4 bg-blue-50 border-2 border-blue-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-black text-blue-800 appearance-none"
                      value={formData.section} onChange={e => setFormData({ ...formData, section: e.target.value })}>
                      <option value="Biblioteca General">Biblioteca General</option>
                      <option value="Hemeroteca">Hemeroteca</option>
                      <option value="Referencia">Colección de Referencia</option>
                      <option value="Juvenil/Infantil">Sección Juvenil/Infantil</option>
                    </select>
                    <ChevronDownIcon className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-400 pointer-events-none" size={20} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase ml-2">Categoría Literaria</label>
                  <input required className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-6 border-t border-gray-50">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase ml-2">Editorial</label>
                  <input className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.publisher} onChange={e => setFormData({ ...formData, publisher: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase ml-2">Año Pub.</label>
                  <input type="number" className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.yearPublish} onChange={e => setFormData({ ...formData, yearPublish: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase ml-2">Stock Total</label>
                  <input type="number" className="w-full p-4 bg-blue-600 text-white font-black rounded-2xl outline-none"
                    value={formData.stockTotal} onChange={e => setFormData({ ...formData, stockTotal: parseInt(e.target.value) })} />
                </div>
              </div>

              <div className="p-8 bg-orange-50/30 rounded-[2.5rem] border border-orange-100">
                <h4 className="text-xs font-black text-orange-600 uppercase tracking-widest mb-6 ml-2 flex items-center gap-2">
                  <MapPinIcon size={16} /> Ubicación en Almacén
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-orange-400 uppercase ml-2">Estante</label>
                    <input placeholder="Ej: A-1" className="w-full p-4 bg-white rounded-2xl outline-none border border-orange-100 focus:ring-2 focus:ring-orange-500 transition-all"
                      value={formData.location.shelf} onChange={e => setFormData({ ...formData, location: { ...formData.location, shelf: e.target.value } })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-orange-400 uppercase ml-2">Nivel</label>
                    <input placeholder="Ej: 2" className="w-full p-4 bg-white rounded-2xl outline-none border border-orange-100 focus:ring-2 focus:ring-orange-500 transition-all"
                      value={formData.location.level} onChange={e => setFormData({ ...formData, location: { ...formData.location, level: e.target.value } })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-orange-400 uppercase ml-2">Signatura (Dewey)</label>
                    <input placeholder="Ej: 823.9" className="w-full p-4 bg-white rounded-2xl outline-none border border-orange-100 focus:ring-2 focus:ring-orange-500 transition-all font-mono"
                      value={formData.location.callNumber} onChange={e => setFormData({ ...formData, location: { ...formData.location, callNumber: e.target.value } })} />
                  </div>
                </div>
              </div>
            </form>

            <div className="p-8 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-4">
              <button onClick={() => setShowModal(false)} className="px-8 py-4 text-gray-500 font-bold hover:text-gray-700 transition-all">
                Cancelar
              </button>
              <button form="bookForm" type="submit" className="px-12 py-4 bg-gray-900 text-white rounded-2xl font-black flex items-center gap-2 hover:bg-blue-600 transition-all shadow-xl">
                <SaveIcon size={20} />
                {isEditing ? 'Actualizar Registro' : 'Guardar en Inventario'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;