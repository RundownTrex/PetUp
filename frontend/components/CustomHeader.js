import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import colors from "../utils/colors";

const CustomHeader = ({ title }) => {
  const navigation = useNavigation();
  const canGoBack = navigation.canGoBack();

  return (
    <View style={styles.headerContainer}>
      {canGoBack ? (
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back-outline" size={25} color="black" />
        </Pressable>
      ) : (
        <View style={styles.placeholder} />
      )}

      {/* Title */}
      <Text style={styles.title}>{title}</Text>

      <View style={styles.headerRight} />
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 45,
    paddingHorizontal: 15,
    backgroundColor: colors.white,
    shadowOffset: { height: 2, width: 0 },
    borderBottomColor: colors.lightgray,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 35,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholder: {
    width: 35,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  headerRight: {
    width: 35,
  },
});

export default CustomHeader;
