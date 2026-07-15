import { NextResponse } from "next/server";
import { ApiResponse } from "../types/api";



export function sessionExpiredJSON(){

    const body:ApiResponse<{redirectTo:string}> = {
        success: false,
        message: "Your session has expired. Please log in again.",
        data : {
            redirectTo: "/login?reason=session_expired"
        },
        error:{
            code:"NO_ACTIVE_SESSION",
        }
    }

    const response = NextResponse.json(body, {status:401});

    response.cookies.delete({name:"session_token",
        path:"/"
    });

    return response;

    
}





/* Deleting the cookie is enough only for the browser-side cleanup—but every HTTP request still needs an HTTP response.

There are two cases.
For a browser navigation route, cookie deletion plus redirect is enough: 

const response = NextResponse.redirect(new URL("/login", request.url));
response.cookies.delete({ name: "session_token", path: "/" });
return response;


The browser follows the redirect, so no JSON body is needed.

For an API route called via your apiFetch(), cookie deletion alone is not enough. The client still needs to know:
-The request failed.
-It was specifically an expired session.
-It should redirect to login.

Also, your current apiFetch() expects JSON. If a route returns an empty 401 response:

401 Unauthorized
Set-Cookie: session_token=deleted

then apiFetch() throws "server returned a non-json response" and loses the useful reason.
*/

// export function OnSessionExpiry(request:Request) {
//     const baseUrl = request.url;
//     const LoginUrl = new URL("/login",baseUrl);
//     LoginUrl.searchParams.set("reason","session_expired");

//     const response = NextResponse.redirect(LoginUrl);
//     response.cookies.delete({ name: "session_token", path: "/" });
//     return response;
// }