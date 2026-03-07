import { Schema, Document, model, models } from "mongoose";

export interface IMessage extends Document {
  conversationId: Schema.Types.ObjectId;
  senderId: Schema.Types.ObjectId;
  content: string;
  messageType: "text" | "image" | "file";
  status: "sent" | "delivered" | "read";
  createdAt: Date;
  updatedAt: Date;
}
export interface IMessageBase {
  _id: string; // Lean objects have string/ObjectId IDs
  conversationId: Schema.Types.ObjectId;
  senderId: Schema.Types.ObjectId;
  content: string;
  messageType: "text" | "image" | "file";
  status: "sent" | "delivered" | "read";
  createdAt: Date;
  updatedAt: Date;
}



const MessageSchema = new Schema<IMessage>(
  {
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

const Message = models.Message || model<IMessage>("Message", MessageSchema);

export default Message;
