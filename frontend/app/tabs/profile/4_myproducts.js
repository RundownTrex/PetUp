import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  Image,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import { Ionicons } from "@expo/vector-icons";
import CustomHeader from "../../../components/CustomHeader";
import MainButton from "../../../components/MainButton";
import colors from "../../../utils/colors";

export default function MyProducts() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchMyListings = async () => {
    try {
      const uid = auth().currentUser.uid;
      const snapshot = await firestore()
        .collection("petProducts")
        .where("sellerId", "==", uid)
        .get();

      const myProducts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setProducts(myProducts);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching my listings: ", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    const uid = auth().currentUser.uid;

    const unsubscribe = firestore()
      .collection("petProducts")
      .where("sellerId", "==", uid)
      .onSnapshot(
        (snapshot) => {
          const myProducts = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setProducts(myProducts);
          setLoading(false);
        },
        (error) => {
          console.error("Error fetching my listings: ", error);
          setLoading(false);
        }
      );

    return () => unsubscribe();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMyListings().then(() => {
      setRefreshing(false);
    });
  };

  const handleStatusChange = async (productId, status) => {
    try {
      await firestore().collection("petProducts").doc(productId).update({
        status: status,
      });
    } catch (error) {
      console.error("Error updating product status: ", error);
    }
  };

  const renderProductItem = ({ item }) => {
    const isAvailable = item.status !== "sold" && item.status !== "reserved";

    return (
      <Pressable
        style={styles.productItem}
        onPress={() => router.push(`/tabs/shop/${item.id}`)}
      >
        <View style={styles.productImageContainer}>
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
        </View>

        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productPrice}>₹{item.price?.toFixed(2)}</Text>
          <Text style={styles.dateText}>
            Listed on{" "}
            {new Date(item.listedDate || Date.now()).toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.actionsContainer}>
          <Pressable
            onPress={() =>
              handleStatusChange(item.id, isAvailable ? "sold" : "available")
            }
            style={[
              styles.statusButton,
              { backgroundColor: isAvailable ? colors.coolback : "#4CAF50" },
            ]}
          >
            <Text style={styles.statusButtonText}>
              {isAvailable ? "Mark as Sold" : "Mark as Available"}
            </Text>
          </Pressable>

          <Pressable
            style={styles.editButton}
            onPress={() =>
              router.push({
                pathname: "/tabs/shop/editproduct/",
                params: { product: JSON.stringify(item) },
              })
            }
          >
            <Ionicons name="pencil" size={18} color={colors.white} />
          </Pressable>
        </View>
      </Pressable>
    );
  };

  if (loading) {
    return (
      <>
        <CustomHeader title="My Listings" />
        <View style={[styles.container, styles.centered]}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </>
    );
  }

  return (
    <>
      <CustomHeader title="My Listings" />
      <View style={styles.container}>
        {products.length > 0 ? (
          <FlatList
            data={products}
            renderItem={renderProductItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.productsList}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="cart-outline" size={60} color={colors.lightgray} />
            <Text style={styles.emptyText}>
              You haven't listed any products yet.
            </Text>
          </View>
        )}

        <MainButton
          title="Add New Listing"
          onPress={() => router.push("/tabs/shop/newproduct/")}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    padding: 20,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  productsList: {
    paddingBottom: 20,
  },
  productItem: {
    backgroundColor: colors.white,
    borderRadius: 10,
    marginVertical: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: colors.offwhite,
  },
  productImageContainer: {
    position: "relative",
    marginBottom: 10,
  },
  productImage: {
    width: "100%",
    height: 150,
    borderRadius: 8,
    marginBottom: 5,
  },
  soldBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(255, 0, 0, 0.8)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 5,
  },
  soldText: {
    color: "white",
    fontFamily: "UbuntuBold",
    fontSize: 12,
  },
  reservedBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(255, 165, 0, 0.8)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 5,
  },
  reservedText: {
    color: "white",
    fontFamily: "UbuntuBold",
    fontSize: 12,
  },
  productInfo: {
    marginBottom: 15,
  },
  productName: {
    fontSize: 16,
    fontFamily: "UbuntuMedium",
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 18,
    fontFamily: "UbuntuBold",
    color: colors.accent,
    marginBottom: 5,
  },
  dateText: {
    fontSize: 12,
    color: colors.darkgray,
    fontFamily: "Aptos",
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginRight: 10,
    alignItems: "center",
  },
  statusButtonText: {
    color: colors.blacktext,
    fontSize: 14,
    fontFamily: "AptosSemiBold",
  },
  editButton: {
    backgroundColor: colors.accent,
    padding: 8,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    width: 36,
    height: 36,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    marginTop: 20,
    marginBottom: 40,
    color: colors.darkgray,
    fontFamily: "Aptos",
  },
});
