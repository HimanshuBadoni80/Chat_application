// fetches all the contacts from the database

import { NextResponse } from "next/server";
import GetSession, { SessionLookupError } from "@/lib/getSession";
import { sessionExpiredJSON } from "@/lib/auth/sessionExpiredJSON";
import { ApiResponse } from "@/lib/types/api";
import { handleApiError } from "@/lib/error/errorUtil";
import { Contact } from "@/lib/Models/index";


type ContactListDto = {
  _id: string;
  user: {
    _id: string;
    uid: string;
    username: string | null;
  } | null;
  createdAt: string;
};

// type SessionResult = Awaited<ReturnType<typeof GetSession>>;

export async function GET() {
  try {
    const session = await GetSession();
    if (!session) return sessionExpiredJSON();

    const ownerId = session.user._id;

    // await connectDB();  not needed as GetSession already has opened a connection.

    const contactList = await Contact.find({
      ownerId,
    })
      .select("_id createdAt")
      .populate("userId", "_id uid username")
      .sort({ createdAt: -1 })
      .lean();

    

    const finalList = contactList.map((contact) => ({
      _id: contact._id.toString(),
      user: contact.userId
        ? {
            _id: contact.userId._id.toString(),
            uid: contact.userId.uid,
            username: contact.userId.username,
          }
        : null,
      createdAt: contact.createdAt.toISOString(),
    }));

    const response: ApiResponse<ContactListDto[]> = {
      success: true,
      message: "successfully fetched the contacts",
      data: finalList,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    if (error instanceof SessionLookupError) {
      const response: ApiResponse = {
        success: false,
        message:
          "Unable to verify your session right now. Please try again later",
        error: {
          code: "SERVER_ERROR",
        },
      };
      return NextResponse.json(response, { status: 503 }); // 503: service unavailable
    }

    return handleApiError(error);
  }
}


// at line no 35, if userId is null, keep it and allow the user to know that the contact no longer exists. User can choose to delete it. 

