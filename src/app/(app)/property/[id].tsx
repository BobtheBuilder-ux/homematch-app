import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, Text, View } from "react-native";
import { getRental, yearlyRent, type RentalProperty } from "@/lib/homematch-api";

export default function PropertyDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [property, setProperty] = useState<RentalProperty | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    getRental(Number(id), controller.signal).then(setProperty).catch((e) => {
      if (e.name !== "AbortError") setError(e.message || "Could not load the property");
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });
    return () => controller.abort();
  }, [id]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#fff" }} contentContainerStyle={{ padding: 20, paddingBottom: 44 }}>
      <Pressable onPress={() => router.back()} accessibilityRole="button" style={{ paddingVertical: 10 }}>
        <Text style={{ color: "#1769aa", fontWeight: "700" }}>‹ Back to results</Text>
      </Pressable>
      {loading ? <ActivityIndicator color="#1769aa" /> : error ? <Text accessibilityRole="alert">{error}</Text> : property ? (
        <>
          {property.photoUrls?.length ? property.photoUrls.map((url, index) => <Image key={url + index} source={{ uri: url }} style={{ height: index === 0 ? 240 : 150, width: "100%", borderRadius: 12, marginBottom: 10 }} />) : <View style={{ height: 200, backgroundColor: "#e2e8f0", borderRadius: 12 }} />}
          <Text style={{ fontSize: 25, fontWeight: "800", color: "#172B4D", marginTop: 12 }}>{property.name}</Text>
          <Text style={{ color: "#64748b", marginVertical: 8 }}>{[property.location?.address, property.location?.city, property.location?.state].filter(Boolean).join(", ")}</Text>
          <Text style={{ fontSize: 22, fontWeight: "800", color: "#1769aa" }}>{yearlyRent(property.pricePerYear)}</Text>
          <Text style={{ marginVertical: 12 }}>{property.beds} bedrooms · {property.baths} bathrooms · {property.propertyType}</Text>
          <Text style={{ fontSize: 17, fontWeight: "700", marginTop: 14 }}>About this home</Text>
          <Text style={{ marginTop: 8, lineHeight: 24, color: "#334155" }}>{property.description || "No description provided."}</Text>
          <Text style={{ fontSize: 17, fontWeight: "700", marginTop: 20 }}>Amenities</Text>
          <Text style={{ marginTop: 8, lineHeight: 24 }}>{property.amenities || "Ask about available amenities."}</Text>
          <View style={{ backgroundColor: "#eff6ff", borderRadius: 12, padding: 15, marginTop: 24 }}>
            <Text style={{ fontWeight: "700", color: "#1e40af" }}>Next: request an inspection</Text>
            <Text style={{ color: "#334155", marginTop: 6 }}>Online inspection and rental applications will be enabled after the HomeMatch tenant authentication and authorization migration is completed.</Text>
          </View>
        </>
      ) : null}
    </ScrollView>
  );
}
