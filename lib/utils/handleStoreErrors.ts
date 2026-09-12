import { isApiResponse } from "../types/apiResponse";

// The shape of per-field validation errors used by components
export type FieldErrors = Record<string, string>;

export function extractFieldErrors(error: unknown): FieldErrors | null {
  // Source 1: Server ApiResponse with VALIDATION_ERROR details
  if (isApiResponse(error)) {
    if (
      error.error?.code === "VALIDATION_ERROR" &&
      error.error.details &&
      Object.keys(error.error.details).length > 0
    ) {
      return error.error.details;
    }
    return null;
  }

  // Source 2: Plain Record<string, string> from client-side extractZodError
  if (
    typeof error === "object" &&
    error !== null &&
    !(error instanceof Error) &&
    !Array.isArray(error) &&
    Object.keys(error).length > 0 &&
    Object.values(error as Record<string, unknown>).every(
      (v) => typeof v === "string",
    )
  ) {
    return error as FieldErrors;
  }

  return null;
}

export function extractErrorMessage(
  error: unknown,
  fallback = "An unexpected error occurred.",
): string {
  if (error instanceof DOMException) {
    if (error.name === "TimeoutError")
      return "Request timed out. Please check your connection and try again.";

    if (error.name === "AbortError") return "Request was cancelled.";
  }
  if (error instanceof TypeError) {
    const msg = error.message.toLowerCase();

    // Handles Chrome/Safari/Firefox network connection drops
    if (
      msg.includes("fetch") ||
      msg.includes("networkerror") ||
      msg.includes("failed to fetch")
    ) {
      return "Network connection failed. Please check your internet and try again.";
    }

    
    return `Type error: ${error.message}`;
  }
  if (isApiResponse(error)) return error.message;
  if (error instanceof Error) return error.message;
  return fallback;
}

export function hasSessionExpired(error: unknown, disconnect?: () => void) {
  if (!isApiResponse(error)) return false;

  if (error.error?.code !== "NO_ACTIVE_SESSION") return false;

  disconnect?.();

  const basePath = hasRedirectTo(error.data) ? error.data.redirectTo : "/login";

  const url = new URL(basePath, window.location.origin);
  url.searchParams.set("reason", "session_expired");
  window.location.href = url.toString();
  return true;
}

function hasRedirectTo(data: unknown): data is { redirectTo: string } {
  return (
    typeof data === "object" &&
    data !== null &&
    "redirectTo" in data &&
    typeof (data as { redirectTo?: unknown }).redirectTo === "string"
  );
}
