import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const sessionToken = request.cookies.get("session_token")?.value;
  const { pathname } = request.nextUrl;
  const isAuthPage = pathname === "/login" || pathname === "/signup";
  //   if (!sessionToken) {
  //     return NextResponse.redirect(new URL("/login", request.url));
  //   } // The Web Response.redirect() API requires a URL object — not a string.

  /* At the HTTP level, a redirect is just:
    HTTP/1.1 307 Temporary Redirect
    Location: /login
 */

  // better
  // If trying to access protected area WITHOUT a session
  if (!isAuthPage && !sessionToken) {
    const loginUrl = new URL("/login", request.url); // always use absolute path "/" not relative path "login".

    loginUrl.searchParams.set(
      "from",
      request.nextUrl.pathname + request.nextUrl.search,
    );
    return NextResponse.redirect(loginUrl);
  }

  // If trying to access login while ALREADY logged in
  if (isAuthPage && sessionToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Create a new Headers object from the existing ones
  const requestHeaders = new Headers(request.headers);
  // Passing the current URL so layouts don't have to guess
  requestHeaders.set("x-url", request.nextUrl.pathname);

  // Pass these new headers into the 'next' response
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    // protected routes
    "/dashboard/:path*",
    "/profile/:path*",
    //Auth Areas (to redirect users who are already logged in)
    "/login",
    "/signup",
  ],
};
