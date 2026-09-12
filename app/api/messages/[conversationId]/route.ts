import type { NextRequest } from "next/server";
import {
  errorResponse,
  zodValidationError,
  successResponse,
} from "@/lib/types/apiResponse";
import { handleApiError } from "@/lib/utils/errorUtil";
import { Message, Conversation, IMessage } from "@/lib/Models";
import type { IConversation } from "@/lib/Models";
import { GetSession } from "@/lib/utils/session";
import { historyFetchSchema } from "@/lib/validation/message.schema";
import { sessionExpiredJSON } from "@/lib/auth/sessionExpiredJSON";
import { QueryFilter } from "mongoose";
import { toMessageDTO } from "@/lib/utils/toMessageDTO";
import type { MessageDto } from "@/lib/validation/message.schema";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> },
) {
  try {
    const session = await GetSession();

    if (!session) {
      return sessionExpiredJSON();
    }

    // get the id from params
    const { conversationId } = await params;

    // validate the data
    const validation = historyFetchSchema.safeParse({
      conversationId,
      createdAt: request.nextUrl.searchParams.get("before") || undefined,
    });

    if (!validation.success) {
      return zodValidationError(validation.error);
    }

    const userId = session.user._id as string;
    const ConvId = validation.data.conversationId;
    const before = validation.data.createdAt;

    // check if the currentUser is participant or not
    const conversation: IConversation = await Conversation.findOne({
      _id: ConvId,
      participants: userId, // { $elemMatch: { $eq: currentUserId } }
    }).lean();

    if (!conversation) {
      return errorResponse(
        403,
        "not authorized to view these messages",
        "UNAUTHORIZED_USER",
      );
    }

    const clearedAt = conversation.clearedAt.get(userId);

    const query: QueryFilter<IMessage> = { conversationId: conversation._id };

    query.createdAt = {
      ...(clearedAt ? { $gt: clearedAt } : {}),
      $lt: before ?? new Date(),
    };

    // fetch the last 20 messages
    const messages = await Message.find(query)
      .sort({ createdAt: -1 }) // descending order, latest date is larger than the older one
      .limit(20)
      .lean();

    messages.reverse();

    const cleanMessages: MessageDto[] = messages.map(toMessageDTO);

    return successResponse<MessageDto[]>(
      "messages fetched successfully",
      200,
      cleanMessages,
    );
  } catch (error) {
    return handleApiError(error);
  }
}
