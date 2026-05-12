export interface ApiResponse<T = void> {
  success: boolean;
  message: string;
  data?: T; // T is the 'payload' (e.g., a User object)
  error?: ApiError;
}

export const ErrorCodes = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  USER_EXISTS: "USER_EXISTS",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  AUTH_FAILED: "AUTH_FAILED",
  SERVER_ERROR: "SERVER_ERROR",
  LINK_INVALID: "LINK_INVALID",
  ALREADY_VERIFIED: "ALREADY_VERIFIED",
  USER_UNVERIFIED: "USER_UNVERIFIED",
  USER_NOT_FOUND: "USER_NOT_FOUND",
  NO_ACTIVE_SESSION: "NO_ACTIVE_SESSION",
  UNAUTHORIZED_USER: "UNAUTHORIZED_USER",
  INVALID_OPERATION:"INVALID_OPERATION",

} as const; //Const Assertion,now obj is just read only.
// This creates a type that can ONLY be one of the values in ErrorCodes
export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

// Now, in your ApiError interface:
export interface ApiError {
  code: ErrorCode; // TypeScript will now suggest "USER_EXISTS", "AUTH_FAILED", etc.
  details?: Record<string, string>; // Extra debugging info
}

export interface UserInfo {
  userEmail: string;
}

export function isApiResponse(error: unknown): error is ApiResponse<unknown> {
    return typeof error === "object" && error !== null && "success" in error ;
  }
