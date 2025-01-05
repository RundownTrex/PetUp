import { Text, View, StyleSheet, Button } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ProfilePage() {
  const router = useRouter();

  const logout = () => {
    // Clear user data from AsyncStorage
    AsyncStorage.removeItem("userData");
    // Redirect to landing page
    router.replace("/landing");
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Profile Page</Text>
      <Button title="Go to Home" onPress={logout} />
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
