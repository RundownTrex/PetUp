import { Text, View, StyleSheet } from "react-native";
import MainButton from "../../../components/MainButton";

import { useRouter } from "expo-router";

export default function SearchPage() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Search Page</Text>
      <MainButton
        onPress={() => router.push("/tabs/search/results")}
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
