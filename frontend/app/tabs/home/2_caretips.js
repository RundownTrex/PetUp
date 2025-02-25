import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Linking,
  FlatList,
} from "react-native";
import CustomHeader from "../../../components/CustomHeader";
import colors from "../../../utils/colors";

const careTipsData = [
  {
    id: "1",
    title: "How to Care for Your Pet",
    url: "https://example.com/care-for-your-pet",
    image: "https://placehold.co/300x200.png?text=Care+for+Your+Pet",
  },
  {
    id: "2",
    title: "Top 10 Pet Care Tips",
    url: "https://example.com/top-10-pet-care-tips",
    image: "https://placehold.co/300x200.png?text=Top+10+Tips",
  },
  {
    id: "3",
    title: "Pet Health and Nutrition",
    url: "https://example.com/pet-health-nutrition",
    image: "https://placehold.co/300x200.png?text=Pet+Health+Nutrition",
  },
];

export default function CareTips() {
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
      <Text style={styles.itemText}>{item.title}</Text>
    </Pressable>
  );

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
  itemText: {
    fontSize: 18,
    color: "#0066cc",
    padding: 10,
    textAlign: "center",
  },
});
