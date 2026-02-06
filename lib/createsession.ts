import Session from "./Models/Session";
import crypto from "crypto";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default async function CreateSessionAndResponse(
  userId: string,
  redirectPath: string = "/dashboard",
  request: NextRequest,
  type: "redirect" | "json" = "redirect",
  message: string,
) {
  const rawToken = crypto.randomBytes(32).toString("base64url");
  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");
  const ip = getCientIp(request);
  const newSession = await Session.create({
    sessionToken: hashedToken,
    userId: userId,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    userAgent: request.headers.get("user-agent"),
    ip,
  });
  if (!newSession) {
    throw new Error("failed to create new session");
  }

  const requestUrl = new URL(request.url);

  const redirectTo = requestUrl.searchParams.get("from") || redirectPath;

  const safeRedirect = redirectTo.startsWith("/") ? redirectTo : redirectPath;

  let response;

  if (type === "redirect") {
    response = NextResponse.redirect(new URL(safeRedirect, request.url));
  } else {
    // for verify api and login api

    response = NextResponse.json(
      {
        success: true,
        message,
        data: {
          redirectTo: safeRedirect, // safe cause signup process erases any "from" parameter
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
