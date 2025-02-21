import React, { useState, useEffect } from "react";
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
import MainButton from "../../../components/MainButton";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import colors from "../../../utils/colors";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Slider from "@react-native-community/slider";
import * as Location from "expo-location";
import { getDistance } from "geolib";

const customSearchTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.accent,
    background: colors.accent,
  },
};

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [petType, setPetType] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [breed, setBreed] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  // New state for user's location and range (in KM)
  const [userLocation, setUserLocation] = useState(null);
  const [range, setRange] = useState(10); // default 10 KM

  const breedOptions = {
    Dog: ["Labrador", "Poodle", "Bulldog", "Beagle"],
    Cat: ["Persian", "Siamese", "Maine Coon"],
    Rabbit: ["Dutch", "Lionhead"],
    Bird: ["Parakeet", "Canary"],
    Reptile: ["Iguana", "Gecko"],
    Fish: ["Goldfish", "Betta"],
    Primate: ["Capuchin", "Marmoset"],
    Other: ["Mixed"],
  };

  useEffect(() => {
    if (Platform.OS === "android") {
      UIManager.setLayoutAnimationEnabledExperimental &&
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  // Get user's current location
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({});
        setUserLocation(loc.coords);
      }
    })();
  }, []);

  const pets = [
    {
      id: "1",
      name: "Buddy",
      species: "Dog",
      ageGroup: "Adult",
      breed: "Labrador",
      image: require("../../../assets/test1.jpg"),
      location: { latitude: 19.2082651403851, longitude: 73.10409884142034 },
    },
    {
      id: "2",
      name: "Mittens",
      species: "Cat",
      ageGroup: "Young",
      breed: "Persian",
      image: require("../../../assets/test2.jpg"),
      location: { latitude: 19.215225368000404, longitude: 73.10587982819078 },
    },
    {
      id: "3",
      name: "Third",
      species: "Cat",
      ageGroup: "Young",
      breed: "Persian",
      image: require("../../../assets/test2.jpg"),
      location: { latitude: 18.924142079929755, longitude: 72.83316454012723 },
    },
  ];

  // Filter pets by query and location range
  const filteredPets = pets.filter((pet) => {
    const matchesQuery =
      pet.name.toLowerCase().includes(query.toLowerCase()) ||
      pet.species.toLowerCase().includes(query.toLowerCase()) ||
      pet.ageGroup.toLowerCase().includes(query.toLowerCase()) ||
      pet.breed.toLowerCase().includes(query.toLowerCase());
    const matchesType = petType
      ? pet.species.toLowerCase() === petType.toLowerCase()
      : true;
    let distanceMatch = true;
    if (userLocation && pet.location) {
      const distance = getDistance(userLocation, pet.location); // in meters
      distanceMatch = distance <= range * 1000; // convert KM to meters
    }
    return matchesQuery && matchesType && distanceMatch;
  });

  const toggleFilters = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowFilters(!showFilters);
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  const petTypes = [
    "Dog",
    "Cat",
    "Rabbit",
    "Bird",
    "Reptile",
    "Fish",
    "Primate",
    "Other",
  ];

  const ageGroups = ["Baby", "Young", "Adult", "Senior"];

  return (
    <View style={styles.container}>
      <FlatList
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

                {/* New Range slider */}
                <View style={styles.sliderContainer}>
                  <Text style={styles.filterLabel}>Range: {range} KM</Text>
                  <Slider
                    style={{ width: "100%", height: 40 }}
                    minimumValue={1}
                    maximumValue={50}
                    step={1}
                    value={range}
                    onValueChange={setRange}
                    minimumTrackTintColor={colors.accent}
                    maximumTrackTintColor={colors.offwhite}
                  />
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
              </View>
            )}
            <Text style={styles.header}>Search Results</Text>
          </>
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.petItem}
            onPress={() =>
              router.push({
                pathname: `/pets/${item.id}`,
              })
            }
          >
            <Image source={item.image} style={styles.petImage} />
            <View style={styles.petInfo}>
              <View style={styles.nameSpeciesRow}>
                <Text style={styles.petName}>{item.name}</Text>
                <Text style={styles.petSpecies}> ({item.species})</Text>
              </View>
              {item.ageGroup && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 5,
                  }}
                >
                  <Ionicons name="time" size={18} color={colors.accent} />
                  <Text style={[styles.petText, { marginLeft: 5 }]}>
                    {item.ageGroup}
                  </Text>
                </View>
              )}
              {item.breed && (
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
              )}
            </View>
            <Ionicons
              name="chevron-forward"
              size={24}
              color={colors.darkgray}
            />
          </Pressable>
        )}
        ListEmptyComponent={
          <Text style={styles.noResults}>No pets found.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    fontFamily: "AptosMedium",
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
    fontFamily: "AptosBold",
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
    fontFamily: "Aptos",
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
