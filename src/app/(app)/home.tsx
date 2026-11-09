import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Pressable, RefreshControl, ScrollView, Text, TextInput, View } from "react-native";
import { searchRentals, yearlyRent, type RentalProperty } from "@/lib/homematch-api";

export default function Home() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [properties, setProperties] = useState<RentalProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setError("");
    searchRentals({ page: 1, limit: 12, sortBy: "postedDate", sortOrder: "desc" }, controller.signal)
      .then((response) => setProperties(response.properties))
      .catch((e) => { if (e.name !== "AbortError") setError(e.message || "Unable to load properties"); })
      .finally(() => { if (!controller.signal.aborted) { setLoading(false); setRefreshing(false); } });
    return () => controller.abort();
  }, [refresh]);

  return (
    <ScrollView style={{ backgroundColor: "#fff", flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 48 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); setRefresh((v) => v + 1); }} />}>
      <Text style={{ fontSize: 28, color: "#1769aa", fontWeight: "900", marginTop: 12 }}>HomeMatch</Text>
      <Text style={{ fontSize: 30, color: "#172B4D", fontWeight: "800", marginTop: 24 }}>Find a place to call home.</Text>
      <Text style={{ color: "#64748b", fontSize: 15, marginTop: 6, marginBottom: 18 }}>Explore long-term rentals in Nigeria, all in one place.</Text>
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 22 }}>
        <TextInput accessibilityLabel="Search a city or property" placeholder="City, area or property" value={query} onChangeText={setQuery}
          onSubmitEditing={() => router.push({ pathname: "/search", params: { q: query.trim() } })}
          style={{ borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 10, padding: 12, flex: 1 }} />
        <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: "/search", params: { q: query.trim() } })}
          style={{ backgroundColor: "#1769aa", borderRadius: 10, padding: 13, justifyContent: "center" }}>
          <Text style={{ color: "#fff", fontWeight: "700" }}>Search</Text>
        </Pressable>
      </View>
      <Text style={{ fontSize: 20, fontWeight: "800", marginBottom: 12 }}>Recently listed homes</Text>
      {loading ? <ActivityIndicator size="large" color="#1769aa" /> : error ? (
        <View><Text accessibilityRole="alert" style={{ color: "#b91c1c" }}>{error}</Text>
          <Pressable onPress={() => { setLoading(true); setRefresh((v) => v + 1); }}><Text style={{ color: "#1769aa", marginTop: 12 }}>Retry</Text></Pressable></View>
      ) : (
        <>
          {properties.map((property) => (
            <Pressable key={property.id} accessibilityRole="button" onPress={() => router.push({ pathname: "/property/[id]", params: { id: String(property.id) } })}
              style={{ borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 12, overflow: "hidden", marginBottom: 16 }}>
              {property.photoUrls?.[0] ? <Image source={{ uri: property.photoUrls[0] }} style={{ width: "100%", height: 205 }} resizeMode="cover" /> :
                <View style={{ height: 140, backgroundColor: "#e2e8f0", alignItems: "center", justifyContent: "center" }}><Text>Property photo unavailable</Text></View>}
              <View style={{ padding: 14, gap: 5 }}>
                <Text style={{ fontSize: 17, fontWeight: "700", color: "#172B4D" }}>{property.name}</Text>
                <Text style={{ color: "#64748b" }}>{[property.location?.city, property.location?.state].filter(Boolean).join(", ")}</Text>
                <Text>{property.beds} bedrooms · {property.baths} bathrooms</Text>
                <Text style={{ color: "#1769aa", fontWeight: "800" }}>{yearlyRent(property.pricePerYear)}</Text>
              </View>
            </Pressable>
          ))}
          {properties.length === 0 && <Text>No rental homes are currently available. Search another area soon.</Text>}
          <Pressable accessibilityRole="button" onPress={() => router.push("/search")}
            style={{ padding: 14, backgroundColor: "#eff6ff", borderRadius: 10, alignItems: "center" }}>
            <Text style={{ color: "#1769aa", fontWeight: "700" }}>Explore all available homes</Text>
          </Pressable>
        </>
      )}
    </ScrollView>
  );
}
