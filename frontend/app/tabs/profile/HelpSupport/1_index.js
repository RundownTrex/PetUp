import React from "react";
import { View, Text, StyleSheet, Pressable, FlatList } from "react-native";
import { Ionicons } from "react-native-vector-icons";
import { useRouter } from "expo-router";

import CustomHeader from "../../../../components/CustomHeader";
import colors from "../../../../utils/colors";

export default function HelpSupport() {
  const router = useRouter();

  const options = [
    { title: "Contact Support", screen: "2_contactsup" },
    { title: "Privacy Policy", screen: "3_privacypolicy" },
    { title: "Terms of Service", screen: "4_tos" },
    { title: "Feedback", screen: "5_feedback" },
    { title: "Follow us on Social Media", screen: "6_socialmedia" },
  ];

  const renderItem = ({ item }) => (
    <Pressable
      style={styles.item}
      onPress={() => router.push("/tabs/profile/HelpSupport/" + item.screen)}
    >
      <Text style={styles.text}>{item.title}</Text>
      <Ionicons name="chevron-forward-outline" size={20} color={colors.black} />
    </Pressable>
  );

  return (
    <>
      <CustomHeader title="Help & Support" />
      <View style={styles.container}>
        <FlatList
          data={options}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: colors.white,
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightgray,
  },
  text: {
    fontSize: 16,
    color: colors.black,
    fontFamily: "AptosSemiBold",
  },
});
