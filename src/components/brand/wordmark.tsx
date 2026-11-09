import { Text } from "@/components/ui";
const sizes = { lg: "display", header: "jumbo", md: "heading" } as const;
export function Wordmark({ size = "lg" }: { size?: keyof typeof sizes }) {
  return <Text variant={sizes[size]} accessibilityRole="header">HomeMatch</Text>;
}
