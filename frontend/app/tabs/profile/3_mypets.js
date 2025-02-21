import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import CustomHeader from "../../../components/CustomHeader";
import MainButton from "../../../components/MainButton";
import colors from "../../../utils/colors";

const MyPetsScreen = () => {
  const router = useRouter();

  const [pets, setPets] = useState([
    { id: "1", name: "Buddy", image: "https://placehold.co/100/png" },
    { id: "2", name: "Mittens", image: "https://placehold.co/100/png" },
  ]);

  const renderPetItem = ({ item }) => (
    <Pressable
      style={styles.petItem}
      onPress={() =>
        router.push({
          pathname: `/pets/${item.id}`,
          params: { isOwner: true },
        })
      }
    >
      <Image source={{ uri: item.image }} style={styles.petImage} />
      <Text style={styles.petName}>{item.name}</Text>
    </Pressable>
  );

  return (
    <>
      <CustomHeader title="My Pets" />
      <View style={styles.container}>
        {pets.length > 0 ? (
          <FlatList
            data={pets}
            renderItem={renderPetItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.petsList}
          />
        ) : (
          <Text style={styles.emptyText}>No pets listed for adoption.</Text>
        )}
        <MainButton
          title="Add New Pet"
          onPress={() => router.push("/pets/newpets/")}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    padding: 20,
  },
  petsList: {
    paddingBottom: 20,
  },
  petItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: colors.lightgray,
  },
  petImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 10,
  },
  petName: {
    fontSize: 16,
    color: colors.black,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    marginVertical: 20,
    color: colors.gray,
  },
});

export default MyPetsScreen;
