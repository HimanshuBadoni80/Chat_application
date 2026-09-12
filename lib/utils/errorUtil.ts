// error handler for resend and signup page
import crypto from "crypto";
import { SessionLookupError } from "./session";
import { errorResponse } from "../types/apiResponse";

interface MongoError extends Error {
  code?: number;
}

// function that tell ts, the error is of mongoDB type error
function isMongoError(error: unknown): error is MongoError {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    "message" in error
  );
}

export function handleApiError(error: unknown) {
  const traceId = crypto.randomBytes(4).toString("hex");
  console.error(`Error [${traceId}]:`, error);

  if (error instanceof SessionLookupError) {
    console.error("Session lookup failed:", error);
    return errorResponse(
      503,
      "Unable to verify your session. Please try again later.",
      "SERVER_ERROR",
    );
  }
  if (isMongoError(error)) {
    if (error?.code === 11000) {
      return Response.json(
        {
          success: false,
          message: "This email is already registered",
        },
        {
          status: 409,
        },
      );
    }

    if (error.name === "ValidationError") {
      return Response.json(
        {
          success: false,
          message: error.message,
        },
        {
          status: 400,
        },
      );
    }
  }

  // fallback to general error
  return Response.json(
    {
      success: false,
      message: `Something went wrong on our end. Please try again shortly. Error ID: ${traceId}`,
    },
    {
      status: 500,
    },
  );
}
