import { Schema, Types, Document, model, models } from "mongoose";

export interface IConversation extends Document {
  participants: Types.ObjectId[];
  lastMessage?: Types.ObjectId;
  isGroup: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
  {
    participants: [
      {
        type: Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    lastMessage: {
      type: Types.ObjectId,
      ref: "Message",
    },
    isGroup: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

ConversationSchema.index({ participants: 1 }, { unique: true });

const Conversation =
  models.Conversation ||
  model<IConversation>("Conversation", ConversationSchema);

export default Conversation;
