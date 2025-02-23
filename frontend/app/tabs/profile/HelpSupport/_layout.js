import { Stack } from "expo-router";

export default function HelpSupportLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: "ios_from_right" }}>
      <Stack.Screen name="1_index" options={{ title: "Help & Support" }} />
      <Stack.Screen
        name="2_contactsup"
        options={{ title: "Contact Support" }}
      />
      <Stack.Screen
        name="3_privacypolicy"
        options={{ title: "Privacy Policy" }}
      />
      <Stack.Screen name="4_tos" options={{ title: "Terms of Service" }} />
      <Stack.Screen name="5_feedback" options={{ title: "Feedback" }} />
      <Stack.Screen name="6_socialmedia" options={{ title: "Social Media" }} />
    </Stack>
  );
}
