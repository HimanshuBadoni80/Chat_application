import connectDB from "@/lib/actions/mongodb";
import User from "@/lib/Models/User";

import { zodLogin } from "@/lib/zod/zodSchemas";
import { z } from "zod";
import { ApiResponse } from "@/lib/types/api";
import bcrypt from "bcrypt";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import CreateSessionAndResponse from "@/lib/createsession";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const validation = zodLogin.safeParse(body);

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
    // on validation success
    await connectDB();

    // check if user exists
    const { email, password } = validation.data;

    const user = await User.findOne({
      email,
    }).select("+password isVerified");

    // if user not found or  incorrect password
    if (!user || !(await bcrypt.compare(password, user.password))) {
      const response: ApiResponse = {
        success: false,
        message: "invalid credentials",
        error: {
          code: "INVALID_CREDENTIALS",
        },
      };
      return Response.json(response, { status: 401 });
    }

    // if not verified
    if (!user.isVerified) {
      const response: ApiResponse = {
        success: false,
        message: "account not verified",
        error: {
          code: "USER_UNVERIFIED",
          details: {
            email: user.email,
          },
        },
      };
      return Response.json(response, {
        status: 403,
      });
    }


    // if no username
    const redirectPath = user.username ? undefined : "/set-username";

    const response = await CreateSessionAndResponse(
      user._id,
      request,
      "json",
      "Logged in successfully",
      redirectPath
    );
    return response;
  } catch (error) {
    let errorMessage = "An unexpected error occured";
    if (error instanceof Error) {
      console.error(`login api:${error.message}`);
      if (process.env.NODE_ENV === "development") {
        errorMessage = error.message;
      }
    }
    return NextResponse.json(
      {
        success: false,
        message: errorMessage,
      },
      {
        status: 500,
      },
    );
  }
}
