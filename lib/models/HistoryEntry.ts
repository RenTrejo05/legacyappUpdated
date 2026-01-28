import mongoose, { Document, Schema } from 'mongoose';

export interface IHistoryEntry extends Document {
  ownerId: mongoose.Types.ObjectId;
  taskId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  action: "CREATED" | "STATUS_CHANGED" | "TITLE_CHANGED" | "DELETED" | "UPDATED";
  oldValue: string;
  newValue: string;
}

const HistoryEntrySchema = new Schema<IHistoryEntry>({
  ownerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  taskId: {
    type: Schema.Types.ObjectId,
    ref: 'Task',
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  action: {
    type: String,
    enum: ["CREATED", "STATUS_CHANGED", "TITLE_CHANGED", "DELETED", "UPDATED"],
    required: true,
  },
  oldValue: {
    type: String,
    required: true,
  },
  newValue: {
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

export default mongoose.models.HistoryEntry || mongoose.model<IHistoryEntry>('HistoryEntry', HistoryEntrySchema);
