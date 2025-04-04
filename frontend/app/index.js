import { useEffect, useState } from "react";
import { useFonts } from "expo-font";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";

SplashScreen.preventAutoHideAsync();

export default function Index() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  const [fontsLoaded] = useFonts({
    Ubuntu: require("../assets/fonts/Ubuntu-Regular.ttf"),
    UbuntuBold: require("../assets/fonts/Ubuntu-Bold.ttf"),
    UbuntuLight: require("../assets/fonts/Ubuntu-Light.ttf"),
    UbuntuMedium: require("../assets/fonts/Ubuntu-Medium.ttf"),
    UbuntuItalic: require("../assets/fonts/Ubuntu-Italic.ttf"),
    UbuntuLightItalic: require("../assets/fonts/Ubuntu-LightItalic.ttf"),
    UbuntuMediumItalic: require("../assets/fonts/Ubuntu-MediumItalic.ttf"),
    UbuntuBoldItalic: require("../assets/fonts/Ubuntu-BoldItalic.ttf"),

    Aptos: require("../assets/fonts/Microsoft Aptos Fonts/Aptos.ttf"),
    AptosBold: require("../assets/fonts/Microsoft Aptos Fonts/Aptos-Bold.ttf"),
    AptosSemiBold: require("../assets/fonts/Microsoft Aptos Fonts/Aptos-SemiBold.ttf"),
    AptosExtraBold: require("../assets/fonts/Microsoft Aptos Fonts/Aptos-ExtraBold.ttf"),
    AptosDisplay: require("../assets/fonts/Microsoft Aptos Fonts/Aptos-Display.ttf"),
    AptosDisplayBold: require("../assets/fonts/Microsoft Aptos Fonts/Aptos-Display-Bold.ttf"),
    AptosBlack: require("../assets/fonts/Microsoft Aptos Fonts/Aptos-Black.ttf"),
    AptosItalic: require("../assets/fonts/Microsoft Aptos Fonts/Aptos-Italic.ttf"),
    AptosLight: require("../assets/fonts/Microsoft Aptos Fonts/Aptos-Light.ttf"),
  });

  useEffect(() => {
    async function checkLoginStatus() {
      try {
        const userData = await AsyncStorage.getItem("userData");
        if (userData) {
          router.replace("/tabs/home"); // Redirect to home if logged in
        } else {
          router.replace("/landing/"); // Redirect to sign-up if not logged in
        }
      } catch (error) {
        console.error("Error checking login status:", error);
        router.replace("/auth/sign-up"); // Fallback route
      } finally {
        setIsLoading(false);
        await SplashScreen.hideAsync(); // Hide the splash screen after loading
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

  return null; // Nothing to render since navigation happens instantly
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
  },
});
