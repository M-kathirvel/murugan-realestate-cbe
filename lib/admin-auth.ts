import "server-only";

import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type { NextRequest, NextResponse } from "next/server";

export const ADMIN_COOKIE = "murugan_admin";
export const ADMIN_LOCKOUT_MESSAGE = "Too many failed attempts. Please come and login after 3 hours.";
export const ADMIN_LOCKOUT_DURATION = 3 * 60 * 60 * 1000;

const sessionDuration = 8 * 60 * 60 * 1000;
const adminUsername = "Nishanth";
const adminPassword = "Nishanth@2006";

function constantTimeMatches(value: string, expected: string) {
  const valueHash = createHash("sha256").update(value).digest();
  const expectedHash = createHash("sha256").update(expected).digest();
  return timingSafeEqual(valueHash, expectedHash) && value === expected;
}

function sessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (process.env.NODE_ENV === "production" && !secret) {
    throw new Error("ADMIN_SESSION_SECRET must be configured in production.");
  }
  return secret ?? "local-development-session-secret-change-before-deployment";
}

export function credentialsAreValid(username: string, password: string) {
  return constantTimeMatches(username, adminUsername) && constantTimeMatches(password, adminPassword);
}

export function loginIdentity(request: NextRequest) {
  const address = request.headers.get("x-real-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return address ? `ip:${address.slice(0, 100)}` : "ip:local";
}

export function setAdminSession(response: NextResponse) {
  const expiresAt = Date.now() + sessionDuration;
  const payload = `${expiresAt}.${randomBytes(16).toString("hex")}`;
  const signature = createHmac("sha256", sessionSecret()).update(payload).digest("hex");
  response.cookies.set(ADMIN_COOKIE, `${payload}.${signature}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: sessionDuration / 1000,
  });
}

export function clearAdminSession(response: NextResponse) {
  response.cookies.set(ADMIN_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
}

export function hasAdminSession(request: NextRequest) {
  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  if (!token) return false;

  const [expiresAtValue, nonce, signature, extra] = token.split(".");
  if (!expiresAtValue || !nonce || !signature || extra) return false;
  const payload = `${expiresAtValue}.${nonce}`;
  const expected = createHmac("sha256", sessionSecret()).update(payload).digest();
  const actual = Buffer.from(signature, "hex");
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return false;
  return Number(expiresAtValue) > Date.now();
}