import { Schema, model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { IUser } from '../interfaces/models.interface';

const userSchema = new Schema<IUser>({
    enrollmentId: { 
        type: String, 
        required: [true, 'La matrícula es obligatoria'], 
        unique: true,
        trim: true 
    },
    name: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { 
        type: String, 
        required: true, 
        unique: true, 
        lowercase: true 
    },
    password: { type: String, required: true },
    role: { 
        type: String, 
        enum: ['admin', 'estudiante', 'docente', 'bibliotecario'], 
        default: 'estudiante' 
    },
    status: { 
        type: String, 
        enum: ['activo', 'suspendido', 'eliminado'], 
        default: 'activo' 
    },
    profilePhoto: { type: String },
    qrAccess: { type: String }
}, { timestamps: true });


userSchema.pre('save', async function (this: any) {
    if (!this.isModified('password')) return;
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    } catch (error: any) {
        throw new Error(error);
    }
});

userSchema.methods.compararPassword = async function(passwordCandidate: string): Promise<boolean> {
    return await bcrypt.compare(passwordCandidate, this.password);
};

export default model<IUser>('User', userSchema);