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

export interface SemanticBook extends Book {
    relevanceScore?: number;
    tags?: string[];
}

export const useBooks = () => {
    const [books, setBooks] = useState<SemanticBook[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSemanticSearching, setIsSemanticSearching] = useState(false);

    // Usamos useCallback para que fetchBooks no cambie en cada render
    const fetchBooks = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/books/catalog');
            setBooks(response.data);
        } catch (error) {
            console.error("Error al obtener libros:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    const searchSemantic = async (query: string, section?: string, category?: string) => {
        setIsSemanticSearching(true);
        try {
            const params = new URLSearchParams();
            if (query) params.append('query', query);
            if (section && section !== 'Todos') params.append('section', section);
            if (category && category !== 'Todas') params.append('category', category);

            const response = await api.get(`/books/search-semantic?${params.toString()}`);
            setBooks(response.data.results);
            return response.data;
        } catch (error) {
            console.error("Error en búsqueda semántica:", error);
        } finally {
            setIsSemanticSearching(false);
        }
    };

    const addBook = async (bookData: Partial<Book>) => {
        try {
            await api.post('/books/register', bookData);
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
            setBooks((prevBooks) => 
                prevBooks.map((b) => 
                    b._id === id ? { ...b, ...bookData } : b
                )
            );
            await fetchBooks(); 
            return { success: true };
        } catch (error: any) {
            const mensaje = error.response?.data?.msg || "Error al actualizar el libro";
            return { success: false, error: mensaje };
        }
    };

    const deleteBook = async (id: string) => {
        const confirmacion = window.confirm("¿Estás seguro de que deseas eliminar este libro? Esta acción no se puede deshacer.");
        if (!confirmacion) return;

        try {
            const response = await api.delete(`/books/${id}`);
            setBooks((prev) => prev.filter(b => b._id !== id));
            alert(response.data.msg);
            return true;
        } catch (error: any) {
            const mensaje = error.response?.data?.msg || "Error al eliminar";
            alert(mensaje);
            return false;
        }
    };

    useEffect(() => {
        fetchBooks();
    }, [fetchBooks]);

    return {
        books,
        loading,
        isSemanticSearching,
        searchSemantic,
        refetch: fetchBooks,
        addBook,
        deleteBook,
        editBook
    };
};