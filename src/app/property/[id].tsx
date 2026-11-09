import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, Text, View } from "react-native";
import { getRentalProperty, type RentalProperty } from "@/lib/homematch-api";

export default function PropertyDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [property, setProperty] = useState<RentalProperty | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    const num = Number(id);
    if (!Number.isInteger(num) || num <= 0) { setError("Invalid property"); return; }
    getRentalProperty(num).then(p => { if (active) setProperty(p); })
      .catch(e => { if (active) setError(e instanceof Error ? e.message : "Unable to load property"); });
    return () => { active = false; };
  }, [id]);
  if (error) return <View style={{ padding: 24 }}><Text accessibilityRole="alert">{error}</Text></View>;
  if (!property) return <ActivityIndicator style={{ marginTop: 40 }} />;
  return <ScrollView style={{ backgroundColor: "white" }} contentContainerStyle={{ paddingBottom: 50 }}>
    <Pressable onPress={() => router.back()} style={{ padding: 16 }}><Text>‹ Back to search</Text></Pressable>
    {property.photoUrls?.[0] ? <Image source={{ uri: property.photoUrls[0] }} style={{ width: "100%", height: 260 }} /> : null}
    <View style={{ padding: 20, gap: 14 }}>
      <Text style={{ fontSize: 26, fontWeight: "800" }}>{property.name}</Text>
      <Text>{[property.location?.address, property.location?.city, property.location?.state].filter(Boolean).join(", ")}</Text>
      <Text style={{ fontSize: 22, color: "#1d4ed8", fontWeight: "700" }}>₦{Math.round(property.pricePerYear).toLocaleString("en-NG")} / year</Text>
      <Text>{property.beds} bedrooms • {property.baths} bathrooms • {property.propertyType}</Text>
      <Text style={{ fontSize: 17, fontWeight: "700" }}>About this home</Text>
      <Text>{property.description}</Text>
      <Text style={{ fontSize: 17, fontWeight: "700" }}>Amenities</Text>
      <Text>{property.amenities || "Ask HomeMatch about available amenities"}</Text>
      <Text style={{ color: "#64748b" }}>Inspection requests and applications will be enabled once tenant authentication and the secured application endpoints are connected.</Text>
    </View>
  </ScrollView>;
}
