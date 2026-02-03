import { Schema, model } from 'mongoose';
import { ILibro } from '../interfaces/models.interface';

const libroSchema = new Schema<ILibro>({
    titulo: { type: String, required: true },
    autor: { type: String, required: true },
    isbn: { type: String, required: true, unique: true },
    categoria: { type: String, required: true },
    stockTotal: { type: Number, default: 1 },
    stockDisponible: { type: Number, default: 1 },
    codigoBarras: { type: String }
}, { timestamps: true });

export default model<ILibro>('Libro', libroSchema);