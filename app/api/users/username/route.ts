import GetSession from "@/lib/getSession";
import connectDB from "@/lib/actions/mongodb";
import User from "@/lib/Models/User";
import { ApiResponse } from "@/lib/types/api";
import { usernameSchema } from "@/lib/zod/zodSchemas";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { handleApiError } from "@/lib/error/errorUtil";

export async function PATCH(request: Request) {
  try {
    const session = await GetSession();

    if (!session) {
      const response: ApiResponse = {
        success: false,
        message: "No active session",
        error: {
          code: "NO_ACTIVE_SESSION",
        },
      };
      return NextResponse.json(response, { status: 401 });
    }

    const body = await request.json();
    const validation = usernameSchema.safeParse(body);

    if (!validation.success) {
      const flattened = z.flattenError(validation.error);
      const response: ApiResponse = {
        success: false,
        message: "validation failed",
        error: {
          code: "VALIDATION_ERROR",
          details: Object.fromEntries(
            Object.entries(flattened.fieldErrors).map(([key, value]) => [
              key,
              value?.[0] || "Invalid",
            ]),
          ),
        },
      };
      return NextResponse.json(response, { status: 400 });
    }

    const username = validation.data.username
      .trim()
      .replace(/\s+/g, "_")
      .toLowerCase();

    await connectDB();

    const existingUser = await User.findOne({
      _id: { $ne: session.user._id },
      username,
    }).select("_id");

    if (existingUser) {
      const response: ApiResponse = {
        success: false,
        message: "Username is already taken",
        error: {
          code: "USER_EXISTS",
          details: {
            username: "Username is already taken",
          },
        },
      };
      return NextResponse.json(response, { status: 409 });
    }

    await User.findByIdAndUpdate(
      session.user._id,
      { $set: { username } },
      { runValidators: true },
    );


    /* The most common placement for revalidatePath is inside a Server Action after a database mutation (Insert, Update, Delete)  
    
    When you use Next.js, the framework aggressively caches your Server Components and data fetches to make the app incredibly fast. revalidatePath is the kill switch you pull when data changes in your database and you need the UI to update immediately for the user*/

    //  This forces Next.js to fetch the new data from the DB on the next render
    // accepts either page or layout
    // default: page
    //Example: revalidatePath('/blog/[slug]', 'page') will purge the specific post being viewed
    //layout: Revalidates the specified layout segment and all segments underneath it
    /* Example: revalidatePath('/blog', 'layout') will instantly clear the cache for /blog, /blog/post-1, /blog/post-2, and any other nested route */
    revalidatePath("/chat", "layout");

    const response: ApiResponse<{ username: string; redirectTo: string }> = {
      success: true,
      message: "Username updated",
      data: {
        username,
        redirectTo: "/chat",
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    return handleApiError(error);
  }
}
