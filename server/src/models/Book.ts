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

        // 1. El Señor de los Anillos
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

        // 2. 1984 de George Orwell
        const orwellExists = await BookModel.findOne({
            $or: [
                { isbn: "978-8499890944" },
                { title: { $regex: "1984", $options: "i" } }
            ]
        });

        if (!orwellExists) {
            await BookModel.create({
                title: "1984",
                author: "George Orwell",
                isbn: "978-8499890944",
                category: "Ciencia Ficción Distópica / Novela",
                publisher: "Debolsillo / Secker & Warburg",
                yearPublish: 1949,
                edition: "Edición Clásica",
                language: "Español",
                stockTotal: 4,
                stockAvailable: 4,
                barcode: "ORW-9788499890944",
                pages: 326,
                description: "Obra maestra de la literatura distópica del siglo XX. Narra la vida de Winston Smith en un Londres sometido a la vigilancia constante del Gran Hermano y la Policía del Pensamiento, abordando temas de manipulación política, verdad histórica y libertad humana.",
                location: {
                    shelf: "ESTANTE-D4",
                    level: "Nivel 3",
                    callNumber: "BG-823.912-O79"
                },
                section: "Biblioteca General"
            });
            console.log("📚 Libro '1984' sembrado exitosamente en MongoDB.");
        }

        // 3. La Sombra del Viento de Carlos Ruiz Zafón
        const zafonExists = await BookModel.findOne({
            $or: [
                { isbn: "978-8408043645" },
                { title: { $regex: "sombra del viento", $options: "i" } }
            ]
        });

        if (!zafonExists) {
            await BookModel.create({
                title: "La Sombra del Viento",
                author: "Carlos Ruiz Zafón",
                isbn: "978-8408043645",
                category: "Misterio / Novela Contemporánea",
                publisher: "Editorial Planeta",
                yearPublish: 2001,
                edition: "Edición Ilustrada",
                language: "Español",
                stockTotal: 4,
                stockAvailable: 4,
                barcode: "CRZ-9788408043645",
                pages: 576,
                description: "Novela cumbre de Carlos Ruiz Zafón ambientada en la Barcelona de posguerra. Daniel Sempere es guiado por su padre al mítico Cementerio de los Libros Olvidados, donde elige un volumen maldito del enigmático Julián Carax que desata una trama de intriga, romance y venganza.",
                location: {
                    shelf: "ESTANTE-Z1",
                    level: "Nivel 1",
                    callNumber: "BG-863.64-R934"
                },
                section: "Biblioteca General"
            });
            console.log("📚 Libro 'La Sombra del Viento' sembrado exitosamente en MongoDB.");
        }

    } catch (err) {
        console.warn("Advertencia al sembrar recursos de catálogo:", err);
    }
};