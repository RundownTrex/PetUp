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
      breed: "Golden Retriever",
      image: "https://placehold.co/600x400/000000/FFFFFF/png",
    },
    {
      id: "2",
      name: "Mittens",
      breed: "Siamese Cat",
      image: "https://placehold.co/600x400/000000/FFFFFF/png",
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
        <Text style={styles.viewAllText}>View All</Text>
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
    fontFamily: "UbuntuRegular",
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

  viewAllText: {
    fontFamily: "UbuntuBold",
    fontSize: 16,
  },
});

export default FeaturedPetsCarousel;
