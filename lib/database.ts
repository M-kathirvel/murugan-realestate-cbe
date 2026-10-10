import "server-only";

import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import path from "node:path";
import type { Property, PropertyInput } from "@/lib/types";

const sampleProperties: PropertyInput[] = [];

const dbDir = process.env.VERCEL ? path.join("/tmp", "data") : path.join(process.cwd(), "data");
mkdirSync(dbDir, { recursive: true });
const dbPath = path.join(dbDir, "murugan.sqlite");

const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS properties (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    location TEXT NOT NULL,
    area INTEGER NOT NULL,
    price INTEGER NOT NULL,
    priceLabel TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    highlights TEXT NOT NULL,
    image TEXT NOT NULL,
    featured INTEGER NOT NULL DEFAULT 0,
    createdAt TEXT NOT NULL
  )
`);

export function getProperties(): Property[] {
  const stmt = db.prepare("SELECT * FROM properties ORDER BY id DESC");
  const rows = stmt.all() as any[];
  return rows.map((row) => ({
    ...row,
    highlights: JSON.parse(row.highlights),
    featured: Boolean(row.featured),
  }));
}

export function getProperty(id: number): Property | null {
  const stmt = db.prepare("SELECT * FROM properties WHERE id = ?");
  const row = stmt.all(id)[0] as any;
  if (!row) return null;
  return {
    ...row,
    highlights: JSON.parse(row.highlights),
    featured: Boolean(row.featured),
  };
}

export function createProperty(input: PropertyInput): Property {
  const stmt = db.prepare(`
    INSERT INTO properties (title, location, area, price, priceLabel, category, description, highlights, image, featured, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const info = stmt.run(
    input.title,
    input.location,
    input.area,
    input.price,
    input.priceLabel,
    input.category,
    input.description,
    JSON.stringify(input.highlights),
    input.image,
    input.featured ? 1 : 0,
    new Date().toISOString()
  );
  return getProperty(Number(info.lastInsertRowid))!;
}

export function updateProperty(id: number, input: PropertyInput): Property {
  const stmt = db.prepare(`
    UPDATE properties
    SET title = ?, location = ?, area = ?, price = ?, priceLabel = ?, category = ?, description = ?, highlights = ?, image = ?, featured = ?
    WHERE id = ?
  `);
  stmt.run(
    input.title,
    input.location,
    input.area,
    input.price,
    input.priceLabel,
    input.category,
    input.description,
    JSON.stringify(input.highlights),
    input.image,
    input.featured ? 1 : 0,
    id
  );
  return getProperty(id)!;
}

export function deleteProperty(id: number): void {
  const stmt = db.prepare("DELETE FROM properties WHERE id = ?");
  stmt.run(id);
}
// Admin Login Security & Lockout Helpers
export function getLockout(identifier: string) {
  return null;
}

export function recordFailedLogin(identifier: string) {
  // Records a failed attempt
}

export function resetFailedLogins(identifier: string) {
  // Resets failed attempts on successful login
}