import { useRouter } from "expo-router";
import { View, Text, Button, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SignUpPage() {
  const router = useRouter();

  const handleSignUp = async () => {
    // Simulation of signing up
    console.log("Signing up...");
    await AsyncStorage.setItem("userData", "present");
    console.log("Signed up!");
    router.replace("/tabs");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      <Button title="Create Account" onPress={handleSignUp} />
      <Button
        title="Go to Sign In"
        onPress={() => router.push("/auth/sign-in")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
});
