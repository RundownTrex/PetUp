import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const CustomHeader = ({ title }) => {
  const navigation = useNavigation();
  const canGoBack = navigation.canGoBack(); // Check if there's a previous screen

  return (
    <View style={styles.headerContainer}>
      {/* Left Side: Back Button or Placeholder */}
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

      {/* Right Side (Keeps Layout Consistent) */}
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
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { height: 2, width: 0 },
  },
  backButton: {
    width: 35, // Ensure consistent width
    alignItems: "center",
    justifyContent: "center",
  },
  placeholder: {
    width: 35, // Same width as the back button to maintain balance
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  headerRight: {
    width: 35, // Same width as back button to maintain balance
  },
});

export default CustomHeader;
