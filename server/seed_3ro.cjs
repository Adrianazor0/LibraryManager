const mongoose = require('mongoose');
const dns = require('dns');

dns.setServers(['8.8.8.8', '8.8.4.4']);

const uri = "mongodb+srv://bacanox1000_db_user:6Xrjee1udTgtvLI9@cluster0.jjw5gjl.mongodb.net/biblioteca_urena?retryWrites=true&w=majority&appName=Cluster0";

async function seed3roBooks() {
    try {
        await mongoose.connect(uri);
        const booksCollection = mongoose.connection.collection('books');

        const books3ro = [
            {
                title: "Cuentos de Amor de Locura y de Muerte",
                author: "Horacio Quiroga",
                isbn: "978-8437604633",
                category: "Literatura Hispanoamericana / Cuentos",
                section: "Juvenil/Infantil",
                publisher: "Editorial Losada",
                yearPublish: 1917,
                edition: "Edición Escolar",
                language: "Español",
                stockTotal: 5,
                stockAvailable: 5,
                description: "Colección icónica de cuentos narrativos latinoamericanos indispensables para el desarrollo de lectura analítica en 3ro de Secundaria.",
                location: { shelf: "JUV-SEC3", level: "Nivel 2", callNumber: "JUV-863-Q8" }
            },
            {
                title: "Geometría Plana y del Espacio con Trigonometría",
                author: "Aurelio Baldor",
                isbn: "978-6077440024",
                category: "Matemáticas y Geometría",
                section: "Biblioteca General",
                publisher: "Grupo Editorial Patria",
                yearPublish: 1967,
                edition: "3ra Edición",
                language: "Español",
                stockTotal: 6,
                stockAvailable: 6,
                description: "Texto clásico de trigonometría y teoremas geométricos fundamentales para estudiantes de 3ro de Secundaria.",
                location: { shelf: "ESTANTE-B2", level: "Nivel 1", callNumber: "BG-516-B178" }
            },
            {
                title: "La Española en el Siglo XVI",
                author: "Frank Moya Pons",
                isbn: "978-9945406184",
                category: "Historia Dominicana",
                section: "Biblioteca General",
                publisher: "Universidad Católica Santo Domingo",
                yearPublish: 1978,
                edition: "2da Edición",
                language: "Español",
                stockTotal: 4,
                stockAvailable: 4,
                description: "Estudio exhaustivo del periodo colonial e inicios de la sociedad dominicana recomendado para 3ro de Secundaria.",
                location: { shelf: "ESTANTE-C1", level: "Nivel 3", callNumber: "BG-972.93-M938" }
            },
            {
                title: "Física General y Ciencias de la Tierra",
                author: "Paul E. Tippens",
                isbn: "978-6071504715",
                category: "Física / Ciencias de la Naturaleza",
                section: "Biblioteca General",
                publisher: "McGraw-Hill",
                yearPublish: 2011,
                edition: "7ma Edición",
                language: "Español",
                stockTotal: 5,
                stockAvailable: 5,
                description: "Introducción a los conceptos de mecánica, materia y ciencias de la tierra para el primer ciclo de educación secundaria.",
                location: { shelf: "ESTANTE-B1", level: "Nivel 2", callNumber: "BG-530-T595" }
            }
        ];

        for (const b of books3ro) {
            const exists = await booksCollection.findOne({ isbn: b.isbn });
            if (!exists) {
                await booksCollection.insertOne(b);
                console.log(`+ INSERTADO EN MONGODB: "${b.title}"`);
            } else {
                console.log(`= YA EXISTE EN MONGODB: "${b.title}"`);
            }
        }

        await mongoose.disconnect();
    } catch (e) {
        console.error("Error:", e);
    }
}

seed3roBooks();
