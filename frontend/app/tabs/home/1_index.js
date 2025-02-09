import { useState, useEffect } from "react";
import { Text, View, StyleSheet, Pressable, Image } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  withTiming,
} from "react-native-reanimated";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Divider } from "react-native-paper";

import MainButton from "../../../components/MainButton";
import CustomDivider from "../../../components/CustomDivider";
import FeaturedPetsCarousel from "../../../components/FeaturedPetsCarousel";
import colors from "../../../utils/colors";

const DATA = Array.from({ length: 30 }, (_, i) => `Item ${i + 1}`); // Dummy data for scrolling

export default function HomePage() {
  const router = useRouter();
  const scrollY = useSharedValue(0);
  const [user, setUser] = useState(null);
  const [firstName, setFirstName] = useState("");

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // console.log("User ID:", currentUser.uid);

        try {
          const userDoc = await firestore()
            .collection("users")
            .doc(currentUser.uid)
            .get();

          if (userDoc.exists) {
            console.log("User Data:", userDoc.data()); // Debugging
            setFirstName(userDoc.data().firstname || ""); // Ensure it's set to an empty string if undefined
          } else {
            console.log("User document does not exist.");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, []);

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
          <View style={styles.headerIcons}>
            <Image
              source={require("../../../assets/AppIcons/Logo.png")}
              style={styles.logo}
            />
            <Pressable onPress={() => router.push("/tabs/notifications")}>
              <Ionicons name="notifications-outline" size={28} color="black" />
            </Pressable>
          </View>
        </View>
      </Animated.View>

      {/* Scrollable Content */}
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        style={{ paddingTop: 60 }}
      >
        <Text style={styles.headerTitle}>
          {`${getGreeting()}, ${firstName ? firstName : ""}`}
        </Text>

        <Text style={styles.featuredPetText}>Featured Pets</Text>
        {/* Featured Pets Carousel (Now Scrolls with List) */}
        <FeaturedPetsCarousel />

        <Divider style={{ marginVertical: 15 }} />

        {/* List Items */}
        {DATA.map((item, index) => (
          <View key={index} style={styles.listItem}>
            <Text>{item}</Text>
          </View>
        ))}
      </Animated.ScrollView>

      {/* Floating Button */}
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
    paddingHorizontal: 16,
    backgroundColor: colors.white,
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
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightgraytext,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  logo: {
    width: 75,
    height: 75,
    resizeMode: "contain",
    borderRadius: 100,
  },
  headerTitle: {
    color: "black",
    fontSize: 18,
    flex: 1,
    fontFamily: "UbuntuMedium",
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    // borderWidth: 1,
  },
  listItem: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  featuredPetText: {
    fontFamily: "UbuntuBold",
    fontSize: 20,
    marginTop: 10,
  },
});
