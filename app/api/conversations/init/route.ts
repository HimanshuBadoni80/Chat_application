import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { initChatSchema } from "@/lib/zod/conversation/Schemas";
import { ApiResponse } from "@/lib/types/api";
import { User, Conversation } from "@/lib/Models";
import connectDB from "@/lib/actions/mongodb";
import GetSession from "@/lib/auth";
import { handleApiError } from "@/lib/error/errorUtil";

export default async function POST(request: NextRequest) {
  /* 🛠️ The Corrected Logic Flow
The Request: Frontend sends only the receiverId.

The Identity Check: The Backend looks at the session_token in the cookie to find out who is making the request (the senderId).

The Search: The Backend looks for a 1-on-1 Conversation with both IDs.

The Result: * If found: Return the conversationId.

If not found: Create the new Conversation and return the new conversationId.

The Transition: The Frontend receives the ID and redirects the user to the chat page (e.g., /chat/[conversationId]).

The "Hydration": Once on that page, the app fetches the old messages and connects the WebSocket. */
  try {
    const body = await request.json();

    const validation = initChatSchema.safeParse(body.receiverId);

    if (!validation.success) {
      const response: ApiResponse = {
        success: false,
        message: "Invalid User ID format",
        error: {
          code: "VALIDATION_ERROR",
        },
      };
      return NextResponse.json(response, {
        status: 400,
      });
    }

    // on validation success

    await connectDB();

    // get the sender's id
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

    // find the receiver by Public uid (nanoid)
    const receiver = await User.findOne({ uid: validation.data }).select("_id");

    if (!receiver) {
      const response: ApiResponse = {
        success: false,
        message: "contact not found/does not exists",
        error: {
          code: "USER_NOT_FOUND",
        },
      };
      return NextResponse.json(response, {
        status: 404,
      });
    }

    const receiverId = receiver._id;

    //PREVENT SELF-CHAT (The Senior Check)
    if (senderId.tostring() === receiverId.tostring()) {
      const response: ApiResponse = {
        success: false,
        message: "can't start chat with yourself",
        error: {
          code: "INVALID_OPERATION",
        },
      };
      return NextResponse.json(response, {
        status: 400,
      });
    }

    // query the conversation model
    let conversation = await Conversation.findOne({
      isGroup: false,
      participants: { $all: [senderId, receiverId], $size: 2 },
    });

    if (!conversation) {
      // create a new conversation
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
        isGroup: false,
      });
    }
    const response: ApiResponse<{ conversationId: string }> = {
      success: true,
      message: "conversation initialized",
      data: {
        conversationId: conversation._id,
      },
    };
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
