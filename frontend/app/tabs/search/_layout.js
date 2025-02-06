import { Stack } from "expo-router";

export default function SearchLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: "ios_from_right" }}>
      <Stack.Screen name="index" options={{ title: "Search" }} />
      <Stack.Screen name="result" options={{ title: "Results" }} />
    </Stack>
  );
}
