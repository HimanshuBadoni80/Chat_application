import { NextRequest } from "next/server";
import { Contact } from "@/lib/Models";
import { GetSession } from "@/lib/utils/session";
import { successResponse, errorResponse } from "@/lib/types/apiResponse";
import { handleApiError } from "@/lib/utils/errorUtil";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ contactId: string }> }
) {
  try {
    const session = await GetSession();
    if (!session) {
      return errorResponse(401, "Not authorized", "NO_ACTIVE_SESSION");
    }

    const { contactId } = await params;
    const userId = session.user._id;

    // Hard delete the contact ensuring the user owns it
    const deletedContact = await Contact.findOneAndDelete({
      _id: contactId,
      ownerId: userId,
    });

    if (!deletedContact) {
      return errorResponse(404, "Contact not found", "USER_NOT_FOUND");
    }

    return successResponse("Contact deleted successfully", 200);
  } catch (error) {
    return handleApiError(error);
  }
}
