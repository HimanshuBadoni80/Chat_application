import { NextResponse } from "next/server";
import * as z from "zod";



 const ErrorCodes = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  USER_EXISTS: "USER_EXISTS",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  AUTH_FAILED: "AUTH_FAILED",
  SERVER_ERROR: "SERVER_ERROR",
  LINK_INVALID: "LINK_INVALID",
  ALREADY_VERIFIED: "ALREADY_VERIFIED",
  USER_UNVERIFIED: "USER_UNVERIFIED",
  USER_NOT_FOUND: "USER_NOT_FOUND",
  CONTACT_EXISTS: "CONTACT_EXISTS",
  NO_ACTIVE_SESSION: "NO_ACTIVE_SESSION",
  UNAUTHORIZED_USER: "UNAUTHORIZED_USER",
  INVALID_OPERATION:"INVALID_OPERATION",

} as const; //Const Assertion,now obj is just read only.


// This creates a type that can ONLY be one of the values in ErrorCodes
 type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

// Now, in your ApiError interface:
 interface ApiError {
  code: ErrorCode; // TypeScript will now suggest "USER_EXISTS", "AUTH_FAILED", etc.
  details?: Record<string, string>; // Extra debugging info
}

 interface ApiResponse<T = void> {
  success: boolean;
  message: string;
  data?: T; // T is the 'payload' (e.g., a User object)
  error?: ApiError;
}

 interface UserInfo {
  userEmail: string;
}

 function isApiResponse(error: unknown): error is ApiResponse<unknown> {
    return typeof error === "object" && error !== null && "success" in error ;
  }


// sends failed ApiResponse
 function errorResponse(
  status: number,
  message: string,
  code: ErrorCode,
  details?: Record<string, string>,
) {
  const response: ApiResponse = {
    success: false,
    message,
    error: { code, details },
  };

  return NextResponse.json(response, { status });
}

//  sends successful ApiResponse
 function successResponse<T = unknown>(
  message: string,
  status: number = 200,
  data?: T,
) {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
  };

  return NextResponse.json(response, { status });
}

// sets validation error and sends errorResponse
 function zodValidationError(error: z.ZodError) {
  const flattened = z.flattenError(error);
  const details = Object.fromEntries(
    Object.entries(flattened.fieldErrors).map(([key, msgs]) => [
      key,
      (msgs as string[] | undefined)?.[0] ?? "Invalid value",
    ]),
  );
  return errorResponse(400, "Invalid input", "VALIDATION_ERROR", details);
}

/*
{
    formErrors: [ 'Unrecognized key: "extraKey"' ],
    fieldErrors: {
        username: [ 'Invalid input: expected string, received number' ],
        favoriteNumbers: [ 'Invalid input: expected number, received string' ]
  }
}
*/


export {
  ErrorCodes,
  type ApiResponse,
  type UserInfo,
  isApiResponse,
  errorResponse,
  successResponse,
  zodValidationError,
}