import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  ownerId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  message: string;
  type: "task_assigned" | "task_updated" | "task_completed" | "comment_added";
  read: boolean;
}

const NotificationSchema = new Schema<INotification>({
  ownerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["task_assigned", "task_updated", "task_completed", "comment_added"],
    required: true,
  },
  read: {
    type: Boolean,
    default: false,
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

export default mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
