import { NextResponse, type NextRequest } from "next/server";

export function GET(request: NextRequest) {
  const from = request.nextUrl.searchParams.get("from");
  const safeFrom =
    from?.startsWith("/") && !from.startsWith("//") ? from : "/chat";

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("from", safeFrom);
  loginUrl.searchParams.set("reason", "session_expired");

  const response = NextResponse.redirect(loginUrl);
  // Match the original cookie's path so the browser removes the right cookie.
  response.cookies.delete({ name: "session_token", path: "/" });

  return response;
}
