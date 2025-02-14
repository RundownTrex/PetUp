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

  const pets = [
    {
      id: "1",
      name: "Buddy",
      species: "Dog",
      ageGroup: "Adult",
      breed: "Labrador",
      image: require("../../../assets/test1.jpg"),
    },
    {
      id: "2",
      name: "Mittens",
      species: "Cat",
      ageGroup: "Young",
      breed: "Persian",
      image: require("../../../assets/test2.jpg"),
    },
    {
      id: "3",
      name: "Coco",
      species: "Parrot",
      ageGroup: "Senior",
      breed: "Parakeet",
      image: require("../../../assets/test1.jpg"),
    },
    {
      id: "4",
      name: "Goldie",
      species: "Fish",
      ageGroup: "Baby",
      breed: "Goldfish",
      image: require("../../../assets/test2.jpg"),
    },
    {
      id: "5",
      name: "Bella",
      species: "Dog",
      ageGroup: "Young",
      breed: "Poodle",
      image: require("../../../assets/test1.jpg"),
    },
    {
      id: "6",
      name: "Max",
      species: "Dog",
      ageGroup: "Adult",
      breed: "Bulldog",
      image: require("../../../assets/test1.jpg"),
    },
    {
      id: "7",
      name: "Whiskers",
      species: "Cat",
      ageGroup: "Senior",
      breed: "Siamese",
      image: require("../../../assets/test2.jpg"),
    },
    {
      id: "8",
      name: "Polly",
      species: "Parrot",
      ageGroup: "Young",
      breed: "Canary",
      image: require("../../../assets/test1.jpg"),
    },
    {
      id: "9",
      name: "Nemo",
      species: "Fish",
      ageGroup: "Baby",
      breed: "Betta",
      image: require("../../../assets/test2.jpg"),
    },
    {
      id: "10",
      name: "Rocky",
      species: "Dog",
      ageGroup: "Senior",
      breed: "Beagle",
      image: require("../../../assets/test1.jpg"),
    },
  ];

  const filteredPets = pets.filter((pet) => {
    const matchesQuery =
      pet.name.toLowerCase().includes(query.toLowerCase()) ||
      pet.species.toLowerCase().includes(query.toLowerCase()) ||
      pet.ageGroup.toLowerCase().includes(query.toLowerCase()) ||
      pet.breed.toLowerCase().includes(query.toLowerCase());
    const matchesType = petType
      ? pet.species.toLowerCase() === petType.toLowerCase()
      : true;
    return matchesQuery && matchesType;
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
            onPress={() => router.push(`/pet/${item.id}`)}
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
    color: "#333",
    marginBottom: 5,
  },
  clearButtonText: {
    fontSize: 14,
    color: colors.accent,
    fontWeight: "600",
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 10,
    color: "#333",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
  },
  header: {
    fontSize: 20,
    marginBottom: 15,
    color: colors.blacktext,
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
