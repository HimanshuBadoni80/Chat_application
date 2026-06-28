import Session from "./Models/Session";
import crypto from "crypto";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default async function CreateSessionAndResponse(
  userId: string,
  request: NextRequest,
  type: "redirect" | "json" = "redirect",
  message: string,
  redirectPath?: string,
) {
  const rawToken = crypto.randomBytes(32).toString("base64url");
  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");
  const ip = getClientIp(request);
  const newSession = await Session.create({
    sessionToken: hashedToken,
    user: userId,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    userAgent: request.headers.get("user-agent"),
    ip,
  });

  if (!newSession) {
    throw new Error("failed to create new session");
  }

  // if redirectPath is present, meaning- login or verify said redirect to set-username, top priority.
  // else priortise from parameter.
  // if not present default to /chat.

  const from = request.nextUrl.searchParams.get("from");
  const safeFrom =
    from?.startsWith("/") && !from.startsWith("//") ? from : "/chat";

  const redirectTo = redirectPath ?? safeFrom;

  let response;

  if (type === "redirect") {
    response = NextResponse.redirect(new URL(redirectTo, request.url));
  } else {
    // for verify api and login api

    response = NextResponse.json(
      {
        success: true,
        message,
        data: {
          redirectTo: redirectTo,
        },
      },
      {
        status: 200,
      },
    );
  }

  // send cookies to browser.
  response.cookies.set("session_token", rawToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: newSession.expiresAt,
    path: "/",
  });

  return response;
}

function hasIp(request: NextRequest): request is NextRequest & { ip: string } {
  return "ip" in request;
}

function getClientIp(request: NextRequest): string {
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
