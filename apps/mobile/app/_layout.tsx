import { ConvexProvider, ConvexReactClient } from "convex/react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

const CONVEX_URL =
  process.env.EXPO_PUBLIC_CONVEX_URL ?? "https://adorable-hawk-821.convex.cloud";

const convex = new ConvexReactClient(CONVEX_URL);

export default function RootLayout() {
  return (
    <ConvexProvider client={convex}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#0a0a0a" },
          animation: "slide_from_right",
        }}
      />
    </ConvexProvider>
  );
}
