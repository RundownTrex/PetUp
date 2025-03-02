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
import { Divider, Searchbar } from "react-native-paper";
import BottomSheet, {
  BottomSheetView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import { formatDistanceToNow, parseISO } from "date-fns";

import MainButton from "../../../components/MainButton";
import CustomDivider from "../../../components/CustomDivider";
import { useBottomSheet } from "../../../contexts/BottomSheetContext";
import FeaturedPetsCarousel from "../../../components/FeaturedPetsCarousel";
import colors from "../../../utils/colors";

const formatRelativeTime = (timestamp) => {
  const distance = formatDistanceToNow(parseISO(timestamp), {
    includeSeconds: true,
  });

  if (distance.includes("less than")) return "just now";

  return distance
    .replace("about ", "")
    .replace(" minutes", "m")
    .replace(" minute", "m")
    .replace(" hours", "h")
    .replace(" hour", "h")
    .replace(" days", "d")
    .replace(" day", "d")
    .replace(" ago", "");
};

export default function HomePage() {
  const router = useRouter();
  const scrollY = useSharedValue(0);
  const [user, setUser] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [userListings, setUserListings] = useState([]);
  const bottomSheetRef = useRef(null);
  const { setIsBottomSheetOpen } = useBottomSheet();
  const snapPoints = useMemo(() => ["95%"], []);

  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const userDoc = await firestore()
            .collection("users")
            .doc(currentUser.uid)
            .get();

          if (userDoc.exists) {
            console.log("User Data:", userDoc.data());
            setFirstName(userDoc.data().firstname || "");
          } else {
            console.log("User document does not exist.");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      const unsubscribeListings = firestore()
        .collection("pets")
        .where("ownerId", "==", user.uid)
        .onSnapshot(
          (snapshot) => {
            const listings = [];
            snapshot.forEach((doc) =>
              listings.push({ id: doc.id, ...doc.data() })
            );
            setUserListings(listings);
          },
          (error) => {
            console.error("Error fetching listings:", error);
          }
        );
      return () => unsubscribeListings();
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const unsubscribeNotifications = firestore()
      .collection("users")
      .doc(user.uid)
      .onSnapshot(
        (doc) => {
          if (doc.exists) {
            const userData = doc.data();
            if (
              userData.recentNotifications &&
              Array.isArray(userData.recentNotifications)
            ) {
              setNotifications(userData.recentNotifications);
            } else {
              setNotifications([]);
            }
          }
        },
        (error) => {
          console.error("Error fetching notifications:", error);
        }
      );

    return () => unsubscribeNotifications();
  }, [user]);

  const showNotifications = useCallback(() => {
    setIsBottomSheetOpen(true);
    bottomSheetRef.current?.snapToIndex(1);
  }, []);

  const closeNotifications = useCallback(() => {
    setIsBottomSheetOpen(false);
    bottomSheetRef.current?.close();
  }, []);

  const clearNotifications = useCallback(async () => {
    if (!user) return;

    try {
      await firestore().collection("users").doc(user.uid).update({
        recentNotifications: [],
      });

      console.log("Notifications cleared from Firestore");
    } catch (error) {
      console.error("Error clearing notifications:", error);
    }
  }, [user]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

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
        <Animated.View style={[styles.header, headerStyle]}>
          <View style={styles.headerContent}>
            <View style={styles.headerIcons}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Text style={styles.headerTitle}>
                  {`${getGreeting()} ${firstName ? firstName : ""}`}
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

        <Animated.ScrollView
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          style={{ paddingTop: 70 }}
        >
          <Searchbar
            placeholder="Search"
            style={[
              styles.searchbar,
              {
                backgroundColor: colors.offwhite,
                height: 50,
                margin: 5,
                justifyContent: "center",
              },
            ]}
            inputStyle={{
              color: colors.blacktext,
              fontFamily: "Aptos",
              fontSize: 14,
              height: 28,
              alignSelf: "center",
            }}
            iconColor={colors.gray}
            placeholderTextColor={colors.gray}
            onPress={() => router.push("/tabs/home/4_search")}
          />

          <View style={styles.quickActionsContainer}>
            <View style={{ flexDirection: "column" }}>
              <Pressable
                style={styles.quickActionButton}
                onPress={() => router.push("/tabs/home/4_search")}
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
                onPress={() => router.push("/pets/newpets/")}
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
          <FeaturedPetsCarousel />

          <Divider style={{ marginTop: 15 }} />

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
                      router.push({
                        pathname: `/pets/${listing.id}`,
                        params: { pet: JSON.stringify(listing) },
                      })
                    }
                  >
                    <Image
                      source={{ uri: listing.petImages[0] }}
                      style={styles.listingImage}
                    />
                    <Text
                      style={styles.listingName}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {listing.petName}
                    </Text>
                    <Text
                      style={styles.listingDetails}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {listing.petSpecies} - {listing.breed}
                    </Text>
                    <Text
                      style={styles.listingDetails}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {listing.ageValue} {listing.ageUnit}
                    </Text>
                    <Text
                      style={styles.listingDate}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      Posted:{" "}
                      {listing.createdAt
                        ? listing.createdAt.toDate().toDateString()
                        : "Not available"}
                    </Text>
                  </Pressable>
                ))}
                <Pressable
                  style={styles.viewAllCard}
                  onPress={() => router.replace("/tabs/profile/3_mypets")}
                >
                  <Ionicons
                    name="chevron-forward"
                    size={24}
                    color={colors.black}
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
                  onPress={() => router.push("pets/newpets")}
                >
                  <Text style={styles.addListingsButtonText}>Add Listing</Text>
                </Pressable>
              </View>
            )}
          </View>

          <Divider style={{ marginVertical: 5 }} />

          <View style={styles.exploreMoreContainer}>
            <Text
              style={[styles.sectionTitle, { marginBottom: 5, marginTop: 0 }]}
            >
              Explore More
            </Text>
            <View style={styles.exploreMoreCardContainer}>
              <Pressable
                style={styles.exploreMoreCard}
                onPress={() => router.push("/tabs/home/2_caretips")}
              >
                <Ionicons name="book" size={24} color={colors.accent} />
                <Text style={styles.exploreMoreCardTitle}>Care Tips</Text>
                <Text style={styles.exploreMoreCardSubtitle}>
                  Expert advice for your pet
                </Text>
              </Pressable>
              <Pressable
                style={styles.exploreMoreCard}
                onPress={() => router.push("/tabs/home/3_training")}
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
          enablePanDownToClose={false}
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
              <Pressable onPress={clearNotifications} style={{ padding: 8 }}>
                <Ionicons name="trash-bin" size={24} color="red" />
              </Pressable>
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
              Recent Notifications
            </Text>
            {notifications.length > 0 ? (
              <ScrollView>
                {notifications.map((notification) => (
                  <View
                    key={notification.id}
                    style={{
                      padding: 12,
                      borderWidth: 1,
                      borderColor: colors.lightgray,
                      borderRadius: 8,
                      marginBottom: 10,
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <Image
                      source={{ uri: notification.pfp }}
                      style={styles.pfp}
                    />
                    <View style={{ flex: 1 }}>
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Text
                          style={[
                            styles.notificationTitle,
                            {
                              flex: 1,
                              marginRight: 8,
                            },
                          ]}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {notification.title}
                        </Text>
                        <Text
                          style={{
                            fontFamily: "Aptos",
                            fontSize: 12,
                            color: colors.darkgray,
                            flexShrink: 0,
                          }}
                        >
                          {formatRelativeTime(notification.timestamp)}
                        </Text>
                      </View>
                      <Text style={styles.notificationBody}>
                        {notification.body}
                      </Text>
                    </View>
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
    borderBottomColor: colors.lightgray,
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
    // flex: 1,
    fontFamily: "AptosBold",
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
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
    color: colors.black,
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
    borderColor: colors.lightgray,
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
    fontFamily: "UbuntuBold",
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
    color: colors.black,
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
  pfp: {
    width: 38,
    height: 38,
    borderRadius: 25,
    marginRight: 10,
  },
  notificationTitle: {
    fontFamily: "AptosBold",
    fontSize: 16,
  },
  notificationBody: {
    fontFamily: "Aptos",
    fontSize: 15,
  },
  searchbar: {
    flex: 1,
    borderRadius: 16,
    height: 50,
  },
});
