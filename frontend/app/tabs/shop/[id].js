import React, { useState, useEffect, useMemo, useRef } from "react";
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
  Linking,
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
import * as Location from "expo-location";
import { getDistance } from "geolib";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";

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
  const [userLocation, setUserLocation] = useState(null);
  const [distance, setDistance] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);

  const scale = useSharedValue(1);
  const animatedFavoriteStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ["50%"], []);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productDoc = await firestore()
          .collection("petProducts")
          .doc(id)
          .get();

        if (productDoc.exists) {
          const productData = { id: productDoc.id, ...productDoc.data() };
          setProduct(productData);

          const currentUserId = auth().currentUser?.uid;
          setIsOwner(currentUserId === productData.sellerId);

          if (productData.sellerId) {
            const sellerDoc = await firestore()
              .collection("users")
              .doc(productData.sellerId)
              .get();

            if (sellerDoc.exists) {
              setSeller({ id: sellerDoc.id, ...sellerDoc.data() });
            }
          }
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

  useEffect(() => {
    const getUserLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          console.log("Location permission denied");
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      } catch (error) {
        console.error("Error getting user location:", error);
      }
    };

    getUserLocation();
  }, []);

  useEffect(() => {
    if (userLocation && product && typeof product.location === "object") {
      const dist = calculateDistance(userLocation, product.location);
      setDistance(dist);
    }
  }, [userLocation, product]);

  const calculateDistance = (userLoc, productLoc) => {
    if (!userLoc || !productLoc || !userLoc.latitude || !productLoc.latitude) {
      return null;
    }

    try {
      const distanceInMeters = getDistance(
        {
          latitude: userLoc.latitude,
          longitude: userLoc.longitude,
        },
        {
          latitude: productLoc.latitude,
          longitude: productLoc.longitude,
        }
      );
      return distanceInMeters / 1000;
    } catch (error) {
      console.error("Error calculating distance:", error);
      return null;
    }
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
  };

  const formatDistance = (distance) => {
    if (distance === null || distance === undefined) {
      return null;
    }
    if (distance >= 1) {
      return `${distance.toFixed(1)} km away`;
    } else {
      return `${(distance * 1000).toFixed(0)} m away`;
    }
  };

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

  const openContactOptions = () => {
    setIsBottomSheetVisible(true);
    bottomSheetRef.current?.expand();
  };

  const closeContactOptions = () => {
    bottomSheetRef.current?.close();
    setTimeout(() => setIsBottomSheetVisible(false), 200);
  };

  const emailSeller = () => {
    if (seller?.email) {
      const subject = encodeURIComponent(`Inquiry about ${product.name}`);
      const body = encodeURIComponent(
        `Hello,\n\nI'm interested in your listing "${product.name}" priced at ₹${product.price}. Please let me know if it's still available.\n\nThank you.`
      );
      const url = `mailto:${seller.email}?subject=${subject}&body=${body}`;
      Linking.openURL(url).catch(() => {
        Alert.alert("Error", "Could not open email application");
      });
    } else {
      Alert.alert("Error", "Seller's email is not available");
    }
  };

  const callSeller = () => {
    if (seller?.phoneNumber) {
      const url = `tel:${seller.phoneNumber}`;
      Linking.openURL(url).catch(() => {
        Alert.alert("Error", "Could not open phone application");
      });
    } else {
      Alert.alert("Error", "Seller's phone number is not available");
    }
  };

  const contactSeller = () => {
    openContactOptions();
  };

  const reportListing = () => {
    setShowReportModal(true);
  };

  const submitReport = async (reason) => {
    setShowReportModal(false);

    try {
      const userId = auth().currentUser?.uid;

      if (!userId) {
        Alert.alert("Error", "You must be logged in to report a listing.");
        return;
      }

      await firestore()
        .collection("reports")
        .add({
          itemId: product.id,
          itemType: "product",
          sellerId: product.sellerId,
          reporterId: userId,
          reason: reason,
          createdAt: firestore.FieldValue.serverTimestamp(),
          status: "pending",
          productName: product.name,
          productImage: product.images?.[0] || null,
        });

      Alert.alert(
        "Thank you",
        "Your report has been submitted and will be reviewed by our team.",
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error("Error submitting report:", error);
      Alert.alert(
        "Error",
        "Failed to submit your report. Please try again later.",
        [{ text: "OK" }]
      );
    }
  };

  const openMapDirections = () => {
    if (
      !userLocation ||
      !product.location ||
      typeof product.location !== "object"
    ) {
      Alert.alert(
        "Cannot Open Directions",
        "Either your location or the seller's location is not available.",
        [{ text: "OK" }]
      );
      return;
    }

    const url = `https://www.google.com/maps/dir/?api=1&destination=${product.location.latitude},${product.location.longitude}`;

    Linking.openURL(url).catch((error) => {
      console.error("Error opening maps:", error);
      Alert.alert("Error", "Could not open the map application.");
    });
  };

  const editProductInfo = () => {
    router.push({
      pathname: `/tabs/shop/editproduct/`,
      params: { product: JSON.stringify(product) },
    });
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
                <View style={styles.imageWrapper}>
                  <Image source={{ uri: item }} style={styles.productImage} />
                  {product.status === "sold" && (
                    <View style={styles.soldOverlay}>
                      <Text style={styles.statusOverlayText}>SOLD</Text>
                    </View>
                  )}
                  {product.status === "reserved" && (
                    <View style={styles.reservedOverlay}>
                      <Text style={styles.statusOverlayText}>RESERVED</Text>
                    </View>
                  )}
                </View>
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
            <Pressable style={styles.reportButton} onPress={reportListing}>
              <MaterialCommunityIcons
                name="flag-outline"
                size={18}
                color={colors.darkgray}
              />
              <Text style={styles.reportText}>Report</Text>
            </Pressable>
          </View>

          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productPrice}>₹{product.price?.toFixed(2)}</Text>

          <View style={styles.locationContainer}>
            <Ionicons
              name="location-outline"
              size={18}
              color={colors.darkgray}
            />
            <View style={styles.locationTextContainer}>
              <Text style={styles.locationText}>
                {typeof product.location === "object"
                  ? product.address?.city ||
                    `${product.location.latitude.toFixed(
                      2
                    )}, ${product.location.longitude.toFixed(2)}`
                  : product.location || "Location not specified"}
              </Text>
              {distance !== null && (
                <Text style={styles.distanceText}>
                  {" "}
                  • {formatDistance(distance)}
                </Text>
              )}
            </View>
          </View>

          {seller && (
            <Pressable
              style={styles.sellerContainer}
              onPress={openMapDirections}
              activeOpacity={0.7}
            >
              <View style={styles.sellerHeader}>
                <Text style={styles.sectionTitle}>Seller Information</Text>
              </View>
              <View style={styles.sellerInfo}>
                <Image
                  source={{
                    uri: seller.pfpUrl || "https://placehold.co/100/jpg",
                  }}
                  style={styles.sellerImage}
                />
                <View style={styles.sellerDetails}>
                  <Text style={styles.sellerName}>
                    {seller.firstname} {seller.lastname}
                  </Text>
                </View>
                <View style={styles.directionsContainer}>
                  <Ionicons name="navigate" size={24} color={colors.black} />
                </View>
              </View>
            </Pressable>
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

          {product.features && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.sectionTitle}>Key Features</Text>
              <Text style={styles.featureText}>{product.features}</Text>
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
          {isOwner ? (
            <MainButton
              title="Edit Listing"
              icon={<Ionicons name="create" size={18} color="white" />}
              onPress={editProductInfo}
              style={{ backgroundColor: colors.accent }}
            />
          ) : (
            <MainButton
              title="Contact Seller"
              icon={<Ionicons name="chatbubble" size={18} color="white" />}
              onPress={contactSeller}
              style={{ backgroundColor: colors.accent }}
            />
          )}
        </View>
      </ScrollView>
      <Modal
        visible={showReportModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowReportModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowReportModal(false)}
        >
          <View style={styles.reportModalContent}>
            <Text style={styles.reportModalTitle}>Report Listing</Text>
            <Text style={styles.reportModalSubtitle}>
              Why are you reporting this listing?
            </Text>

            <Pressable
              style={styles.reportOption}
              onPress={() => submitReport("Prohibited item")}
            >
              <Text style={styles.reportOptionText}>Prohibited item</Text>
            </Pressable>

            <Pressable
              style={styles.reportOption}
              onPress={() => submitReport("Inaccurate description")}
            >
              <Text style={styles.reportOptionText}>
                Inaccurate description
              </Text>
            </Pressable>

            <Pressable
              style={styles.reportOption}
              onPress={() => submitReport("Suspected fraud")}
            >
              <Text style={styles.reportOptionText}>Suspected fraud</Text>
            </Pressable>

            <Pressable
              style={[styles.reportOption, styles.cancelOption]}
              onPress={() => setShowReportModal(false)}
            >
              <Text style={styles.cancelOptionText}>Cancel</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
      {isBottomSheetVisible && (
        <Pressable
          style={styles.bottomSheetBackdrop}
          onPress={() => {
            bottomSheetRef.current?.close();
            setTimeout(() => setIsBottomSheetVisible(false), 200);
          }}
        />
      )}

      {isBottomSheetVisible && (
        <BottomSheet
          ref={bottomSheetRef}
          snapPoints={snapPoints}
          enablePanDownToClose={true}
          onClose={() => setIsBottomSheetVisible(false)}
          backgroundStyle={styles.bottomSheetBackground}
          handleIndicatorStyle={styles.bottomSheetIndicator}
        >
          <BottomSheetView style={styles.bottomSheetContent}>
            <Text style={styles.bottomSheetTitle}>
              Contact {seller?.firstname || "Seller"}
            </Text>

            <Pressable
              style={styles.contactOption}
              onPress={() => {
                closeContactOptions();
                const prePopulatedMessage = `Hi, I'm interested in your listing "${product.name}" priced at ₹${product.price}. Is it still available?`;

                router.push({
                  pathname: `/tabs/chat/${product.sellerId}`,
                  params: {
                    ownerId: product.sellerId,
                    initialMessage: prePopulatedMessage,
                  },
                });
              }}
            >
              <View
                style={[
                  styles.contactIconCircle,
                  { backgroundColor: "#e9fdf0" },
                ]}
              >
                <Ionicons name="chatbubble" size={24} color={colors.accent} />
              </View>
              <View style={styles.contactOptionTextContainer}>
                <Text style={styles.contactOptionTitle}>Message</Text>
                <Text style={styles.contactOptionSubtitle}>
                  Chat with the seller
                </Text>
              </View>
            </Pressable>

            <Pressable
              style={styles.contactOption}
              onPress={() => {
                emailSeller();
                closeContactOptions();
              }}
            >
              <View
                style={[
                  styles.contactIconCircle,
                  { backgroundColor: "#e9f0fd" },
                ]}
              >
                <FontAwesome name="envelope" size={24} color="#4a80f5" />
              </View>
              <View style={styles.contactOptionTextContainer}>
                <Text style={styles.contactOptionTitle}>Email</Text>
                <Text style={styles.contactOptionSubtitle}>
                  Send an email to the seller
                </Text>
              </View>
            </Pressable>

            <Pressable
              style={styles.contactOption}
              onPress={() => {
                callSeller();
                closeContactOptions();
              }}
            >
              <View
                style={[
                  styles.contactIconCircle,
                  { backgroundColor: "#fde9e9" },
                ]}
              >
                <FontAwesome name="phone" size={24} color="#f54a4a" />
              </View>
              <View style={styles.contactOptionTextContainer}>
                <Text style={styles.contactOptionTitle}>Call</Text>
                <Text style={styles.contactOptionSubtitle}>
                  Call the seller directly
                </Text>
              </View>
            </Pressable>
          </BottomSheetView>
        </BottomSheet>
      )}
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
  locationTextContainer: {
    marginLeft: 5,
    flexDirection: "row",
  },
  locationText: {
    fontSize: 15,
    color: colors.darkgray,
    fontFamily: "Aptos",
  },
  distanceText: {
    fontSize: 14,
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
  featureText: {
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
  directionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  directionsText: {
    fontSize: 14,
    color: colors.accent,
    fontFamily: "Aptos",
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  reportModalContent: {
    width: "80%",
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  reportModalTitle: {
    fontSize: 18,
    fontFamily: "AptosBold",
    marginBottom: 10,
  },
  reportModalSubtitle: {
    fontSize: 14,
    fontFamily: "Aptos",
    color: colors.darkgray,
    marginBottom: 20,
  },
  reportOption: {
    width: "100%",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.offwhite,
    alignItems: "center",
  },
  reportOptionText: {
    fontSize: 16,
    fontFamily: "Aptos",
  },
  cancelOption: {
    borderBottomWidth: 0,
  },
  cancelOptionText: {
    fontSize: 16,
    fontFamily: "Aptos",
    color: colors.accent,
  },
  imageWrapper: {
    position: "relative",
  },
  soldOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  reservedOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 165, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  statusOverlayText: {
    color: colors.white,
    fontSize: 24,
    fontFamily: "AptosBold",
  },
  bottomSheetBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  bottomSheetBackground: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  bottomSheetIndicator: {
    backgroundColor: colors.black,
    width: 60,
  },
  bottomSheetContent: {
    flex: 1,
    padding: 20,
  },
  bottomSheetTitle: {
    fontSize: 20,
    fontFamily: "AptosBold",
    marginBottom: 20,
    textAlign: "center",
  },
  contactOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightgray,
  },
  contactIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  contactOptionTextContainer: {
    flex: 1,
  },
  contactOptionTitle: {
    fontFamily: "AptosBold",
    fontSize: 16,
  },
  contactOptionSubtitle: {
    fontFamily: "Aptos",
    fontSize: 14,
    color: colors.darkgray,
  },
});

export default ProductDetailsScreen;
