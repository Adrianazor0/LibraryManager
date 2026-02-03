export interface IBook {
    title: string;
    author: string;
    isbn: string;
    category: string;
    stockTotal: number;
    stockAvailable: number;
    barcode?: string; 
}

export interface IBorrow {
    BookId: string;
    userId: string;
    departureDate: Date;
    dueDate: Date;
    state: 'pendiente' | 'devuelto' | 'atrasado';
}

export interface IUser {
    _id?: string;
    enrollmentID: string;
    name: string;
    lastname: string;
    email: string;
    password?: string;
    role: 'admin' | 'estudiante' | 'docente'; 
    status: 'activo' | 'suspendido';
    profilePhoto?: string;
    qrAccess?: string;
    createdAt?: Date;
    updatedAt?: Date;
}