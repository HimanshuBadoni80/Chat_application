import { User } from "@/lib/Models/index";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { emailSchema } from "@/lib/zod/zodSchemas";
import crypto from "crypto";
import { sendEmail } from "@/lib/mail/mail";
import { ApiResponse } from "@/lib/types/api";
import connectDB from "@/lib/actions/mongodb";
import { handleApiError } from "@/lib/error/errorUtil";

// the email sender
export  async function POST(request: NextRequest) {
  /* get the json
       validate json
       call the db
       find the user
       set the passwordResetHash?: string; passwordResetExpires?: Date; resetAttempts: number;
       send a success response, and an email to the user email. 
    */

  const body = await request.json();

  // validate email
  const validation = emailSchema.safeParse(body.email);

  if (!validation.success) {
    const response: ApiResponse = {
      success: false,
      message: "validation failed",
      error: {
        code: "VALIDATION_ERROR",
      },
    };
    return NextResponse.json(response, {
      status: 400,
    });
  }

  const email = validation.data;

  // from parameter
  const requestUrl = new URL(request.url);
  const redirectTo = requestUrl.searchParams.get("from") || "/dashboard";
  const safeRedirect = redirectTo.startsWith("/") ? redirectTo : "/dashboard";

  try {
    await connectDB();

    // look for the user
    const user = await User.findOne({ email });

    if (!user) {
      const response: ApiResponse<string> = {
        success: true,
        message: "if an account exists, a reset link has been sent",
        data: email,
      };
      return NextResponse.json(response, {
        status: 404,
      });
    }

    // not verified
    if (!user.isVerified) {
      const response: ApiResponse = {
        success: false,
        message: "Please verify your email before resetting your password.",
        error: {
          code: "USER_UNVERIFIED",
        },
      };
      return Response.json(response, {
        status: 403, // Forbidden
      });
    }

    // Rate Limit
    if (
      user.resetAttempts > 5 &&
      user.updatedAt > new Date(Date.now() - 60 * 60 * 1000)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Too many attempts. Try again in an hour.",
        },
        { status: 429 }, // to many requests
      );
    }
    // generate the rawToken
    const rawToken = crypto.randomBytes(32).toString("base64url");
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    user.passwordResetHash = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);
    user.resetAttempts = (user.resetAttempts | 0) + 1; // undefined or null for first timers
    await user.save();

    // send the email to user
    await sendEmail(email, rawToken, "/reset-password", safeRedirect);
    // send success response to the user
    const response: ApiResponse<string> = {
      success: true,
      message: "Password reset link has been sent to your email.",
      data: email,
    };
    return NextResponse.json(response, {
      status: 200,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
