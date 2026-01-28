import { ApiResponse } from "@/lib/types/api";
import connectDB from "@/lib/actions/mongodb";
import User from "@/lib/Models/User";
import crypto from "crypto";
import { sendEmail } from "@/lib/mail/mail";
import { handleApiError } from "@/lib/error/errorUtil";
import { emailSchema } from "@/lib/zod/zodSchemas";

export async function POST(request: Request) {
  const body = await request.json();

  const validation = emailSchema.safeParse(body.userEmail); // returns a string not a obj

  if (!validation.success) {
    const response: ApiResponse = {
      success: false,
      message: "validation failed",
      error: {
        code: "VALIDATION_ERROR",
      },
    };
    return Response.json(response, {
      status: 400,
    });
  }

  const email = validation.data; // validated.data = the email string

  try {
    await connectDB();

    // query the DB
    const user = await User.findOne({ email });
    if (!user) {
      const response: ApiResponse = {
        success: false,
        message: "user not found",
      };
      return Response.json(response, {
        status: 404,
      });
    }

    if (user.isVerified) {
      const response: ApiResponse = {
        success: false,
        message: "Account already verified ",
        error: {
          code: "ALREADY_VERIFIED",
        },
      };
      return Response.json(response, {
        status: 400,
      });
    }

    // unverified users
    const token = crypto.randomBytes(32).toString("base64url");
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    user.verifyToken = hashedToken;
    user.verifyTokenExpiry = new Date(Date.now()+ 24 * 60 * 60 * 1000);
    await user.save();

    // send the email

    await sendEmail(email, token);
    return Response.json(
      {
        success: true,
        message: "Verification email sent!",
        data: {
          userEmail: email,
        },
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
