import { NextRequest, NextResponse } from "next/server";
import { clearAdminSession, hasAdminSession } from "@/lib/admin-auth";

 // export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  return NextResponse.json({ authenticated: hasAdminSession(request) });
}

export async function DELETE() {
  const response = NextResponse.json({ authenticated: false });
  clearAdminSession(response);
  return response;
}