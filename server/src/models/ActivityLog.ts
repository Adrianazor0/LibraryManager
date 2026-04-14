import { Schema, model } from 'mongoose';

const LogSchema = new Schema({
  action: String, // 'PRESTAMO', 'DEVOLUCION', 'EDICION_LIBRO'
  user: { type: Schema.Types.ObjectId, ref: 'User' }, // Quién lo hizo
  target: String, // ID del libro o usuario afectado
  details: String, // "Préstamo de 7 días aplicado a matrícula 2023-01"
  timestamp: { type: Date, default: Date.now }
});

export default model('ActivityLog', LogSchema);