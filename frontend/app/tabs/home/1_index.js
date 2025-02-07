import React from "react";
import {
  Text,
  View,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  Image,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  withTiming,
} from "react-native-reanimated";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import MainButton from "../../../components/MainButton";
import colors from "../../../utils/colors";

const DATA = Array.from({ length: 30 }, (_, i) => `Item ${i + 1}`); // Dummy data for scrolling

export default function HomePage() {
  const router = useRouter();
  const scrollY = useSharedValue(0);

  // Scroll handler
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Animated style for the header
  const headerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY:
            scrollY.value > 0
              ? withTiming(-60, { duration: 300 })
              : withTiming(0),
        },
      ],
    };
  });

  const getGreeting = () => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) {
      return "Good Morning!";
    } else if (currentHour < 18) {
      return "Good Afternoon!";
    } else {
      return "Good Evening!";
    }
  };

  return (
    <View style={styles.container}>
      {/* Collapsible Header */}
      <Animated.View style={[styles.header, headerStyle]}>
        <View style={styles.headerContent}>
          {/* <Image
            source={require("../../../assets/PetUpLogo.jpg")}
            style={styles.logo}
          /> */}
          <Text style={styles.headerTitle}>{getGreeting()}</Text>
          <View style={styles.headerIcons}>
            <Pressable onPress={() => router.push("/tabs/notifications")}>
              <Ionicons name="notifications-outline" size={28} color="black" />
            </Pressable>
          </View>
        </View>
      </Animated.View>

      <View style={{ flex: 1 }}>
        <Animated.FlatList
          data={DATA}
          keyExtractor={(item, index) => index.toString()}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          contentContainerStyle={{ paddingTop: 60, paddingBottom: 80 }} // Fix: Prevents bottom tab bar overlap
          renderItem={({ item }) => (
            <View style={styles.listItem}>
              <Text>{item}</Text>
            </View>
          )}
        />
      </View>

      <MainButton
        onPress={() => router.push("/tabs/home/2_details")}
        title="Details"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    paddingHorizontal: 10,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  logo: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },
  headerTitle: {
    color: "black",
    fontSize: 18,
    flex: 1,
    textAlign: "center",
    fontFamily: "UbuntuREgular",
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  listItem: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
});
