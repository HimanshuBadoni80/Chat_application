// fetches all the contacts from the database
import { GetSession } from "@/lib/utils/session";
import { sessionExpiredJSON } from "@/lib/auth/sessionExpiredJSON";
import { handleApiError } from "@/lib/utils/errorUtil";
import { Contact, type populatedContact } from "@/lib/Models/index";
import { toContactDTO } from "@/lib/utils/toContactDTO";
import { successResponse } from "@/lib/types/apiResponse";

// type SessionResult = Awaited<ReturnType<typeof GetSession>>;

export async function GET() {
  try {
    const session = await GetSession();
    if (!session) return sessionExpiredJSON();

    const ownerId = session.user._id;

    // await connectDB();  not needed as GetSession already has opened a connection.

    const contactList: populatedContact[] = await Contact.find({
      ownerId,
    })
      .populate("userId", "_id uid username isDeleted")
      .sort({ createdAt: -1 })
      .lean();

    const finalList = contactList.map((contact) => toContactDTO(contact));

    return successResponse("successfully fetched the contacts", 200, finalList);
  } catch (error) {
    return handleApiError(error);
  }
}
