/* what i need, first
1.token and email and zod to verify them.
2. i need cryto for hasing the token
3. i need mongoose connection
*/

// question for later-
// Are you planning to send the token and email in the body (POST request) or in the URL (GET request)? If it's a GET request, you'll be parsing searchParams instead of request.json()

import { z } from "zod";
import crypto from "crypto";
import connectDB from "@/lib/actions/mongodb";
import User from "@/lib/Models/User";
import { ApiResponse } from "@/lib/types/api";

const verifySchema = z.object({
  token: z.string().min(1, "Too short"),
  email: z.email({ error: "Invalid Email format" }),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const queryData = {
    token: searchParams.get("token"),
    email: searchParams.get("email"),
  };

  const validation = verifySchema.safeParse(queryData);

  // if validation failed
  if (!validation.success) {
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
    return Response.json(response, {
      status: 400,
    });
  }
  try {
    const { email, token } = validation.data;
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    await connectDB();
    const user = await User.findOneAndUpdate(
      {
        email,
        verifyToken: hashedToken,
        verifyTokenExpiry: { $gt: new Date() },
      },
      {
        $set: { isVerified: true },
        $unset: { verifyToken: "", verifyTokenExpiry: "" },
      },
    );

    if (!user) {
      const response: ApiResponse = {
        success: false,
        message: "The verification link is invalid or has expired.",
        error:{
          code: "LINK_INVALID",
        }
      };
      return Response.json(response, {
        status: 400,
      });
    }

    return Response.json(
      {
        success: true,
        message: "Email is verified now",
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error:", error);
    return Response.json(
      {
        success: false,
        message: "Server Error",
      },
      {
        status: 500,
      },
    );
  }
}
