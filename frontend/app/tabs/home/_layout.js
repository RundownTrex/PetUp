import { Stack } from "expo-router";

export default function HomeLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: "ios_from_right" }}>
      <Stack.Screen name="1_index" options={{ title: "Home" }} />
      <Stack.Screen name="2_caretips" options={{ title: "Care Tips" }} />
      <Stack.Screen name="3_training" options={{ title: "Training" }} />
      <Stack.Screen name="4_search" options={{ title: "Search" }} />
    </Stack>
  );
}
