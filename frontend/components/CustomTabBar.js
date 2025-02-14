import React from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import colors from "../utils/colors";

const TABS = [
  { name: "home/1_index", icon: "home" },
  { name: "search/1_index", icon: "search" },
  { name: "chat", icon: "chatbubbles" },
  { name: "profile", icon: "person" },
];

export default function CustomTabBar(props) {
  const router = useRouter();
  const pathname = usePathname();

  // Hide tab bar if inside a stack screen
  const hideTabBar = ![
    "/tabs/home/1_index",
    "/tabs/search/1_index",
    "/tabs/chat",
    "/tabs/profile",
  ].includes(pathname);

  // console.log("Hide tab bar:", hideTabBar);

  if (hideTabBar) return null; // Hide the tab bar

  return (
    <View style={styles.tabBarContainer}>
      {TABS.map((tab) => {
        const isActive = pathname === `/tabs/${tab.name}`;
        // console.log(tab.name, isActive);

        return (
          <Pressable
            key={tab.name}
            onPress={() => router.push(`/tabs/${tab.name}`)} // Expo Router navigation
            style={styles.tabButton}
          >
            <Ionicons
              name={isActive ? tab.icon : `${tab.icon}-outline`}
              size={28}
              color={isActive ? colors.accent : colors.somewhatlightback}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 50,
    backgroundColor: "#fff",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { height: -2, width: 0 },
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
  },
});
