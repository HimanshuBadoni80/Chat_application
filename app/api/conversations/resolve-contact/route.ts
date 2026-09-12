import { sessionExpiredJSON } from "@/lib/auth/sessionExpiredJSON";
import { validateMongoIdSchema } from "@/lib/validation/auth.schema";
import { GetSession } from "@/lib/utils/session";
import {
  successResponse,
  errorResponse,
  zodValidationError,
} from "@/lib/types/apiResponse";
import type { NextRequest } from "next/server";
import type { contactToBeResolved } from "@/lib/types/resolveContact.types";
import { Contact, Conversation } from "@/lib/Models";
import { toConversationDTO } from "@/lib/utils/toConversationDTO";
import { handleApiError } from "@/lib/utils/errorUtil";

export async function POST(request: NextRequest) {
  try {
    const session = await GetSession();
    if (!session) return sessionExpiredJSON();

    const body: unknown = await request.json();
    const validation = validateMongoIdSchema.safeParse(body);

    if (!validation.success) return zodValidationError(validation.error);

    const ownerId = session.user._id.toString();
    // const contactId = validation.data.contactId;

    const targetedUserId = validation.data.targetId; // the id  is the other userId.

    const contactDoc = await Contact.findOne({
      ownerId,
      userId: targetedUserId,
    })
      .select("userId")
      .populate("userId", "_id isDeleted")
      .lean();

    if (!contactDoc) {
      return errorResponse(404, "Contact not found", "USER_NOT_FOUND");
    }

    if (!contactDoc.userId || contactDoc.userId.isDeleted) {
      return errorResponse(
        410,
        "This contact is no longer available.",
        "USER_NOT_FOUND",
      );
    }

    const directKey = [ownerId, contactDoc.userId._id.toString()]
      .sort()
      .join(":");

    const conversationDoc = await Conversation.findOneAndUpdate(
      { directKey, isGroup: false },
      { $pull: { hiddenFor: ownerId } },
      { new: true },
    )
      .select("participants lastMessage clearedAt createdAt")
      .populate("participants", "_id uid username isDeleted")
      .populate("lastMessage", "-updatedAt")
      .lean();

    if (conversationDoc) {
      const data: contactToBeResolved = {
        kind: "existing",
        conversation: toConversationDTO(conversationDoc, ownerId),
      };

      return successResponse<contactToBeResolved>(
        "Opened existing conversation",
        200,
        data,
      );
    }

    const data: contactToBeResolved = { kind: "draft" };

    return successResponse<contactToBeResolved>(
      "No existing conversation was found",
      200,
      data,
    );
  } catch (error) {
    return handleApiError(error);
  }
}
