import { Schema, model } from 'mongoose';
import { ILibraryPolicy } from '../interfaces/models.interface';

const libraryPolicySchema = new Schema<ILibraryPolicy>({
    section: {
        type: String,
        required: true,
        unique: true
    },
    canBorrow: { type: Boolean, default: true },
    rules: [{
        role: { 
            type: String, 
            enum: ['estudiante', 'docente', 'bibliotecario', 'admin'],
            required: true 
        },
        maxBooks: { type: Number, required: true },
        loanDays: { type: Number, required: true }
    }]
}, { timestamps: true });

export default model<ILibraryPolicy>('LibraryPolicy', libraryPolicySchema);

// Función para inicializar políticas por defecto si no existen
export const seedPolicies = async () => {
    const PolicyModel = model('LibraryPolicy');
    const count = await PolicyModel.countDocuments();
    
    if (count === 0) {
        const defaultPolicies = [
            {
                section: 'Biblioteca General',
                canBorrow: true,
                rules: [
                    { role: 'estudiante', maxBooks: 3, loanDays: 7 },
                    { role: 'docente', maxBooks: 10, loanDays: 30 },
                    { role: 'bibliotecario', maxBooks: 5, loanDays: 15 },
                    { role: 'admin', maxBooks: 10, loanDays: 30 }
                ]
            },
            {
                section: 'Hemeroteca',
                canBorrow: true,
                rules: [
                    { role: 'estudiante', maxBooks: 1, loanDays: 2 },
                    { role: 'docente', maxBooks: 3, loanDays: 5 },
                    { role: 'bibliotecario', maxBooks: 2, loanDays: 3 },
                    { role: 'admin', maxBooks: 3, loanDays: 5 }
                ]
            },
            {
                section: 'Referencia',
                canBorrow: false,
                rules: [
                    { role: 'estudiante', maxBooks: 0, loanDays: 0 },
                    { role: 'docente', maxBooks: 0, loanDays: 0 },
                    { role: 'bibliotecario', maxBooks: 0, loanDays: 0 },
                    { role: 'admin', maxBooks: 0, loanDays: 0 }
                ]
            },
            {
                section: 'Juvenil/Infantil',
                canBorrow: true,
                rules: [
                    { role: 'estudiante', maxBooks: 2, loanDays: 5 },
                    { role: 'docente', maxBooks: 5, loanDays: 15 },
                    { role: 'bibliotecario', maxBooks: 3, loanDays: 7 },
                    { role: 'admin', maxBooks: 5, loanDays: 15 }
                ]
            }
        ];
        await PolicyModel.insertMany(defaultPolicies);
        console.log('Políticas de biblioteca inicializadas');
    }
};
