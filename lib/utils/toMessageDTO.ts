import { Types } from "mongoose";
import type { MessageDto } from "../validation/message.schema";


export type MessageDtoSource = {
  _id: Types.ObjectId;
  tempId: string;
  conversationId: Types.ObjectId;
  senderId: Types.ObjectId;
  content: string;
  messageType: "text" | "image" | "file";
  status: "sent" | "delivered" | "read";
  createdAt: Date;
};

export function toMessageDTO(msg: MessageDtoSource): MessageDto {
  return {
    _id: msg._id.toString(),
    tempId: msg.tempId,
    conversationId: msg.conversationId.toString(),
    senderId: msg.senderId.toString(),
    content: msg.content,
    messageType: msg.messageType,
    status: msg.status,
    createdAt: msg.createdAt.toISOString(),
  };
}
