import mongoose, { Document, Schema } from 'mongoose';

export interface IProject extends Document {
  ownerId: mongoose.Types.ObjectId;
  name: string;
  description: string;
}

const ProjectSchema = new Schema<IProject>({
  ownerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
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

export default mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);
