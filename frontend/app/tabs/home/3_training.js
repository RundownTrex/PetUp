import React from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  Image,
  Linking,
} from "react-native";
import CustomHeader from "../../../components/CustomHeader";
import colors from "../../../utils/colors";

const trainingData = [
  {
    id: "1",
    title: "Basic Obedience Training",
    description: "Learn simple commands to get your pet started.",
    videoUrl: "https://example.com/basic-obedience-training",
    thumbnail: "https://placehold.co/300x200.png?text=Obedience",
  },
  {
    id: "2",
    title: "House Training Tips",
    description: "Tips and tricks to help your pet learn proper house manners.",
    videoUrl: "https://example.com/house-training-tips",
    thumbnail: "https://placehold.co/300x200.png?text=House+Training",
  },
  {
    id: "3",
    title: "Advanced Tricks",
    description:
      "Take your pet's skills to the next level with advanced tricks.",
    videoUrl: "https://example.com/advanced-tricks",
    thumbnail: "https://placehold.co/300x200.png?text=Advanced+Tricks",
  },
];

export default function Training() {
  const openLink = async (url) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      console.log("Don't know how to open URI: " + url);
    }
  };

  const renderItem = ({ item }) => (
    <Pressable
      style={styles.itemContainer}
      onPress={() => openLink(item.videoUrl)}
    >
      <Image source={{ uri: item.thumbnail }} style={styles.itemImage} />
      <View style={styles.textContainer}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <Text style={styles.itemDescription}>{item.description}</Text>
      </View>
    </Pressable>
  );

  return (
    <>
      <CustomHeader title="Training" />
      <View style={styles.container}>
        <FlatList
          data={trainingData}
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
});
