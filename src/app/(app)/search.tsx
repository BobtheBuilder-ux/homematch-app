import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { getRentalProperties, type PropertySearch, type PropertyPage } from "@/lib/homematch-api";

const options = ["any", "SelfContain", "Apartment", "Bungalow", "Duplex"];
const field = { backgroundColor: "#fff", borderRadius: 10, borderWidth: 1, borderColor: "#cbd5e1", padding: 12 } as const;

export default function Search() {
  const router = useRouter();
  const { q: incoming } = useLocalSearchParams<{ q?: string }>();
  const [q, setQ] = useState(incoming ?? "");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("any");
  const [beds, setBeds] = useState("");
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");
  const [filters, setFilters] = useState<PropertySearch>({ page: 1, limit: 20, q: incoming });
  const [result, setResult] = useState<PropertyPage | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (incoming) { setQ(incoming); setFilters(f => ({ ...f, q: incoming, page: 1 })); }
  }, [incoming]);
  useEffect(() => {
    const abort = new AbortController();
    setLoading(true); setError("");
    getRentalProperties(filters, abort.signal).then(setResult)
      .catch(e => { if (!abort.signal.aborted) setError(String(e instanceof Error ? e.message : e)); })
      .finally(() => { if (!abort.signal.aborted) setLoading(false); });
    return () => abort.abort();
  }, [filters]);
  const submit = () => {
    const low = min.trim() ? Number(min) : undefined, high = max.trim() ? Number(max) : undefined;
    if ((low !== undefined && (!Number.isFinite(low) || low < 0)) || (high !== undefined && (!Number.isFinite(high) || high < 0)) ||
      (low !== undefined && high !== undefined && low > high)) { setError("Check the annual rent range."); return; }
    setFilters({ q: q.trim() || undefined, location: location.trim() || undefined,
      propertyType: type === "any" ? undefined : type,
      bedsMin: beds ? Number(beds) : undefined, priceMin: low, priceMax: high, page: 1, limit: 20 });
  };

  return <View style={{ flex: 1, backgroundColor: "#f8fafc", paddingHorizontal: 16, paddingTop: 16 }}>
    <Text style={{ fontSize: 27, fontWeight: "800", color: "#1e3a8a" }}>Find your next home</Text>
    <Text style={{ color: "#64748b", marginBottom: 12 }}>Available rentals • Prices per year in naira</Text>
    <TextInput accessibilityLabel="Property search" placeholder="Apartment, neighbourhood, keywords…" value={q} onChangeText={setQ} onSubmitEditing={submit} style={field} />
    <TextInput accessibilityLabel="Location" placeholder="City, area or address" value={location} onChangeText={setLocation} style={[field, { marginTop: 8 }]} />
    <ScrollView horizontal style={{ flexGrow: 0, marginVertical: 10 }} showsHorizontalScrollIndicator={false}>
      {options.map(t => <Pressable key={t} onPress={() => setType(t)} style={{ padding: 9, borderRadius: 20, backgroundColor: t === type ? "#2563eb" : "#e2e8f0", marginRight: 8 }}>
        <Text style={{ color: t === type ? "white" : "#334155" }}>{t === "any" ? "All homes" : t}</Text>
      </Pressable>)}
    </ScrollView>
    <View style={{ flexDirection: "row", gap: 6 }}>
      <TextInput keyboardType="numeric" placeholder="Beds min" value={beds} onChangeText={setBeds} style={[field, { flex: 1 }]} />
      <TextInput keyboardType="numeric" placeholder="Min ₦/yr" value={min} onChangeText={setMin} style={[field, { flex: 1 }]} />
      <TextInput keyboardType="numeric" placeholder="Max ₦/yr" value={max} onChangeText={setMax} style={[field, { flex: 1 }]} />
    </View>
    <Pressable onPress={submit} style={{ backgroundColor: "#2563eb", padding: 13, borderRadius: 10, alignItems: "center", marginTop: 10 }}>
      <Text style={{ color: "white", fontWeight: "700" }}>Search properties</Text>
    </Pressable>
    {error ? <Text accessibilityRole="alert" style={{ color: "#b91c1c", marginTop: 8 }}>{error}</Text> : null}
    {loading ? <ActivityIndicator style={{ margin: 20 }} /> : null}
    {!loading && result ? <FlatList data={result.properties} style={{ marginTop: 10 }}
      keyExtractor={item => String(item.id)}
      ListHeaderComponent={<Text style={{ color: "#64748b", marginVertical: 8 }}>{result.pagination.total} properties available</Text>}
      ListEmptyComponent={<Text>No properties match those filters.</Text>}
      renderItem={({ item }) => <Pressable
        onPress={() => router.push({ pathname: "/property/[id]", params: { id: String(item.id) } })}
        style={{ marginBottom: 12, backgroundColor: "#fff", borderRadius: 12, overflow: "hidden" }}>
        {item.photoUrls?.[0] ? <Image source={{ uri: item.photoUrls[0] }} style={{ width: "100%", height: 155 }} /> : null}
        <View style={{ padding: 12, gap: 3 }}>
          <Text style={{ fontWeight: "700", fontSize: 17 }}>{item.name}</Text>
          <Text>{[item.location?.city, item.location?.state].filter(Boolean).join(", ")}</Text>
          <Text style={{ fontWeight: "800", color: "#2563eb" }}>₦{Math.round(item.pricePerYear).toLocaleString("en-NG")} / year</Text>
          <Text>{item.beds} beds • {item.baths} baths • {item.propertyType}</Text>
        </View>
      </Pressable>}
      ListFooterComponent={result.pagination.pages > 1 ? <View style={{ flexDirection: "row", justifyContent: "space-between", padding: 16 }}>
        <Pressable disabled={(filters.page ?? 1) <= 1} onPress={() => setFilters(f => ({ ...f, page: (f.page ?? 1) - 1 }))}><Text>Previous</Text></Pressable>
        <Text>{result.pagination.page} / {result.pagination.pages}</Text>
        <Pressable disabled={(filters.page ?? 1) >= result.pagination.pages} onPress={() => setFilters(f => ({ ...f, page: (f.page ?? 1) + 1 }))}><Text>Next</Text></Pressable>
      </View> : null} /> : null}
  </View>;
}
