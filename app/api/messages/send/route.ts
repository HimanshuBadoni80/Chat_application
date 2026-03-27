import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { messageSchema } from "@/lib/zod/messages/Schemas";
import { ApiResponse } from "@/lib/types/api";
import GetSession from "@/lib/auth";
import { Message, Conversation } from "@/lib/Models/index";
import { Types } from "mongoose";
import type { IMessage } from "@/lib/Models/index";
import * as z from "zod";
import { handleApiError } from "@/lib/error/errorUtil";
export default async function POST(request: NextRequest) {
  try {
    // get the values
    const body = await request.json();
    const validation = messageSchema.safeParse(body);
    if (!validation.success) {
      const flattened = z.flattenError(validation.error);
      const response: ApiResponse = {
        success: false,
        message: "invalid credentials",
        error: {
          code: "VALIDATION_ERROR",
          details: Object.fromEntries(
            Object.entries(flattened.fieldErrors).map(([key, value]) => [
              key,
              value?.[0] || "Invalid",
            ]),
          ),
        },
      };
      return NextResponse.json(response, { status: 400 });
    }

    const { conversationId, content, messageType } = validation.data;
    // authenticate the sender
    const session = await GetSession();
    // no active session
    if (!session) {
      const response: ApiResponse<{ redirectTo: string }> = {
        success: false,
        message: "Please login to start a chat",
        data: {
          redirectTo: "/login", // hard refresh
        },
        error: {
          code: "NO_ACTIVE_SESSION",
        },
      };
      return NextResponse.json(response, {
        status: 401,
      });
    }

    const senderId = session.userId._id;

    const conversation = await Conversation.findOne({
      _id: conversationId, //Look for the specific chat
      isGroup: false,
      participants: senderId, // AND verify the sender is allowed to be there
    });

    if (!conversation) {
      const response: ApiResponse = {
        success: false,
        message: "not authorized to send message",
        error: {
          code: "UNAUTHORIZED_USER",
        },
      };
      return NextResponse.json(response, {
        status: 403,
      });
    }

    // get the receiverId
    const receiverId = conversation.participants.find(
      (Id: Types.ObjectId) => !Id.equals(senderId),
    );

    if (!receiverId) {
      // This would only happen if someone is in a 1-on-1 chat with themselves!
      throw new Error("Receiver not found");
    }

    // parallel update
    const newMessage = await Message.create({
      conversationId,
      senderId,
      content,
      messageType,
      status: "sent",
    });

    // clean object for both the Websocket and HTTP response
    const messagePayload: Partial<IMessage> = {
      _id: newMessage._id.tostring(),
      conversationId: newMessage.conversationId.toString(),
      senderId: newMessage.senderId.toString(),
      content: newMessage.content,
      messageType: newMessage.messageType,
      createdAt: newMessage.createdAt,
    };

    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: newMessage,
      updatedAt: new Date(),
    });

    // websocket server logic here
    fetch(`${process.env.NODE_SERVER_URL}/api/push`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.INTERNAL_SECRET || "",
      },
      body: JSON.stringify({
        receiverId: receiverId.toString(),
        payload: messagePayload, // send the clean object
      }),
    }).catch((err) => console.error("Ws push failed", err));

    const response: ApiResponse<Partial<IMessage>> = {
      success: true,
      message: "message saved",
      data: { ...messagePayload, status: "sent" }, // send the clean object
    };
    return NextResponse.json(response, {
      status: 200,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/* we trusted the Conversation document and did not check the receiverId.
if receiver is not there(account deleted or removed from the app), 
we should have a "Cleanup Service" that removes them from the participants array of all their conversations or marks the conversation as inactive.
If the senderId is in the participants and there is another ID there, we assume the "Folder" is still valid. */
