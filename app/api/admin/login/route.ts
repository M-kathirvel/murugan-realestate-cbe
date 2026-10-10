import { NextRequest, NextResponse } from "next/server";
import { ADMIN_LOCKOUT_DURATION, ADMIN_LOCKOUT_MESSAGE, credentialsAreValid, loginIdentity, setAdminSession } from "@/lib/admin-auth";
import { getLockout, recordFailedLogin, resetFailedLogins } from "@/lib/database";

// export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const identity = loginIdentity(request);
  const now = Date.now();
    const lockout = getLockout(identity) as any;
    if (lockout && (lockout.locked_until > now || lockout.lockedUntil > now)) {
      return NextResponse.json({ error: ADMIN_LOCKOUT_MESSAGE }, { status: 429 });
    }

  let body: { username?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Enter your username and password." }, { status: 400 });
  }

  const username = typeof body.username === "string" ? body.username : "";
    if (!credentialsAreValid(username, password)) {
      const result: any = recordFailedLogin(identity);
      if (result && (result.failedAttempts >= 3 || result.attempts >= 3)) {
        return NextResponse.json({ error: ADMIN_LOCKOUT_MESSAGE }, { status: 429 });
      }
      return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });
    }
    return NextResponse.json({ error: "The username or password is incorrect." }, { status: 401 });
  }

  resetFailedLogins(identity);
  const response = NextResponse.json({ authenticated: true });
  setAdminSession(response);
  return response;
}