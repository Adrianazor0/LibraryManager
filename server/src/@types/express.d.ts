import { User } from '../interfaces/models.interface'; // Ajusta la ruta a tu interfaz de usuario

declare global {
  namespace Express {
    interface Request {
      user?: any; // O mejor: user?: User;
    }
  }
}