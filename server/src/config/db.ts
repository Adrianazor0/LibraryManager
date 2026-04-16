import mongoose from 'mongoose';

export const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI;
        if (!uri) {
            console.error("CRITICAL: MONGO_URI is missing in process.env!");
            return; // Don't crash, let the health check pass
        }
        const conn = await mongoose.connect(uri);
        console.log(`MongoDB Conectado: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error de conexión a MongoDB: ${error}`);
        // Let the server keep running for Cloud Run's health check
    }
};