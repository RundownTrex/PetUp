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
  ActivityIndicator,
  Modal,
} from "react-native";
import { DefaultTheme, Searchbar, Chip } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import * as Location from "expo-location";
import { getDistance } from "geolib";

import colors from "../../../utils/colors";
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
  const [priceRange, setPriceRange] = useState(5000);
  const [brand, setBrand] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState("newest");
  const [showSortModal, setShowSortModal] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
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

    fetchProducts();
  }, []);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }
    })();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const productsSnapshot = await firestore()
        .collection("petProducts")
        .orderBy("createdAt", "desc")
        .get();

      const productsList = productsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log(productsList);

      setProducts(productsList);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  const toggleFilters = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowFilters(!showFilters);
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 9999;

    try {
      const distanceInMeters = getDistance(
        { latitude: lat1, longitude: lon1 },
        { latitude: lat2, longitude: lon2 }
      );

      return distanceInMeters / 1000;
    } catch (error) {
      console.error("Error calculating distance:", error);
      return 9999;
    }
  };

  const formatDistance = (distance) => {
    if (distance === undefined || distance === null) {
      return "Distance unknown";
    }
    if (distance >= 1) {
      return `${distance.toFixed(1)} km away`;
    } else {
      return `${(distance * 1000).toFixed(0)} m away`;
    }
  };

  const currentUserId = auth().currentUser?.uid || "";

  const sortedAndFilteredProducts = React.useMemo(() => {
    const filtered = products.filter((product) => {
      if (product.sellerId === currentUserId) {
        return false;
      }

      const matchesQuery =
        (product.name || "").toLowerCase().includes(query.toLowerCase()) ||
        (product.description || "").toLowerCase().includes(query.toLowerCase());
      const matchesCategory = category ? product.category === category : true;
      const matchesPetType = petType ? product.petType === petType : true;
      const matchesPrice =
        priceRange === 5000 ? true : product.price <= priceRange;

      return matchesQuery && matchesCategory && matchesPetType && matchesPrice;
    });

    return [...filtered].sort((a, b) => {
      if (sortOption === "price_low_high") {
        return a.price - b.price;
      } else if (sortOption === "price_high_low") {
        return b.price - a.price;
      } else if (sortOption === "distance" && userLocation) {
        const distanceA = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          a.location?.latitude,
          a.location?.longitude
        );
        const distanceB = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          b.location?.latitude,
          b.location?.longitude
        );
        return distanceA - distanceB;
      } else {
        return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
      }
    });
  }, [
    products,
    query,
    category,
    petType,
    priceRange,
    sortOption,
    userLocation,
    currentUserId,
  ]);

  const handleSortChange = (option) => {
    setSortOption(option);
    setShowSortModal(false);
  };

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

        <View style={styles.sortContainer}>
          <Text style={styles.sortLabel}>Sort by:</Text>
          <Pressable
            style={styles.sortButton}
            onPress={() => setShowSortModal(true)}
          >
            <Text style={styles.sortButtonText}>
              {sortOption === "newest" && "Newest"}
              {sortOption === "price_low_high" && "Price: Low to High"}
              {sortOption === "price_high_low" && "Price: High to Low"}
              {sortOption === "distance" && "Distance"}
            </Text>
            <Ionicons name="chevron-down" size={16} color={colors.black} />
          </Pressable>
        </View>

        <Modal
          transparent
          visible={showSortModal}
          animationType="fade"
          onRequestClose={() => setShowSortModal(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setShowSortModal(false)}
          >
            <View style={styles.sortModalContent}>
              <Pressable
                style={[
                  styles.sortOption,
                  sortOption === "newest" && styles.selectedSort,
                ]}
                onPress={() => handleSortChange("newest")}
              >
                <Text style={styles.sortOptionText}>Newest</Text>
                {sortOption === "newest" && (
                  <Ionicons name="checkmark" size={18} color={colors.accent} />
                )}
              </Pressable>

              <Pressable
                style={[
                  styles.sortOption,
                  sortOption === "price_low_high" && styles.selectedSort,
                ]}
                onPress={() => handleSortChange("price_low_high")}
              >
                <Text style={styles.sortOptionText}>Price: Low to High</Text>
                {sortOption === "price_low_high" && (
                  <Ionicons name="checkmark" size={18} color={colors.accent} />
                )}
              </Pressable>

              <Pressable
                style={[
                  styles.sortOption,
                  sortOption === "price_high_low" && styles.selectedSort,
                ]}
                onPress={() => handleSortChange("price_high_low")}
              >
                <Text style={styles.sortOptionText}>Price: High to Low</Text>
                {sortOption === "price_high_low" && (
                  <Ionicons name="checkmark" size={18} color={colors.accent} />
                )}
              </Pressable>

              <Pressable
                style={[
                  styles.sortOption,
                  sortOption === "distance" && styles.selectedSort,
                  !userLocation && styles.disabledSort,
                ]}
                onPress={() => userLocation && handleSortChange("distance")}
              >
                <Text
                  style={[
                    styles.sortOptionText,
                    !userLocation && { color: colors.darkgray },
                  ]}
                >
                  Distance
                  {!userLocation && " (Location access required)"}
                </Text>
                {sortOption === "distance" && (
                  <Ionicons name="checkmark" size={18} color={colors.accent} />
                )}
              </Pressable>
            </View>
          </Pressable>
        </Modal>

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
                    setPriceRange(500);
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
                  selectedColor={colors.white}
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
                  selectedColor={colors.white}
                >
                  {type}
                </Chip>
              ))}
            </View>

            <View style={styles.sliderContainer}>
              <Text style={styles.filterLabel}>
                Max Price: {priceRange === 5000 ? "No limit" : `₹${priceRange}`}
              </Text>
              <Slider
                style={{ width: "100%", height: 40 }}
                minimumValue={500}
                maximumValue={5000}
                step={500}
                value={priceRange}
                onValueChange={setPriceRange}
                minimumTrackTintColor={colors.accent}
                maximumTrackTintColor={colors.offwhite}
              />
            </View>
          </View>
        )}

        <Text style={styles.header}>Listed Products</Text>

        {sortedAndFilteredProducts.length > 0 ? (
          <FlatList
            contentContainerStyle={{ paddingBottom: 180 }}
            data={sortedAndFilteredProducts}
            keyExtractor={(item) => item.id}
            numColumns={2}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            renderItem={({ item }) => {
              let distance;
              if (userLocation && item.location) {
                distance = calculateDistance(
                  userLocation.latitude,
                  userLocation.longitude,
                  item.location.latitude,
                  item.location.longitude
                );
              }

              return (
                <Pressable
                  style={styles.productCard}
                  onPress={() => {
                    router.push({
                      pathname: `/tabs/shop/${item.id}`,
                      params: { productId: item.id },
                    });
                  }}
                >
                  <Image
                    source={{
                      uri: item.images
                        ? item.images[0]
                        : item.image || "https://via.placeholder.com/150",
                    }}
                    style={styles.productImage}
                  />
                  {item.status === "sold" && (
                    <View style={styles.soldBadge}>
                      <Text style={styles.soldText}>SOLD</Text>
                    </View>
                  )}
                  {item.status === "reserved" && (
                    <View style={styles.reservedBadge}>
                      <Text style={styles.reservedText}>RESERVED</Text>
                    </View>
                  )}
                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>{item.name}</Text>
                    <Text style={styles.productPrice}>
                      ₹{item.price.toFixed(2)}
                    </Text>
                    <View style={styles.locationContainer}>
                      <Ionicons
                        name="location-outline"
                        size={14}
                        color={colors.darkgray}
                      />
                      <Text style={styles.locationText}>
                        {item.address?.city || "Location not specified"}
                        {distance !== undefined &&
                          ` • ${formatDistance(distance)}`}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              );
            }}
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
    marginBottom: 5,
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
    position: "relative",
  },
  productImage: {
    width: "100%",
    height: 150,
    resizeMode: "cover",
  },
  soldBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(255, 0, 0, 0.8)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  soldText: {
    color: "white",
    fontFamily: "UbuntuBold",
    fontSize: 10,
  },
  reservedBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(255, 165, 0, 0.8)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  reservedText: {
    color: "white",
    fontFamily: "UbuntuBold",
    fontSize: 10,
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
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  locationText: {
    marginLeft: 4,
    fontSize: 12,
    color: colors.darkgray,
    fontFamily: "Aptos",
  },
  noResults: {
    fontSize: 16,
    fontStyle: "italic",
    color: "#888",
    textAlign: "center",
    marginTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    color: colors.darkgray,
    fontFamily: "Aptos",
  },
  sortContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  sortLabel: {
    fontSize: 14,
    color: colors.black,
    fontFamily: "AptosSemiBold",
    marginRight: 10,
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.offwhite,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  sortButtonText: {
    fontSize: 14,
    color: colors.black,
    fontFamily: "AptosSemiBold",
    marginRight: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  sortModalContent: {
    width: "80%",
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 0,
    overflow: "hidden",
  },
  sortOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.offwhite,
  },
  selectedSort: {
    backgroundColor: colors.lightAccent,
  },
  disabledSort: {
    opacity: 0.7,
  },
  sortOptionText: {
    fontSize: 16,
    color: colors.blacktext,
    fontFamily: "Aptos",
  },
});
