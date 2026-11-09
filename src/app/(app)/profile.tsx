import { useAuth, useUser } from "@clerk/expo";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";

// Transitional profile only: the final release must replace Clerk with
// HomeMatch's Better Auth account before enabling private tenant data.
export default function TenantProfile() {
  const router = useRouter();
  const { user } = useUser();
  const { signOut } = useAuth();
  const [busy, setBusy] = useState(false);
  return <ScrollView style={{ flex: 1, backgroundColor: "#f8fafc" }} contentContainerStyle={{ padding: 20, gap: 14 }}>
    <Text style={{ fontSize: 27, fontWeight: "800", color: "#1e3a8a" }}>My HomeMatch account</Text>
    <View style={{ backgroundColor: "white", padding: 18, borderRadius: 14, gap: 8 }}>
      <Text style={{ fontWeight: "700", fontSize: 20 }}>{user?.fullName || "HomeMatch tenant"}</Text>
      <Text>{user?.primaryEmailAddress?.emailAddress || "No email on file"}</Text>
      <Text style={{ color: "#64748b" }}>Your HomeMatch tenancy profile will be available after the shared account migration.</Text>
    </View>
    <Pressable onPress={() => router.push("/search")} style={{ padding: 16, backgroundColor: "#dbeafe", borderRadius: 10 }}>
      <Text style={{ color: "#1e40af", fontWeight: "700" }}>Explore available homes</Text>
    </Pressable>
    <Pressable onPress={() => router.push("/trips")} style={{ padding: 16, backgroundColor: "white", borderRadius: 10 }}>
      <Text style={{ fontWeight: "700" }}>My rental applications</Text>
    </Pressable>
    <Pressable disabled={busy} onPress={async () => {
      setBusy(true);
      try { await signOut(); } finally { setBusy(false); }
    }} style={{ padding: 16, borderRadius: 10, borderWidth: 1, borderColor: "#cbd5e1" }}>
      {busy ? <ActivityIndicator /> : <Text style={{ fontWeight: "700" }}>Sign out</Text>}
    </Pressable>
  </ScrollView>;
}
