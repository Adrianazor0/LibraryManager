import React, { useState, useRef, useEffect } from 'react';
import api from '../api/axios';
import { XIcon, SendIcon, SparklesIcon, BotIcon, UserIcon } from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  suggestedBooks?: any[];
  timestamp: string;
}

export const RagChatbotModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMsg, setInputMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: '¡Hola! 👋 Soy **BiblioBot**, tu Asistente Conversacional Inteligente 24/7 del Liceo Vespertino La Ureña. ¿En qué te puedo ayudar hoy? Puedes preguntarme por recomendaciones de libros, horarios de préstamo o la ubicación física de cualquier tema.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMsg.trim() || isLoading) return;

    const userText = inputMsg.trim();
    setInputMsg('');

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const lastBotMsg = [...messages].reverse().find(m => m.sender === 'bot' && m.suggestedBooks && m.suggestedBooks.length > 0);
      const lastSuggestedBooks = lastBotMsg ? lastBotMsg.suggestedBooks : [];

      const response = await api.post('/chat/ask', { message: userText, lastSuggestedBooks });
      if (response.data.success) {
        const botMsg: Message = {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: response.data.reply,
          suggestedBooks: response.data.suggestedBooks || [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, botMsg]);
      }
    } catch (err) {
      console.error("Error RAG Bot:", err);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: 'Lo siento, tuve un problema temporal al consultar la base de datos de la biblioteca. Por favor intenta de nuevo.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[120]">
      {/* BOTÓN FLOTANTE */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative group bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white p-4 rounded-full shadow-2xl hover:scale-105 transition-all duration-300 flex items-center gap-3 border-2 border-white/20"
        >
          <div className="relative">
            <BotIcon size={26} className="text-amber-300 animate-bounce" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-indigo-900"></span>
          </div>
          <span className="font-black text-sm pr-2 hidden md:inline tracking-wide">Asistente IA 24/7</span>
          <span className="absolute -top-2 -left-2 bg-amber-400 text-indigo-950 font-black text-[9px] px-2 py-0.5 rounded-full shadow">RAG</span>
        </button>
      )}

      {/* DRAWER / MODAL DEL CHATBOT */}
      {isOpen && (
        <div className="bg-white w-[92vw] sm:w-[420px] h-[580px] max-h-[85vh] rounded-[2.5rem] shadow-2xl border border-indigo-100 flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
          
          {/* HEADER DEL BOT */}
          <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-blue-900 p-5 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                <BotIcon size={22} className="text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-base tracking-tight">BiblioBot 24/7</h3>
                  <span className="bg-emerald-400/20 text-emerald-300 text-[9px] font-black px-2 py-0.5 rounded-full border border-emerald-400/30">ONLINE</span>
                </div>
                <p className="text-[11px] text-indigo-200 font-medium">Asistente RAG • Liceo Vespertino La Ureña</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-all">
              <XIcon size={20} className="text-indigo-200" />
            </button>
          </div>

          {/* ÁREA DE MENSAJES */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50/50 custom-scrollbar">
            {messages.map(msg => (
              <div key={msg.id} className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.sender === 'bot' && (
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-amber-300 shadow-sm flex-shrink-0 mt-1">
                    <BotIcon size={18} />
                  </div>
                )}
                
                <div className={`max-w-[82%] rounded-2xl p-4 space-y-3 ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-none shadow-md font-medium text-sm'
                    : 'bg-white text-gray-800 border border-indigo-50 shadow-sm rounded-bl-none text-sm'
                }`}>
                  <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>

                  {/* CARDS DE LIBROS SUGERIDOS */}
                  {msg.suggestedBooks && msg.suggestedBooks.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-gray-100">
                      <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider block">Libros sugeridos en catálogo:</span>
                      {msg.suggestedBooks.map(b => (
                        <div key={b._id} className="bg-indigo-50/60 p-3 rounded-xl border border-indigo-100/60 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-black text-gray-800">{b.title}</span>
                            <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md ${b.stockAvailable > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {b.stockAvailable > 0 ? `${b.stockAvailable} disp.` : 'Agotado'}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 font-medium">{b.author} • {b.category}</p>
                          {b.location && (
                            <p className="text-[10px] text-indigo-600 font-bold">📍 Estante {b.location.shelf}, Nivel {b.location.level}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <span className={`text-[9px] block text-right font-medium ${msg.sender === 'user' ? 'text-indigo-200' : 'text-gray-400'}`}>
                    {msg.timestamp}
                  </span>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-sm flex-shrink-0 mt-1">
                    <UserIcon size={16} />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-amber-300 shadow-sm flex-shrink-0 animate-pulse">
                  <BotIcon size={18} />
                </div>
                <div className="bg-white p-4 rounded-2xl border border-indigo-50 shadow-sm rounded-bl-none flex items-center gap-2">
                  <SparklesIcon size={16} className="text-indigo-600 animate-spin" />
                  <span className="text-xs font-bold text-gray-500">Consultando acervo con RAG...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* SUGERENCIAS RÁPIDAS */}
          <div className="px-4 py-2 bg-indigo-50/50 border-t border-indigo-100/50 flex flex-wrap gap-1.5">
            <span 
              onClick={() => { setInputMsg('Recomiéndame libros de física para 5to'); }}
              className="text-[10px] font-bold bg-white text-indigo-700 hover:bg-indigo-600 hover:text-white px-2.5 py-1 rounded-full border border-indigo-200 cursor-pointer transition-all shadow-sm"
            >
              🔬 Libros de Física
            </span>
            <span 
              onClick={() => { setInputMsg('¿Cuáles son las reglas de préstamo?'); }}
              className="text-[10px] font-bold bg-white text-purple-700 hover:bg-purple-600 hover:text-white px-2.5 py-1 rounded-full border border-purple-200 cursor-pointer transition-all shadow-sm"
            >
              📚 Horarios y Préstamos
            </span>
            <span 
              onClick={() => { setInputMsg('¿Tienen cuentos de Juan Bosch o Pinocho?'); }}
              className="text-[10px] font-bold bg-white text-emerald-700 hover:bg-emerald-600 hover:text-white px-2.5 py-1 rounded-full border border-emerald-200 cursor-pointer transition-all shadow-sm"
            >
              📖 Cuentos y Novelas
            </span>
          </div>

          {/* INPUT FORM */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
            <input
              type="text"
              placeholder="Pregúntale a BiblioBot sobre libros o reglamentos..."
              className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              value={inputMsg}
              onChange={e => setInputMsg(e.target.value)}
            />
            <button
              type="submit"
              disabled={isLoading || !inputMsg.trim()}
              className="p-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl transition-all shadow-md active:scale-95"
            >
              <SendIcon size={16} />
            </button>
          </form>

        </div>
      )}
    </div>
  );
};
