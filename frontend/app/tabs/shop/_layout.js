import { Stack } from "expo-router";

export default function ShopLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: "ios_from_right" }}>
      <Stack.Screen name="1_index" options={{ title: "Shop" }} />
    </Stack>
  );
}
