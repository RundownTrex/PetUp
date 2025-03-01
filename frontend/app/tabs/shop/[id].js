import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Dimensions,
  Modal,
  Pressable,
  Alert,
  TouchableOpacity,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import {
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";

import colors from "../../../utils/colors";
import MainButton from "../../../components/MainButton";
import CustomHeader from "../../../components/CustomHeader";
import { router } from "expo-router";

const { width: screenWidth } = Dimensions.get("window");

const ProductDetailsScreen = () => {
  const route = useRoute();
  const { id } = route.params || {};

  const [product, setProduct] = useState(null);
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  const scale = useSharedValue(1);
  const animatedFavoriteStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productDoc = await firestore()
          .collection("products")
          .doc(id)
          .get();

        if (productDoc.exists) {
          const productData = { id: productDoc.id, ...productDoc.data() };
          setProduct(productData);

          // Fetch seller information if sellerId exists
          if (productData.sellerId) {
            const sellerDoc = await firestore()
              .collection("users")
              .doc(productData.sellerId)
              .get();

            if (sellerDoc.exists) {
              setSeller({ id: sellerDoc.id, ...sellerDoc.data() });
            }
          }
        } else {
          const mockProduct = {
            id: id,
            name: "Premium Dog Food",
            description: "High-quality nutrition for your dog",
            price: 899.99,
            category: "Food",
            petType: "Dog",
            brand: "Royal Canin",
            condition: "New",
            listedDate: new Date().toISOString(),
            sellerId: "user123",
            location: "Mumbai, Maharashtra",
            details:
              "Made with real chicken as the #1 ingredient. Contains essential nutrients and vitamins for a healthy and active lifestyle.",
            usage:
              "For adult dogs. Feed according to weight - see feeding chart on packaging.",
            features: [
              "High protein content",
              "No artificial preservatives",
              "Balanced nutrition",
              "Supports immune system",
            ],
            specifications: "Protein: 26%, Fat: 15%, Fiber: 3%, Moisture: 10%",
            images: [
              "https://m.media-amazon.com/images/I/41nXO0RsQdL._SX300_SY300_QL70_FMwebp_.jpg",
              "https://m.media-amazon.com/images/I/41nXO0RsQdL._SX300_SY300_QL70_FMwebp_.jpg",
              "https://m.media-amazon.com/images/I/41nXO0RsQdL._SX300_SY300_QL70_FMwebp_.jpg",
            ],
          };
          setProduct(mockProduct);

          setSeller({
            id: "user123",
            displayName: "Rahul Sharma",
            photoURL: "https://randomuser.me/api/portraits/men/32.jpg",
            location: "Mumbai, Maharashtra",
            totalSales: 24,
          });
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching product:", error);
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (product?.id) {
      const userId = auth().currentUser?.uid;
      if (userId) {
        const unsubscribe = firestore()
          .collection("users")
          .doc(userId)
          .onSnapshot(
            (doc) => {
              if (doc.exists) {
                const data = doc.data();
                if (
                  data.favoriteProducts &&
                  Array.isArray(data.favoriteProducts)
                ) {
                  setIsFavorite(data.favoriteProducts.includes(product.id));
                }
              }
            },
            (error) => {
              console.error("Error fetching favorites:", error);
            }
          );

        return () => unsubscribe();
      }
    }
  }, [product?.id]);

  const toggleFavorite = async () => {
    const newFavoriteStatus = !isFavorite;
    setIsFavorite(newFavoriteStatus);

    scale.value = withSpring(1.2, { damping: 5, stiffness: 200 }, () => {
      scale.value = withSpring(1, { damping: 5, stiffness: 200 });
    });

    const userId = auth().currentUser?.uid;
    if (userId && product?.id) {
      try {
        if (newFavoriteStatus) {
          await firestore()
            .collection("users")
            .doc(userId)
            .update({
              favoriteProducts: firestore.FieldValue.arrayUnion(product.id),
            });
        } else {
          await firestore()
            .collection("users")
            .doc(userId)
            .update({
              favoriteProducts: firestore.FieldValue.arrayRemove(product.id),
            });
        }
      } catch (error) {
        console.error("Error updating favorite status:", error);
      }
    }
  };

  const contactSeller = () => {
    // In a real app, this would open a chat with the seller
    Alert.alert(
      "Contact Seller",
      `Would you like to message ${seller?.displayName || "the seller"}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Message",
          onPress: () => router.push(`/messages/${seller?.id}`),
        },
      ]
    );
  };

  const viewSellerProfile = () => {
    if (seller?.id) {
      router.push(`/profile/${seller.id}`);
    }
  };

  const reportListing = () => {
    Alert.alert("Report Listing", "Why are you reporting this listing?", [
      {
        text: "Prohibited item",
        onPress: () =>
          Alert.alert("Thank you", "Your report has been submitted"),
      },
      {
        text: "Inaccurate description",
        onPress: () =>
          Alert.alert("Thank you", "Your report has been submitted"),
      },
      {
        text: "Suspected fraud",
        onPress: () =>
          Alert.alert("Thank you", "Your report has been submitted"),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  if (loading || !product) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>Loading listing details...</Text>
      </View>
    );
  }

  const productImages = product.images || [product.image];
  const formatDate = (dateString) => {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <>
      <CustomHeader title="Listing Details" />
      <ScrollView style={styles.container}>
        <View style={styles.carouselContainer}>
          <Carousel
            loop
            width={screenWidth}
            height={400}
            autoPlay={productImages.length > 1}
            scrollAnimationDuration={1800}
            data={productImages}
            renderItem={({ item, index }) => (
              <Pressable
                activeOpacity={0.8}
                onPress={() => {
                  setSelectedIndex(index);
                  setShowModal(true);
                }}
              >
                <Image source={{ uri: item }} style={styles.productImage} />
              </Pressable>
            )}
          />
          <Pressable style={styles.favoriteIcon} onPress={toggleFavorite}>
            <Animated.View style={animatedFavoriteStyle}>
              <Ionicons
                name={isFavorite ? "heart" : "heart-outline"}
                size={28}
                color="red"
              />
            </Animated.View>
          </Pressable>
        </View>

        <Modal
          visible={showModal}
          transparent={false}
          animationType="slide"
          onRequestClose={() => setShowModal(false)}
        >
          <View style={styles.modalContainer}>
            <Pressable
              style={styles.closeButton}
              onPress={() => setShowModal(false)}
            >
              <Ionicons name="close" size={24} color={colors.white} />
            </Pressable>
            <Image
              source={{ uri: productImages[selectedIndex] }}
              style={styles.fullscreenImage}
              resizeMode="contain"
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.thumbnailScroll}
              contentContainerStyle={{ alignItems: "center" }}
            >
              {productImages.map((img, idx) => (
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
          <View style={styles.listedInfoRow}>
            <Text style={styles.listedDate}>
              Listed {formatDate(product.listedDate)}
            </Text>
            <TouchableOpacity
              style={styles.reportButton}
              onPress={reportListing}
            >
              <MaterialCommunityIcons
                name="flag-outline"
                size={18}
                color={colors.darkgray}
              />
              <Text style={styles.reportText}>Report</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productPrice}>₹{product.price?.toFixed(2)}</Text>

          <View style={styles.locationContainer}>
            <Ionicons
              name="location-outline"
              size={18}
              color={colors.darkgray}
            />
            <Text style={styles.locationText}>
              {product.location || "Location not specified"}
            </Text>
          </View>

          {/* Seller Information */}
          {seller && (
            <View style={styles.sellerContainer}>
              <View style={styles.sellerHeader}>
                <Text style={styles.sectionTitle}>Seller Information</Text>
              </View>
              <View style={styles.sellerInfo}>
                <Image
                  source={{
                    uri: seller.photoURL || "https://via.placeholder.com/100",
                  }}
                  style={styles.sellerImage}
                />
                <View style={styles.sellerDetails}>
                  <Text style={styles.sellerName}>{seller.displayName}</Text>

                  <View style={styles.salesRow}>
                    <Text style={styles.salesText}>
                      {seller.totalSales || 0}{" "}
                      {seller.totalSales === 1 ? "sale" : "sales"}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          <View style={styles.detailRow}>
            <View style={[styles.detailBox, styles.categoryBox]}>
              <Text style={styles.detailTitle}>Category</Text>
              <Text style={styles.detailValue}>{product.category}</Text>
            </View>
            <View style={[styles.detailBox, styles.petTypeBox]}>
              <Text style={styles.detailTitle}>For</Text>
              <Text style={styles.detailValue}>{product.petType}</Text>
            </View>
            <View style={[styles.detailBox, styles.brandBox]}>
              <Text style={styles.detailTitle}>Condition</Text>
              <Text style={styles.detailValue}>
                {product.condition || "New"}
              </Text>
            </View>
          </View>

          <View style={styles.descriptionContainer}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>{product.description}</Text>
          </View>

          {product.details && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.sectionTitle}>Details</Text>
              <Text style={styles.descriptionText}>{product.details}</Text>
            </View>
          )}

          {product.usage && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.sectionTitle}>Usage Instructions</Text>
              <Text style={styles.descriptionText}>{product.usage}</Text>
            </View>
          )}

          {product.features && product.features.length > 0 && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.sectionTitle}>Key Features</Text>
              {product.features.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color={colors.accent}
                  />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          )}

          {product.specifications && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.sectionTitle}>Specifications</Text>
              <Text style={styles.descriptionText}>
                {product.specifications}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.buttonContainer}>
          <MainButton
            title="Contact Seller"
            icon={
              <Ionicons
                name="chatbubble-outline"
                size={18}
                color="white"
                style={{ marginRight: 10 }}
              />
            }
            onPress={contactSeller}
            style={{ backgroundColor: colors.accent }}
          />
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
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  carouselContainer: {
    position: "relative",
  },
  productImage: {
    width: "100%",
    height: 400,
    resizeMode: "contain",
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
  listedInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  listedDate: {
    fontSize: 14,
    color: colors.darkgray,
    fontFamily: "Aptos",
  },
  reportButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  reportText: {
    fontSize: 14,
    color: colors.darkgray,
    fontFamily: "Aptos",
    marginLeft: 4,
  },
  productName: {
    fontSize: 22,
    fontFamily: "UbuntuBold",
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 24,
    fontFamily: "UbuntuBold",
    color: colors.accent,
    marginBottom: 5,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  locationText: {
    marginLeft: 5,
    fontSize: 15,
    color: colors.darkgray,
    fontFamily: "Aptos",
  },
  sellerContainer: {
    marginVertical: 15,
    borderWidth: 1,
    borderColor: colors.offwhite,
    borderRadius: 10,
    overflow: "hidden",
  },
  sellerHeader: {
    backgroundColor: colors.offwhite,
    padding: 10,
  },
  sellerInfo: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  sellerImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  sellerDetails: {
    flex: 1,
  },
  sellerName: {
    fontSize: 16,
    fontFamily: "AptosSemiBold",
    marginBottom: 2,
  },
  sellerSince: {
    fontSize: 14,
    color: colors.darkgray,
    fontFamily: "Aptos",
    marginBottom: 2,
  },
  salesRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  salesText: {
    fontSize: 14,
    color: colors.darkgray,
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
    borderRadius: 5,
  },
  categoryBox: {
    backgroundColor: colors.offwhite,
  },
  petTypeBox: {
    backgroundColor: "#e9f0fd",
  },
  brandBox: {
    backgroundColor: "#e9fdf0",
  },
  detailTitle: {
    fontSize: 14,
    color: colors.darkgray,
    fontFamily: "Aptos",
  },
  detailValue: {
    fontSize: 16,
    fontFamily: "AptosDisplayBold",
    textAlign: "center",
  },
  descriptionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "AptosBold",
    marginBottom: 5,
  },
  descriptionText: {
    fontSize: 14,
    color: "gray",
    fontFamily: "Aptos",
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  featureText: {
    marginLeft: 8,
    fontSize: 14,
    color: "gray",
    fontFamily: "Aptos",
  },
  buttonContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.black,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 40,
    left: 20,
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

export default ProductDetailsScreen;
