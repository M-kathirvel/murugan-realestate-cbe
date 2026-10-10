import { NextRequest, NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/admin-auth";
import { createProperty, getProperties } from "@/lib/database";
import { parsePropertyInput } from "@/lib/property-validation";

// export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(getProperties());
}

export async function POST(request: NextRequest) {
  if (!hasAdminSession(request)) return NextResponse.json({ error: "Admin access required." }, { status: 401 });
  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid property details." }, { status: 400 });
  }
  const property = parsePropertyInput(input);
  if (!property) return NextResponse.json({ error: "Check the property details and try again." }, { status: 400 });
  return NextResponse.json(insertProperty(property), { status: 201 });
}