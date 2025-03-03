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
      style={styles.petCard}
      onPress={() =>
        router.push({
          pathname: `/tabs/home/pets/${item.id}`,
          params: { pet: JSON.stringify(item), isOwner: true },
        })
      }
    >
      <Image
        source={{ uri: item.petImages ? item.petImages[0] : item.image }}
        style={styles.petImage}
      />
      <View style={styles.petInfo}>
        <View style={styles.nameAndStatus}>
          <Text style={styles.petName}>{item.petName}</Text>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: item.adopted
                  ? colors.lightgray
                  : colors.lightgreen,
              },
            ]}
          >
            <Text style={styles.statusText}>
              {item.adopted ? "Adopted" : "Available"}
            </Text>
          </View>
        </View>

        <Text style={styles.petDetails}>
          <Text style={styles.detailLabel}>Species: </Text>
          {item.petSpecies}
          {item.gender && (
            <Text>
              {" "}
              • <Text style={styles.detailLabel}>Gender: </Text>
              {item.gender}
            </Text>
          )}
        </Text>

        <Text style={styles.petDetails}>
          <Text style={styles.detailLabel}>Breed: </Text>
          {item.breed || "Not specified"}
        </Text>

        <Text style={styles.petDetails}>
          <Text style={styles.detailLabel}>Age: </Text>
          {item.ageValue
            ? `${item.ageValue} ${item.ageUnit || "years"}`
            : "Not specified"}
        </Text>




        {item.createdAt && (
          <Text style={styles.dateAdded}>
            Added {new Date(item.createdAt.toDate()).toLocaleDateString()}
          </Text>
        )}
      </View>

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
          onPress={() => router.push("/tabs/home/pets/newpets/")}
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
  petCard: {
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
  petInfo: {
    flex: 1,
  },
  nameAndStatus: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  petName: {
    fontSize: 16,
    color: colors.black,
    fontFamily: "UbuntuMedium",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: colors.white,
    fontFamily: "UbuntuMedium",
  },
  petDetails: {
    fontSize: 14,
    color: colors.black,
    fontFamily: "UbuntuRegular",
  },
  detailLabel: {
    fontFamily: "UbuntuMedium",
  },
  dateAdded: {
    fontSize: 12,
    color: colors.darkgray,
    fontFamily: "UbuntuRegular",
    marginTop: 4,
  },
  adoptedText: {
    fontSize: 24,
    color: colors.white,
    fontFamily: "UbuntuBold",
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    marginVertical: 20,
    color: colors.gray,
  },
});

export default MyPetsScreen;
