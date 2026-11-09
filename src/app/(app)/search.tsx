import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { searchRentals, yearlyRent, type RentalFilters, type RentalProperty } from "@/lib/homematch-api";

const types = ["Any", "SelfContain", "Apartment", "Bungalow", "Duplex"] as const;
const blank = { properties: [] as RentalProperty[], pagination: { page: 1, limit: 20, total: 0, pages: 0 } };

export default function Search() {
  const router = useRouter();
  const { q: initialQuery } = useLocalSearchParams<{ q?: string }>();
  const [q, setQ] = useState(initialQuery ?? "");
  const [location, setLocation] = useState("");
  const [propertyType, setPropertyType] = useState<(typeof types)[number]>("Any");
  const [beds, setBeds] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<RentalFilters>({ q: initialQuery ?? "", page: 1, limit: 20 });
  const [result, setResult] = useState(blank);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof initialQuery === "string" && initialQuery !== filters.q) {
      setQ(initialQuery);
      setFilters((old) => ({ ...old, q: initialQuery, page: 1 }));
      setPage(1);
    }
  }, [initialQuery]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    searchRentals(filters, controller.signal).then(setResult).catch((e) => {
      if (e.name !== "AbortError") setError(e.message || "Search failed");
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });
    return () => controller.abort();
  }, [filters]);

  const submit = () => {
    const next = {
      q: q.trim(),
      location: location.trim(),
      propertyType: propertyType === "Any" ? undefined : propertyType,
      bedsMin: beds ? Number(beds) : undefined,
      priceMin: minPrice ? Number(minPrice) : undefined,
      priceMax: maxPrice ? Number(maxPrice) : undefined,
      page: 1,
      limit: 20
    } satisfies RentalFilters;
    setPage(1);
    setFilters(next);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#fff" }} contentContainerStyle={{ padding: 20, paddingBottom: 48 }} keyboardShouldPersistTaps="handled">
      <Text style={{ fontSize: 28, fontWeight: "800", marginBottom: 6, color: "#172B4D" }}>Find your next home</Text>
      <Text style={{ color: "#64748b", marginBottom: 18 }}>Verified long-term rentals across Nigeria</Text>
      <TextInput accessibilityLabel="Property or keyword" placeholder="Property or keyword" value={q} onChangeText={setQ} onSubmitEditing={submit} style={field} returnKeyType="search" />
      <TextInput accessibilityLabel="City or neighbourhood" placeholder="City or neighbourhood" value={location} onChangeText={setLocation} style={field} />
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
        {types.map((type) => (
          <Pressable key={type} accessibilityRole="button" onPress={() => setPropertyType(type)} style={{ borderRadius: 16, paddingHorizontal: 12, paddingVertical: 9, backgroundColor: type === propertyType ? "#1769aa" : "#f1f5f9" }}>
            <Text style={{ color: type === propertyType ? "white" : "#334155" }}>{type === "SelfContain" ? "Self-contain" : type}</Text>
          </Pressable>
        ))}
      </View>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <TextInput accessibilityLabel="Minimum annual rent" placeholder="Min rent ₦/year" keyboardType="numeric" value={minPrice} onChangeText={setMinPrice} style={[field, { flex: 1 }]} />
        <TextInput accessibilityLabel="Maximum annual rent" placeholder="Max rent ₦/year" keyboardType="numeric" value={maxPrice} onChangeText={setMaxPrice} style={[field, { flex: 1 }]} />
      </View>
      <TextInput accessibilityLabel="Minimum number of bedrooms" placeholder="Minimum bedrooms" keyboardType="numeric" value={beds} onChangeText={setBeds} style={field} />
      <Pressable accessibilityRole="button" onPress={submit} style={{ backgroundColor: "#1769aa", padding: 15, borderRadius: 12, alignItems: "center", marginBottom: 20 }}>
        <Text style={{ color: "#fff", fontWeight: "700" }}>Search properties</Text>
      </Pressable>
      {loading ? <ActivityIndicator size="large" color="#1769aa" /> : error ? (
        <View><Text accessibilityRole="alert" style={{ color: "#b91c1c" }}>{error}</Text><Pressable onPress={() => setFilters({ ...filters })}><Text style={{ color: "#1769aa", marginTop: 12 }}>Retry</Text></Pressable></View>
      ) : (
        <>
          <Text style={{ fontWeight: "700", marginBottom: 14 }}>{result.pagination.total} properties found</Text>
          {result.properties.map((property) => (
            <Pressable accessibilityRole="button" key={property.id} onPress={() => router.push({ pathname: "/property/[id]", params: { id: String(property.id) } })} style={{ marginBottom: 16, borderRadius: 12, borderWidth: 1, borderColor: "#e2e8f0", overflow: "hidden" }}>
              {property.photoUrls?.[0] ? <Image source={{ uri: property.photoUrls[0] }} style={{ width: "100%", height: 180 }} resizeMode="cover" /> : <View style={{ height: 120, backgroundColor: "#e2e8f0", justifyContent: "center", alignItems: "center" }}><Text>No photo</Text></View>}
              <View style={{ padding: 14, gap: 5 }}>
                <Text style={{ fontSize: 17, fontWeight: "700" }}>{property.name}</Text>
                <Text style={{ color: "#64748b" }}>{[property.location?.city, property.location?.state].filter(Boolean).join(", ")}</Text>
                <Text>{property.beds} beds · {property.baths} baths · {property.propertyType}</Text>
                <Text style={{ color: "#1769aa", fontWeight: "800" }}>{yearlyRent(property.pricePerYear)}</Text>
              </View>
            </Pressable>
          ))}
          {result.pagination.total === 0 && <Text style={{ color: "#64748b" }}>No available properties match these filters. Try another location or price range.</Text>}
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 12 }}>
            <Pressable disabled={page <= 1} onPress={() => { const n = page - 1; setPage(n); setFilters({ ...filters, page: n }); }}><Text style={{ color: page <= 1 ? "#94a3b8" : "#1769aa" }}>Previous</Text></Pressable>
            <Text>Page {page} of {Math.max(1, result.pagination.pages)}</Text>
            <Pressable disabled={page >= result.pagination.pages} onPress={() => { const n = page + 1; setPage(n); setFilters({ ...filters, page: n }); }}><Text style={{ color: page >= result.pagination.pages ? "#94a3b8" : "#1769aa" }}>Next</Text></Pressable>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const field = { borderColor: "#cbd5e1", borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12, marginBottom: 12, color: "#0f172a" } as const;
