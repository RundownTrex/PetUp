import { useRouter } from "expo-router";
import { View, Text, Button, StyleSheet } from "react-native";

export default function LandingPage() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to PetUp!</Text>
      <Text style={styles.subtitle}>Explore the app features here.</Text>
      <Button title="Sign In" onPress={() => router.replace("/auth/sign-in")} />
      <Button title="Sign Up" onPress={() => router.replace("/auth/sign-up")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  subtitle: { fontSize: 16, marginBottom: 40 },
});
