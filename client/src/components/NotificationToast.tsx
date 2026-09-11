import React from 'react';
import { BellIcon, XIcon, ArrowRightIcon, BookOpenIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface NotificationItem {
  id: string;
  userName?: string;
  enrollmentId?: string;
  bookTitle: string;
  author?: string;
  requestedDays?: number;
  createdAt: string;
  msg: string;
}

interface NotificationToastProps {
  notifications: NotificationItem[];
  onDismiss: (id: string) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ notifications, onDismiss }) => {
  const navigate = useNavigate();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-6 z-[100] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {notifications.map((notif) => (
        <div
          key={notif.id}
          className="pointer-events-auto bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-blue-400/30 backdrop-blur-md animate-in slide-in-from-top-5 duration-300 flex flex-col gap-2"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-blue-500/20 text-blue-300 rounded-xl border border-blue-400/20 animate-pulse">
                <BellIcon size={18} />
              </div>
              <div>
                <span className="bg-blue-400/20 text-blue-200 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-blue-300/20">
                  📱 NUEVA SOLICITUD MÓVIL
                </span>
                <h4 className="font-extrabold text-sm text-white leading-tight mt-1">{notif.userName}</h4>
              </div>
            </div>
            <button
              onClick={() => onDismiss(notif.id)}
              className="p-1 hover:bg-white/10 rounded-lg text-blue-200 hover:text-white transition-all"
            >
              <XIcon size={16} />
            </button>
          </div>

          <div className="bg-white/10 p-2.5 rounded-xl border border-white/10 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-amber-300 font-bold">
              <BookOpenIcon size={14} />
              <span>{notif.bookTitle}</span>
            </div>
            {notif.author && (
              <p className="text-[11px] text-blue-200 font-medium">Autor: {notif.author}</p>
            )}
            <p className="text-[10px] text-gray-300">
              Solicitud de {notif.requestedDays || 7} días • Matrícula: {notif.enrollmentId || 'N/A'}
            </p>
          </div>

          <button
            onClick={() => {
              onDismiss(notif.id);
              navigate('/dashboard/borrowsLanding');
            }}
            className="flex items-center justify-center gap-2 w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
          >
            <span>Ver y Procesar Solicitud</span>
            <ArrowRightIcon size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};
