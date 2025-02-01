import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        animation: "ios_from_right",
        headerTitle: "",
      }}
    />
  );
}
