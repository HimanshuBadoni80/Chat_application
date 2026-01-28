export interface ApiResponse<T = void> {
  success: boolean;
  message: string;
  data?: T; // T is the 'payload' (e.g., a User object)
  error?: ApiError;
}

export const ErrorCodes = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  USER_EXISTS: "USER_EXISTS",
  AUTH_FAILED: "AUTH_FAILED",
  SERVER_ERROR: "SERVER_ERROR",
  LINK_INVALID: "LINK_INVALID",
  ALREADY_VERIFIED: "ALREADY_VERIFIED",
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
