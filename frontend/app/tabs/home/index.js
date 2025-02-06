import { Text, View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import MainButton from "../../../components/MainButton";

export default function HomePage() {
  const router = useRouter();
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Home Page</Text>
      <MainButton
        onPress={() => router.push("/tabs/home/details")}
        title="Details"
      />
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
