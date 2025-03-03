import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Linking,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import CustomHeader from "../../../components/CustomHeader";
import colors from "../../../utils/colors";
import firestore from "@react-native-firebase/firestore";

export default function CareTips() {
  const [careTipsData, setCareTipsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCareTips = async () => {
      try {
        const tipsSnapshot = await firestore().collection("careTips").get();

        const tips = tipsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log(tips);

        setCareTipsData(tips);
      } catch (err) {
        console.error("Error fetching care tips:", err);
        setError("Unable to load care tips. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCareTips();
  }, []);

  const openLink = async (url) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      console.log("Don't know how to open URI: " + url);
    }
  };

  const renderItem = ({ item }) => (
    <Pressable style={styles.itemContainer} onPress={() => openLink(item.url)}>
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      <View style={styles.textContainer}>
        <Text style={styles.itemTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.itemDescription} numberOfLines={5}>
          {item.description}
        </Text>
      </View>
    </Pressable>
  );

  if (loading) {
    return (
      <>
        <CustomHeader title="Care Tips" />
        <View style={[styles.container, styles.centered]}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </>
    );
  }

  if (error) {
    return (
      <>
        <CustomHeader title="Care Tips" />
        <View style={[styles.container, styles.centered]}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable
            style={styles.retryButton}
            onPress={() => {
              setLoading(true);
              setError(null);
              fetchCareTips();
            }}
          >
            <Text style={styles.retryText}>Try Again</Text>
          </Pressable>
        </View>
      </>
    );
  }

  return (
    <>
      <CustomHeader title="Care Tips" />
      <View style={styles.container}>
        <FlatList
          data={careTipsData}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  list: {
    paddingVertical: 10,
    padding: 16,
  },
  itemContainer: {
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    overflow: "hidden",
  },
  itemImage: {
    width: "100%",
    height: 200,
  },
  textContainer: {
    padding: 10,
    backgroundColor: colors.white,
  },
  itemTitle: {
    fontSize: 20,
    color: colors.black,
    marginBottom: 4,
    fontFamily: "AptosBold",
  },
  itemDescription: {
    fontSize: 16,
    color: colors.darkgray,
    fontFamily: "Aptos",
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontFamily: "AptosSemiBold",
    fontSize: 16,
    color: colors.darkgray,
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: colors.white,
    fontFamily: "AptosBold",
    fontSize: 16,
  },
});
