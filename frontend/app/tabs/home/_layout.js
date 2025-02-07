import { Stack } from "expo-router";

export default function HomeLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: "ios_from_right" }}>
      <Stack.Screen name="1_index" options={{ title: "Home" }} />
      <Stack.Screen name="2_details" options={{ title: "Details" }} />
    </Stack>
  );
}
