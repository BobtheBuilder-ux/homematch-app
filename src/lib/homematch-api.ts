// HomeMatch's public rental catalogue. The base URL must point to the Express API,
// not the Next.js web frontend. Do not put a private API key in EXPO_PUBLIC_*.
export type PropertySearch = {
  q?: string; location?: string; propertyType?: string;
  bedsMin?: number; priceMin?: number; priceMax?: number;
  page?: number; limit?: number;
};
export type RentalProperty = {
  id: number; name: string; description: string; pricePerYear: number;
  beds: number; baths: number; propertyType: string;
  photoUrls: string[]; availableUnits: number;
  amenities: string | null;
  location: { address: string; city: string; state: string; country: string } | null;
};
export type PropertyPage = {
  properties: RentalProperty[];
  pagination: { page: number; limit: number; total: number; pages: number };
};
const baseURL = (process.env.EXPO_PUBLIC_API_BASE_URL ?? "").replace(/\\/$/, "");
export async function getRentalProperties(filters: PropertySearch, signal?: AbortSignal): Promise<PropertyPage> {
  if (!baseURL) throw new Error("Configure EXPO_PUBLIC_API_BASE_URL to search HomeMatch homes.");
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== "") query.set(key, String(value));
  }
  const response = await fetch(`${baseURL}/properties?${query.toString()}`, { signal });
  if (!response.ok) throw new Error(`Property search failed (${response.status})`);
  return response.json() as Promise<PropertyPage>;
}
export async function getRentalProperty(id: number): Promise<RentalProperty> {
  if (!baseURL) throw new Error("Configure EXPO_PUBLIC_API_BASE_URL.");
  const response = await fetch(`${baseURL}/properties/${id}`);
  if (!response.ok) throw new Error("Unable to load this property");
  return response.json() as Promise<RentalProperty>;
}
