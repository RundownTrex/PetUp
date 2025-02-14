import { Stack } from "expo-router";

export default function ChatLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: "ios_from_right" }}>
      <Stack.Screen name="1_index" options={{ title: "Chat" }} />
      <Stack.Screen name="[id]" options={{ title: "Chat Screen" }} />
    </Stack>
  );
}
