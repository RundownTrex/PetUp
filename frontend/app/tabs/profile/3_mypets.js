import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  Image,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import CustomHeader from "../../../components/CustomHeader";
import MainButton from "../../../components/MainButton";
import colors from "../../../utils/colors";

const MyPetsScreen = () => {
  const router = useRouter();
  const [pets, setPets] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const uid = auth().currentUser.uid;
    const unsubscribe = firestore()
      .collection("pets")
      .where("ownerId", "==", uid)
      .onSnapshot(
        (snapshot) => {
          const myPets = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setPets(myPets);
        },
        (error) => {
          console.error("Error fetching my pets: ", error);
        }
      );
    return () => unsubscribe();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  const renderPetItem = ({ item }) => (
    <Pressable
      style={styles.petItem}
      onPress={() =>
        router.push({
          pathname: `/pets/${item.id}`,
          params: { pet: JSON.stringify(item), isOwner: true },
        })
      }
    >
      <Image
        source={{ uri: item.petImages ? item.petImages[0] : item.image }}
        style={styles.petImage}
      />
      <Text style={styles.petName}>{item.petName}</Text>
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
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
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
    fontFamily: "UbuntuMedium",
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    marginVertical: 20,
    color: colors.gray,
  },
});

export default MyPetsScreen;
