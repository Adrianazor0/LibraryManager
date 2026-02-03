import { IUser } from "../../interfaces/models.interface";

declare global {
  namespace Express {
    interface Request {
      user?: any; 
    }
  }
}