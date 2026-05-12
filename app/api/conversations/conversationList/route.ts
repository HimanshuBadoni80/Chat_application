import { Conversation } from "@/lib/Models/index";
import { NextResponse } from "next/server";
import GetSession from "@/lib/getSession";
import type {
  updatedClientSession,
  updatedIConversation,
  PopulatedParticipant,
} from "@/lib/types/Conversation";
import connectDB from "@/lib/actions/mongodb";
import { handleApiError } from "@/lib/error/errorUtil";
import { ApiResponse } from "@/lib/types/api";

// function to get conversation list
export  async function GET() {
  try {
    const session: updatedClientSession = await GetSession();

    if (!session) {
      // tell the user to log in again and do a hard refresh
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorised",
        },
        { status: 401 },
      );
    }

    // get the user from the session
    const userDocId = session.user._id;
    await connectDB();

    const rawlist = await Conversation.find({
      participants: userDocId,
    })
      .populate("participants", "_id uid username")
      .populate("lastMessage", "-updatedAt")
      .sort({ updatedAt: -1 })
      .lean();

    const conversationList: updatedIConversation[] = rawlist.map((conv) => ({
      ...conv,
      _id: conv._id.toString(),
      createdAt: conv.createdAt?.toISOString(),
      participants: conv.participants?.map((p: PopulatedParticipant) => ({
        ...p,
        _id: p._id?.toString(),
      })),
      // Use optional chaining to prevent "undefined" errors
      lastMessage: conv.lastMessage
        ? {
            ...conv.lastMessage,
            _id: conv.lastMessage._id?.toString(),
            senderId: conv.lastMessage.senderId?.toString(),
            createdAt: conv.lastMessage.createdAt?.toISOString(),
          }
        : null,
    }));

    // if conversation list is empty you just send it anyway, new users will have no conversations. frontend will show the start new chat ui.

    const response: ApiResponse<updatedIConversation[]> = {
      success: true,
      message: "successfully fetched the conversations",
      data: conversationList,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
