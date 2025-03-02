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
import { SegmentedButtons } from "react-native-paper";

import colors from "../../../utils/colors";
import CustomHeader from "../../../components/CustomHeader";

const FavoritesScreen = () => {
  const router = useRouter();
  const [favoritePets, setFavoritePets] = useState([]);
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [activeTab, setActiveTab] = useState("pets");
  const userId = auth().currentUser.uid;

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

            const petFavIds = data.favorites || [];
            if (petFavIds.length > 0) {
              fetchFavoritePets(petFavIds);
            } else {
              setFavoritePets([]);
            }

            // Fetch favorite products
            const productFavIds = data.favoriteProducts || [];
            if (productFavIds.length > 0) {
              fetchFavoriteProducts(productFavIds);
            } else {
              setFavoriteProducts([]);
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

  const fetchFavoritePets = (petIds) => {
    firestore()
      .collection("pets")
      .where(firestore.FieldPath.documentId(), "in", petIds)
      .get()
      .then((querySnapshot) => {
        const petList = [];
        querySnapshot.forEach((docSnapshot) => {
          const petItem = {
            id: docSnapshot.id,
            ...docSnapshot.data(),
          };
          if (petItem.location && userLocation) {
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
            petItem.distance = "N/A";
          }
          petList.push(petItem);
        });
        setFavoritePets(petList);
      })
      .catch((error) => {
        console.error("Error fetching favorite pets:", error);
      });
  };

  const fetchFavoriteProducts = (productIds) => {
    firestore()
      .collection("petProducts")
      .where(firestore.FieldPath.documentId(), "in", productIds)
      .get()
      .then((querySnapshot) => {
        const productList = [];
        querySnapshot.forEach((docSnapshot) => {
          const productItem = {
            id: docSnapshot.id,
            ...docSnapshot.data(),
          };
          if (productItem.location && userLocation) {
            const dist = getDistance(
              {
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
              },
              {
                latitude: productItem.location.latitude,
                longitude: productItem.location.longitude,
              }
            );
            productItem.distance = (dist / 1000).toFixed(2) + " km";
          } else {
            productItem.distance = "N/A";
          }
          productList.push(productItem);
        });
        setFavoriteProducts(productList);
      })
      .catch((error) => {
        console.error("Error fetching favorite products:", error);
      });
  };

  const removeFavoritePet = (petId) => {
    firestore()
      .collection("users")
      .doc(userId)
      .update({
        favorites: firestore.FieldValue.arrayRemove(petId),
      })
      .catch((error) => console.error("Error removing favorite pet:", error));
  };

  const removeFavoriteProduct = (productId) => {
    firestore()
      .collection("users")
      .doc(userId)
      .update({
        favoriteProducts: firestore.FieldValue.arrayRemove(productId),
      })
      .catch((error) =>
        console.error("Error removing favorite product:", error)
      );
  };

  const renderPetItem = ({ item }) => (
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
          removeFavoritePet(item.id);
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

  const renderProductItem = ({ item }) => (
    <Pressable
      style={styles.card}
      onPress={() =>
        router.push({
          pathname: `/tabs/shop/${item.id}`,
        })
      }
    >
      <Image
        source={{ uri: item.images ? item.images[0] : item.image }}
        style={styles.image}
      />
      <Pressable
        style={styles.favoriteIcon}
        onPress={(e) => {
          e.stopPropagation();
          removeFavoriteProduct(item.id);
        }}
      >
        <Ionicons name="heart" size={24} color="red" />
      </Pressable>
      <Text numberOfLines={1} ellipsizeMode="tail" style={styles.name}>
        {item.name}
      </Text>
      <View style={styles.infoContainer}>
        <Ionicons name="location" size={16} color={colors.accent} />
        <Text numberOfLines={1} ellipsizeMode="tail" style={styles.info}>
          {item.distance}
        </Text>
      </View>
      <View style={styles.priceContainer}>
        <Text style={styles.price}>₹{item.price?.toFixed(2)}</Text>
      </View>
    </Pressable>
  );

  return (
    <>
      <CustomHeader title="Favorites" />
      <View style={styles.container}>
        <View style={styles.segmentContainer}>
          <SegmentedButtons
            value={activeTab}
            onValueChange={setActiveTab}
            buttons={[
              {
                value: "pets",
                label: "Pets",
                icon: "paw",
                checkedColor: colors.white,
                style: {
                  backgroundColor:
                    activeTab === "pets" ? colors.accent : colors.white,
                },
              },
              {
                value: "products",
                label: "Products",
                icon: "shopping",
                checkedColor: colors.white,
                style: {
                  backgroundColor:
                    activeTab === "products" ? colors.accent : colors.white,
                },
              },
            ]}
            style={styles.segmentedButtons}
          />
        </View>

        {activeTab === "pets" ? (
          <FlatList
            data={favoritePets}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            renderItem={renderPetItem}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No favorite pets found.</Text>
              </View>
            }
          />
        ) : (
          <FlatList
            data={favoriteProducts}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            renderItem={renderProductItem}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  No favorite products found.
                </Text>
              </View>
            }
          />
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  segmentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  segmentedButtons: {
    backgroundColor: colors.white,
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
  priceContainer: {
    marginHorizontal: 10,
    marginTop: 4,
  },
  price: {
    fontSize: 16,
    fontFamily: "AptosSemiBold",
    color: colors.black,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: colors.darkgray,
    fontFamily: "Aptos",
  },
});

export default FavoritesScreen;
