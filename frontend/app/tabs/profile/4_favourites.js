import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import * as Location from "expo-location";
import { getDistance } from "geolib";

import colors from "../../../utils/colors";
import CustomHeader from "../../../components/CustomHeader";

const FavoritesScreen = () => {
  const router = useRouter();
  const [favorites, setFavorites] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const userId = auth().currentUser.uid;

  // Fetch user's current location
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation(location.coords);
      } else {
        console.log("Location permission not granted");
      }
    })();
  }, []);

  useEffect(() => {
    const unsubscribeUser = firestore()
      .collection("users")
      .doc(userId)
      .onSnapshot(
        (doc) => {
          if (doc.exists) {
            const data = doc.data();
            const favIds = data.favorites || [];
            console.log("Favorite IDs:", favIds);
            if (favIds.length > 0) {
              firestore()
                .collection("pets")
                .where(firestore.FieldPath.documentId(), "in", favIds)
                .get()
                .then((querySnapshot) => {
                  const petList = [];
                  querySnapshot.forEach((docSnapshot) => {
                    const petItem = {
                      id: docSnapshot.id,
                      ...docSnapshot.data(),
                    };
                    if (petItem.location) {
                      if (userLocation) {
                        const dist = getDistance(
                          {
                            latitude: userLocation.latitude,
                            longitude: userLocation.longitude,
                          },
                          {
                            latitude: petItem.location.latitude,
                            longitude: petItem.location.longitude,
                          }
                        );
                        petItem.distance = (dist / 1000).toFixed(2) + " km";
                      } else {
                        petItem.distance = "...";
                      }
                    } else {
                      petItem.distance = "N/A";
                    }
                    petList.push(petItem);
                  });
                  setFavorites(petList);
                })
                .catch((error) => {
                  console.error("Error fetching favorite pets:", error);
                });
            } else {
              setFavorites([]);
            }
          }
        },
        (error) => {
          console.error("Error fetching user favorites:", error);
        }
      );

    return () => {
      unsubscribeUser();
    };
  }, [userId, userLocation]);

  const removeFavorite = (petId) => {
    firestore()
      .collection("users")
      .doc(userId)
      .update({
        favorites: firestore.FieldValue.arrayRemove(petId),
      })
      .catch((error) => console.error("Error removing favorite:", error));
  };

  const renderItem = ({ item }) => (
    <Pressable
      style={styles.card}
      onPress={() =>
        router.push({
          pathname: `/pets/${item.id}`,
          params: {
            pet: JSON.stringify(item),
            isOwner: false,
          },
        })
      }
    >
      <Image source={{ uri: item.petImages[0] }} style={styles.image} />
      <Pressable
        style={styles.favoriteIcon}
        onPress={(e) => {
          e.stopPropagation();
          removeFavorite(item.id);
        }}
      >
        <Ionicons name="heart" size={24} color="red" />
      </Pressable>
      <Text numberOfLines={1} ellipsizeMode="tail" style={styles.name}>
        {item.petName}
      </Text>
      <View style={styles.infoContainer}>
        <Ionicons name="location" size={16} color={colors.accent} />
        <Text numberOfLines={1} ellipsizeMode="tail" style={styles.info}>
          {item.distance}
        </Text>
      </View>
      <View style={styles.infoContainer}>
        <Text numberOfLines={2} ellipsizeMode="tail" style={styles.info}>
          {item.petSpecies} - {item.breed}
        </Text>
      </View>
    </Pressable>
  );

  const handleRefresh = () => {
    console.log("Refresh favorites list");
    // Optionally, you can trigger a manual re-fetch here if needed.
  };

  return (
    <>
      <CustomHeader title="Favorites" />
      <View style={styles.container}>
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          renderItem={renderItem}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          onRefresh={handleRefresh}
          refreshing={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No favorites found.</Text>
            </View>
          }
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    paddingVertical: 16,
  },
  list: {
    paddingHorizontal: 15,
    paddingBottom: 60,
  },
  row: {
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    backgroundColor: colors.offwhite,
    borderRadius: 10,
    paddingBottom: 10,
    overflow: "hidden",
    marginBottom: 10,
  },
  image: {
    width: "100%",
    height: 150,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  favoriteIcon: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: colors.white,
    borderRadius: 50,
    padding: 5,
    zIndex: 1,
  },
  name: {
    fontSize: 16,
    marginHorizontal: 10,
    marginTop: 5,
    fontFamily: "UbuntuBold",
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 10,
    marginTop: 2,
  },
  info: {
    fontSize: 14,
    color: colors.darkgray,
    marginLeft: 5,
    fontFamily: "Aptos",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  emptyText: {
    fontSize: 16,
    color: colors.darkgray,
    fontFamily: "Aptos",
  },
});

export default FavoritesScreen;
