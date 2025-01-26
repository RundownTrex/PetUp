import React from "react";
import { Text, View, StyleSheet, Button } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import auth from "@react-native-firebase/auth";

export default function ProfilePage() {
  const router = useRouter();

  const logout = async () => {
    try {
      // Sign out from Firebase Auth
      await auth().signOut();

      // Clear user data from AsyncStorage
      await AsyncStorage.removeItem("userData");

      // Redirect to landing page
      router.replace("/landing");

      console.log("User signed out successfully");
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text>Profile Page</Text>
      <Button title="Sign Out" onPress={logout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
