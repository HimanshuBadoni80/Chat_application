import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import * as z from "zod";
import connectDB from "@/lib/actions/mongodb";
import GetSession from "@/lib/getSession";
import { Contact, User } from "@/lib/Models";
import { ApiResponse } from "@/lib/types/api";
import { createContactSchema } from "@/lib/zod/contact/Schemas";
import { handleApiError } from "@/lib/error/errorUtil";

type ContactDto = {
  _id: string;
  user: {
    _id: string;
    uid: string;
    username: string | null;
  };
  createdAt: string;
};

function validationError(details?: Record<string, string>) {
  const response: ApiResponse = {
    success: false,
    message: "Invalid contact details",
    error: {
      code: "VALIDATION_ERROR",
      details,
    },
  };

  return NextResponse.json(response, { status: 400 });
}

export async function POST(request: NextRequest) {
  try {
    const session = await GetSession();

    if (!session) {
      const response: ApiResponse<{ redirectTo: string }> = {
        success: false,
        message: "Please log in to add a contact",
        data: { redirectTo: "/api/auth/session-expired" },
        error: { code: "NO_ACTIVE_SESSION" },
      };
      return NextResponse.json(response, { status: 401 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return validationError({ body: "Request body must be valid JSON" });
    }

    const validation = createContactSchema.safeParse(body);
    if (!validation.success) {
      const flattened = z.flattenError(validation.error);
      return validationError(
        Object.fromEntries(
          Object.entries(flattened.fieldErrors).map(([key, value]) => [
            key,
            value?.[0] ?? "Invalid value",
          ]),
        ),
      );
    }

    await connectDB();

    const ownerId = session.user._id;
    const user = await User.findOne({ uid: validation.data.uid }).select(
      "_id uid username",
    );

    if (!user) {
      const response: ApiResponse = {
        success: false,
        message: "No user exists with that ID",
        error: { code: "USER_NOT_FOUND" },
      };
      return NextResponse.json(response, { status: 404 });
    }

    if (user._id.toString() === ownerId.toString()) {
      const response: ApiResponse = {
        success: false,
        message: "You cannot add yourself as a contact",
        error: { code: "INVALID_OPERATION" },
      };
      return NextResponse.json(response, { status: 400 });
    }

    const existingContact = await Contact.findOne({
      ownerId,
      userId: user._id,
    }).select("_id");

    if (existingContact) {
      const response: ApiResponse = {
        success: false,
        message: "This user is already in your contacts",
        error: { code: "CONTACT_EXISTS" },
      };
      return NextResponse.json(response, { status: 409 });
    }

    try {
      const contact = await Contact.create({ ownerId, userId: user._id });
      const response: ApiResponse<ContactDto> = {
        success: true,
        message: "Contact added",
        data: {
          _id: contact._id.toString(),
          user: {
            _id: user._id.toString(),
            uid: user.uid,
            username: user.username,
          },
          createdAt: contact.createdAt.toISOString(),
        },
      };

      return NextResponse.json(response, { status: 201 });
    } catch (error) {
      // The pre-check gives a friendly response; the unique index closes the
      // race where two identical requests arrive at the same time.
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === 11000
      ) {
        const response: ApiResponse = {
          success: false,
          message: "This user is already in your contacts",
          error: { code: "CONTACT_EXISTS" },
        };
        return NextResponse.json(response, { status: 409 });
      }
      throw error;
    }
  } catch (error) {
    return handleApiError(error);
  }
}
