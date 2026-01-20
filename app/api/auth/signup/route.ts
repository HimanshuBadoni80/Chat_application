
import { ApiResponse,UserInfo } from "@/lib/types/api";
import connectDB from "@/lib/actions/mongodb";
import User from "@/lib/Models/User";
import crypto from "crypto";
import { sendEmail } from "@/lib/mail/mail";
import {handleApiError} from "@/lib/error/errorUtil";
import {signUpSchema} from "@/lib/zod/zodSchemas";
import {z} from "zod";


export async function POST(request: Request) {
  const body = await request.json();

  const validation = signUpSchema.safeParse(body); // safeparse always returns an obj without throwing.

  /* validation = {
    success: boolean;
    data?: T;
    error?: instance of ZodError;
    } 
    ZodError {
        issues: ZodIssue[],
        errors: ZodIssue[], // alias
        message: string,
        name: "ZodError"
    }
        Each ZodIssue looks like:
        {
            expected: 'string',
            code: "invalid_string",
            path: ["email"],
            message: "Invalid email",
            
        }
        {
            expected: 'string',
            code: 'invalid_type',
            path: [ 'username' ],
            message: 'Invalid input: expected string, received number'
        },
*/
  if (!validation.success) {
    const flattened = z.flattenError(validation.error);
    /* 
    {
    formErrors: [ 'Unrecognized key: "extraKey"' ],
    fieldErrors: {
        username: [ 'Invalid input: expected string, received number' ],
        favoriteNumbers: [ 'Invalid input: expected number, received string' ]
  }
}
    */
    const response: ApiResponse = {
      success: false,
      message: "validation failed",
      error: {
        code: "VALIDATION_ERROR",
        details: Object.fromEntries(
          Object.entries(flattened.fieldErrors).map(([key, value]) => [
            key,
            value?.[0] || "Invalid",
          ])
        ),
      },
    };
    return Response.json(response, {
      status: 400,
    });
  }
  // on validation success
  await connectDB();

  // query the DB if the email already exists
  const { userEmail } = validation.data;
  const userExists = await User.findOne({ userEmail }).select("_id");

  // user exist
  if (userExists) {
    const response: ApiResponse = {
      success: false,
      message: "Conflict",
      error: {
        code: "USER_EXISTS",
      },
    };
    return Response.json(response, { status: 409 });
  }

  // if user does not exist, create a new one

  const token = crypto.randomBytes(32).toString("base64url");
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  try {
    const newUser = await User.create({
      email: validation.data.userEmail,
      password: validation.data.userPassword,
      verifyToken: hashedToken,
      verifyTokenExpiry: new Date(Date.now() + 3600000),
    });

    //  Only send the email if the save was successful!
    if (newUser) {
      await sendEmail(validation.data.userEmail, token);
      const response: ApiResponse<UserInfo> = {
        success: true,
        message: "Verification email sent!",
        data: {
          userEmail: validation.data.userEmail,
        },
      };
      return Response.json(response);
    }
  } catch (error) {
    return handleApiError(error);
  }
}
