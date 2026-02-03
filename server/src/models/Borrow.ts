import { Schema, model, Types } from 'mongoose';
import { IBorrow } from '../interfaces/models.interface'; 

const borrowSchema = new Schema<IBorrow>({
    bookId: { 
        type: Schema.Types.ObjectId, 
        ref: 'Libro', 
        required: true 
    },
    userId: { 
        type: Schema.Types.ObjectId, 
        ref: 'Usuario', 
        required: true 
    },
    departureDate: { 
        type: Date, 
        default: Date.now 
    },
    dueDate: { 
        type: Date, 
        required: true 
    },
    status: { 
        type: String, 
        enum: ['pendiente', 'devuelto', 'atrasado'], 
        default: 'pendiente' 
    }
}, { 
    timestamps: true
});

export default model<IBorrow>('Borrow', borrowSchema);