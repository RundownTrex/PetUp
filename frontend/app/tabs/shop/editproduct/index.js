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

import CustomHeader from "../../../../components/CustomHeader";
import MainButton from "../../../../components/MainButton";
import CustomInput from "../../../../components/CustomInput";
import colors from "../../../../utils/colors";
import { router } from "expo-router";
import { useRoute } from "@react-navigation/native";

const categories = [
  "Food",
  "Toys",
  "Accessories",
  "Grooming",
  "Bedding",
  "Healthcare",
  "Clothing",
  "Training",
  "Other",
];

const petTypes = [
  "Dog",
  "Cat",
  "Rabbit",
  "Bird",
  "Reptile",
  "Fish",
  "All Pets",
  "Other",
];

const conditionOptions = [
  { label: "New", value: "New" },
  { label: "Like New", value: "Like New" },
  { label: "Good", value: "Good" },
  { label: "Fair", value: "Fair" },
  { label: "Used", value: "Used" },
];

const statusOptions = [
  { label: "Available", value: "available" },
  { label: "Sold", value: "sold" },
  { label: "Reserved", value: "reserved" },
];

export default function EditProduct() {
  const route = useRoute();
  const { product } = route.params || {};

  const productData = useMemo(() => {
    return product ? JSON.parse(product) : {};
  }, [product]);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [petType, setPetType] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState("");
  const [features, setFeatures] = useState("");
  const [usage, setUsage] = useState("");
  const [specifications, setSpecifications] = useState("");
  const [images, setImages] = useState([]);
  const [status, setStatus] = useState("available");
  const [initialValues, setInitialValues] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (productData) {
      setName(productData.name || "");
      setCategory(productData.category || "");
      setPetType(productData.petType || "");
      setDescription(productData.description || "");
      setPrice(productData.price ? productData.price.toString() : "");
      setCondition(productData.condition || "");
      setFeatures(productData.features || "");
      setUsage(productData.usage || "");
      setSpecifications(productData.specifications || "");
      setImages(productData.images || []);
      setStatus(productData.status || "available");

      setInitialValues({
        name: productData.name || "",
        category: productData.category || "",
        petType: productData.petType || "",
        description: productData.description || "",
        price: productData.price ? productData.price.toString() : "",
        condition: productData.condition || "",
        features: productData.features || "",
        usage: productData.usage || "",
        specifications: productData.specifications || "",
        images: productData.images || [],
        status: productData.status || "available",
      });
    }
  }, [productData]);

  const isChanged = useMemo(() => {
    if (!initialValues) return false;
    return (
      name !== initialValues.name ||
      category !== initialValues.category ||
      petType !== initialValues.petType ||
      description !== initialValues.description ||
      price !== initialValues.price ||
      condition !== initialValues.condition ||
      features !== initialValues.features ||
      usage !== initialValues.usage ||
      specifications !== initialValues.specifications ||
      status !== initialValues.status ||
      JSON.stringify(images) !== JSON.stringify(initialValues.images)
    );
  }, [
    initialValues,
    name,
    category,
    petType,
    description,
    price,
    condition,
    features,
    usage,
    specifications,
    status,
    images,
  ]);

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
        "https://petup.onrender.com/uploadProductImage",
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

  const handleSave = async () => {
    if (
      !name ||
      !category ||
      !petType ||
      !description ||
      !price ||
      !condition ||
      !features ||
      !usage ||
      !specifications ||
      images.length === 0
    ) {
      Toast.show({
        type: "error",
        text1: "Please fill all fields and add at least one image.",
      });
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      Toast.show({
        type: "error",
        text1: "Please enter a valid price.",
      });
      return;
    }

    setLoading(true);

    const uploadedImages = [];
    for (const imageUri of images) {
      if (imageUri.startsWith("http")) {
        uploadedImages.push(imageUri);
        continue;
      }

      const uploadResult = await uploadProductImage(imageUri);
      if (uploadResult && uploadResult.url) {
        uploadedImages.push(uploadResult.url);
      } else {
        Alert.alert("Error", "One or more product images failed to upload.");
        setLoading(false);
        return;
      }
    }

    const updatedProductData = {
      name,
      category,
      petType,
      description,
      price: parseFloat(price),
      condition,
      features,
      usage,
      specifications,
      status,
      images: uploadedImages,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    };

    try {
      await firestore()
        .collection("petProducts")
        .doc(productData.id)
        .update(updatedProductData);
      Alert.alert("Product Updated", "Your product listing has been updated!");
      router.back();
    } catch (error) {
      console.error("Error updating product info:", error);
      Alert.alert(
        "Error",
        "There was a problem updating your product information."
      );
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
      selectionLimit: 5,
    });
    if (!result.cancelled && result.assets && result.assets.length > 0) {
      const newImages = result.assets.map((asset) => asset.uri);
      setImages((prevImages) => [...prevImages, ...newImages]);
    }
  };

  const removeImage = (uriToRemove) => {
    setImages((prevImages) => prevImages.filter((uri) => uri !== uriToRemove));
  };

  return (
    <>
      <CustomHeader title="Edit Product" />
      <ScrollView contentContainerStyle={styles.container}>
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
            Add at least 1 high quality image of your product.
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
          placeholder="For what pet?"
          placeholderStyle={{ color: colors.black, fontFamily: "Aptos" }}
          value={petType}
          onChange={(item) => setPetType(item.value)}
        />

        <Dropdown
          style={styles.input}
          data={conditionOptions}
          labelField="label"
          valueField="value"
          placeholder="Product Condition"
          placeholderStyle={{ color: colors.black, fontFamily: "Aptos" }}
          value={condition}
          onChange={(item) => setCondition(item.value)}
        />

        <Dropdown
          style={styles.input}
          data={statusOptions}
          labelField="label"
          valueField="value"
          placeholder="Product Status"
          placeholderStyle={{ color: colors.black, fontFamily: "Aptos" }}
          value={status}
          onChange={(item) => setStatus(item.value)}
          renderLeftIcon={() => (
            <View style={{ marginRight: 5 }}>
              {status === "available" && (
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={colors.green}
                />
              )}
              {status === "sold" && (
                <Ionicons name="close-circle" size={20} color={colors.red} />
              )}
              {status === "reserved" && (
                <Ionicons name="time" size={20} color={colors.orange} />
              )}
            </View>
          )}
        />

        <CustomInput
          label="Price (₹)"
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
        />

        <CustomInput
          label="Description"
          placeholder="Describe your product"
          value={description}
          onChangeText={setDescription}
          multiline={true}
        />

        <CustomInput
          label="Key Features"
          placeholder="Key features and benefits"
          value={features}
          onChangeText={setFeatures}
          multiline={true}
        />

        <CustomInput
          label="Usage Instructions"
          placeholder="How to use this product"
          value={usage}
          onChangeText={setUsage}
          multiline={true}
        />

        <CustomInput
          label="Specifications"
          placeholder="Technical specifications"
          value={specifications}
          onChangeText={setSpecifications}
          multiline={true}
        />

        {isChanged && (
          <MainButton
            title="Save Changes"
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
