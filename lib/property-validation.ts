import type { PropertyCategory, PropertyInput } from "@/lib/types";

const categories: PropertyCategory[] = ["Residential Plot", "Farm Land", "Commercial Land"];

export function parsePropertyInput(value: unknown): PropertyInput | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Record<string, unknown>;
  const title = typeof candidate.title === "string" ? candidate.title.trim() : "";
  const location = typeof candidate.location === "string" ? candidate.location.trim() : "";
  const description = typeof candidate.description === "string" ? candidate.description.trim() : "";
  const priceLabel = typeof candidate.priceLabel === "string" ? candidate.priceLabel.trim() : "";
  const image = typeof candidate.image === "string" ? candidate.image.trim() : "";
  const category = candidate.category;
  const area = Number(candidate.area);
  const price = Number(candidate.price);
  const highlights = Array.isArray(candidate.highlights)
    ? candidate.highlights.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean)
    : [];

  if (
    title.length < 5 || title.length > 120 || location.length < 3 || location.length > 120 ||
    description.length < 20 || description.length > 1200 || priceLabel.length < 2 || priceLabel.length > 30 ||
    !Number.isFinite(area) || area <= 0 || area > 100000000 || !Number.isFinite(price) || price <= 0 ||
    !categories.includes(category as PropertyCategory) || highlights.length > 8 || highlights.some((item) => item.length > 60) ||
    image.length > 2000 || (!image.startsWith("/uploads/") && !image.startsWith("https://"))
  ) {
    return null;
  }

  return {
    title,
    location,
    area,
    price,
    priceLabel,
    category: category as PropertyCategory,
    description,
    highlights,
    image,
    featured: candidate.featured === true,
  };
}