import React, { useState } from "react";
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

import colors from "../../../utils/colors";
import CustomHeader from "../../../components/CustomHeader";

const initialPets = [
  {
    id: "1",
    name: "Mochi",
    species: "Dog",
    distance: "1.2 km",
    breed: "Abyssinian",
    image: "https://placehold.co/300x150/png?text=Mochi",
  },
  {
    id: "2",
    name: "Clover",
    species: "Cat",
    distance: "1.2 km",
    breed: "Fauve de Bourgogne",
    image: "https://placehold.co/300x150/png?text=Clover",
  },
  {
    id: "3",
    name: "Cleo",
    species: "Cat",
    distance: "1.5 km",
    breed: "Manx",
    image: "https://placehold.co/300x150/png?text=Cleo",
  },
  {
    id: "4",
    name: "Luna",
    species: "Dog",
    distance: "1.2 km",
    breed: "Chihuahua",
    image: "https://placehold.co/300x150/png?text=Luna",
  },
  {
    id: "5",
    name: "Bella",
    species: "Dog",
    distance: "0.5 km",
    breed: "Golden Retriever",
    image: "https://placehold.co/300x150/png?text=Bella",
  },
];

const FavoritesScreen = () => {
  const router = useRouter();
  const [favorites, setFavorites] = useState(initialPets);

  const removeFavorite = (petId) => {
    setFavorites(favorites.filter((pet) => pet.id !== petId));
  };

  const renderItem = ({ item }) => (
    <Pressable
      style={styles.card}
      onPress={() => router.push(`/pets/${item.id}`)}
    >
      <Image source={{ uri: item.image }} style={styles.image} />
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
        {item.name}
      </Text>
      <View style={styles.infoContainer}>
        <Ionicons name="location" size={16} color={colors.accent} />
        <Text numberOfLines={1} ellipsizeMode="tail" style={styles.info}>
          {item.distance}
        </Text>
      </View>
      <View style={styles.infoContainer}>
        <Text numberOfLines={2} ellipsizeMode="tail" style={styles.info}>
          {item.species} - {item.breed}
        </Text>
      </View>
    </Pressable>
  );

  const handleRefresh = () => {
    console.log("Refresh favorites list");
    // Refresh logic goes here (e.g. re-fetch favourited items)
  };

  return (
    <>
      <CustomHeader title="Favorites" />
      <View style={styles.container}>
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          numColumns={2}
          renderItem={renderItem}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          onRefresh={handleRefresh}
          refreshing={false}
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
});

export default FavoritesScreen;
