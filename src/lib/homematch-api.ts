/**
 * The HomeMatch web and tenant app share the public rental API.
 * Configure EXPO_PUBLIC_HOMEMATCH_API_URL with the deployed Express API origin,
 * for example https://your-api-host.example/properties (without /properties).
 */
export type RentalFilters = {
  q?: string;
  location?: string;
  priceMin?: number;
  priceMax?: number;
  bedsMin?: number;
  bathsMin?: number;
  propertyType?: "SelfContain" | "Apartment" | "Bungalow" | "Duplex";
  page?: number;
  limit?: number;
  sortBy?: "postedDate" | "pricePerYear";
  sortOrder?: "asc" | "desc";
};

export type RentalProperty = {
  id: number;
  name: string;
  description: string | null;
  pricePerYear: number;
  serviceCharge?: number | null;
  beds: number;
  baths: number;
  propertyType: string;
  photoUrls?: string[] | null;
  availableUnits: number;
  amenities?: string | null;
  location?: { city?: string | null; state?: string | null; address?: string | null } | null;
};

type SearchResponse = {
  properties: RentalProperty[];
  pagination: { page: number; limit: number; total: number; pages: number };
};

function apiBase(): string {
  const url = process.env.EXPO_PUBLIC_HOMEMATCH_API_URL?.trim();
  if (!url) throw new Error("Configure EXPO_PUBLIC_HOMEMATCH_API_URL to search HomeMatch properties.");
  if (!/^https?:\/\//.test(url)) throw new Error("HomeMatch API URL must begin with https:// or http://");
  return url.replace(/\/$/, "");
}

async function readJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal, headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(response.status === 404 ? "Property not found" : "HomeMatch could not load properties");
  return response.json() as Promise<T>;
}

export async function searchRentals(filters: RentalFilters = {}, signal?: AbortSignal): Promise<SearchResponse> {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
  }
  return readJson<SearchResponse>(apiBase() + "/properties?" + params.toString(), signal);
}

export async function getRental(id: number, signal?: AbortSignal): Promise<RentalProperty> {
  if (!Number.isInteger(id) || id < 1) throw new Error("Invalid property ID");
  return readJson<RentalProperty>(apiBase() + "/properties/" + id, signal);
}

export function yearlyRent(value: number): string {
  return "₦" + Number(value).toLocaleString("en-NG") + " / year";
}
