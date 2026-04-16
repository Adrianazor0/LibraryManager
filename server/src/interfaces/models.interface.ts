import { Types } from 'mongoose';

export interface IBook {
    _id?: string;
    title: string;
    author: string;
    isbn: string;
    category: string;
    publisher?: string;
    yearPublish?: number;
    edition?: string;
    language?: string;
    stockTotal: number;
    stockAvailable: number;
    barcode?: string;
    pages?: number;
    description?: string;
    coverImage?: string;
    location?: {
        shelf: string;    
        level: string;    
        callNumber: string; 
    };
    createdAt?: Date;
    updatedAt?: Date;
    section: 'Biblioteca General' | 'Hemeroteca' | 'Referencia' | 'Juvenil/Infantil';
}

export interface IBorrow {
    _id?: string;
    bookId: Types.ObjectId;
    userId: Types.ObjectId;
    approvedBy?: Types.ObjectId;
    departureDate: Date;
    dueDate: Date;
    status: 'pendiente' | 'devuelto' | 'atrasado' | 'prestado';
}

export interface IUser {
    _id?: string;
    enrollmentId: string;
    name: string;
    lastname: string;
    email: string;
    password?: string;
    role: 'admin' | 'estudiante' | 'docente' | 'bibliotecario'; 
    status: 'activo' | 'suspendido' | 'eliminado';
    profilePhoto?: string;
    qrAccess?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IActivityLog {
    action: 'PRESTAMO' | 'DEVOLUCION' | 'EDICION_LIBRO';
    user: Types.ObjectId; 
    book?: Types.ObjectId; 
    timestamp: Date;
    details?: string; 
    }

    export interface ILibraryPolicy {
    _id?: string;
    section: 'Biblioteca General' | 'Hemeroteca' | 'Referencia' | 'Juvenil/Infantil';
    canBorrow: boolean;
    rules: {
        role: 'estudiante' | 'docente' | 'bibliotecario' | 'admin';
        maxBooks: number;
        loanDays: number;
    }[];
    }