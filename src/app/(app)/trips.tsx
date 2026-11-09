import { useRouter } from "expo-router";
import { View } from "react-native";

import { EmptyState } from "@/components/ui";

// Placeholder until trips are designed and booking exists.
export default function Trips() {
  const router = useRouter();
  return (
    <View className="flex-1 justify-center bg-surface">
      <EmptyState
        icon="calendar"
        title="No rental applications yet"
        message="Your HomeMatch rental applications will appear here after the tenant account migration."
        action={{ title: "Explore homes", onPress: () => router.navigate("/home") }}
      />
    </View>
  );
}
