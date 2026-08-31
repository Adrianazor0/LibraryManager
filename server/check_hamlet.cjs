const mongoose = require('mongoose');
const dns = require('dns');

dns.setServers(['8.8.8.8', '8.8.4.4']);

const uri = "mongodb+srv://bacanox1000_db_user:6Xrjee1udTgtvLI9@cluster0.jjw5gjl.mongodb.net/biblioteca_urena?retryWrites=true&w=majority&appName=Cluster0";

async function checkHamlet() {
    try {
        await mongoose.connect(uri);
        const booksCollection = mongoose.connection.collection('books');
        
        const hamlet = await booksCollection.find({ 
            $or: [
                { title: { $regex: 'hamlet', $options: 'i' } },
                { author: { $regex: 'shakespeare', $options: 'i' } }
            ]
        }).toArray();

        console.log("=== HAMLET BOOKS IN MONGODB ===");
        console.log(JSON.stringify(hamlet, null, 2));

        if (hamlet.length === 0) {
            console.log("\nHAMLET WAS NOT IN MONGO DB! INSERTING HAMLET NOW...");
            const newHamlet = {
                title: "Hamlet",
                author: "William Shakespeare",
                isbn: "978-0141396507",
                category: "Literatura Clásica / Teatro",
                section: "Biblioteca General",
                publisher: "Penguin Classics",
                yearPublish: 1603,
                edition: "Edición Crítica",
                language: "Español",
                stockTotal: 4,
                stockAvailable: 4,
                description: "Tragedia cumbre de la literatura universal escrita por William Shakespeare. Ambientada en el Reino de Dinamarca, la obra sigue al joven Príncipe Hamlet en su atormentada búsqueda de venganza tras el asesinato de su padre a manos de su tío Claudio.",
                location: { shelf: "ESTANTE-A2", level: "Nivel 3", callNumber: "BG-822.33-H22" }
            };
            const insRes = await booksCollection.insertOne(newHamlet);
            console.log("HAMLET INSERTED SUCCESSFULLY! ID:", insRes.insertedId);
        }

        await mongoose.disconnect();
    } catch (e) {
        console.error("Error:", e);
    }
}

checkHamlet();
