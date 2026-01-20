// error handler for resend and signup page

interface MongoError extends Error {
  code?: number;
}

// function that tell ts, the error is of monogoDB type error
function isMongoError(error: unknown): error is MongoError {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    "message" in error
  );
}

export function handleApiError(error: unknown) {
  console.error("API Error Logged:", error);
  if (isMongoError(error)) {
    if (error?.code === 11000) {
      return Response.json(
        {
          success: false,
          message: "This email is already registered",
        },
        {
          status: 409,
        }
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
        }
      );
    }
  }

  // fallback to general error
  return Response.json(
    {
      success: false,
      message: "an unexpected error occured",
    },
    {
      status: 500,
    }
  );
}

// Check if it's the MongoDB "Duplicate Key" error
//Defense in Depth
//Layer 1 (Frontend): Disable the "Submit" button after one click.
//Layer 2 (API): Use findOne to check for existing users
//Layer 3 (Database): Use a unique index and a try/catch for 11000.
