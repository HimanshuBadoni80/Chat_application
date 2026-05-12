import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { resetPasswordSchema } from "@/lib/zod/zodSchemas";
import connectDB from "@/lib/actions/mongodb";
import { ApiResponse } from "@/lib/types/api";
import { z } from "zod";
import { User, Session } from "@/lib/Models/index";
import crypto from "crypto";
import { handleApiError } from "@/lib/error/errorUtil";


// looks for a Token Hash in the database.
export  async function POST(request: NextRequest) {
  /* the flow
        get the json body
        zod validation
        user lookup (DB call)
        token verification
            -hash the incoming token and compare
            -expiry check
        update
            -the new password
            -unset the passwordResetHash?: string; and passwordResetExpires?: Date;
        invalidate all the active sessions

        send a success response and and a redirectTo: "/login?reset=true". 

        note- don't involve from parameter, not need, the User Intent has changed completely.
            user is in "Recovery Mode.

    */

  /* {
        "token": "string",
        "email" : "string",
        "newPassword": "string",
        "confirmPassword": "string"
     } 
    */

  // get the body
  const body = await request.json();

  // validate
  const validation = resetPasswordSchema.safeParse(body);

  if (!validation.success) {
    // get the error fields
    const flattened = z.flattenError(validation.error);
    const response: ApiResponse = {
      success: false,
      message: "validation failed",
      error: {
        code: "VALIDATION_ERROR",
        details: Object.fromEntries(
          Object.entries(flattened.fieldErrors).map(([key, value]) => [
            key,
            value?.[0] || "Invalid",
          ]),
        ),
      },
    };
    return NextResponse.json(response, { status: 400 });
  }

  try {
    // call the DB
    await connectDB();

    const hashedToken = crypto
      .createHash("sha256")
      .update(validation.data.token)
      .digest("hex");
    // look for the user
    const user = await User.findOne({
      email: validation.data.email,
      passwordResetHash: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    });

    // when you pass an object with multiple fields to findOne(), it performs an implicit AND operation.
    if (!user) {
      const response: ApiResponse = {
        success: false,
        message: "The reset link is invalid or has expired.",
        error: {
          code: "LINK_INVALID",
        },
      };
      return NextResponse.json(response, { status: 401 });
    }

    // update the user password
    user.password = validation.data.newPassword;

    // clear the reset fields
    user.passwordResetHash = undefined;
    user.passwordResetExpires = undefined;
    user.resetAttempts = 0;

    // save the doc to trigger pre-hook to hash the password
    await user.save();

    // After successful user.save()
    await Session.deleteMany({ userId: user._id });

    const response: ApiResponse<{ redirectTo: string }> = {
      success: true,
      message: "Password reset successful.",
      data: {
        redirectTo: "/login?reset=true",
      },
    };
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

/* Common "Status" Parameters
In professional apps, you'll see this pattern used for many things:

/login?error=OAuthSignin (If Google login fails)

/login?verified=true (After they click the email verification link)

/login?logout=true (To show a "You have been logged out" message) */
