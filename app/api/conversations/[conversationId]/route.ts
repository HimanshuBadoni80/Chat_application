import { NextRequest } from "next/server";
import { Conversation } from "@/lib/Models";
import { GetSession } from "@/lib/utils/session";
import { successResponse, errorResponse } from "@/lib/types/apiResponse";
import { handleApiError } from "@/lib/utils/errorUtil";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const session = await GetSession();
    if (!session) {
      return errorResponse(401, "Not authorized", "NO_ACTIVE_SESSION");
    }

    const { conversationId } = await params;
    const userId = session.user._id;

    // Add user's ID to the hiddenFor array using $addToSet to avoid duplicates
    const updatedConv = await Conversation.findOneAndUpdate(
      { 
        _id: conversationId,
        participants: userId // Ensure the user is actually a participant
      },
      { 
        $addToSet: { hiddenFor: userId } 
      },
      { new: true }
    );

    if (!updatedConv) {
      return errorResponse(404, "Conversation not found or you are not a participant", "USER_NOT_FOUND");
    }

    return successResponse("Conversation deleted successfully", 200);
  } catch (error) {
    return handleApiError(error);
  }
}
