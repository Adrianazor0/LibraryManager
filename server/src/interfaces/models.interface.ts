export interface ILibro {
    titulo: string;
    autor: string;
    isbn: string;
    categoria: string;
    stockTotal: number;
    stockDisponible: number;
    codigoBarras?: string; 
}

export interface IPrestamo {
    libroId: string;
    usuarioId: string;
    fechaSalida: Date;
    fechaVencimiento: Date;
    estado: 'pendiente' | 'devuelto' | 'atrasado';
}