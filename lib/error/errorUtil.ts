// error handler for resend and signup page
import crypto from "crypto";

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

  // if a user emails support saying "I got error a1b2c3," you can search your logs for that specific ID and find exactly what crashed without ever exposing your DB details to them.
}

// Check if it's the MongoDB "Duplicate Key" error
//Defense in Depth
//Layer 1 (Frontend): Disable the "Submit" button after one click.
//Layer 2 (API): Use findOne to check for existing users
//Layer 3 (Database): Use a unique index and a try/catch for 11000.
