import { useState } from "react";
import { View, Text, Button, TextInput, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import auth from "@react-native-firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSignIn = async () => {
    try {
      const userCredential = await auth().signInWithEmailAndPassword(
        email,
        password
      );
      console.log("Signing in...");
      await AsyncStorage.setItem(
        "userData",
        JSON.stringify(userCredential.user)
      );
      console.log("Signed in!");
      router.replace("/tabs");
      console.log("Navigated to home page");
    } catch (error) {
      console.error("Error signing in: ", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign In</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Sign In" onPress={handleSignIn} />
      <Button title="Sign Up" onPress={() => router.replace("/auth/sign-up")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  input: {
    width: "80%",
    padding: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
  },
});
