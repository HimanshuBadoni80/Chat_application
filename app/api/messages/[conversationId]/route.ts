import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { ApiResponse } from "@/lib/types/api";
import connectDB from "@/lib/actions/mongodb";
import { handleApiError } from "@/lib/error/errorUtil";
import { Message, Conversation, IMessageBase } from "@/lib/Models";
import GetSession from "@/lib/auth";

export default async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> },
) {
  /* the flow
        1. get the conversationId from the url params
        2. check the user session and existence as a participant
        3. sort by createdAt in descending order 
        4. get the first 20 messages and send to the frontend
    */

  try {
    // get the id from params
    const { conversationId } = await params;

    // connect the DB
    await connectDB();

    // check the user session
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

    const currentUserId = session.userId._id;

    // check if the currentUser is participant or not
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: currentUserId, // { $elemMatch: { $eq: currentUserId } }
    }).select("_id");

    if (!conversation) {
      const response: ApiResponse = {
        success: false,
        message: "not authorized to view these messages",
        error: {
          code: "UNAUTHORIZED_USER",
        },
      };
      return NextResponse.json(response, {
        status: 403,
      });
    }

    // fetch the last 20 messages
    const messages = await Message.find({ conversationId })
      .sort({ createdAt: -1 }) // descending order, latest date is larger than the older one
      .limit(20)
      .lean();

    const oldestToNewMessages = [...messages].reverse(); // for ui, latest at the bottom,oldest at the top of screen

    // clean DTO Data Transfer Object
    const cleanMessages:IMessageBase[] = oldestToNewMessages.map((msg) => ({
      _id: msg._id.toString(),
      tempId: msg.tempId.toString(),
      conversationId: msg.conversationId.toString(),
      senderId: msg.senderId.toString(),
      content: msg.content,
      messageType: msg.messageType,
      status: msg.status || "sent",
      createdAt: msg.createdAt,
    }));
    const response: ApiResponse<IMessageBase[]> = {
      success: true,
      message: "messages fetched successfully",
      data: cleanMessages,
    };

    return NextResponse.json(response, {
      status: 200,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
