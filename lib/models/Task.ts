import mongoose, { Document, Schema } from 'mongoose';

export interface ITask extends Document {
  ownerId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  status: "Pendiente" | "En Progreso" | "Completada" | "Bloqueada" | "Cancelada";
  priority: "Baja" | "Media" | "Alta" | "Crítica";
  projectId: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  dueDate?: Date;
  estimatedHours: number;
  actualHours: number;
}

const TaskSchema = new Schema<ITask>({
  ownerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["Pendiente", "En Progreso", "Completada", "Bloqueada", "Cancelada"],
    default: "Pendiente",
  },
  priority: {
    type: String,
    enum: ["Baja", "Media", "Alta", "Crítica"],
    default: "Media",
  },
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  dueDate: {
    type: Date,
    required: false,
  },
  estimatedHours: {
    type: Number,
    default: 0,
  },
  actualHours: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret) => {
      ret.id = ret._id.toString();
      delete ret._id;
      return ret;
    },
  },
});

export default mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);
