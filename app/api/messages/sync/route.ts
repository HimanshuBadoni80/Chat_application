import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { updatedClientSession } from "@/lib/types/Conversation";
import GetSession from "@/lib/getSession";
import { Conversation, Message } from "@/lib/Models/index";
import type { IConversation, IMessageBase } from "@/lib/Models/index";
import { handleApiError } from "@/lib/error/errorUtil";
import { ApiResponse } from "@/lib/types/api";
import connectDB from "@/lib/actions/mongodb";

export async function GET(request: NextRequest) {
  try {
    // authenticate the user
    const session: updatedClientSession = await GetSession();
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

    // get search params from the url (/api/messages/sync?since=2024-05-20T12:00:00.000Z)
    const since = request.nextUrl.searchParams.get("since");

    if (!since) {
      const response: ApiResponse = {
        success: false,
        message: "'since' parameter is required",
      };
      return NextResponse.json(response, { status: 400 });
    }

    const sinceDate = new Date(since);

    if (isNaN(sinceDate.getTime())) {
      const response: ApiResponse = {
        success: false,
        message: "Invalid 'since' timestamp format",
      };
      return NextResponse.json(response, { status: 400 });
    }

    const currentUserId = session.user._id;

    await connectDB();

    // fetch all the conversations that belongs to the user
    const conversations = await Conversation.find<IConversation>({
      participants: currentUserId,
    });

    // if no conversations
    if (conversations.length === 0) {
      const response: ApiResponse<[]> = {
        success: true,
        message: "zero conversations",
        data: [],
      };
      return NextResponse.json(response, { status: 200 });
    }

    const conversationIDs = conversations.map((conv) => conv._id);

    const missedMessages = await Message.find({
      conversationId: { $in: conversationIDs },
      createdAt: { $gt: sinceDate },
    })
      .select("-updatedAt")
      .sort({ createdAt: 1 })
      .lean(); // oldest to new

    if (missedMessages.length === 0) {
      const response: ApiResponse<[]> = {
        success: true,
        message: "no missed messges",
        data: [],
      };
      return NextResponse.json(response, { status: 200 });
    }

    // stringify all the dates and ObjectIds
    const stringifiedMsgs: IMessageBase[] = missedMessages.map((msg) => ({
      ...msg,
      _id: msg._id.toString(),
      senderId: msg.senderId.toString(),
      conversationId: msg.conversationId.toString(),
      createdAt: msg.createdAt.toISOString(),
    }));

    const response: ApiResponse<IMessageBase[]> = {
      success: true,
      message: "missed messges fetched",
      data: stringifiedMsgs,
    };
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
