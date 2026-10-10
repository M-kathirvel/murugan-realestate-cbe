import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { hasAdminSession } from "@/lib/admin-auth";

export const runtime = "nodejs";

const allowedTypes: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function POST(request: NextRequest) {
  if (!hasAdminSession(request)) return NextResponse.json({ error: "Admin access required." }, { status: 401 });
  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File) || !allowedTypes[file.type] || file.size < 1 || file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "Choose a JPG, PNG, or WebP image up to 5 MB." }, { status: 400 });
  }

  const filename = `${randomUUID()}.${allowedTypes[file.type]}`;
  const uploadDirectory = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDirectory, { recursive: true });
  await writeFile(path.join(uploadDirectory, filename), Buffer.from(await file.arrayBuffer()), { flag: "wx" });
  return NextResponse.json({ image: `/uploads/${filename}` }, { status: 201 });
}