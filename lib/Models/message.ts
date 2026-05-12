import { Schema, Document, model, models } from "mongoose";

export interface IMessage extends Document {
  tempId?: string;
  conversationId: Schema.Types.ObjectId;
  senderId: Schema.Types.ObjectId;
  content: string;
  messageType: "text" | "image" | "file";
  status: "sent" | "delivered" | "read";
  createdAt: Date;
  updatedAt: Date;
}

// used in useChatStore , [conversationId]/route.ts, api/messages/send/route.ts
export interface IMessageBase {
  _id?: string; // Lean objects have string/ObjectId IDs
  tempId?: string;
  conversationId: string;
  senderId: string;
  content: string;
  messageType: "text" | "image" | "file";
  status?: "sent" | "delivered" | "read" | "pending";
  createdAt: string;
  
}

export interface IMessagePatch {
  _id: string;
  tempId: string;
  createdAt: string;
  status: "sent";
}

export type IncomingMessage = IMessageBase | IMessagePatch;

const MessageSchema = new Schema<IMessage>(
  {
    tempId: {
      type: String,
    },
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    messageType: {
      type: String,
      enum: ["text", "image", "file"],
      default: "text",
    },
    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
    },
  },
  {
    timestamps: true,
  },
);

MessageSchema.index({ tempId: 1 }, { unique: true });
const Message = models.Message || model<IMessage>("Message", MessageSchema);

export default Message;
