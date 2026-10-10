export type PropertyCategory = "Residential Plot" | "Farm Land" | "Commercial Land";

export type Property = {
  id: number;
  title: string;
  location: string;
  area: number;
  price: number;
  priceLabel: string;
  category: PropertyCategory;
  description: string;
  highlights: string[];
  image: string;
  featured: boolean;
  createdAt: string;
};

export type PropertyInput = Omit<Property, "id" | "createdAt">;