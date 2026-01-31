import crypto from "crypto";
import connectDB from "@/lib/actions/mongodb";
import User from "@/lib/Models/User";
import Session from "@/lib/Models/Session";
import { zodLogin } from "@/lib/zod/zodSchemas";
import { z } from "zod";
import { ApiResponse } from "@/lib/types/api";
import bcrypt from "bcrypt";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export default async function POST(request: NextRequest) {
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

  // on validation success
  await connectDB();

  // check if user exists
  const { email, password } = validation.data;

  const user = await User.findOne({
    email,
  }).select("+password isVerified");

  if (!user) {
    const response: ApiResponse = {
      success: false,
      message: "invalid credentails",
      error: {
        code: "INVALID_CREDENTIALS",
      },
    };
    return Response.json(response, { status: 401 });
  }

  // check the password
  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) {
    const response: ApiResponse = {
      success: false,
      message: "invalid credentails",
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
      },
    };
    return Response.json(response, {
      status: 403,
    });
  }

  //if user exists
  /* Create Session: Use your new Session model.

Set Cookie: Send the response with the Set-Cookie header. */

  const rawToken = crypto.randomBytes(32).toString("base64url");

  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  try {
    const ip = getCientIp(request);
    const newSession = await Session.create({
      sessionToken: hashedToken,
      userId: user._id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      userAgent: request.headers.get("user-agent"),
      ip,
    });

    // if saved in db, send it to the browser
    if (!newSession) {
      throw new Error("failed to create new session");
    }
    const response = NextResponse.json(
      {
        success: true,
        message: "Logged in successfully",
      },
      { status: 200 },
    );
    response.cookies.set("session_token", rawToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: newSession.expiresAt,
      path: "/",
    });
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

function hasIp(request: NextRequest): request is NextRequest & { ip: string } {
  return "ip" in request;
}

function getCientIp(request: NextRequest): string {
  //Check for the standard proxy header (most reliable in prod)
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();

  //Check for the specific Vercel/Next header
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;

  if (hasIp(request)) {
    return request.ip;
  }

  return "127.0.0.1";
}

/* TypeScript narrows types only when it can see the check
or when the function’s return type explicitly promises a narrowing (is). 

TypeScript reads function bodies for type correctness,
but ignores them for type narrowing outside the function.
*/
