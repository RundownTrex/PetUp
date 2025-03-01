import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Image,
  LayoutAnimation,
  Platform,
  UIManager,
  RefreshControl,
} from "react-native";
import { DefaultTheme, Searchbar, Chip } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import firestore from "@react-native-firebase/firestore";

import colors from "../../../utils/colors";
import CustomHeader from "../../../components/CustomHeader";
import { router } from "expo-router";

const customSearchTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.accent,
    background: colors.accent,
  },
};

export default function ShopScreen() {
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [category, setCategory] = useState("");
  const [petType, setPetType] = useState("");
  const [priceRange, setPriceRange] = useState(100);
  const [brand, setBrand] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const searchbarRef = useRef(null);

  const categories = [
    "Food",
    "Toys",
    "Accessories",
    "Grooming",
    "Medicine",
    "Beds",
    "Treats",
  ];
  const petTypes = ["Dog", "Cat", "Bird", "Fish", "Reptile", "Small Pets"];

  useEffect(() => {
    if (Platform.OS === "android") {
      UIManager.setLayoutAnimationEnabledExperimental &&
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }

    setProducts([
      {
        id: "1",
        name: "Premium Dog Food",
        description: "High-quality nutrition for your dog",
        price: 24.99,
        category: "Food",
        petType: "Dog",
        brand: "Royal Canin",
        rating: 4.5,
        image:
          "https://m.media-amazon.com/images/I/41nXO0RsQdL._SX300_SY300_QL70_FMwebp_.jpg",
      },
      {
        id: "2",
        name: "Deluxe Cat Food",
        description: "Balanced nutrition for your cat",
        price: 19.99,
        category: "Food",
        petType: "Cat",
        brand: "Purina",
        rating: 4.2,
        image:
          "https://m.media-amazon.com/images/I/41nXO0RsQdL._SX300_SY300_QL70_FMwebp_.jpg",
      },
      {
        id: "3",
        name: "Bird Seed Mix",
        description: "Nutritious blend for your birds",
        price: 9.99,
        category: "Food",
        petType: "Bird",
        brand: "PetsCo",
        rating: 4.0,
        image:
          "https://m.media-amazon.com/images/I/41nXO0RsQdL._SX300_SY300_QL70_FMwebp_.jpg",
      },
      {
        id: "4",
        name: "Chew Toy",
        description: "Durable chew toy for dogs",
        price: 14.99,
        category: "Toys",
        petType: "Dog",
        brand: "Kong",
        rating: 4.6,
        image:
          "https://m.media-amazon.com/images/I/41nXO0RsQdL._SX300_SY300_QL70_FMwebp_.jpg",
      },
      {
        id: "5",
        name: "Catnip Toy",
        description: "Fun toy infused with catnip",
        price: 7.99,
        category: "Toys",
        petType: "Cat",
        brand: "Friskies",
        rating: 4.4,
        image:
          "https://m.media-amazon.com/images/I/41nXO0RsQdL._SX300_SY300_QL70_FMwebp_.jpg",
      },
      {
        id: "6",
        name: "Premium Fish Food",
        description: "High quality flakes for fish",
        price: 12.99,
        category: "Food",
        petType: "Fish",
        brand: "Royal Canin",
        rating: 4.3,
        image:
          "https://m.media-amazon.com/images/I/41nXO0RsQdL._SX300_SY300_QL70_FMwebp_.jpg",
      },
      {
        id: "7",
        name: "Reptile Heating Lamp",
        description: "Essential heating for reptiles",
        price: 29.99,
        category: "Accessories",
        petType: "Reptile",
        brand: "PetsCo",
        rating: 4.7,
        image:
          "https://m.media-amazon.com/images/I/41nXO0RsQdL._SX300_SY300_QL70_FMwebp_.jpg",
      },
      {
        id: "8",
        name: "Small Pet Bedding",
        description: "Comfortable bedding for small pets",
        price: 15.99,
        category: "Beds",
        petType: "Small Pets",
        brand: "Purina",
        rating: 4.1,
        image:
          "https://m.media-amazon.com/images/I/41nXO0RsQdL._SX300_SY300_QL70_FMwebp_.jpg",
      },
      {
        id: "9",
        name: "Grooming Kit",
        description: "All-in-one grooming kit for pets",
        price: 34.99,
        category: "Grooming",
        petType: "Dog",
        brand: "Kong",
        rating: 4.8,
        image:
          "https://m.media-amazon.com/images/I/41nXO0RsQdL._SX300_SY300_QL70_FMwebp_.jpg",
      },
      {
        id: "10",
        name: "Medicine for Pets",
        description: "Effective medicine for common pet ailments",
        price: 29.99,
        category: "Medicine",
        petType: "Cat",
        brand: "Royal Canin",
        rating: 4.2,
        image:
          "https://m.media-amazon.com/images/I/41nXO0RsQdL._SX300_SY300_QL70_FMwebp_.jpg",
      },
      {
        id: "11",
        name: "Treats Pack",
        description: "Delicious treats for training and rewards",
        price: 11.99,
        category: "Treats",
        petType: "Dog",
        brand: "Friskies",
        rating: 4.5,
        image:
          "https://m.media-amazon.com/images/I/41nXO0RsQdL._SX300_SY300_QL70_FMwebp_.jpg",
      },
    ]);
  }, []);

  const toggleFilters = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowFilters(!showFilters);
  };

  const filteredProducts = products.filter((product) => {
    const matchesQuery =
      (product.name || "").toLowerCase().includes(query.toLowerCase()) ||
      (product.description || "").toLowerCase().includes(query.toLowerCase());
    const matchesCategory = category ? product.category === category : true;
    const matchesPetType = petType ? product.petType === petType : true;
    const matchesPrice = product.price <= priceRange;

    return matchesQuery && matchesCategory && matchesPetType && matchesPrice;
  });

  return (
    <>
      <View style={styles.container}>
        <View style={styles.searchRowContainer}>
          <Searchbar
            placeholder="Search products"
            onChangeText={setQuery}
            value={query}
            style={[styles.searchbar, { backgroundColor: colors.offwhite }]}
            inputStyle={{ color: colors.blacktext, fontFamily: "Aptos" }}
            theme={customSearchTheme}
            ref={searchbarRef}
          />
          <Pressable style={styles.filterButton} onPress={toggleFilters}>
            <Ionicons name="filter" size={24} color={colors.white} />
          </Pressable>
        </View>

        {showFilters && (
          <View style={styles.filtersContainer}>
            <View style={styles.filterHeaderRow}>
              <Text style={styles.filterText}>Filter options:</Text>
              {(category || petType || brand || priceRange < 100) && (
                <Pressable
                  onPress={() => {
                    LayoutAnimation.configureNext(
                      LayoutAnimation.Presets.easeInEaseOut
                    );
                    setCategory("");
                    setPetType("");
                    setBrand("");
                    setPriceRange(100);
                  }}
                >
                  <Text style={styles.clearButtonText}>Clear</Text>
                </Pressable>
              )}
            </View>

            <Text style={styles.filterLabel}>Category:</Text>
            <View style={styles.chipRow}>
              {categories.map((cat) => (
                <Chip
                  key={cat}
                  selected={category === cat}
                  onPress={() => setCategory(category === cat ? "" : cat)}
                  style={{
                    backgroundColor:
                      category === cat ? colors.accent : colors.coolback,
                    marginRight: 10,
                    marginBottom: 5,
                  }}
                  textStyle={{
                    color: category === cat ? colors.white : colors.blacktext,
                  }}
                >
                  {cat}
                </Chip>
              ))}
            </View>

            <Text style={styles.filterLabel}>Pet Type:</Text>
            <View style={styles.chipRow}>
              {petTypes.map((type) => (
                <Chip
                  key={type}
                  selected={petType === type}
                  onPress={() => setPetType(petType === type ? "" : type)}
                  style={{
                    backgroundColor:
                      petType === type ? colors.accent : colors.coolback,
                    marginRight: 10,
                    marginBottom: 5,
                  }}
                  textStyle={{
                    color: petType === type ? colors.white : colors.blacktext,
                  }}
                >
                  {type}
                </Chip>
              ))}
            </View>

            <View style={styles.sliderContainer}>
              <Text style={styles.filterLabel}>Max Price: ₹{priceRange}</Text>
              <Slider
                style={{ width: "100%", height: 40 }}
                minimumValue={5}
                maximumValue={100}
                step={5}
                value={priceRange}
                onValueChange={setPriceRange}
                minimumTrackTintColor={colors.accent}
                maximumTrackTintColor={colors.offwhite}
              />
            </View>
          </View>
        )}

        <Text style={styles.header}>Search Results</Text>

        {filteredProducts.length > 0 ? (
          <FlatList
            contentContainerStyle={{ paddingBottom: 180 }}
            data={filteredProducts}
            keyExtractor={(item) => item.id}
            numColumns={2}
            renderItem={({ item }) => (
              <Pressable
                style={styles.productCard}
                onPress={() => {
                  router.push({ pathname: `/tabs/shop/${item.id}` });
                }}
              >
                <Image
                  source={{
                    uri: item.image || "https://via.placeholder.com/150",
                  }}
                  style={styles.productImage}
                />
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{item.name}</Text>
                  <Text style={styles.productPrice}>
                    ₹{item.price.toFixed(2)}
                  </Text>
                </View>
              </Pressable>
            )}
          />
        ) : (
          <Text style={styles.noResults}>
            No products found matching your criteria.
          </Text>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: colors.white,
  },
  searchRowContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  searchbar: {
    flex: 1,
    borderRadius: 10,
  },
  filterButton: {
    backgroundColor: colors.accent,
    padding: 10,
    borderRadius: 25,
    marginLeft: 10,
  },
  filtersContainer: {
    backgroundColor: colors.offwhite,
    padding: 10,
    borderRadius: 10,
    marginBottom: 20,
  },
  filterHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  filterText: {
    fontSize: 16,
    color: colors.black,
    marginBottom: 5,
    fontFamily: "AptosBold",
  },
  clearButtonText: {
    fontSize: 14,
    color: colors.black,
    fontFamily: "AptosDisplayBold",
    padding: 5,
  },
  filterLabel: {
    fontSize: 14,
    marginTop: 10,
    color: colors.black,
    fontFamily: "AptosSemiBold",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 5,
  },
  sliderContainer: {
    marginTop: 15,
  },
  header: {
    fontSize: 20,
    marginBottom: 15,
    color: colors.black,
    fontFamily: "AptosSemiBold",
  },
  productCard: {
    flex: 1,
    margin: 5,
    backgroundColor: colors.white,
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.offwhite,
  },
  productImage: {
    width: "100%",
    height: 150,
    resizeMode: "cover",
  },
  productInfo: {
    padding: 10,
  },
  productName: {
    fontSize: 14,
    fontFamily: "UbuntuBold",
    color: colors.blacktext,
  },
  productPrice: {
    fontSize: 16,
    fontFamily: "AptosSemiBold",
    color: colors.accent,
    marginTop: 5,
  },

  noResults: {
    fontSize: 16,
    fontStyle: "italic",
    color: "#888",
    textAlign: "center",
    marginTop: 20,
  },
});
