import React, { useState, useEffect } from "react";
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
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";

import colors from "../utils/colors";

const { width, height } = Dimensions.get("window");

const FeaturedPetsCarousel = () => {
  const router = useRouter();
  const [featuredPets, setFeaturedPets] = useState([]);
  const currentUid = auth().currentUser.uid;

  useEffect(() => {
    const unsubscribe = firestore()
      .collection("pets")
      .orderBy("createdAt", "desc")
      .onSnapshot(
        (snapshot) => {
          const pets = [];
          snapshot.forEach((doc) => {
            const pet = {
              id: doc.id,
              ...doc.data(),
            };
            if (pet.adopted) return;
            if (pet.ownerId === currentUid) return;
            pets.push(pet);
          });
          setFeaturedPets(pets.slice(0, 3));
        },
        (error) => {
          console.error("Error fetching featured pets:", error);
        }
      );
    return () => unsubscribe();
  }, [currentUid]);

  const renderItem = ({ item }) => (
    <Pressable
      style={styles.card}
      onPress={() =>
        router.push({
          pathname: `/pets/${item.id}`,
          params: { pet: JSON.stringify(item) },
        })
      }
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.petImages[0] }} style={styles.image} />
        <View style={styles.overlay}>
          <Text style={styles.petName}>{item.petName}</Text>
          <Text style={styles.petBreed}>
            {item.breed} {item.petSpecies}
          </Text>
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
            height={height * 0.33}
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
    height: "100%",
    borderRadius: 10,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
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
    color: colors.white,
  },
  petBreed: {
    fontSize: 14,
    fontFamily: "Ubuntu",
    color: colors.white,
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
