import { Stack } from "expo-router";

export default function ProfileLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: "ios_from_right" }}>
      <Stack.Screen name="1_index" options={{ title: "Profile" }} />
      <Stack.Screen name="2_myprofile" options={{ title: "My Profile" }} />
      <Stack.Screen name="3_mypets" options={{ title: "My Pets" }} />
      <Stack.Screen name="4_accountSecurity" options={{ title: "Account & Security" }} />
      <Stack.Screen name="5_helpSupport" options={{ title: "Help & Support" }} />
    </Stack>
  );
}
