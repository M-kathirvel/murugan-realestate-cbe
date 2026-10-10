import { NextRequest, NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/admin-auth";
import { deleteProperty, updateProperty } from "@/lib/database";
import { parsePropertyInput } from "@/lib/property-validation";

// export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, context: RouteContext) {
  if (!hasAdminSession(request)) return NextResponse.json({ error: "Admin access required." }, { status: 401 });
  const id = Number((await context.params).id);
  if (!Number.isSafeInteger(id) || id < 1) return NextResponse.json({ error: "Property not found." }, { status: 404 });
  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid property details." }, { status: 400 });
  }
  const property = parsePropertyInput(input);
  if (!property) return NextResponse.json({ error: "Check the property details and try again." }, { status: 400 });
  const updated = updateProperty(id, property);
  return updated ? NextResponse.json(updated) : NextResponse.json({ error: "Property not found." }, { status: 404 });
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  if (!hasAdminSession(request)) return NextResponse.json({ error: "Admin access required." }, { status: 401 });
  const id = Number((await context.params).id);
  if (!Number.isSafeInteger(id) || id < 1) {
    return NextResponse.json({ error: "Invalid property ID." }, { status: 400 });
  }
  deleteProperty(id);
  return NextResponse.json({ deleted: true });
}