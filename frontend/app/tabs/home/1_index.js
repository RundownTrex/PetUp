import { useState, useEffect, useRef, useMemo, useCallback } from "react";
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
import BottomSheet, {
  BottomSheetView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";

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
  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ["95%"], []);
  const [userListings, setUserListings] = useState([
    {
      id: "1",
      name: "Buddy",
      image: require("../../../assets/test1.jpg"),
      breed: "Golden Retriever",
      age: "2 years",
      postedDate: "01/02/2025",
    },
    {
      id: "2",
      name: "Mittens",
      image: require("../../../assets/test2.jpg"),
      breed: "Siamese Cat",
      age: "1 year",
      postedDate: "15/02/2025",
    },
    {
      id: "3",
      name: "Charlie",
      image: require("../../../assets/test1.jpg"),
      breed: "Labrador",
      age: "3 years",
      postedDate: "20/02/2025",
    },
    {
      id: "4",
      name: "Whiskers",
      image: require("../../../assets/test2.jpg"),
      breed: "Persian Cat",
      age: "4 years",
      postedDate: "25/02/2025",
    },
  ]);

  const [notifications, setNotifications] = useState([
    { id: "1", text: "New pet posting available" },
    { id: "2", text: "Your listing has been viewed" },
    { id: "3", text: "Reminder: Update your profile" },
  ]);

  const showNotifications = useCallback(() => {
    bottomSheetRef.current?.expand();
  }, []);

  const closeNotifications = useCallback(() => {
    bottomSheetRef.current?.close();
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

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
    <>
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
              <Pressable onPress={showNotifications}>
                <Ionicons
                  name="notifications-outline"
                  size={28}
                  color="black"
                />
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
            Find your perfect pet companion or help a pet find a new loving
            home!
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
            <Text style={styles.myListingsTitle}>My Listings</Text>
            {userListings.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.myListingsScrollView}
              >
                {userListings.slice(0, 3).map((listing) => (
                  <Pressable
                    key={listing.id}
                    style={styles.listingItem}
                    onPress={() =>
                      router.push(`/tabs/my-listing-details/${listing.id}`)
                    }
                  >
                    <Image source={listing.image} style={styles.listingImage} />
                    <Text
                      style={styles.listingName}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {listing.name}
                    </Text>
                    <Text
                      style={styles.listingDetails}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {listing.breed}
                    </Text>
                    <Text
                      style={styles.listingDetails}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {listing.age}
                    </Text>
                    <Text
                      style={styles.listingDate}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      Posted: {listing.postedDate}
                    </Text>
                  </Pressable>
                ))}
                <Pressable
                  style={styles.viewAllCard}
                  onPress={() => router.push("/tabs/my-listings")}
                >
                  <Ionicons
                    name="chevron-forward"
                    size={24}
                    color={colors.blacktext}
                  />
                  <Text style={styles.viewAllText}>View All</Text>
                </Pressable>
              </ScrollView>
            ) : (
              <View style={styles.noListingsContainer}>
                <Text style={styles.noListingsText}>
                  You have no listings yet
                </Text>
                <Pressable
                  style={styles.addListingsButton}
                  onPress={() => router.push("/tabs/add-listing")}
                >
                  <Text style={styles.addListingsButtonText}>Add Listing</Text>
                </Pressable>
              </View>
            )}
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
        </Animated.ScrollView>
      </View>

      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        <BottomSheet
          ref={bottomSheetRef}
          index={3}
          snapPoints={snapPoints}
          style={{ zIndex: 2 }}
          backdropComponent={(props) => (
            <BottomSheetBackdrop
              {...props}
              appearsOnIndex={0}
              disappearsOnIndex={-1}
            />
          )}
          enablePanDownToClose={true}
        >
          <BottomSheetView
            style={{ flex: 1, backgroundColor: colors.white, padding: 16 }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              {/* Button to clear notifications */}
              <Pressable onPress={clearNotifications} style={{ padding: 8 }}>
                <Ionicons name="trash-bin" size={24} color="red" />
              </Pressable>
              {/* Button to close the bottom sheet */}
              <Pressable onPress={closeNotifications} style={{ padding: 8 }}>
                <Ionicons name="close" size={24} color="black" />
              </Pressable>
            </View>
            <Text
              style={{
                fontFamily: "AptosBold",
                fontSize: 18,
                marginBottom: 10,
              }}
            >
              Notifications
            </Text>
            {notifications.length > 0 ? (
              <ScrollView>
                {notifications.map((notification) => (
                  <View
                    key={notification.id}
                    style={{
                      padding: 12,
                      borderWidth: 1,
                      borderColor: colors.lightgraytext,
                      borderRadius: 8,
                      marginBottom: 10,
                    }}
                  >
                    <Text style={{ fontFamily: "Aptos", fontSize: 16 }}>
                      {notification.text}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            ) : (
              <View
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{ fontFamily: "Aptos", fontSize: 16, color: "gray" }}
                >
                  No notifications.
                </Text>
              </View>
            )}
          </BottomSheetView>
        </BottomSheet>
      </View>
    </>
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
    zIndex: 1,
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
    backgroundColor: colors.lightgray, // Adjust as needed or use a custom color
    padding: 12,
    borderRadius: 8,
    marginRight: 16,
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
    width: 150,
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
    marginRight: 16,
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
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
  myListingsContainer: {
    paddingVertical: 10,
  },
  myListingsTitle: {
    fontFamily: "AptosBold",
    fontSize: 20,
    marginBottom: 10,
    paddingHorizontal: 16,
  },
  myListingsScrollView: {
    paddingLeft: 16,
    paddingRight: 8,
    paddingBottom: 10,
  },
  noListingsContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  noListingsText: {
    fontFamily: "Aptos",
    fontSize: 16,
    color: "gray",
    marginBottom: 10,
  },
  addListingsButton: {
    backgroundColor: colors.accent,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  addListingsButtonText: {
    color: colors.white,
    fontFamily: "AptosBold",
    fontSize: 16,
  },
  listingItem: {
    width: 150,
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 10,
    marginRight: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  listingName: {
    fontFamily: "UbuntuMedium",
    fontSize: 16,
    marginTop: 5,
    width: "100%",
    textAlign: "center",
  },
  listingDetails: {
    fontFamily: "Aptos",
    fontSize: 14,
    color: "gray",
    width: "100%",
    textAlign: "center",
  },
  listingDate: {
    fontFamily: "Aptos",
    fontSize: 12,
    color: "gray",
    marginTop: 4,
    width: "100%",
    textAlign: "center",
  },
  listingImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  viewAllText: {
    fontFamily: "AptosBold",
    fontSize: 16,
    marginTop: 5,
    color: colors.blacktext,
  },
  viewAllCard: {
    width: 100,
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
});
