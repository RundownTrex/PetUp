import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Dimensions,
  Modal,
  Pressable,
  Linking,
  Alert,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";
import * as Location from "expo-location";
import { getDistance } from "geolib";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";

import colors from "../../../../utils/colors";
import MainButton from "../../../../components/MainButton";
import CustomHeader from "../../../../components/CustomHeader";
import { router } from "expo-router";

const { width: screenWidth } = Dimensions.get("window");

const PetDetailsScreen = () => {
  const route = useRoute();
  const { pet } = route.params || {};

  const petData = JSON.parse(pet);
  const [isOwner, setIsOwner] = useState(false);
  const [ownerData, setOwnerData] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ["50%"], []);
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("Permission to access location was denied");
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setUserLocation(location.coords);
      console.log(location.coords);
    })();
  }, []);

  useEffect(() => {
    if (petData?.ownerId) {
      setIsOwner(petData.ownerId === auth().currentUser.uid);

      const unsubscribe = firestore()
        .collection("users")
        .doc(petData.ownerId)
        .onSnapshot(
          (doc) => {
            if (doc.exists) {
              console.log(doc.data());
              setOwnerData(doc.data());
            }
          },
          (error) => console.error("Error fetching owner data:", error)
        );
      return () => unsubscribe();
    }
  }, [petData?.ownerId]);

  useEffect(() => {
    console.log(petData);
  }, [petData]);

  useEffect(() => {
    const userId = auth().currentUser.uid;
    const unsubscribe = firestore()
      .collection("users")
      .doc(userId)
      .onSnapshot(
        (doc) => {
          if (doc.exists) {
            const data = doc.data();
            if (data.favorites && Array.isArray(data.favorites)) {
              setIsFavorite(data.favorites.includes(petData.id));
            }
          }
        },
        (error) => {
          console.error("Error fetching favorites:", error);
        }
      );

    return () => unsubscribe();
  }, [petData.id]);

  const petImages = petData.petImages || [];

  const scale = useSharedValue(1);

  const animatedFavoriteStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const toggleFavorite = async () => {
    const newFavoriteStatus = !isFavorite;
    setIsFavorite(newFavoriteStatus);

    scale.value = withSpring(1.2, { damping: 5, stiffness: 200 }, () => {
      scale.value = withSpring(1, { damping: 5, stiffness: 200 });
    });

    const userId = auth().currentUser.uid;
    const petId = petData.id;

    try {
      if (newFavoriteStatus) {
        await firestore()
          .collection("users")
          .doc(userId)
          .update({
            favorites: firestore.FieldValue.arrayUnion(petId),
          });
      } else {
        await firestore()
          .collection("users")
          .doc(userId)
          .update({
            favorites: firestore.FieldValue.arrayRemove(petId),
          });
      }
    } catch (error) {
      console.error("Error updating favorite status:", error);
    }
  };

  const openMaps = () => {
    const { latitude, longitude } = petData.location || {};
    if (latitude && longitude) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
      Linking.openURL(url);
    } else {
      alert("Location not available");
    }
  };

  const emailOwner = () => {
    const email = ownerData ? ownerData.email : null;
    console.log("Pressed");
    if (email) {
      const subject = encodeURIComponent(`Inquiry about ${petData.petName}`);
      const body = encodeURIComponent(
        `Hello,\n\nI'm interested in learning more about ${petData.petName}. Please let me know if it's still available.\n\nThank you.`
      );
      const url = `mailto:${email}?subject=${subject}&body=${body}`;
      Linking.openURL(url);
    } else {
      alert("Email address not available");
    }
  };

  const callOwner = () => {
    const phone = ownerData ? ownerData.phoneNumber : null;
    if (phone) {
      const url = `tel:${phone}`;
      Linking.openURL(url);
    } else {
      alert("Phone number not available");
    }
  };

  const distanceInMeters = userLocation
    ? getDistance(
        { latitude: userLocation.latitude, longitude: userLocation.longitude },
        {
          latitude: petData.location.latitude,
          longitude: petData.location.longitude,
        }
      )
    : null;

  const handleMarkAsAdopted = () => {
    Alert.alert(
      "Confirm Adoption",
      "Are you sure you want to mark this pet as adopted?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes",
          onPress: async () => {
            try {
              await firestore()
                .collection("pets")
                .doc(petData.id)
                .update({ adopted: true });
              alert("Pet marked as adopted!");
            } catch (error) {
              console.error("Error updating adoption status:", error);
              alert("There was an error marking the pet as adopted.");
            }
          },
        },
      ]
    );
  };

  const openContactOptions = () => {
    setIsBottomSheetVisible(true);
    bottomSheetRef.current?.expand();
  };

  const closeContactOptions = () => {
    bottomSheetRef.current?.close();
    setTimeout(() => setIsBottomSheetVisible(false), 200);
  };

  const handleMessagePress = () => {
    closeContactOptions();
    const prePopulatedMessage = `Hi, I'm interested in your pet "${petData.petName}" (${petData.petSpecies} - ${petData.breed}). Is it still available for adoption?`;
    router.replace({
      pathname: `/tabs/chat/${petData.ownerId}`,
      params: {
        ownerId: petData.ownerId,
        initialMessage: prePopulatedMessage,
      },
    });
  };

  return (
    <>
      <CustomHeader title="Pet Details" />
      <ScrollView style={styles.container}>
        <View style={styles.carouselContainer}>
          <Carousel
            loop
            width={screenWidth}
            height={400}
            autoPlay={petImages.length > 1}
            scrollAnimationDuration={1800}
            data={petImages}
            renderItem={({ item, index }) => (
              <Pressable
                activeOpacity={0.8}
                onPress={() => {
                  setSelectedIndex(index);
                  setShowModal(true);
                }}
              >
                <View style={styles.imageWrapper}>
                  <Image source={{ uri: item }} style={styles.petImage} />
                  {petData.adopted && (
                    <View style={styles.adoptedOverlay}>
                      <Text style={styles.adoptedOverlayText}>Adopted</Text>
                    </View>
                  )}
                </View>
              </Pressable>
            )}
          />
          {!isOwner && (
            <Pressable style={styles.favoriteIcon} onPress={toggleFavorite}>
              <Animated.View style={animatedFavoriteStyle}>
                <Ionicons
                  name={isFavorite ? "heart" : "heart-outline"}
                  size={28}
                  color="red"
                />
              </Animated.View>
            </Pressable>
          )}
        </View>

        <Modal
          visible={showModal}
          transparent={false}
          animationType="slide"
          onRequestClose={() => setShowModal(false)}
        >
          <View style={styles.modalContainer}>
            <Pressable
              style={styles.closeButton}
              onPress={() => setShowModal(false)}
            >
              <Ionicons name="close" size={24} color={colors.white} />
            </Pressable>
            <Image
              source={{ uri: petImages[selectedIndex] }}
              style={styles.fullscreenImage}
              resizeMode="contain"
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.thumbnailScroll}
              contentContainerStyle={{ alignItems: "center" }}
            >
              {petImages.map((img, idx) => (
                <Pressable key={idx} onPress={() => setSelectedIndex(idx)}>
                  <Image
                    source={{ uri: img }}
                    style={[
                      styles.thumbnail,
                      idx === selectedIndex && styles.activeThumbnail,
                    ]}
                  />
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Modal>

        <View style={styles.contentContainer}>
          <Text style={styles.petName}>
            {petData.petName}{" "}
            <Text style={styles.petBreed}>
              ({petData.petSpecies} - {petData.breed})
            </Text>
          </Text>
          {!isOwner && (
            <View style={styles.locationRow}>
              <FontAwesome name="map-marker" size={16} color={colors.accent} />
              {distanceInMeters !== null ? (
                <Text style={styles.markerText}>
                  {(distanceInMeters / 1000).toFixed(2)} km away
                </Text>
              ) : (
                <Text style={styles.markerText}>Calculating distance...</Text>
              )}
            </View>
          )}
          <View style={styles.detailRow}>
            <View style={[styles.detailBox, styles.genderBox]}>
              <Text style={styles.detailTitle}>Gender</Text>
              <Text style={styles.detailValue}>{petData.gender}</Text>
            </View>
            <View style={[styles.detailBox, styles.ageBox]}>
              <Text style={styles.detailTitle}>Age</Text>
              <Text style={styles.detailValue}>
                {petData.ageValue} {petData.ageUnit}
              </Text>
            </View>
            <View style={[styles.detailBox, styles.sizeBox]}>
              <Text style={styles.detailTitle}>Size</Text>
              <Text style={styles.detailValue}>{petData.size}</Text>
            </View>
          </View>
          <Pressable style={styles.userContainer} onPress={openMaps}>
            <Image
              source={{
                uri: ownerData
                  ? ownerData.pfpUrl || "https://placehold.co/40/png"
                  : "https://placehold.co/40/png",
              }}
              style={styles.userPfp}
            />
            <View
              style={{
                flex: 1,
              }}
            >
              <Text style={styles.userName}>
                {ownerData
                  ? `${ownerData.firstname} ${ownerData.lastname}`
                  : "Loading..."}
              </Text>
              <Text
                style={styles.userAddress}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {petData.address.formattedAddress}
              </Text>
            </View>
            <View style={styles.navigateIconContainer}>
              <Ionicons name="navigate" size={24} color="black" />
            </View>
          </Pressable>
          <View style={styles.descriptionContainer}>
            <Text style={styles.sectionTitle}>About {petData.petName}</Text>
            <Text style={styles.descriptionText}>{petData.about}</Text>
          </View>
          <View style={styles.descriptionContainer}>
            <Text style={styles.sectionTitle}>Personality & Habits</Text>
            <Text style={styles.descriptionText}>{petData.personality}</Text>
          </View>
          <View style={styles.descriptionContainer}>
            <Text style={styles.sectionTitle}>Vaccination Records</Text>
            <Text style={styles.descriptionText}>{petData.vaccinations}</Text>
          </View>
          <View style={styles.descriptionContainer}>
            <Text style={styles.sectionTitle}>Ideal Home</Text>
            <Text style={styles.descriptionText}>{petData.idealHome}</Text>
          </View>
          <View style={styles.descriptionContainer}>
            <Text style={styles.sectionTitle}>Adoption Information</Text>
            <Text style={styles.descriptionText}>{petData.adoptionInfo}</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          {isOwner ? (
            <>
              {!petData.adopted && (
                <MainButton
                  title="Mark as Adopted"
                  onPress={handleMarkAsAdopted}
                  style={{ marginBottom: 10 }}
                />
              )}
              <MainButton
                title="Edit"
                onPress={() => {
                  router.push({
                    pathname: `/tabs/home/pets/editpets/`,
                    params: { pet: JSON.stringify(petData) },
                  });
                }}
              />
            </>
          ) : (
            <MainButton title="Contact Owner" onPress={openContactOptions} />
          )}
        </View>
      </ScrollView>

      {isBottomSheetVisible && (
        <Pressable
          style={styles.bottomSheetBackdrop}
          onPress={() => {
            bottomSheetRef.current?.close();
            setTimeout(() => setIsBottomSheetVisible(false), 200);
          }}
        />
      )}

      {isBottomSheetVisible && (
        <BottomSheet
          ref={bottomSheetRef}
          snapPoints={snapPoints}
          enablePanDownToClose={true}
          onClose={() => setIsBottomSheetVisible(false)}
          backgroundStyle={styles.bottomSheetBackground}
          handleIndicatorStyle={styles.bottomSheetIndicator}
        >
          <BottomSheetView style={styles.bottomSheetContent}>
            <Text style={styles.bottomSheetTitle}>
              Contact {ownerData?.firstname || "Owner"}
            </Text>

            <Pressable
              style={styles.contactOption}
              onPress={handleMessagePress}
            >
              <View
                style={[
                  styles.contactIconCircle,
                  { backgroundColor: "#e9fdf0" },
                ]}
              >
                <Ionicons name="chatbubble" size={24} color={colors.accent} />
              </View>
              <View style={styles.contactOptionTextContainer}>
                <Text style={styles.contactOptionTitle}>Message</Text>
                <Text style={styles.contactOptionSubtitle}>
                  Chat with the owner
                </Text>
              </View>
            </Pressable>

            <Pressable
              style={styles.contactOption}
              onPress={() => {
                emailOwner();
                closeContactOptions();
              }}
            >
              <View
                style={[
                  styles.contactIconCircle,
                  { backgroundColor: "#e9f0fd" },
                ]}
              >
                <FontAwesome name="envelope" size={24} color="#4a80f5" />
              </View>
              <View style={styles.contactOptionTextContainer}>
                <Text style={styles.contactOptionTitle}>Email</Text>
                <Text style={styles.contactOptionSubtitle}>
                  Send an email to the owner
                </Text>
              </View>
            </Pressable>

            <Pressable
              style={styles.contactOption}
              onPress={() => {
                callOwner();
                closeContactOptions();
              }}
            >
              <View
                style={[
                  styles.contactIconCircle,
                  { backgroundColor: "#fde9e9" },
                ]}
              >
                <FontAwesome name="phone" size={24} color="#f54a4a" />
              </View>
              <View style={styles.contactOptionTextContainer}>
                <Text style={styles.contactOptionTitle}>Call</Text>
                <Text style={styles.contactOptionSubtitle}>
                  Call the owner directly
                </Text>
              </View>
            </Pressable>
          </BottomSheetView>
        </BottomSheet>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  carouselContainer: {
    position: "relative",
  },
  petImage: {
    width: "100%",
    height: 400,
    resizeMode: "cover",
  },
  favoriteIcon: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: colors.offwhite,
    borderRadius: 20,
    padding: 6,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  petName: {
    fontSize: 22,
    fontFamily: "UbuntuBold",
  },
  petBreed: {
    fontSize: 18,
    fontFamily: "Ubuntu",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  markerText: {
    marginLeft: 5,
    fontSize: 16,
    color: "gray",
    fontFamily: "Aptos",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  detailBox: {
    flex: 1,
    alignItems: "center",
    margin: 5,
    padding: 10,
  },
  genderBox: {
    backgroundColor: "#fde9e9",
    borderRadius: 5,
  },
  ageBox: {
    backgroundColor: "#e9f0fd",
    borderRadius: 5,
  },
  sizeBox: {
    backgroundColor: "#e9fdf0",
    borderRadius: 5,
  },
  detailTitle: {
    fontSize: 14,
    color: colors.darkgray,
    fontFamily: "Aptos",
  },
  detailValue: {
    fontSize: 16,
    fontFamily: "AptosDisplayBold",
    textAlign: "center",
  },
  userContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    marginBottom: 20,
  },
  userPfp: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userName: {
    fontSize: 16,
    fontFamily: "AptosBold",
  },
  userAddress: {
    fontSize: 14,
    color: colors.darkgray,
    fontFamily: "Aptos",
  },
  navigateIconContainer: {
    alignItems: "flex-end",
  },
  buttonContainer: {
    padding: 20,
  },
  descriptionContainer: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "AptosBold",
  },
  descriptionText: {
    fontSize: 14,
    color: "gray",
    fontFamily: "Aptos",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.black,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 1,
    padding: 10,
  },
  fullscreenImage: {
    width: screenWidth,
    height: "70%",
  },
  thumbnailScroll: {
    marginTop: 20,
  },
  thumbnail: {
    width: 70,
    height: 70,
    marginHorizontal: 5,
    borderWidth: 2,
    borderColor: "transparent",
  },
  activeThumbnail: {
    borderColor: colors.accent,
  },
  imageWrapper: {
    position: "relative",
  },
  adoptedOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  adoptedOverlayText: {
    color: colors.white,
    fontSize: 24,
    fontFamily: "UbuntuBold",
  },
  bottomSheetBackground: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  bottomSheetIndicator: {
    backgroundColor: colors.black,
    width: 60,
  },
  bottomSheetContent: {
    flex: 1,
    padding: 20,
  },
  bottomSheetTitle: {
    fontSize: 20,
    fontFamily: "AptosBold",
    marginBottom: 20,
    textAlign: "center",
  },
  contactOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightgray,
  },
  contactIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  contactOptionTextContainer: {
    flex: 1,
  },
  contactOptionTitle: {
    fontFamily: "AptosBold",
    fontSize: 16,
  },
  contactOptionSubtitle: {
    fontFamily: "Aptos",
    fontSize: 14,
    color: colors.darkgray,
  },
  bottomSheetBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
});

export default PetDetailsScreen;
