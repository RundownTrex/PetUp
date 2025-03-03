import React, { useState, useEffect, useRef } from "react";
import {
  Text,
  View,
  StyleSheet,
  FlatList,
  Pressable,
  Image,
  LayoutAnimation,
  Platform,
  UIManager,
  RefreshControl,
} from "react-native";
import { DefaultTheme, Searchbar, Chip } from "react-native-paper";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import * as Location from "expo-location";
import { getDistance } from "geolib";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";

import colors from "../../../utils/colors";
import CustomHeader from "../../../components/CustomHeader";
import { petTypes, breedOptions } from "../../../utils/petType";

const customSearchTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.accent,
    background: colors.accent,
  },
};

function getAgeGroup(ageValue, ageUnit) {
  let ageInYears = 0;
  if (ageUnit.toLowerCase().includes("month")) {
    ageInYears = ageValue / 12;
  } else {
    ageInYears = ageValue;
  }

  if (ageInYears < 1) {
    return "Baby";
  } else if (ageInYears < 3) {
    return "Young";
  } else if (ageInYears < 7) {
    return "Adult";
  } else {
    return "Senior";
  }
}

export default function SearchPage() {
  const router = useRouter();
  const [pets, setPets] = useState([]);
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [petType, setPetType] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [breed, setBreed] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [range, setRange] = useState(10);
  const searchbarRef = useRef(null);


  const ageGroups = ["Baby", "Young", "Adult", "Senior"];

  useEffect(() => {
    if (Platform.OS === "android") {
      UIManager.setLayoutAnimationEnabledExperimental &&
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({});
        setUserLocation(loc.coords);
      }
    })();
  }, []);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection("pets")
      .onSnapshot(
        (snapshot) => {
          const petsData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setPets(petsData);
        },
        (error) => {
          console.error("Error fetching pets: ", error);
        }
      );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    console.log(pets);
  }, [pets]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchbarRef.current) {
        searchbarRef.current.focus();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const filteredPets = pets.filter((pet) => {
    if (pet.ownerId === auth().currentUser.uid) return false;
    if (pet.adopted) return false;

    const matchesQuery =
      (pet.petName || "").toLowerCase().includes(query.toLowerCase()) ||
      (pet.petSpecies || "").toLowerCase().includes(query.toLowerCase()) ||
      (pet.breed || "").toLowerCase().includes(query.toLowerCase());
    const matchesType = petType
      ? (pet.petSpecies || "").toLowerCase() === petType.toLowerCase()
      : true;
    const matchesBreed = breed
      ? (pet.breed || "").toLowerCase() === breed.toLowerCase()
      : true;

    const computedAgeGroup = getAgeGroup(parseFloat(pet.ageValue), pet.ageUnit);
    const matchesAgeGroup = ageGroup
      ? computedAgeGroup.toLowerCase() === ageGroup.toLowerCase()
      : true;

    let distanceMatch = true;
    if (userLocation && pet.location && range < 100) {
      const distance = getDistance(
        { latitude: userLocation.latitude, longitude: userLocation.longitude },
        { latitude: pet.location.latitude, longitude: pet.location.longitude }
      );
      distanceMatch = distance <= range * 1000;
    }

    return (
      matchesQuery &&
      matchesType &&
      matchesBreed &&
      matchesAgeGroup &&
      distanceMatch
    );
  });

  const toggleFilters = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowFilters(!showFilters);
  };

  const onRefresh = async () => {
    setRefreshing(true);

    try {
      const snapshot = await firestore().collection("pets").get();
      const petsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPets(petsData);
    } catch (error) {
      console.error("Error refreshing pets: ", error);
    }

    setRefreshing(false);
  };

  return (
    <>
      <CustomHeader title="Search" />
      <FlatList
        contentContainerStyle={styles.container}
        data={filteredPets}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <>
            <View style={styles.searchRowContainer}>
              <Searchbar
                placeholder="Search"
                onChangeText={setQuery}
                value={query}
                style={[styles.searchbar, { backgroundColor: colors.offwhite }]}
                inputStyle={{
                  color: colors.blacktext,
                  fontFamily: "Aptos",
                }}
                theme={customSearchTheme}
                ref={searchbarRef}
              />
              <Pressable style={styles.filterButton} onPress={toggleFilters}>
                <Ionicons name="filter" size={24} color={colors.white} />
              </Pressable>
            </View>
            {showFilters && (
              <View style={styles.filtersContainer}>
                <View style={styles.filterHeaderRow}>
                  <Text style={styles.filterText}>Filter options:</Text>
                  {(petType || ageGroup || breed) && (
                    <Pressable
                      onPress={() => {
                        LayoutAnimation.configureNext(
                          LayoutAnimation.Presets.easeInEaseOut
                        );
                        setPetType("");
                        setAgeGroup("");
                        setBreed("");
                      }}
                    >
                      <Text style={styles.clearButtonText}>Clear</Text>
                    </Pressable>
                  )}
                </View>

                <Text style={styles.filterLabel}>Pet Type:</Text>
                <View style={styles.chipRow}>
                  {petTypes.map((type) => (
                    <Chip
                      key={type}
                      selected={petType === type}
                      onPress={() => {
                        setPetType(petType === type ? "" : type);
                        setBreed("");
                      }}
                      style={{
                        backgroundColor:
                          petType === type ? colors.accent : colors.coolback,
                        marginRight: 10,
                      }}
                      textStyle={{
                        color:
                          petType === type ? colors.white : colors.blacktext,
                      }}
                      selectedColor={colors.white}
                    >
                      {type}
                    </Chip>
                  ))}
                </View>

                {petType && breedOptions[petType] && (
                  <>
                    <Text style={styles.filterLabel}>Breed:</Text>
                    <View style={styles.chipRow}>
                      {breedOptions[petType].map((breedOption) => (
                        <Chip
                          key={breedOption}
                          selected={breed === breedOption}
                          onPress={() =>
                            setBreed(breed === breedOption ? "" : breedOption)
                          }
                          style={{
                            backgroundColor:
                              breed === breedOption
                                ? colors.accent
                                : colors.coolback,
                            marginRight: 10,
                          }}
                          textStyle={{
                            color:
                              breed === breedOption
                                ? colors.white
                                : colors.blacktext,
                          }}
                          selectedColor={colors.white}
                        >
                          {breedOption}
                        </Chip>
                      ))}
                    </View>
                  </>
                )}

                <Text style={styles.filterLabel}>Age Group:</Text>
                <View style={styles.chipRow}>
                  {ageGroups.map((group) => (
                    <Chip
                      key={group}
                      selected={ageGroup === group}
                      onPress={() =>
                        setAgeGroup(ageGroup === group ? "" : group)
                      }
                      style={{
                        backgroundColor:
                          ageGroup === group ? colors.accent : colors.coolback,
                        marginRight: 10,
                      }}
                      textStyle={{
                        color:
                          ageGroup === group ? colors.white : colors.blacktext,
                      }}
                      selectedColor={colors.white}
                    >
                      {group}
                    </Chip>
                  ))}
                </View>

                <View style={styles.sliderContainer}>
                  <Text style={styles.filterLabel}>
                    Range: {range === 100 ? "Max" : `${range} KM`}
                  </Text>
                  <Slider
                    style={{ width: "100%", height: 40 }}
                    minimumValue={5}
                    maximumValue={100}
                    step={5}
                    value={range}
                    onValueChange={setRange}
                    minimumTrackTintColor={colors.accent}
                    maximumTrackTintColor={colors.offwhite}
                  />
                </View>
              </View>
            )}
            <Text style={styles.header}>Search Results</Text>
          </>
        }
        renderItem={({ item }) => {
          const ageGroup = getAgeGroup(parseFloat(item.ageValue), item.ageUnit);

          return (
            <Pressable
              style={styles.petItem}
              onPress={() => {
                console.log(item);
                router.push({
                  pathname: `/tabs/home/pets/${item.id}`,
                  params: { pet: JSON.stringify(item), isOwner: false },
                });
              }}
            >
              <Image
                source={{ uri: item.petImages[0] }}
                style={styles.petImage}
              />
              <View style={styles.petInfo}>
                <View style={styles.nameSpeciesRow}>
                  <Text style={styles.petName}>{item.petName}</Text>
                  <Text style={styles.petSpecies}> ({item.petSpecies})</Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 5,
                  }}
                >
                  <Ionicons name="time" size={18} color={colors.accent} />
                  <Text style={[styles.petText, { marginLeft: 5 }]}>
                    {item.ageValue} {item.ageUnit} ({ageGroup})
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 5,
                  }}
                >
                  <Ionicons name="paw" size={18} color={colors.accent} />
                  <Text style={[styles.petText, { marginLeft: 5 }]}>
                    {item.breed}
                  </Text>
                </View>
              </View>
              <Ionicons
                name="chevron-forward"
                size={24}
                color={colors.darkgray}
              />
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <Text style={styles.noResults}>No pets found.</Text>
        }
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
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
    gap: 5,
  },
  sliderContainer: {
    marginTop: 15,
  },
  header: {
    fontSize: 20,
    marginBottom: 15,
    color: colors.black,
    fontFamily: "AptosSemiBold",
  },
  petItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: colors.white,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.offwhite,
  },
  petImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 15,
  },
  petInfo: {
    flex: 1,
  },
  petText: {
    fontSize: 16,
    color: colors.blacktext,
    fontFamily: "AptosSemiBold",
  },
  noResults: {
    fontSize: 16,
    fontStyle: "italic",
    color: "#888",
    textAlign: "center",
    marginTop: 20,
  },
  petName: {
    fontSize: 16,
    color: colors.blacktext,
    fontFamily: "UbuntuBold",
  },
  petSpecies: {
    fontSize: 14,
    color: "#666",
  },
  nameSpeciesRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
});
