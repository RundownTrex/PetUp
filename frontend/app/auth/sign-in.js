import { useRouter } from "expo-router";
import { View, Text, Button, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SignInPage() {
  const router = useRouter();

  const handleSignIn = async () => {
    //Simulation of signing in
    console.log("Signing in...");
    await AsyncStorage.setItem("userData", "present");
    console.log("Signed in!");
    router.replace("/tabs");
    console.log("Navigated to home page");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign In</Text>
      <Button title="Sign In" onPress={handleSignIn} />
      <Button title="Sign Up" onPress={() => router.push("/auth/sign-up")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
});
