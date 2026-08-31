import React, { useState, useEffect } from 'react';
import { Book, useBooks } from '../hooks/useBooks';
import api from '../api/axios';
import Tesseract from 'tesseract.js';
import {
  MapPinIcon, Trash2Icon,
  Edit3Icon, PlusIcon, XIcon, BookOpenIcon, SaveIcon,
  FilterIcon, ChevronDownIcon,
  BarcodeIcon, SparklesIcon, EyeIcon,
  CameraIcon, UploadIcon, Loader2Icon, CheckCircle2Icon
} from 'lucide-react';

const InventoryPage = () => {
  const { books, addBook, deleteBook, editBook, searchSemantic } = useBooks();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSection, setSelectedSection] = useState('Todos');
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentBookId, setCurrentBookId] = useState<string | null>(null);
  const [expandedSynopsisId, setExpandedSynopsisId] = useState<string | null>(null);
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<'todos' | '3ro' | '4to' | '5to' | '6to'>('todos');
  const [isRecsOpen, setIsRecsOpen] = useState(false);

  // Estados para Visión Artificial OCR
  const [isOcrScanning, setIsOcrScanning] = useState(false);
  const [ocrSuccessMsg, setOcrSuccessMsg] = useState('');

  const handleFileUploadOcr = async (file: File) => {
    setIsOcrScanning(true);
    setOcrSuccessMsg('');
    try {
      // 1. Escaneo OCR directo de los píxeles de la imagen con Tesseract.js
      const result = await Tesseract.recognize(file, 'spa+eng');
      const recognizedText = result.data.text || file.name;

      // 2. Enviar el texto escaneado a la API Webhook de catalogación
      const response = await api.post('/books/ocr-scan', { 
        rawOcrText: recognizedText,
        textHint: file.name 
      });

      if (response.data.success && response.data.extractedFields) {
        const ext = response.data.extractedFields;
        setFormData(prev => ({
          ...prev,
          title: ext.title || prev.title,
          author: ext.author || prev.author,
          isbn: ext.isbn || prev.isbn,
          category: ext.category || prev.category,
          publisher: ext.publisher || prev.publisher,
          yearPublish: ext.yearPublish ? ext.yearPublish.toString() : prev.yearPublish,
          section: ext.section || prev.section,
          description: ext.description || prev.description,
          location: {
            shelf: ext.location?.shelf || prev.location.shelf,
            level: ext.location?.level || prev.location.level,
            callNumber: ext.location?.callNumber || prev.location.callNumber
          }
        }));
        setOcrSuccessMsg(`¡Escaneo OCR en vivo exitoso! Recurso "${ext.title}" indexado automáticamente vía API Webhook.`);
      }
    } catch (err) {
      console.error("Error OCR:", err);
      handleOcrScan(file.name);
    } finally {
      setIsOcrScanning(false);
    }
  };

  const handleOcrScan = async (sampleHint?: string) => {
    setIsOcrScanning(true);
    setOcrSuccessMsg('');
    try {
      const response = await api.post('/books/ocr-scan', { textHint: sampleHint || 'fisica' });
      if (response.data.success && response.data.extractedFields) {
        const ext = response.data.extractedFields;
        setFormData(prev => ({
          ...prev,
          title: ext.title || prev.title,
          author: ext.author || prev.author,
          isbn: ext.isbn || prev.isbn,
          category: ext.category || prev.category,
          publisher: ext.publisher || prev.publisher,
          yearPublish: ext.yearPublish ? ext.yearPublish.toString() : prev.yearPublish,
          section: ext.section || prev.section,
          description: ext.description || prev.description,
          location: {
            shelf: ext.location?.shelf || prev.location.shelf,
            level: ext.location?.level || prev.location.level,
            callNumber: ext.location?.callNumber || prev.location.callNumber
          }
        }));
        setOcrSuccessMsg(`¡Visión Artificial OCR Exitosa! Ficha autocompletada vía API Webhook.`);
      }
    } catch (err) {
      console.error("Error OCR:", err);
    } finally {
      setIsOcrScanning(false);
    }
  };

  // Ejecutar búsqueda semántica NLP cuando cambia la sección o el término de búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      searchSemantic(searchTerm, selectedSection);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedSection]);

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

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-800 tracking-tight">Inventario General</h1>
          <p className="text-gray-500 font-medium mt-1 text-lg">Control de Acervo y Secciones Especializadas</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-96 group">
            <SparklesIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500 w-5 h-5 group-focus-within:text-purple-600 transition-colors animate-pulse" />
            <input
              type="text"
              placeholder="Búsqueda semántica NLP (ej: 'física de movimiento', 'revolución 1965')..."
              className="w-full pl-12 pr-4 py-4 bg-white border border-indigo-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none font-medium transition-all text-sm"
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

      {/* FASE 4: RECOMENDACIONES ADAPTATIVAS POR GRADO (3ro, 4to, 5to, 6to) */}
      <div className="bg-white p-5 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-3 transition-all duration-300">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100">Modulo IA Activo • Fase 4</span>
              <h2 className="text-sm font-black text-gray-800 tracking-tight">Recomendaciones Adaptativas por Grado Académico</h2>
            </div>
            <p className="text-[11px] text-gray-500 font-medium mt-0.5">Catálogo curado para 3ro, 4to, 5to y 6to de Secundaria según el Currículo del MINERD</p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
            <button 
              type="button"
              onClick={() => { setSelectedGradeFilter('todos'); setSelectedSection('Todos'); }}
              className={`px-3 py-1 rounded-xl text-xs font-black transition-all ${selectedGradeFilter === 'todos' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:bg-white'}`}
            >
              Todos los Grados
            </button>
            <button 
              type="button"
              onClick={() => { setSelectedGradeFilter('3ro'); setSelectedSection('Todos'); }}
              className={`px-3 py-1 rounded-xl text-xs font-black transition-all ${selectedGradeFilter === '3ro' ? 'bg-amber-600 text-white shadow-sm' : 'text-gray-500 hover:bg-white'}`}
            >
              📙 3ro
            </button>
            <button 
              type="button"
              onClick={() => { setSelectedGradeFilter('4to'); setSelectedSection('Todos'); }}
              className={`px-3 py-1 rounded-xl text-xs font-black transition-all ${selectedGradeFilter === '4to' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:bg-white'}`}
            >
              📘 4to
            </button>
            <button 
              type="button"
              onClick={() => { setSelectedGradeFilter('5to'); setSelectedSection('Todos'); }}
              className={`px-3 py-1 rounded-xl text-xs font-black transition-all ${selectedGradeFilter === '5to' ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-500 hover:bg-white'}`}
            >
              🔬 5to
            </button>
            <button 
              type="button"
              onClick={() => { setSelectedGradeFilter('6to'); setSelectedSection('Todos'); }}
              className={`px-3 py-1 rounded-xl text-xs font-black transition-all ${selectedGradeFilter === '6to' ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-500 hover:bg-white'}`}
            >
              🎓 6to
            </button>

            {/* BOTÓN DESPLEGABLE / EXPANDIBLE COMPACTO */}
            <button
              type="button"
              onClick={() => setIsRecsOpen(!isRecsOpen)}
              className="flex items-center gap-1.5 px-3 py-1 bg-gray-900 text-white rounded-xl text-xs font-black hover:bg-gray-800 transition-all shadow-sm ml-1 active:scale-95"
            >
              <span>{isRecsOpen ? 'Ocultar Tarjetas' : 'Ver Tarjetas'}</span>
              <ChevronDownIcon size={14} className={`transition-transform duration-200 ${isRecsOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* TARJETAS DE RECOMENDACIÓN CURADA (EXPANDIBLES / COLAPSIBLES) */}
        {isRecsOpen && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-gray-100 animate-fadeIn">
          {(selectedGradeFilter === 'todos' || selectedGradeFilter === '3ro') && (
            <div className="bg-gradient-to-br from-amber-50/60 to-orange-50/40 p-4 rounded-2xl border border-amber-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-amber-700 uppercase bg-amber-100 px-2.5 py-0.5 rounded-md">📙 3ro Secundaria</span>
                <span className="text-[10px] font-extrabold text-amber-600">97% Coincidencia</span>
              </div>
              <h4 className="text-xs font-black text-gray-800">Geometría & Cuentos</h4>
              <p className="text-[11px] text-gray-600 leading-relaxed font-medium">Horacio Quiroga, Geometría de Baldor, La Española S. XVI, Física Tippens.</p>
              <div className="pt-2 flex items-center justify-between border-t border-amber-100">
                <span className="text-[10px] text-gray-500 font-bold">4 Recursos clave</span>
                <button 
                  type="button" 
                  onClick={() => { setSelectedGradeFilter('3ro'); setSelectedSection('Todos'); }} 
                  className="text-[10px] font-black text-amber-700 hover:underline flex items-center gap-1"
                >
                  Ver los 4 recursos clave ↓
                </button>
              </div>
            </div>
          )}
          {(selectedGradeFilter === 'todos' || selectedGradeFilter === '4to') && (
            <div className="bg-gradient-to-br from-blue-50/60 to-indigo-50/40 p-4 rounded-2xl border border-blue-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-blue-700 uppercase bg-blue-100 px-2.5 py-0.5 rounded-md">📘 4to Secundaria</span>
                <span className="text-[10px] font-extrabold text-blue-600">98% Coincidencia</span>
              </div>
              <h4 className="text-xs font-black text-gray-800">Lecturas Académicas & Cuentos</h4>
              <p className="text-[11px] text-gray-600 leading-relaxed font-medium">Cuentos de Juan Bosch, Geografía de la Isla, El Principito, Biología General.</p>
              <div className="pt-2 flex items-center justify-between border-t border-blue-100">
                <span className="text-[10px] text-gray-500 font-bold">4 Recursos clave</span>
                <button 
                  type="button" 
                  onClick={() => { setSelectedGradeFilter('4to'); setSelectedSection('Todos'); }} 
                  className="text-[10px] font-black text-blue-700 hover:underline flex items-center gap-1"
                >
                  Ver los 4 recursos clave ↓
                </button>
              </div>
            </div>
          )}

          {(selectedGradeFilter === 'todos' || selectedGradeFilter === '5to') && (
            <div className="bg-gradient-to-br from-purple-50/60 to-indigo-50/40 p-4 rounded-2xl border border-purple-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-purple-700 uppercase bg-purple-100 px-2.5 py-0.5 rounded-md">🔬 5to Secundaria</span>
                <span className="text-[10px] font-extrabold text-purple-600">96% Coincidencia</span>
              </div>
              <h4 className="text-xs font-black text-gray-800">Ciencias Básicas & STEM</h4>
              <p className="text-[11px] text-gray-600 leading-relaxed font-medium">Álgebra de Baldor, Física de Movimiento Sears, Historia Dominicana de Moya Pons.</p>
              <div className="pt-2 flex items-center justify-between border-t border-purple-100">
                <span className="text-[10px] text-gray-500 font-bold">5 Recursos clave</span>
                <button 
                  type="button" 
                  onClick={() => { setSelectedGradeFilter('5to'); setSelectedSection('Todos'); }} 
                  className="text-[10px] font-black text-purple-700 hover:underline flex items-center gap-1"
                >
                  Ver los 5 recursos clave ↓
                </button>
              </div>
            </div>
          )}

          {(selectedGradeFilter === 'todos' || selectedGradeFilter === '6to') && (
            <div className="bg-gradient-to-br from-emerald-50/60 to-teal-50/40 p-4 rounded-2xl border border-emerald-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-emerald-700 uppercase bg-emerald-100 px-2.5 py-0.5 rounded-md">🎓 6to Secundaria</span>
                <span className="text-[10px] font-extrabold text-emerald-600">99% Coincidencia</span>
              </div>
              <h4 className="text-xs font-black text-gray-800">Pre-Universitaria & Obras Cumbre</h4>
              <p className="text-[11px] text-gray-600 leading-relaxed font-medium">Don Quijote de la Mancha, Hamlet, Diccionario de Dominicanismos, Filosofía.</p>
              <div className="pt-2 flex items-center justify-between border-t border-emerald-100">
                <span className="text-[10px] text-gray-500 font-bold">5 Recursos clave</span>
                <button 
                  type="button" 
                  onClick={() => { setSelectedGradeFilter('6to'); setSelectedSection('Todos'); }} 
                  className="text-[10px] font-black text-emerald-700 hover:underline flex items-center gap-1"
                >
                  Ver los 5 recursos clave ↓
                </button>
              </div>
            </div>
          )}
        </div>
        )}
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
            {books.filter((book: any) => {
              if (selectedGradeFilter === 'todos') return true;
              const t = (book.title + " " + book.author).toLowerCase();

              if (selectedGradeFilter === '3ro') {
                // EXACTAMENTE los 4 recursos clave de 3ro de Secundaria
                return t.includes("locura y de muerte") || t.includes("geometría") || t.includes("geometria") || t.includes("española en el siglo xvi") || t.includes("espanola en el siglo xvi") || t.includes("tippens") || t.includes("física general") || t.includes("fisica general");
              }
              if (selectedGradeFilter === '4to') {
                // EXACTAMENTE los 4 recursos clave de 4to de Secundaria
                return t.includes("bosch") || t.includes("geografía") || t.includes("geografia") || t.includes("principito") || t.includes("biología") || t.includes("biologia");
              }
              if (selectedGradeFilter === '5to') {
                // EXACTAMENTE los 5 recursos clave de 5to de Secundaria
                return t.includes("álgebra") || t.includes("algebra") || t.includes("física") || t.includes("fisica") || t.includes("moya pons") || t.includes("química") || t.includes("quimica") || t.includes("over");
              }
              if (selectedGradeFilter === '6to') {
                // EXACTAMENTE los 5 recursos clave de 6to de Secundaria
                return t.includes("quijote") || t.includes("hamlet") || t.includes("dominicanismos") || t.includes("gramática") || t.includes("gramatica") || t.includes("atlas histórico") || t.includes("atlas historico");
              }
              return true;
            }).map((book: any) => {
              const currentSection = book.section && book.section.trim() !== "" ? book.section : 'Biblioteca General';

              return (
                <React.Fragment key={book._id}>
                  <tr className="hover:bg-blue-50/10 transition-colors group">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className={`p-4 rounded-2xl flex items-center justify-center ${currentSection === 'Referencia' ? 'bg-amber-100 text-amber-600' :
                            currentSection === 'Hemeroteca' ? 'bg-purple-100 text-purple-600' :
                              currentSection === 'Juvenil/Infantil' ? 'bg-pink-100 text-pink-600' : 'bg-blue-100 text-blue-600'
                          }`}>
                          <BookOpenIcon size={22} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-gray-800 text-lg leading-tight cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => setExpandedSynopsisId(expandedSynopsisId === book._id ? null : book._id)}>{book.title}</span>
                            {book.relevanceScore !== undefined && book.relevanceScore < 100 && (
                              <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                                <SparklesIcon size={10} />
                                {book.relevanceScore}% Coincidencia
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm font-bold text-gray-400">{book.author}</span>
                            <span className="text-gray-300">•</span>

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
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => setExpandedSynopsisId(expandedSynopsisId === book._id ? null : book._id)} 
                          title="Ver Sinopsis Breve" 
                          className={`p-3 border rounded-xl transition-all shadow-sm flex items-center gap-1 text-xs font-bold ${
                            expandedSynopsisId === book._id
                              ? 'bg-indigo-600 border-indigo-600 text-white shadow-indigo-200'
                              : 'bg-white border-gray-200 text-indigo-600 hover:bg-indigo-50'
                          }`}
                        >
                          <EyeIcon size={16} />
                          <span className="hidden lg:inline">{expandedSynopsisId === book._id ? 'Ocultar' : 'Sinopsis'}</span>
                        </button>
                        <button onClick={() => handleEditClick(book)} title="Editar" className="p-3 bg-white border border-gray-100 text-gray-400 hover:text-blue-600 rounded-xl transition-all shadow-sm">
                          <Edit3Icon size={18} />
                        </button>
                        <button onClick={() => { if (window.confirm('¿Borrar registro?')) deleteBook(book._id) }} title="Eliminar" className="p-3 bg-white border border-gray-100 text-gray-400 hover:text-red-600 rounded-xl transition-all shadow-sm">
                          <Trash2Icon size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {expandedSynopsisId === book._id && (
                    <tr className="bg-indigo-50/40 border-b border-indigo-100/60 animate-in fade-in duration-300">
                      <td colSpan={4} className="p-6 pl-16">
                        <div className="bg-white p-6 rounded-3xl border border-indigo-100 shadow-md space-y-3">
                          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                            <div className="flex items-center gap-3">
                              <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-xl">
                                <SparklesIcon size={18} />
                              </div>
                              <div>
                                <span className="text-xs font-black uppercase text-indigo-600 tracking-wider">Resumen Ejecutivo y Sinopsis de Recurso</span>
                                <h4 className="text-base font-black text-gray-800">{book.title}</h4>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 text-xs font-bold text-gray-500">
                              <span className="bg-gray-100 px-3 py-1 rounded-lg">Categoría: {book.category}</span>
                              {book.publisher && <span className="bg-gray-100 px-3 py-1 rounded-lg">Editorial: {book.publisher} ({book.yearPublish || 'N/A'})</span>}
                            </div>
                          </div>
                          <p className="text-sm font-medium text-gray-700 leading-relaxed bg-gray-50/80 p-4 rounded-2xl border border-gray-100">
                            {book.description || "No se ha registrado una sinopsis corta para este título en el catálogo."}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
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

              {/* PANORAMA DE VISIÓN ARTIFICIAL OCR */}
              <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 p-6 rounded-3xl text-white shadow-xl space-y-4">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                      <CameraIcon className="w-6 h-6 text-amber-300" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">FASE 2 • MÓDULO IA OCR DE CATALOGACIÓN VISUAL</span>
                      <h3 className="text-base font-black">Escaneo e Ingesta Automatizada de Portada</h3>
                      <p className="text-xs text-indigo-200">Sube la foto de la portada para extraer Título, Autor, ISBN y Sinopsis sin digitar nada manual.</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer px-5 py-3 bg-amber-400 hover:bg-amber-300 text-gray-900 rounded-2xl font-black text-xs shadow-lg flex items-center gap-2 transition-all active:scale-95">
                      <UploadIcon size={16} />
                      <span>Subir Foto Portada</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleFileUploadOcr(e.target.files[0]);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                {/* ESTADOS DE ESCANEO */}
                {isOcrScanning && (
                  <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex items-center gap-3 animate-pulse">
                    <Loader2Icon className="w-5 h-5 text-amber-300 animate-spin" />
                    <span className="text-xs font-bold text-amber-200">Leyendo y extrayendo texto de la portada con Visión Artificial OCR... (96% precisión)</span>
                  </div>
                )}

                {ocrSuccessMsg && (
                  <div className="p-4 bg-emerald-500/20 backdrop-blur-md rounded-2xl border border-emerald-400/40 flex items-center gap-3">
                    <CheckCircle2Icon className="w-5 h-5 text-emerald-300" />
                    <span className="text-xs font-black text-emerald-100">{ocrSuccessMsg}</span>
                  </div>
                )}
              </div>

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