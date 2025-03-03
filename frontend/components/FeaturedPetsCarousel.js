import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import { getDistance } from "geolib";
import * as Location from "expo-location";

import colors from "../utils/colors";

const { width, height } = Dimensions.get("window");

const FeaturedPetsCarousel = () => {
  const router = useRouter();
  const [featuredPets, setFeaturedPets] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locationPermission, setLocationPermission] = useState(null);
  const currentUid = auth().currentUser?.uid || "";

  useEffect(() => {
    const getLocationAsync = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        setLocationPermission(status === "granted");

        if (status === "granted") {
          const location = await Location.getCurrentPositionAsync({});
          console.log("Got user location:", location.coords);
          setUserLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        } else {
          console.log("Location permission denied");
        }
      } catch (error) {
        console.error("Error getting location:", error);
      }
    };

    getLocationAsync();
  }, []);

  useEffect(() => {
    console.log("User location state:", userLocation);

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

          console.log(`Found ${pets.length} pets`);
          console.log("Calculating distances for pets");

          if (userLocation && pets.length > 0) {
            console.log("Calculating distances for pets");
            const petsWithDistance = pets.map((pet) => {
              if (
                pet.location &&
                pet.location.latitude &&
                pet.location.longitude
              ) {
                const distanceInMeters = getDistance(
                  {
                    latitude: userLocation.latitude,
                    longitude: userLocation.longitude,
                  },
                  {
                    latitude: pet.location.latitude,
                    longitude: pet.location.longitude,
                  }
                );

                const distance = distanceInMeters / 1000;
                return { ...pet, distance };
              }
              return { ...pet, distance: 10000 };
            });

            petsWithDistance.sort((a, b) => a.distance - b.distance);

            setFeaturedPets(petsWithDistance.slice(0, 5));
          } else {
            setFeaturedPets(pets.slice(0, 3));
          }

          setLoading(false);
        },
        (error) => {
          console.error("Error fetching featured pets:", error);
          setLoading(false);
        }
      );
    return () => unsubscribe();
  }, [currentUid, userLocation]);

  const renderItem = ({ item }) => (
    <Pressable
      style={styles.card}
      onPress={() =>
        router.push({
          pathname: `/tabs/home/pets/${item.id}`,
          params: { pet: JSON.stringify(item) },
        })
      }
    >
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri: item.petImages?.[0] || "https://via.placeholder.com/400",
          }}
          style={styles.image}
        />
        <View style={styles.overlay}>
          <View>
            <Text style={styles.petName}>{item.petName || "Unnamed Pet"}</Text>
            <Text style={styles.petBreed}>
              {item.breed || "Unknown"} {item.petSpecies || ""}
            </Text>
          </View>
          {typeof item.distance === "number" && (
            <Text style={styles.distance}>
              {item.distance < 1
                ? `${Math.round(item.distance * 1000)}m away`
                : `${item.distance.toFixed(1)}km away`}
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );

  return (
    <>
      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color={colors.accent} />
        ) : featuredPets.length > 0 ? (
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
          <Text style={styles.noPetsText}>
            {locationPermission === false
              ? "Enable location to see pets near you."
              : "No featured pets available nearby."}
          </Text>
        )}
      </View>
      <Pressable
        onPress={() => router.push("/tabs/home/4_search?filter=featured")}
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
    minHeight: 100,
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
    alignItems: "center",
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
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
  distance: {
    fontSize: 12,
    fontFamily: "Ubuntu",
    color: colors.white,
    marginTop: 4,
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
