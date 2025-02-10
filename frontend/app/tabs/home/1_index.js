import { useState, useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  Pressable,
  Image,
  ScrollView,
} from "react-native";
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
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Image
                source={require("../../../assets/AppIcons/Logo.png")}
                style={styles.logo}
              />
              <Text
                style={{
                  fontFamily: "UbuntuBold",
                  fontSize: 22,
                  marginLeft: -10,
                }}
              >
                PetUp
              </Text>
            </View>
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
        style={{ paddingTop: 70 }}
      >
        <Text style={styles.headerTitle}>
          {`${getGreeting()}, ${firstName ? firstName : ""}`}
        </Text>
        <Text
          style={{
            fontFamily: "Aptos",
            fontSize: 16,
          }}
        >
          Find your perfect pet companion or help a pet find a new loving home!
        </Text>

        <View style={styles.quickActionsContainer}>
          <View style={{ flexDirection: "column" }}>
            <Pressable
              style={styles.quickActionButton}
              onPress={() => router.push("/tabs/adopt")}
            >
              <Image
                source={require("../../../assets/kitten.png")}
                style={styles.quickActionImage}
              />
            </Pressable>
            <Text style={styles.quickActionLabel}>Adopt a pet</Text>
          </View>
          <View>
            <Pressable
              style={styles.quickActionButton}
              onPress={() => router.push("/tabs/rehome")}
            >
              <Image
                source={require("../../../assets/Rehome.png")}
                style={styles.quickActionImage}
              />
            </Pressable>
            <Text style={styles.quickActionLabel}>Rehome a pet</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Featured Pets</Text>
        {/* Featured Pets Carousel (Now Scrolls with List) */}
        <FeaturedPetsCarousel />

        <Divider style={{ marginVertical: 15 }} />

        {/* My Listings Section */}
        <View style={styles.myListingsContainer}>
          <Text
            style={[styles.sectionTitle, { marginTop: 0, marginBottom: 5 }]}
          >
            My Listings
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Pressable
              style={styles.myListingCard}
              onPress={() => router.push("/tabs/my-listing-details/1")}
            >
              <Image
                source={require("../../../assets/test1.jpg")}
                style={styles.myListingImage}
              />
              <Text style={styles.myListingLabel}>Buddy</Text>
            </Pressable>
            <Pressable
              style={styles.myListingCard}
              onPress={() => router.push("/tabs/my-listing-details/2")}
            >
              <Image
                source={require("../../../assets/test2.jpg")}
                style={styles.myListingImage}
              />
              <Text style={styles.myListingLabel}>Mittens</Text>
            </Pressable>
            <Pressable
              style={styles.myListingCard}
              onPress={() => router.push("/tabs/my-listing-details/1")}
            >
              <Image
                source={require("../../../assets/test1.jpg")}
                style={styles.myListingImage}
              />
              <Text style={styles.myListingLabel}>Buddy</Text>
            </Pressable>
            <Pressable
              style={styles.myListingCard}
              onPress={() => router.push("/tabs/my-listing-details/2")}
            >
              <Image
                source={require("../../../assets/test2.jpg")}
                style={styles.myListingImage}
              />
              <Text style={styles.myListingLabel}>Mittens</Text>
            </Pressable>
            <Pressable
              style={styles.myListingCard}
              onPress={() => router.push("/tabs/my-listing-details/1")}
            >
              <Image
                source={require("../../../assets/test1.jpg")}
                style={styles.myListingImage}
              />
              <Text style={styles.myListingLabel}>Buddy</Text>
            </Pressable>
            <Pressable
              style={styles.myListingCard}
              onPress={() => router.push("/tabs/my-listing-details/2")}
            >
              <Image
                source={require("../../../assets/test2.jpg")}
                style={styles.myListingImage}
              />
              <Text style={styles.myListingLabel}>Mittens</Text>
            </Pressable>
          </ScrollView>
        </View>

        <Divider style={{ marginVertical: 15 }} />

        <View style={styles.exploreMoreContainer}>
          <Text
            style={[styles.sectionTitle, { marginBottom: 5, marginTop: 0 }]}
          >
            Explore More
          </Text>
          <View style={styles.exploreMoreCardContainer}>
            <Pressable
              style={styles.exploreMoreCard}
              onPress={() => router.push("/tabs/pet-care-tips")}
            >
              <Ionicons name="book" size={24} color={colors.accent} />
              <Text style={styles.exploreMoreCardTitle}>Care Tips</Text>
              <Text style={styles.exploreMoreCardSubtitle}>
                Expert advice for your pet
              </Text>
            </Pressable>
            <Pressable
              style={styles.exploreMoreCard}
              onPress={() => router.push("/tabs/pet-training-videos")}
            >
              <Ionicons name="videocam" size={24} color={colors.accent} />
              <Text style={styles.exploreMoreCardTitle}>Training</Text>
              <Text style={styles.exploreMoreCardSubtitle}>
                Watch how-to videos
              </Text>
            </Pressable>
          </View>
        </View>

        {/* <Divider style={{ marginVertical: 15 }} /> */}

        {/* List Items */}
        {/* {DATA.map((item, index) => (
          <View key={index} style={styles.listItem}>
            <Text>{item}</Text>
          </View>
        ))} */}
      </Animated.ScrollView>
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
    marginLeft: -10,
  },
  headerTitle: {
    color: "black",
    fontSize: 18,
    flex: 1,
    fontFamily: "AptosBold",
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
  sectionTitle: {
    fontFamily: "AptosBold",
    fontSize: 20,
    marginTop: 10,
  },

  quickActionsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
  },
  quickActionButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },

  quickActionLabel: {
    fontSize: 16,
    color: colors.blacktext,
    marginTop: 5,
    textAlign: "center",
    fontFamily: "AptosBold",
  },

  quickActionImage: {
    width: 55,
    height: 55,
    resizeMode: "contain",
  },

  exploreMoreContainer: {
    paddingVertical: 10,
    paddingHorizontal: 5,
    marginBottom: 10,
    paddingBottom: 70,
  },

  exploreMoreCardContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  exploreMoreCard: {
    width: "auto",
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.lightgraytext,
  },
  exploreMoreCardTitle: {
    fontFamily: "AptosBold",
    fontSize: 16,
    marginTop: 8,
    textAlign: "center",
  },
  exploreMoreCardSubtitle: {
    fontFamily: "Aptos",
    fontSize: 12,
    color: "gray",
    textAlign: "center",
    marginTop: 4,
  },

  myListingCard: {
    marginHorizontal: 8,
    alignItems: "center",
  },
  myListingImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  myListingLabel: {
    fontFamily: "Aptos",
    fontSize: 16,
    marginTop: 5,
  },
});
