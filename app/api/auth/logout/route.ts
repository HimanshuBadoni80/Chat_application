import { NextResponse, type NextRequest } from "next/server";
import { ApiResponse } from "@/lib/types/api";
import deleteSession from "@/lib/auth/logoutService";
export default async function POST(request: NextRequest) {
  const successResponse: ApiResponse<{ redirectTo: string }> = {
    success: true,
    message: "logged out successfully",
    data: {
      redirectTo: "/login",
    },
  };
  

  const finalResponse = NextResponse.json(successResponse);
  finalResponse.cookies.delete("session_token");

  const rawToken = request.cookies.get("session_token")?.value;
  if (!rawToken) {
    return finalResponse;
  }

  try {
    await deleteSession(rawToken);
    return finalResponse;
  } catch (error) {
    console.error("Logout Error (DB Cleanup Failed):", error);
    return finalResponse;
  }
}

