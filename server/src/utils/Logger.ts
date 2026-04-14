import ActivityLog from '../models/ActivityLog';

export const logActivity = async (
  action: string,
  userId: string,
  targetId: string,
  details: string
) => {
  try {
    const newLog = new ActivityLog({
      action,
      user: userId,
      target: targetId,
      details
    });
    await newLog.save();
  } catch (error) {
    console.error("Error al guardar log de auditoría:", error);
    // No lanzamos el error para que la operación principal (prestar/editar) no se detenga
  }
};