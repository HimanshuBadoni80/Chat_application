import type { NextRequest } from "next/server";
import { GetSession } from "@/lib/utils/session";
import { Contact, User, type populatedContact } from "@/lib/Models";
import { createContactSchema } from "@/lib/validation/contact.schema";
import { handleApiError } from "@/lib/utils/errorUtil";
import { sessionExpiredJSON } from "@/lib/auth/sessionExpiredJSON";
import {
  zodValidationError,
  errorResponse,
  successResponse,
} from "@/lib/types/apiResponse";
import { toContactDTO } from "@/lib/utils/toContactDTO";

export async function POST(request: NextRequest) {
  try {
    const session = await GetSession();
    if (!session) return sessionExpiredJSON();

    const body = await request.json();

    const validation = createContactSchema.safeParse(body);

    if (!validation.success) {
      return zodValidationError(validation.error);
    }

    const ownerId = session.user._id;

    // find the user
    const user = await User.findOne({ uid: validation.data.uid }).select(
      "_id uid username isDeleted",
    );

    // if user is not found
    if (!user || user.isDeleted) {
      return errorResponse(
        404,
        "No user exists with that ID",
        "USER_NOT_FOUND",
      );
    }

    // did the owner submit its own id?
    if (user._id.toString() === ownerId.toString()) {
      return errorResponse(
        400,
        "You cannot add yourself as a contact",
        "INVALID_OPERATION",
      );
    }

    // does the user exists in owner contact list?
    const existingContact = await Contact.findOne({
      ownerId,
      userId: user._id,
    }).select("_id");

    // contact found.
    if (existingContact) {
      return errorResponse(
        409,
        "This user is already in your contacts",
        "CONTACT_EXISTS",
      );
    }

    const contact = await (
      await Contact.create({
        ownerId,
        userId: user._id,
        nickname: validation.data.nickname,
      })
    ).populate("userId", "_id uid username isDeleted");

    const LeanContact: populatedContact = contact.toObject(); // same result as .lean() on a query

    const data = toContactDTO(LeanContact);

    return successResponse("Contact added", 200, data);
  } catch (error) {
    return handleApiError(error);
  }
}
