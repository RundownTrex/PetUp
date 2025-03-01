import React, { useState, useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  ScrollView,
  StyleSheet,
  Alert,
  Text,
  View,
  Image,
  Pressable,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import * as Location from "expo-location";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";

import CustomHeader from "../../../../components/CustomHeader";
import MainButton from "../../../../components/MainButton";
import CustomInput from "../../../../components/CustomInput";
import colors from "../../../../utils/colors";
import { router } from "expo-router";

const categories = [
  "Food",
  "Toys",
  "Accessories",
  "Grooming",
  "Medicine",
  "Beds",
  "Treats",
  "Other",
];

const petTypes = [
  "Dog",
  "Cat",
  "Bird",
  "Fish",
  "Reptile",
  "Small Pets",
  "Other",
];

const conditionOptions = [
  { label: "New", value: "New" },
  { label: "Like New", value: "Like New" },
  { label: "Good", value: "Good" },
  { label: "Fair", value: "Fair" },
  { label: "Used", value: "Used" },
];

export default function NewAccessory() {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [petType, setPetType] = useState("");
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState("");
  const [description, setDescription] = useState("");
  const [features, setFeatures] = useState("");
  const [specifications, setSpecifications] = useState("");
  const [usage, setUsage] = useState("");
  const [images, setImages] = useState([]);
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState(null);
  const [isFetchingLocation, setIsFetchingLocation] = useState(true);
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setName("");
    setCategory("");
    setPetType("");
    setPrice("");
    setCondition("");
    setDescription("");
    setFeatures("");
    setSpecifications("");
    setUsage("");
    setImages([]);
  };

  useFocusEffect(
    React.useCallback(() => {
      resetForm();
      return () => {}; 
    }, [])
  );

  const handleSave = async () => {
    if (
      !name.trim() ||
      !category ||
      !petType ||
      !price ||
      !condition ||
      !description.trim() ||
      !features.trim() ||
      !specifications.trim() ||
      !usage.trim() ||
      images.length === 0
    ) {
      Toast.show({
        type: "error",
        text1: "Please fill all fields and add at least one image.",
      });
      return;
    }

    if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      Toast.show({
        type: "error",
        text1: "Please enter a valid price.",
      });
      return;
    }

    setLoading(true);

    const uploadedImages = [];
    for (const imageUri of images) {
      const uploadResult = await uploadProductImage(imageUri);
      if (uploadResult && uploadResult.url) {
        uploadedImages.push(uploadResult.url);
      } else {
        Alert.alert("Error", "One or more product images failed to upload.");
        setLoading(false);
        return;
      }
    }

    const productData = {
      name,
      category,
      petType,
      price: parseFloat(price),
      condition,
      description,
      features,
      specifications,
      usage,
      images: uploadedImages,
      location,
      address,
      listedDate: new Date().toISOString(),
      createdAt: firestore.FieldValue.serverTimestamp(),
      sellerId: auth().currentUser.uid,
      status: "available",
    };

    try {
      await firestore().collection("petProducts").add(productData);
      Alert.alert(
        "Listing Created",
        "Your product has been listed successfully!"
      );
      resetForm(); 
      router.back();
    } catch (error) {
      console.error("Error saving product info:", error);
      Alert.alert("Error", "There was a problem creating your listing.");
    } finally {
      setLoading(false);
    }
  };

  const categoryData = categories.map((cat) => ({ label: cat, value: cat }));
  const petTypeData = petTypes.map((type) => ({ label: type, value: type }));

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
      setImages((prevImages) => [...prevImages, ...newImages]);
    }
  };

  const removeImage = (uriToRemove) => {
    setImages((prevImages) => prevImages.filter((uri) => uri !== uriToRemove));
  };

  const fetchLocation = async () => {
    setIsFetchingLocation(true);
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Please allow location access to include your location."
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

  const uploadProductImage = async (uri) => {
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
        "http://192.168.221.151:3000/uploadProductImage",
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
        console.error(
          "Upload product image failed with status",
          response.status
        );
        return null;
      }
    } catch (error) {
      console.error("Error uploading product image:", error);
      return null;
    }
  };

  return (
    <>
      <CustomHeader title="New Listing" />
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
                Note: This location will be used to inform buyers about your
                listing's whereabouts.
              </Text>
            </>
          ) : (
            <Text style={styles.locationText}>Location unavailable</Text>
          )}
        </View>

        <View style={styles.imageContainer}>
          {images.map((uri, index) => (
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
            Please add clear images of your product from different angles.
          </Text>
        </View>

        <CustomInput label="Product Name" value={name} onChangeText={setName} />

        <Dropdown
          style={styles.input}
          data={categoryData}
          labelField="label"
          valueField="value"
          placeholder="Select Category"
          placeholderStyle={{ color: colors.black, fontFamily: "Aptos" }}
          value={category}
          onChange={(item) => setCategory(item.value)}
        />

        <Dropdown
          style={styles.input}
          data={petTypeData}
          labelField="label"
          valueField="value"
          placeholder="For Pet Type"
          placeholderStyle={{ color: colors.black, fontFamily: "Aptos" }}
          value={petType}
          onChange={(item) => setPetType(item.value)}
        />

        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Price (₹)</Text>
          <TextInput
            style={styles.priceInput}
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
            placeholder="0.00"
          />
        </View>

        <Dropdown
          style={styles.input}
          data={conditionOptions}
          labelField="label"
          valueField="value"
          placeholder="Select Condition"
          placeholderStyle={{ color: colors.black, fontFamily: "Aptos" }}
          value={condition}
          onChange={(item) => setCondition(item.value)}
        />

        <CustomInput
          label="Description"
          placeholder="Describe your product in detail"
          value={description}
          onChangeText={setDescription}
          multiline={true}
        />

        <CustomInput
          label="Features"
          placeholder="Enter features (one per line)"
          value={features}
          onChangeText={setFeatures}
          multiline={true}
          info="List one feature per line. These will be displayed as bullet points."
        />

        <CustomInput
          label="Specifications"
          placeholder="Enter technical specifications"
          value={specifications}
          onChangeText={setSpecifications}
          multiline={true}
        />

        <CustomInput
          label="Usage Instructions"
          placeholder="How to use this product"
          value={usage}
          onChangeText={setUsage}
          multiline={true}
        />

        <MainButton
          title="Create Listing"
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
  priceContainer: {
    marginBottom: 15,
  },
  priceLabel: {
    fontFamily: "AptosSemiBold",
    fontSize: 14,
    marginBottom: 8,
    color: colors.black,
  },
  priceInput: {
    borderWidth: 1,
    borderColor: colors.darkgray,
    borderRadius: 5,
    padding: 12,
    fontFamily: "Aptos",
    fontSize: 16,
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
    backgroundColor: colors.offwhite,
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
    width: "100%",
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
  requiredNote: {
    marginTop: 15,
    marginBottom: 20,
    color: colors.darkgray,
    fontFamily: "Aptos",
    textAlign: "center",
    fontSize: 12,
  },
});
