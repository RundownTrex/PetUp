import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Dimensions,
  Modal,
  Pressable,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

import colors from "../../utils/colors";
import MainButton from "../../components/MainButton";
import CustomHeader from "../../components/CustomHeader";

const { width: screenWidth } = Dimensions.get("window");

const PetDetailsScreen = () => {
  const route = useRoute();
  const { isOwner } = route.params || {};

  // Sample array of pet images
  const petImages = [
    "https://placehold.co/300x300/png?text=Image+1",
    "https://placehold.co/300x300/png?text=Image+2",
    "https://placehold.co/300x300/png?text=Image+3",
    "https://placehold.co/300x300/png?text=Image+4",
    "https://placehold.co/300x300/png?text=Image+5",
    "https://placehold.co/300x300/png?text=Image+6",
  ];

  const [showModal, setShowModal] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  const scale = useSharedValue(1);

  const animatedFavoriteStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    scale.value = withSpring(1.2, { damping: 5, stiffness: 200 }, () => {
      scale.value = withSpring(1, { damping: 5, stiffness: 200 });
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
            height={300}
            autoPlay={true}
            data={petImages}
            scrollAnimationDuration={1000}
            renderItem={({ item, index }) => (
              <Pressable
                activeOpacity={0.8}
                onPress={() => {
                  setSelectedIndex(index);
                  setShowModal(true);
                }}
              >
                <Image source={{ uri: item }} style={styles.petImage} />
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

        <Modal visible={showModal} transparent={false} animationType="slide">
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
            Luna <Text style={styles.petBreed}>(Chihuahua)</Text>
          </Text>
          <View style={styles.locationRow}>
            <FontAwesome name="map-marker" size={16} color={colors.accent} />
            <Text style={styles.markerText}>1.2 km</Text>
          </View>
          <View style={styles.detailRow}>
            <View style={[styles.detailBox, styles.genderBox]}>
              <Text style={styles.detailTitle}>Gender</Text>
              <Text style={styles.detailValue}>Female</Text>
            </View>
            <View style={[styles.detailBox, styles.ageBox]}>
              <Text style={styles.detailTitle}>Age</Text>
              <Text style={styles.detailValue}>5 months</Text>
            </View>
            <View style={[styles.detailBox, styles.sizeBox]}>
              <Text style={styles.detailTitle}>Size</Text>
              <Text style={styles.detailValue}>Small</Text>
            </View>
          </View>

          {/* Rescue Center Information */}
          <View style={styles.rescueContainer}>
            <Image
              source={{ uri: "https://placehold.co/40/png" }}
              style={styles.rescueImage}
            />
            <View>
              <Text style={styles.rescueName}>Happy Tails Animal Rescue</Text>
              <Text style={styles.rescueAddress}>
                123 Paws Street, NYC, NY 10001
              </Text>
            </View>
            <View style={styles.navigateIconContainer}>
              <Ionicons name="navigate" size={24} color="black" />
            </View>
          </View>

          {!isOwner && (
            <View style={styles.contactContainer}>
              <View style={styles.buttonWrapper}>
                <MainButton
                  title="Email Adopter"
                  icon={<FontAwesome name="envelope" size={16} color="white" />}
                  onPress={() => {
                    // Add code to open email client with adopter's email
                  }}
                />
              </View>
              <View style={styles.buttonWrapper}>
                <MainButton
                  title="Call Adopter"
                  icon={<FontAwesome name="phone" size={16} color="white" />}
                  onPress={() => {
                    // Add code to initiate a phone call to the adopter
                  }}
                />
              </View>
            </View>
          )}

          <View style={styles.descriptionContainer}>
            <Text style={styles.sectionTitle}>About Luna</Text>
            <Text style={styles.descriptionText}>
              Luna is a cheerful pet who loves to play and cuddle. She is
              well-trained, vaccinated, and looking for a forever home.
            </Text>
          </View>

          <View>
            <Text style={styles.sectionTitle}>Personality & Habits</Text>
            <Text style={styles.descriptionText}>
              Luna is playful, friendly, and curious. She loves exploring new
              places, enjoys long walks, and has a habit of greeting everyone
              with a wagging tail. Her calm nature and affectionate behavior
              make her a perfect companion.
            </Text>
          </View>

          <View style={styles.descriptionContainer}>
            <Text style={styles.sectionTitle}>Vaccination Records</Text>
            <Text style={styles.descriptionText}>
              - Rabies: Up-to-date{"\n"}- Distemper: Up-to-date{"\n"}-
              Parainfluenza: Up-to-date{"\n"}- Adenovirus: Up-to-date
            </Text>
          </View>

          <View style={styles.descriptionContainer}>
            <Text style={styles.sectionTitle}>Ideal Home</Text>
            <Text style={styles.descriptionText}>
              A loving and active environment where Luna can enjoy daily walks,
              ample playtime, and plenty of cuddles.
            </Text>
          </View>

          <View style={styles.descriptionContainer}>
            <Text style={styles.sectionTitle}>Adoption Information</Text>
            <Text style={styles.descriptionText}>
              Please contact to schedule a meeting and learn more about the
              adoption process.
            </Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          {isOwner ? (
            <MainButton
              title="Edit"
              onPress={() => console.log("Editing Info")}
            />
          ) : (
            <MainButton
              title="Contact Owner"
              onPress={() => console.log("Contacting owner")}
            />
          )}
        </View>
      </ScrollView>
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
    height: 300,
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
  },
  rescueContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    marginBottom: 20,
  },
  rescueImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  rescueName: {
    fontSize: 16,
    fontFamily: "AptosBold",
  },
  rescueAddress: {
    fontSize: 14,
    color: colors.darkgray,
    fontFamily: "Aptos",
  },
  navigateIconContainer: {
    flex: 1,
    alignItems: "flex-end",
  },
  contactContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 15,
    gap: 20,
  },
  buttonWrapper: {
    flex: 1,
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
});

export default PetDetailsScreen;
