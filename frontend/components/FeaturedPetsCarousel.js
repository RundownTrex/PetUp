import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  Dimensions,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import colors from "../utils/colors";
import MainButton from "./MainButton";

const { width, height } = Dimensions.get("window");

const FeaturedPetsCarousel = () => {
  const router = useRouter();

  const featuredPets = [
    {
      id: "1",
      name: "Buddy",
      breed: "Sigma Dog",
      image:
        "https://www.dogingtonpost.com/wp-content/uploads/2018/03/dogscaping-main.jpg",
    },
    {
      id: "2",
      name: "Mittens",
      breed: "Siamese Cat",
      image:
        "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEihqTAxvRDbH_Uj3QE_A7bKfHzYrS3W4v3t_CHkzZTSQvxnWkx1Zqshgk39NA1dDgJvXkVeKnb2cTG8dSTGz_dBZtWgrKF7aXHSbo1J1oMrVZtmsHCnvDI3TE9i9lPfb36NSYGikkcu8-I/s400/siamese+cat+information.jpg",
    },
    {
      id: "3",
      name: "Charlie",
      breed: "Beagle",
      image: "https://placehold.co/600x400/000000/FFFFFF/png",
    },
    {
      id: "4",
      name: "Bella",
      breed: "Persian Cat",
      image: "https://placehold.co/600x400/000000/FFFFFF/png",
    },
    {
      id: "5",
      name: "Max",
      breed: "Bulldog",
      image: "https://placehold.co/600x400/000000/FFFFFF/png",
    },
  ];

  const renderItem = ({ item }) => (
    <Pressable
      style={styles.card}
      onPress={() => router.push(`/tabs/pet-details/${item.id}`)}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.image }} style={styles.image} />
        <View style={styles.overlay}>
          <Text style={styles.petName}>{item.name}</Text>
          <Text style={styles.petBreed}>{item.breed}</Text>
        </View>
      </View>
    </Pressable>
  );

  return (
    <>
      <View style={styles.container}>
        {featuredPets.length > 0 ? (
          <Carousel
            loop
            width={width}
            height={height * 0.27}
            autoPlay
            autoPlayInterval={3000}
            data={featuredPets}
            scrollAnimationDuration={1000}
            renderItem={({ item }) => renderItem({ item })}
          />
        ) : (
          <Text style={styles.noPetsText}>No featured pets available.</Text>
        )}
      </View>
      <Pressable
        onPress={() => router.push("/tabs/search?filter=featured")}
        style={styles.viewAllButton}
      >
        <View style={styles.viewAllContainer}>
          <Text style={styles.viewAllText}>View All</Text>
          <Ionicons
            name="arrow-forward-outline"
            size={16}
            color={colors.black}
          />
        </View>
      </Pressable>
      {/* <MainButton
        title="View All"
        onPress={() => router.push("/tabs/search?filter=featured")}
        style={styles.viewAllButton}
      /> */}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
  },
  card: {
    backgroundColor: colors.white,
    padding: 10,
    alignItems: "center",
    marginHorizontal: 10,
  },
  imageContainer: {
    width: "100%",
    height: 175,
    borderRadius: 10,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    paddingVertical: 5,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "flex-start",
    padding: 16,
  },
  petName: {
    fontSize: 16,
    fontFamily: "UbuntuBold",
    color: "#fff",
    borderColor: colors.white,
  },
  petBreed: {
    fontSize: 14,
    fontFamily: "Ubuntu",
    color: "#fff",
  },
  noPetsText: {
    textAlign: "left",
    color: "gray",
  },
  viewAllButton: {
    paddingHorizontal: 10,
    borderRadius: 10,
    justifyContent: "flex-start",
  },
  viewAllContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewAllText: {
    fontFamily: "AptosBold",
    fontSize: 16,
    marginRight: 5,
    color: colors.black,
  },
});

export default FeaturedPetsCarousel;
