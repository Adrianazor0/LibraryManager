import { Schema, model } from 'mongoose';
import { IBook } from '../interfaces/models.interface';

const bookSchema = new Schema<IBook>({
    title: { type: String, required: true },
    author: { type: String, required: true },
    isbn: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    stockTotal: { type: Number, default: 1 },
    stockAvailable: { type: Number, default: 1 },
    barcode: { type: String }
}, { timestamps: true });

export default model<IBook>('Book', bookSchema);