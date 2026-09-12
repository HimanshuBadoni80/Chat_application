import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { updatedClientSession } from "@/lib/Models";
import { GetSession } from "@/lib/utils/session";
import { Conversation, Message } from "@/lib/Models/index";
import type { IConversation } from "@/lib/Models/index";
import { handleApiError } from "@/lib/utils/errorUtil";
import { ApiResponse } from "@/lib/types/apiResponse";
import connectDB from "@/lib/actions/mongodb";
import { toMessageDTO } from "@/lib/utils/toMessageDTO";
import type { MessageDto } from "@/lib/validation/message.schema";

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

    const stringifiedMsgs: MessageDto[] = missedMessages.map(toMessageDTO);

    const response: ApiResponse<MessageDto[]> = {
      success: true,
      message: "missed messges fetched",
      data: stringifiedMsgs,
    };
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
