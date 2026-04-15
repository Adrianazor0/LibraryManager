import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

export interface Book {
    _id: string;
    title: string;
    author: string;
    isbn: string;
    category: string;
    publisher: string;
    yearPublish: number;
    edition: string;
    language: string;
    stockTotal: number;
    stockAvailable: number;
    barcode: string;
    description: string;
    section: string;
    location: {
        shelf: string;
        level: string;
        callNumber: string;
    };
}

export const useBooks = () => {
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);

    // Usamos useCallback para que fetchBooks no cambie en cada render
    const fetchBooks = useCallback(async () => {
        setLoading(true);
        try {
            // Asegúrate de que este endpoint sea el correcto (/books o /books/catalog)
            const response = await api.get('/books/catalog');
            setBooks(response.data);
        } catch (error) {
            console.error("Error al obtener libros:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    const addBook = async (bookData: Partial<Book>) => {
        try {
            // El backend recibe el objeto completo (incluyendo location)
            await api.post('/books/register', bookData);

            // En lugar de actualización optimista, refrescamos para obtener
            // la data procesada por el backend (IDs, timestamps, etc.)
            await fetchBooks();

            return { success: true };
        } catch (error: any) {
            const mensaje = error.response?.data?.msg || "Error al registrar el libro";
            console.error("Error en el registro:", error);
            return { success: false, error: mensaje };
        }
    };

const editBook = async (id: string, bookData: Partial<Book>) => {
    try {
        await api.put(`/books/update/${id}`, bookData);
        
        // --- MODIFICACIÓN AQUÍ ---
        // Actualizamos el estado local manualmente para que la UI 
        // cambie al instante sin esperar el re-fetch
        setBooks((prevBooks) => 
            prevBooks.map((b) => 
                b._id === id ? { ...b, ...bookData } : b
            )
        );

        // De todos modos refrescamos por seguridad
        await fetchBooks(); 
        
        return { success: true };
    } catch (error: any) {
        const mensaje = error.response?.data?.msg || "Error al actualizar el libro";
        return { success: false, error: mensaje };
    }
};

const deleteBook = async (id: string) => {
    // Confirmación nativa del navegador
    const confirmacion = window.confirm("¿Estás seguro de que deseas eliminar este libro? Esta acción no se puede deshacer.");
    
    if (!confirmacion) return;

    try {
        const response = await api.delete(`/books/${id}`);
        // Actualización local para que desaparezca de la tabla de inmediato
        setBooks((prev) => prev.filter(b => b._id !== id));
        alert(response.data.msg);
        return true;
    } catch (error: any) {
        const mensaje = error.response?.data?.msg || "Error al eliminar";
        alert(mensaje); // Aquí verás el aviso si el libro tiene préstamos
        return false;
    }
};

    useEffect(() => {
        fetchBooks();
    }, [fetchBooks]);

    return {
        books,
        loading,
        refetch: fetchBooks,
        addBook,
        deleteBook,
        editBook
    };
};