import { Conversation } from "@/lib/Models/index";
import type { reducedIConversation } from "@/lib/Models/conversation";
import type { ChatConversation } from "@/lib/validation/conversation.schema";
import { GetSession } from "@/lib/utils/session";
import { successResponse } from "@/lib/types/apiResponse";
import { updatedClientSession } from "@/lib/Models/index";
import { handleApiError } from "@/lib/utils/errorUtil";
import { sessionExpiredJSON } from "@/lib/auth/sessionExpiredJSON";
import { toConversationDTO } from "@/lib/utils/toConversationDTO";

// get conversation list
export async function GET() {
  try {
    const session: updatedClientSession = await GetSession();

    if (!session) return sessionExpiredJSON();

    const userId = session.user._id;

    const conversationList: reducedIConversation[] = await Conversation.find({
      participants: userId,
      hiddenFor: { $ne: userId },
    })
      .select("-directKey -isGroup  -hiddenFor -updatedAt")
      .populate("participants", "_id uid username isDeleted")
      .populate("lastMessage", "-updatedAt")
      .sort({ updatedAt: -1 })
      .lean();

    const inbox: ChatConversation[] = conversationList.map((conv) =>
      toConversationDTO(conv, userId.toString()),
    );

    // sort
    inbox.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    return successResponse<ChatConversation[]>(
      "successfully fetched the conversations",
      200,
      inbox,
    );
  } catch (error) {
    return handleApiError(error);
  }
}
