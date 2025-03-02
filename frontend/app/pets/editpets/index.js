import React, { useState, useEffect, useMemo } from "react";
import {
  ScrollView,
  StyleSheet,
  Alert,
  Text,
  View,
  Image,
  Pressable,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";

import CustomHeader from "../../../components/CustomHeader";
import MainButton from "../../../components/MainButton";
import CustomInput from "../../../components/CustomInput";
import colors from "../../../utils/colors";
import { router } from "expo-router";
import { useRoute } from "@react-navigation/native";

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

const sizeOptions = [
  { label: "Small", value: "Small" },
  { label: "Medium", value: "Medium" },
  { label: "Large", value: "Large" },
];

export default function EditPet() {
  const route = useRoute();

  const { pet } = route.params || {};

  const petData = useMemo(() => {
    return pet ? JSON.parse(pet) : {};
  }, [pet]);

  const [petName, setPetName] = useState("");
  const [petSpecies, setPetSpecies] = useState("");
  const [breed, setBreed] = useState("");
  const [gender, setGender] = useState("");
  const [size, setSize] = useState("");
  const [about, setAbout] = useState("");
  const [personality, setPersonality] = useState("");
  const [vaccinations, setVaccinations] = useState("");
  const [idealHome, setIdealHome] = useState("");
  const [adoptionInfo, setAdoptionInfo] = useState("");
  const [petImages, setPetImages] = useState([]);
  const [ageValue, setAgeValue] = useState("");
  const [ageUnit, setAgeUnit] = useState("Month(s)");
  const [initialValues, setInitialValues] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (petData) {
      setPetName(petData.petName || "");
      setPetSpecies(petData.petSpecies || "");
      setBreed(petData.breed || "");
      setGender(petData.gender || "");
      setSize(petData.size || "");
      setAbout(petData.about || "");
      setPersonality(petData.personality || "");
      setVaccinations(petData.vaccinations || "");
      setIdealHome(petData.idealHome || "");
      setAdoptionInfo(petData.adoptionInfo || "");
      setPetImages(petData.petImages || []);
      setAgeValue(petData.ageValue ? petData.ageValue.toString() : "");
      setAgeUnit(petData.ageUnit || "Month(s)");

      setInitialValues({
        petName: petData.petName || "",
        petSpecies: petData.petSpecies || "",
        breed: petData.breed || "",
        gender: petData.gender || "",
        size: petData.size || "",
        about: petData.about || "",
        personality: petData.personality || "",
        vaccinations: petData.vaccinations || "",
        idealHome: petData.idealHome || "",
        adoptionInfo: petData.adoptionInfo || "",
        petImages: petData.petImages || [],
        ageValue: petData.ageValue ? petData.ageValue.toString() : "",
        ageUnit: petData.ageUnit || "Month(s)",
      });
    }
  }, [petData]);

  const isChanged = useMemo(() => {
    if (!initialValues) return false;
    return (
      petName !== initialValues.petName ||
      petSpecies !== initialValues.petSpecies ||
      breed !== initialValues.breed ||
      gender !== initialValues.gender ||
      size !== initialValues.size ||
      about !== initialValues.about ||
      personality !== initialValues.personality ||
      vaccinations !== initialValues.vaccinations ||
      idealHome !== initialValues.idealHome ||
      adoptionInfo !== initialValues.adoptionInfo ||
      JSON.stringify(petImages) !== JSON.stringify(initialValues.petImages) ||
      ageValue !== initialValues.ageValue ||
      ageUnit !== initialValues.ageUnit
    );
  }, [
    initialValues,
    petName,
    petSpecies,
    breed,
    gender,
    size,
    about,
    personality,
    vaccinations,
    idealHome,
    adoptionInfo,
    petImages,
    ageValue,
    ageUnit,
  ]);

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

    const updatedPetData = {
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
    };

    try {
      await firestore()
        .collection("pets")
        .doc(petData.id)
        .update(updatedPetData);
      Alert.alert("Pet Updated", "Your pet profile has been updated!");
      router.back();
    } catch (error) {
      console.error("Error updating pet info:", error);
      Alert.alert(
        "Error",
        "There was a problem updating your pet information."
      );
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
      selectionLimit: 0,
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

  return (
    <>
      <CustomHeader title="Edit Pet" />
      <ScrollView contentContainerStyle={styles.container}>
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
        <View style={{ flexDirection: "row", alignItems: "center" }}>
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
        {isChanged && (
          <MainButton
            title="Save info"
            onPress={handleSave}
            loading={loading}
            disabled={loading}
          />
        )}
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
});
