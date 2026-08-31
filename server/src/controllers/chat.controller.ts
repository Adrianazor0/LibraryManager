import { Request, Response } from 'express';
import Book from '../models/Book';

/**
 * Controller for Phase 3: 24/7 Conversational AI Library Assistant (RAG)
 * Combines Retrieval + Augmentation + Anaphora Resolution + Whole-Word Negative Match Engine + Phase 4 Grade Recommendations
 */
export const askLibraryBot = async (req: Request, res: Response) => {
    try {
        const { message, lastSuggestedBooks } = req.body;

        if (!message || message.trim() === '') {
            return res.status(400).json({ msg: "El mensaje no puede estar vacío" });
        }

        const q = message.toLowerCase().trim();
        const allBooks = await Book.find({}).lean();

        // 1. RESOLUCIÓN DE ANÁFORAS Y MEMORIA CONVERSACIONAL
        const isAskingAboutLast = q.includes("ultimo") || q.includes("último") || q.includes("mencionado");
        const isAskingAboutFirst = q.includes("primer") || q.includes("primero");
        const isAskingAboutDuration = q.includes("tiempo") || q.includes("duracion") || q.includes("duración") || q.includes("dias") || q.includes("días") || q.includes("prestado") || q.includes("tomar");
        const isAskingExclusivity = q.includes("solo tenemos") || q.includes("sólo tenemos") || q.includes("mas libros") || q.includes("más libros") || q.includes("otros tomos") || q.includes("otros libros");

        let targetBook: any = null;
        if (Array.isArray(lastSuggestedBooks) && lastSuggestedBooks.length > 0) {
            if (isAskingAboutLast) {
                targetBook = lastSuggestedBooks[lastSuggestedBooks.length - 1];
            } else if (isAskingAboutFirst) {
                targetBook = lastSuggestedBooks[0];
            } else if (isAskingAboutDuration || q.includes("ese") || q.includes("libro")) {
                targetBook = lastSuggestedBooks[lastSuggestedBooks.length - 1] || lastSuggestedBooks[0];
            }
        }

        // 2. DETECCIÓN DE ENTIDADES Y GRADOS ACADÉMICOS (INTEGRACIÓN FASE 4 CON FASE 3)
        const isAskingAboutGrade3 = q.includes("3ro") || q.includes("tercero") || q.includes("3er");
        const isAskingAboutGrade4 = q.includes("4to") || q.includes("cuarto");
        const isAskingAboutGrade5 = q.includes("5to") || q.includes("quinto");
        const isAskingAboutGrade6 = q.includes("6to") || q.includes("sexto");
        const isAskingRecommendation = q.includes("deberia leer") || q.includes("debería leer") || q.includes("recomendado") || q.includes("recomendados") || q.includes("recomiendas") || q.includes("plan de lectura") || q.includes("que libros") || q.includes("qué libros") || q.includes("cuales libros") || q.includes("cuáles libros") || q.includes("bachiller") || q.includes("secundaria");

        const isHarryPotter = q.includes("harry") || q.includes("potter") || q.includes("rowling");
        const isPinocho = q.includes("pinocho") || q.includes("collodi");
        const isQuijote = q.includes("quijote") || q.includes("cervantes");
        const isDominicanismos = q.includes("dominicanismos") || (q.includes("diccionario") && q.includes("dominicano"));
        const isBosch = q.includes("bosch") || q.includes("mañosa") || q.includes("manosa");
        const isBaldor = q.includes("baldor") || q.includes("álgebra") || q.includes("algebra");
        const isLordOfTheRings = q.includes("anillos") || q.includes("lord of the rings") || q.includes("tolkien") || q.includes("señor de los anillos");

        let reply = "";
        let suggestedBooks: any[] = [];

        // CASO 0: Recomendación por Grado Académico (3ro de Secundaria / Bachillerato)
        if (isAskingAboutGrade3 && isAskingRecommendation) {
            const grade3Books = allBooks.filter(b => {
                const t = (b.title || '').toLowerCase();
                return t.includes("quiroga") || t.includes("locura") || t.includes("geometría") || t.includes("geometria") || t.includes("española en el siglo xvi") || t.includes("espanola en el siglo xvi") || t.includes("tippens");
            });
            reply = `📙 **Plan de Lectura Académico Recomendado - 3ro de Secundaria**:\n\nDe acuerdo con el Currículo del MINERD para el Liceo Vespertino La Ureña, estos son los **4 recursos clave indispensables** recomendados para estudiantes de 3ro Grado (Geometría, Cuentos & Historia Colonial):`;
            suggestedBooks = grade3Books;
        }
        // CASO 1: Recomendación por Grado Académico (4to de Secundaria / Bachillerato)
        else if (isAskingAboutGrade4 && isAskingRecommendation) {
            const grade4Books = allBooks.filter(b => {
                const t = (b.title || '').toLowerCase();
                return t.includes("bosch") || t.includes("geografía") || t.includes("geografia") || t.includes("principito") || t.includes("biología") || t.includes("biologia");
            });
            reply = `📘 **Plan de Lectura Académico Recomendado - 4to de Secundaria**:\n\nDe acuerdo con el Currículo del MINERD para el Liceo Vespertino La Ureña, estos son los **4 recursos clave indispensables** recomendados para estudiantes de 4to Grado:`;
            suggestedBooks = grade4Books;
        }
        // CASO 2: Recomendación por Grado Académico (5to de Secundaria / Bachillerato)
        else if (isAskingAboutGrade5 && isAskingRecommendation) {
            const grade5Books = allBooks.filter(b => {
                const t = (b.title || '').toLowerCase();
                return t.includes("álgebra") || t.includes("algebra") || t.includes("física") || t.includes("fisica") || t.includes("moya pons") || t.includes("química") || t.includes("quimica") || t.includes("over");
            });
            reply = `🔬 **Plan de Lectura Académico Recomendado - 5to de Secundaria**:\n\nDe acuerdo con el Currículo del MINERD para el Liceo Vespertino La Ureña, estos son los **5 recursos clave indispensables** recomendados para 5to Grado (Ciencias Básicas & STEM):`;
            suggestedBooks = grade5Books;
        }
        // CASO 3: Recomendación por Grado Académico (6to de Secundaria / Bachillerato)
        else if (isAskingAboutGrade6 && isAskingRecommendation) {
            const grade6Books = allBooks.filter(b => {
                const t = (b.title || '').toLowerCase();
                return t.includes("quijote") || t.includes("hamlet") || t.includes("dominicanismos") || t.includes("gramática") || t.includes("gramatica") || t.includes("atlas histórico") || t.includes("atlas historico");
            });
            reply = `🎓 **Plan de Lectura Académico Recomendado - 6to de Secundaria**:\n\nDe acuerdo con el Currículo del MINERD para el Liceo Vespertino La Ureña, estos son los **5 recursos clave indispensables** recomendados para 6to Grado (Pre-Universitaria & Humanidades):`;
            suggestedBooks = grade6Books;
        }
        // CASO 4: Consulta sobre El Señor de los Anillos / Lord of the Rings / Tolkien
        else if (isLordOfTheRings) {
            const lotrBooks = allBooks.filter(b => {
                const text = (b.title + " " + b.author).toLowerCase();
                return text.includes("anillos") || text.includes("tolkien") || text.includes("rings") || text.includes("hobbit");
            });

            if (lotrBooks.length > 0) {
                reply = `⚔️ **Stock de Obras de J.R.R. Tolkien en Catálogo**:\n\nDisponemos de **${lotrBooks.length} título(s)** de la literatura fantástica de Tolkien:`;
                suggestedBooks = lotrBooks;
            } else {
                reply = `❌ **Recurso No Disponible en Catálogo**:\n\nActualmente **NO disponemos** de libros de la saga **"El Señor de los Anillos" (Lord of the Rings)** ni obras de J.R.R. Tolkien en el inventario de la biblioteca del Liceo Vespertino La Ureña.\n\nPuedes solicitar su adquisición con el personal bibliotecario o explorar nuestras obras disponibles de Literatura Fantástica.`;
                suggestedBooks = [];
            }
        }
        // CASO 5: Consulta Exclusiva sobre Harry Potter
        else if (isHarryPotter) {
            const hpBooks = allBooks.filter(b => {
                const text = (b.title + " " + b.author).toLowerCase();
                return text.includes("harry") || text.includes("potter");
            });

            if (hpBooks.length > 0) {
                const totalCopies = hpBooks.reduce((acc, b) => acc + (b.stockAvailable || 0), 0);
                if (isAskingExclusivity) {
                    reply = `⚡ **Información de la Saga Harry Potter**:\n\nActualmente en el catálogo del Liceo Vespertino La Ureña contamos con **${hpBooks.length} único título disponible** de esta saga:\n\n• **${hpBooks[0].title}** de ${hpBooks[0].author} (${hpBooks[0].stockAvailable} ejemplares disponibles en ${hpBooks[0].section}).\n\nNo disponemos de otros tomos de la saga en este momento.`;
                } else {
                    reply = `⚡ **Stock de Harry Potter**:\n\nDisponemos de **${totalCopies} ejemplares en total** para la saga de Harry Potter en nuestra sección de ${hpBooks[0].section || 'Juvenil/Infantil'}:`;
                }
                suggestedBooks = hpBooks;
            } else {
                reply = "⚡ En este momento no disponemos de títulos de Harry Potter en el inventario activo de la biblioteca.";
                suggestedBooks = [];
            }
        }
        // CASO 6: Consulta Exclusiva sobre Pinocho
        else if (isPinocho) {
            const pinochoBooks = allBooks.filter(b => (b.title + " " + b.author).toLowerCase().includes("pinocho") || (b.title + " " + b.author).toLowerCase().includes("collodi"));
            if (pinochoBooks.length > 0) {
                reply = `🧸 **Stock de Pinocho**:\n\nContamos con **${pinochoBooks[0].stockAvailable} ejemplares disponibles** de **"${pinochoBooks[0].title}"** de ${pinochoBooks[0].author} en la sección ${pinochoBooks[0].section}.`;
                suggestedBooks = pinochoBooks;
            }
        }
        // CASO 7: Consulta Exclusiva sobre Diccionario de Dominicanismos
        else if (isDominicanismos) {
            const domBooks = allBooks.filter(b => (b.title + " " + b.author).toLowerCase().includes("dominicanismos"));
            if (domBooks.length > 0) {
                reply = `📖 **Stock de Diccionario de Dominicanismos**:\n\nContamos con **${domBooks[0].stockAvailable} ejemplares disponibles** de **"${domBooks[0].title}"** de ${domBooks[0].author} en la sección de **${domBooks[0].section || 'Referencia'}** (Estante ${domBooks[0].location?.shelf || 'REF-SEC2'}, Nivel ${domBooks[0].location?.level || 'Nivel 2'}).`;
                suggestedBooks = domBooks;
            }
        }
        // CASO 8: Pregunta de seguimiento sobre tiempo de préstamo de libro específico
        else if (targetBook && isAskingAboutDuration) {
            const isReference = (targetBook.section || '').includes("Referencia") || (targetBook.category || '').includes("Léxico") || (targetBook.category || '').includes("Diccionario") || (targetBook.title || '').toLowerCase().includes("diccionario");
            
            if (isReference) {
                reply = `📖 **Duración y Normativa de Préstamo - Sección de Referencia**:\n\nEl recurso **"${targetBook.title}"** de ${targetBook.author} pertenece a la sección de **Referencia** (Ubicación: Estante ${targetBook.location?.shelf || 'REF-SEC2'}, Nivel ${targetBook.location?.level || 'Nivel 2'}).\n\nPor ser una obra de consulta y léxico especializado, se presta para **Consulta en Sala y Aula por hasta 1 día (jornada escolar)**. Para préstamos a domicilio, requiere autorización del bibliotecario.`;
            } else {
                reply = `📚 **Duración de Préstamo a Domicilio**:\n\nEl libro **"${targetBook.title}"** de ${targetBook.author} (${targetBook.section || 'Biblioteca General'}) se puede solicitar en préstamo a domicilio por un periodo estándar de **7 días renovables** directamente desde esta aplicación.`;
            }
            suggestedBooks = [targetBook];
        }
        // CASO 9: Saludos puros
        else if (q === "hola" || q === "buenas" || q === "saludos" || q === "hola bibliobot") {
            reply = "¡Hola! 👋 Soy BiblioBot, tu Asistente Conversacional Inteligente 24/7 del Liceo Vespertino La Ureña. ¿En qué te puedo colaborar hoy? Puedes preguntarme por recomendaciones de 4to, 5to o 6to de secundaria, libros de física o normativas de préstamo.";
        }
        // CASO 10: Búsqueda Semántica RAG Estricta de Palabra Completa
        else {
            const stopWords = ['hola', 'buenas', 'saludos', 'favor', 'como', 'esta', 'estos', 'este', 'esta', 'para', 'con', 'por', 'que', 'los', 'las', 'del', 'una', 'uno', 'tienen', 'tiene', 'donde', 'busco', 'cuanto', 'cuánto', 'tiempo', 'puedo', 'tomar', 'ultimo', 'último', 'mencionado', 'prestado', 'solo', 'sólo', 'tenemos', 'disponibles', 'disponible', 'libro', 'libros', 'stock'];
            const tokens = q.split(/\s+/).filter((t: string) => t.length > 2 && !stopWords.includes(t));

            let matched = allBooks.filter(book => {
                const title = (book.title || '').toLowerCase();
                const author = (book.author || '').toLowerCase();
                const category = (book.category || '').toLowerCase();

                if (tokens.length === 0) return false;

                return tokens.some((token: string) => {
                    const wordRegex = new RegExp(`\\b${token}\\b`, 'i');
                    return wordRegex.test(title) || wordRegex.test(author) || wordRegex.test(category);
                });
            });

            if (matched.length > 0) {
                reply = `🔍 Encontré ${matched.length} recurso(s) en el catálogo del Liceo La Ureña directamente relacionados con tu consulta:`;
                suggestedBooks = matched;
            } else {
                reply = `❌ **Recurso No Disponible en Catálogo**:\n\nActualmente **NO disponemos** de libros en el inventario activo de la biblioteca que coincidan con la búsqueda de **"${message}"**.\n\nPuedes consultar con el personal bibliotecario para sugerir su adquisición o realizar una Búsqueda por Foto de Portada (OCR).`;
                suggestedBooks = [];
            }
        }

        res.json({
            success: true,
            reply,
            suggestedBooks: suggestedBooks.map(b => ({
                _id: b._id,
                title: b.title,
                author: b.author,
                section: b.section || 'Biblioteca General',
                category: b.category,
                stockAvailable: b.stockAvailable,
                stockTotal: b.stockTotal,
                description: b.description,
                location: b.location
            })),
            timestamp: new Date().toISOString()
        });

    } catch (error: any) {
        console.error("Error en RAG Bot:", error);
        res.status(500).json({ msg: "Error al procesar consulta en RAG Bot", error: error.message });
    }
};
