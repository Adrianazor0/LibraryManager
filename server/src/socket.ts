import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';

let io: SocketIOServer | null = null;

export const initSocket = (server: HttpServer): SocketIOServer => {
  io = new SocketIOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    }
  });

  io.on('connection', (socket) => {
    console.log(`⚡ Cliente conectado a Socket.IO: ${socket.id}`);

    // Unirse a sala según ID de usuario (para notificaciones a la app móvil)
    socket.on('join_user_room', (userId: string) => {
      if (userId) {
        socket.join(`user_${userId}`);
        console.log(`📌 Socket ${socket.id} se unió a la sala: user_${userId}`);
      }
    });

    // Unirse a sala de administradores/bibliotecarios (para notificaciones a la web)
    socket.on('join_admin_room', () => {
      socket.join('admin_room');
      console.log(`🛡️ Socket ${socket.id} se unió a la sala: admin_room`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Cliente desconectado de Socket.IO: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = (): SocketIOServer | null => {
  return io;
};
