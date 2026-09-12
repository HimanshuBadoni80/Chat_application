import type { NextRequest } from "next/server";
import { sendMessageSchema } from "@/lib/validation/message.schema";
import { GetSession } from "@/lib/utils/session";
import { sessionExpiredJSON } from "@/lib/auth/sessionExpiredJSON";
import {
  errorResponse,
  successResponse,
  zodValidationError,
} from "@/lib/types/apiResponse";
import { Conversation, Contact, Message } from "@/lib/Models";
import type { Types } from "mongoose";
import { toMessageDTO, type MessageDtoSource } from "@/lib/utils/toMessageDTO";
import type { ConversationDTO } from "@/lib/validation/conversation.schema";
import { toConversationDTO } from "@/lib/utils/toConversationDTO";
import { handleApiError } from "@/lib/utils/errorUtil";
import connectDB from "@/lib/actions/mongodb";

interface PopulatedConvResult {
  _id: Types.ObjectId;
  participants: { _id: Types.ObjectId; isDeleted: boolean }[];
}

export async function POST(request: NextRequest) {
  try {
    const session = await GetSession();
    if (!session) return sessionExpiredJSON();

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return errorResponse(
        400,
        "Request body must be valid JSON",
        "VALIDATION_ERROR",
      );
    }

    const validation = sendMessageSchema.safeParse(body);

    if (!validation.success) return zodValidationError(validation.error);

    const senderId = session.user._id;
    const input = validation.data;

    let conversationId: Types.ObjectId | undefined = undefined;
    let isNewConversation: boolean = false;
    let receiverId: Types.ObjectId | undefined = undefined;
    let message: MessageDtoSource | null = null;

    // –––existing conversation
    if (input.kind === "existing") {
      const conv: PopulatedConvResult | null = await Conversation.findOne({
        _id: input.conversationId,
        participants: senderId,
      })
        .select("_id participants")
        .populate("participants", "_id  isDeleted")
        .lean();

      if (!conv)
        return errorResponse(403, "Not authorised", "UNAUTHORIZED_USER");

      const receiver = conv.participants.find(
        (user) => String(user._id) !== String(senderId),
      );

      if (receiver === undefined || receiver.isDeleted === true) {
        return errorResponse(404, "user doesn't exits", "USER_NOT_FOUND");
      }
      conversationId = conv._id;
      receiverId = receiver._id;
    } else {
      // ––– new conversation from contact
      const contact = await Contact.findOne({
        _id: input.contactId,
        ownerId: senderId,
      }).populate("userId", "_id isDeleted");

      if (!contact)
        return errorResponse(404, "Contact not found", "USER_NOT_FOUND");

      if (!contact.userId || contact.userId.isDeleted)
        return errorResponse(410, "User no longer available", "USER_NOT_FOUND");

      receiverId = contact.userId._id as Types.ObjectId;

      // verify with direct key, to reuse the direct chat.
      const directKey = [senderId.toString(), receiverId.toString()]
        .sort()
        .join(":");

      // ── Transaction: create conversation + message atomically ──
      const mongoose = await connectDB();
      const dbSession = await mongoose.startSession();
      try {
        await dbSession.withTransaction(async () => {
          const convResult = await Conversation.findOneAndUpdate(
            {
              directKey,
              isGroup: false,
            },
            {
              $setOnInsert: {
                participants: [senderId, receiverId],
                directKey,
                isGroup: false,
              },
              $pull: { hiddenFor: senderId },
            },
            {
              new: true,
              upsert: true,
              runValidators: true,
              includeResultMetadata: true,
              lean: true,
              session: dbSession,
            },
          );

          const conv = convResult.value;
          if (!conv)
            throw new Error("Conversation upsert returned no document");

          isNewConversation = !convResult.lastErrorObject?.updatedExisting;
          conversationId = conv._id;

          const msgResult = await Message.findOneAndUpdate(
            {
              senderId,
              tempId: input.tempId,
            },
            {
              $setOnInsert: {
                tempId: input.tempId,
                conversationId,
                senderId,
                content: input.content,
                messageType: input.messageType,
                status: "sent",
              },
            },
            {
              new: true,
              upsert: true,
              runValidators: true,
              includeResultMetadata: true,
              lean: true,
              session: dbSession,
            },
          );

          message = msgResult.value;
          if (!message) throw new Error("Message upsert retruned no document");

          const isNewMessage = !msgResult.lastErrorObject?.updatedExisting;
          if (isNewMessage) {
            await Conversation.findByIdAndUpdate(
              conv._id,
              {
                lastMessage: message._id,
                updatedAt: new Date(),
              },
              {
                session: dbSession,
              },
            );
          }
        });
      } catch (error) {
        throw error;
      } finally {
        await dbSession.endSession();
      }
    }

    // Both branches must have resolved these by now
    if (!conversationId || !receiverId) {
      throw new Error("conversationId or receiverId unresolved");
    }

    if (!message) {
      const msgResult = await Message.findOneAndUpdate(
        { senderId, tempId: input.tempId },
        {
          $setOnInsert: {
            tempId: input.tempId,
            conversationId,
            senderId,
            content: input.content,
            messageType: input.messageType,
            status: "sent",
          },
        },
        {
          new: true,
          upsert: true,
          runValidators: true,
          lean: true,
        },
      );

      if (!msgResult) throw new Error("Message upsert returned no document");
      message = msgResult as MessageDtoSource;

      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: message._id,
        updatedAt: new Date(),
        $pull: { hiddenFor: senderId },
      });
    }

    const messagePayload = toMessageDTO(message);
    let senderConversation: ConversationDTO | undefined = undefined;
    let recipientConversation: ConversationDTO | undefined = undefined;
    if (input.kind === "new") {
      const populated = await Conversation.findById(conversationId)
        .select("participants lastMessage clearedAt createdAt")
        .populate("participants", "_id uid username isDeleted")
        .populate("lastMessage", "-updatedAt")
        .lean();
      senderConversation = toConversationDTO(populated, senderId.toString());
      recipientConversation = toConversationDTO(
        populated,
        receiverId.toString(),
      );
    }

    const wsPayload = isNewConversation
      ? {
          type: "NEW_CONVERSATION_MESSAGE",
          payload: {
            conversation: recipientConversation,
            message: messagePayload,
          },
        }
      : {
          type: "NEW_MESSAGE",
          payload: messagePayload,
        };

    const internalSecret = process.env.INTERNAL_SECRET;

    if (internalSecret) {
      fetch(`${process.env.NODE_SERVER_URL}/api/push`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": internalSecret,
        },
        body: JSON.stringify({
          receiverId: receiverId.toString(),
          payload: wsPayload,
        }),
      }).catch((err) => console.error("WS push failed", err));
    }

    if (input.kind === "new") {
      return successResponse("Message saved", 200, {
        conversation: senderConversation,
        message: messagePayload,
      });
    }

    return successResponse("Message saved", 200, messagePayload);
  } catch (error) {
    return handleApiError(error);
  }
}
