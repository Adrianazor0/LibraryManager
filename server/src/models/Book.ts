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

bookSchema.index({ title: 'text', description: 'text', author: 'text', category: 'text' });

export default model<IBook>('Book', bookSchema);

// Semilla para garantizar que obras fundamentales estén siempre disponibles en MongoDB
export const seedBooks = async () => {
    try {
        const BookModel = model<IBook>('Book');
        const lotrExists = await BookModel.findOne({
            $or: [
                { isbn: "978-8445071793" },
                { title: { $regex: "anillos", $options: "i" } }
            ]
        });

        if (!lotrExists) {
            await BookModel.create({
                title: "El Señor de los Anillos: La Comunidad del Anillo",
                author: "J.R.R. Tolkien",
                isbn: "978-8445071793",
                category: "Fantasía Épica / Novela",
                publisher: "Ediciones Minotauro",
                yearPublish: 1954,
                edition: "Edición Conmemorativa",
                language: "Español",
                stockTotal: 4,
                stockAvailable: 4,
                barcode: "LOTR-9788445071793",
                pages: 488,
                description: "Obra cumbre de la literatura fantástica universal escrita por J.R.R. Tolkien. En la legendaria Tierra Media, el joven hobbit Frodo Bolsón emprende una peligrosa travesía hacia el Monte del Destino para destruir el Anillo Único antes de que el Señor Oscuro Sauron someta a todos los pueblos libres.",
                location: {
                    shelf: "ESTANTE-L3",
                    level: "Nivel 2",
                    callNumber: "BG-823.91-T649"
                },
                section: "Biblioteca General"
            });
            console.log("📚 Libro 'El Señor de los Anillos' sembrado exitosamente en MongoDB.");
        }
    } catch (err) {
        console.warn("Advertencia al sembrar recursos de catálogo:", err);
    }
};