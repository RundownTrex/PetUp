import React, { useState, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  Alert,
  Text,
  View,
  Image,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import * as Location from "expo-location";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";

import CustomHeader from "../../../components/CustomHeader";
import MainButton from "../../../components/MainButton";
import CustomInput from "../../../components/CustomInput";
import colors from "../../../utils/colors";
import { router } from "expo-router";

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

const genderOptions = [
  { label: "Male", value: "Male" },
  { label: "Female", value: "Female" },
];

const ageOptions = [
  { label: "Puppy/Kitten", value: "Puppy/Kitten" },
  { label: "Young", value: "Young" },
  { label: "Adult", value: "Adult" },
  { label: "Senior", value: "Senior" },
];

const sizeOptions = [
  { label: "Small", value: "Small" },
  { label: "Medium", value: "Medium" },
  { label: "Large", value: "Large" },
];

export default function NewPet() {
  const [petName, setPetName] = useState("");
  const [petSpecies, setPetSpecies] = useState("");
  const [breed, setBreed] = useState("");
  const [gender, setGender] = useState("");
  const [size, setSize] = useState("");
  const [age, setAge] = useState("");
  const [about, setAbout] = useState("");
  const [personality, setPersonality] = useState("");
  const [vaccinations, setVaccinations] = useState("");
  const [idealHome, setIdealHome] = useState("");
  const [adoptionInfo, setAdoptionInfo] = useState("");
  const [petImages, setPetImages] = useState([]);
  const [ageValue, setAgeValue] = useState("");
  const [ageUnit, setAgeUnit] = useState("Month(s)");
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState(null);
  const [isFetchingLocation, setIsFetchingLocation] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (
      !petName ||
      !petSpecies ||
      !gender ||
      !size ||
      !ageValue ||
      !about ||
      !personality ||
      !vaccinations ||
      !idealHome ||
      !adoptionInfo ||
      petImages.length === 0
    ) {
      Toast.show({
        type: "error",
        text1: "Please fill all fields and add at least one image.",
      });
      return;
    }
    setLoading(true);

    const uploadedImages = [];
    for (const imageUri of petImages) {
      const uploadResult = await uploadPetImage(imageUri);
      if (uploadResult && uploadResult.url) {
        uploadedImages.push(uploadResult.url);
      } else {
        Alert.alert("Error", "One or more pet images failed to upload.");
        setLoading(false);
        return;
      }
    }

    const petData = {
      petName,
      petSpecies,
      breed,
      gender,
      size,
      ageValue,
      ageUnit,
      about,
      personality,
      vaccinations,
      idealHome,
      adoptionInfo,
      petImages: uploadedImages,
      location,
      address,
      createdAt: firestore.FieldValue.serverTimestamp(),
      ownerId: auth().currentUser.uid,
    };

    try {
      await firestore().collection("pets").add(petData);
      Alert.alert("Pet Saved", "Your new pet has been listed for adoption!");
      router.back();
    } catch (error) {
      console.error("Error saving pet info:", error);
      Alert.alert("Error", "There was a problem saving your pet information.");
    } finally {
      setLoading(false);
    }
  };

  const speciesData = petTypes.map((type) => ({ label: type, value: type }));

  const breedData =
    petSpecies && breedOptions[petSpecies]
      ? breedOptions[petSpecies].map((b) => ({ label: b, value: b }))
      : [];

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Please grant library permissions to select images."
      );
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsMultipleSelection: true,
      selectionLimit: 8,
    });
    if (!result.cancelled && result.assets && result.assets.length > 0) {
      const newImages = result.assets.map((asset) => asset.uri);
      setPetImages((prevImages) => [...prevImages, ...newImages]);
    }
  };

  const removeImage = (uriToRemove) => {
    setPetImages((prevImages) =>
      prevImages.filter((uri) => uri !== uriToRemove)
    );
  };

  const ageUnitOptions = [
    { label: "Month(s)", value: "Month(s)" },
    { label: "Year(s)", value: "Year(s)" },
  ];

  const fetchLocation = async () => {
    setIsFetchingLocation(true);
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Please allow location access to include your pet's location."
      );
      setIsFetchingLocation(false);
      return;
    }
    const currentLocation = await Location.getCurrentPositionAsync({});
    setLocation(currentLocation.coords);
    setIsFetchingLocation(false);
  };

  const fetchAddress = async (coords) => {
    let address = await Location.reverseGeocodeAsync(coords);
    return address[0];
  };

  useEffect(() => {
    fetchLocation();
  }, []);

  useEffect(() => {
    if (location) {
      (async () => {
        const addr = await fetchAddress(location);
        setAddress(addr);
      })();
    }
  }, [location]);

  const uploadPetImage = async (uri) => {
    try {
      const file = {
        uri,
        name: `${auth().currentUser.uid}-${Date.now()}.jpg`,
        type: "image/jpeg",
      };

      const formData = new FormData();
      formData.append("file", file);
      formData.append("uid", auth().currentUser.uid);

      const response = await fetch(
        "https://petup.onrender.com/uploadPetImage",
        {
          method: "POST",
          body: formData,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        console.error("Upload pet image failed with status", response.status);
        return null;
      }
    } catch (error) {
      console.error("Error uploading pet image:", error);
      return null;
    }
  };

  return (
    <>
      <CustomHeader title="New Pet" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.locationDisplay}>
          {isFetchingLocation ? (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontFamily: "Aptos", color: colors.darkgray }}>
                Fetching address...
              </Text>
              <ActivityIndicator size="small" color={colors.accent} />
            </View>
          ) : location ? (
            <>
              <Text style={styles.locationText}>
                Coordinates: {location.latitude.toFixed(4)},{" "}
                {location.longitude.toFixed(4)}
              </Text>
              {address && (
                <Text style={styles.locationText}>
                  Address: {address.name ? `${address.name}, ` : ""}
                  {address.city ? `${address.city}, ` : ""}
                  {address.region ? `${address.region}, ` : ""}
                  {address.country || ""}
                </Text>
              )}
              <Text style={styles.locationNote}>
                Note: This location will be used to inform others about your
                pet's whereabouts.
              </Text>
            </>
          ) : (
            <Text style={styles.locationText}>Location unavailable</Text>
          )}
        </View>
        <View style={styles.imageContainer}>
          {petImages.map((uri, index) => (
            <View key={index} style={styles.imageWrapper}>
              <Image source={{ uri }} style={styles.imagePreview} />
              <Pressable
                style={styles.removeButton}
                onPress={() => removeImage(uri)}
              >
                <Ionicons name="close" size={12} color={colors.white} />
              </Pressable>
            </View>
          ))}
          <Pressable style={styles.addImageButton} onPress={pickImage}>
            <Text style={styles.addImageText}>Add Image</Text>
          </Pressable>
          <Text style={styles.addImageNote}>
            Please add landscape images of your pet.
          </Text>
        </View>

        <CustomInput
          label="Pet Name"
          value={petName}
          onChangeText={setPetName}
        />

        <Dropdown
          style={styles.input}
          data={speciesData}
          labelField="label"
          valueField="value"
          placeholder="Select Species"
          placeholderStyle={{ color: colors.black, fontFamily: "Aptos" }}
          value={petSpecies}
          onChange={(item) => {
            setPetSpecies(item.value);
            setBreed("");
          }}
        />

        {petSpecies !== "" && (
          <Dropdown
            style={styles.input}
            data={breedData}
            labelField="label"
            valueField="value"
            placeholder="Select Breed"
            value={breed}
            onChange={(item) => setBreed(item.value)}
          />
        )}

        <Dropdown
          style={styles.input}
          data={genderOptions}
          labelField="label"
          valueField="value"
          placeholder="Select Gender"
          value={gender}
          onChange={(item) => setGender(item.value)}
        />

        <Dropdown
          style={styles.input}
          data={sizeOptions}
          labelField="label"
          valueField="value"
          placeholder="Select Size"
          value={size}
          onChange={(item) => setSize(item.value)}
        />

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <View style={{ flex: 1, marginRight: 10 }}>
            <CustomInput
              label="Age"
              placeholder="Enter age"
              value={ageValue}
              onChangeText={setAgeValue}
              keyboardType="numeric"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Dropdown
              style={[styles.input, { marginTop: 5 }]}
              data={ageUnitOptions}
              labelField="label"
              valueField="value"
              placeholder="Select Unit"
              value={ageUnit}
              onChange={(item) => setAgeUnit(item.value)}
            />
          </View>
        </View>

        <CustomInput
          label="About the Pet"
          placeholder="About the Pet"
          value={about}
          onChangeText={setAbout}
          multiline={true}
        />

        <CustomInput
          label="Personality & Habits"
          placeholder="Personality & Habits"
          value={personality}
          onChangeText={setPersonality}
          multiline={true}
        />

        <CustomInput
          label="Vaccination Records"
          placeholder="Vaccination Records"
          value={vaccinations}
          onChangeText={setVaccinations}
          multiline={true}
        />

        <CustomInput
          label="Ideal Home"
          placeholder="Ideal Home"
          value={idealHome}
          onChangeText={setIdealHome}
          multiline={true}
        />

        <CustomInput
          label="Adoption Information"
          placeholder="Adoption Information"
          value={adoptionInfo}
          onChangeText={setAdoptionInfo}
          multiline={true}
        />

        <MainButton
          title="Save Pet"
          onPress={handleSave}
          loading={loading}
          disabled={loading}
        />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: colors.white,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.darkgray,
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    paddingLeft: 15,
    height: 50,
  },
  imageContainer: {
    marginVertical: 15,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    marginTop: 0,
  },
  imageWrapper: {
    position: "relative",
    marginRight: 10,
    marginBottom: 10,
  },
  imagePreview: {
    width: 95,
    height: 95,
    borderRadius: 8,
  },
  removeButton: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: colors.red,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  addImageButton: {
    backgroundColor: colors.accent,
    padding: 10,
    borderRadius: 5,
  },
  addImageText: {
    color: colors.white,
    fontFamily: "AptosBold",
  },
  addImageNote: {
    marginTop: 10,
    color: colors.darkgray,
    fontFamily: "Aptos",
  },
  locationDisplay: {
    marginBottom: 15,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.darkgray,
    borderRadius: 5,
  },
  locationText: {
    fontFamily: "Aptos",
    color: colors.darkgray,
  },
  locationNote: {
    marginTop: 5,
    color: colors.darkgray,
    fontFamily: "Aptos",
  },
});
