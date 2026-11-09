import { useRouter } from "expo-router";
import { View } from "react-native";
import { EmptyState } from "@/components/ui";

// Tenant application history requires the secured HomeMatch identity migration.
// Do not invent applications from local Roam bookings.
export default function Applications() {
  const router = useRouter();
  return <View className="flex-1 justify-center bg-surface">
    <EmptyState icon="calendar" title="Your rental applications"
      message="Application tracking will appear here when your HomeMatch account is connected."
      action={{ title: "Explore available homes", onPress: () => router.navigate("/search") }} />
  </View>;
}
