import { Schema, model } from 'mongoose';
import { IBook } from '../interfaces/models.interface';

const bookSchema = new Schema<IBook>({
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    isbn: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    publisher: { type: String },
    yearPublish: { type: Number },
    edition: { type: String },
    language: { type: String, default: 'Español' },
    stockTotal: { type: Number, default: 1 },
    stockAvailable: { type: Number, default: 1 },
    barcode: { type: String, unique: true, sparse: true }, 
    pages: { type: Number },
    description: { type: String },
    coverImage: { type: String },
    location: {
        shelf: { type: String },
        level: { type: String },
        callNumber: { type: String }
    },
    section: { 
    type: String, 
    required: true,
    default: 'Biblioteca General'
  }
}, { timestamps: true });

export default model<IBook>('Book', bookSchema);