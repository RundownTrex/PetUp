import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";

export default function Index() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkLoginStatus() {
      try {
        const userData = await AsyncStorage.getItem("userData");
        if (userData) {
          // User is logged in, redirect to home
          router.replace("/tabs/home");
        } else {
          // User is not logged in, redirect to landing page
          router.replace("/auth/sign-up");
        }
      } catch (error) {
        console.error("Error checking login status:", error);
        router.replace("/auth/sign-up"); // Fallback to landing page on error
      } finally {
        setIsLoading(false); // Ensure loading stops
      }
    }

    checkLoginStatus();
  }, [router]);

  if (isLoading) {
    // Show a loading screen while checking login status
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
  },
});
