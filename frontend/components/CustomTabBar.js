import React, { useState, useEffect } from "react";
import { View, Pressable, Keyboard, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";

import { useBottomSheet } from "../contexts/BottomSheetContext";
import colors from "../utils/colors";

const TABS = [
  { name: "home/1_index", icon: "home" },
  { name: "shop/1_index", icon: "storefront" },
  { name: "chat/1_index", icon: "chatbubbles" },
  { name: "profile/1_index", icon: "person" },
];

export default function CustomTabBar(props) {
  const { isBottomSheetOpen } = useBottomSheet();
  const router = useRouter();
  const pathname = usePathname();
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () =>
      setKeyboardVisible(true)
    );
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () =>
      setKeyboardVisible(false)
    );
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  // Hide tab bar if inside a stack screen
  const hideTabBar = ![
    "/tabs/home/1_index",
    "/tabs/shop/1_index",
    "/tabs/chat/1_index",
    "/tabs/profile/1_index",
  ].includes(pathname);

  if (hideTabBar) return null;

  if (isBottomSheetOpen) return null;

  if (keyboardVisible) return null;

  return (
    <View style={styles.tabBarContainer}>
      {TABS.map((tab) => {
        const isActive = pathname === `/tabs/${tab.name}`;
        // console.log(tab.name, isActive);

        return (
          <Pressable
            key={tab.name}
            onPress={() => router.push(`/tabs/${tab.name}`)}
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
    backgroundColor: colors.white,
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
