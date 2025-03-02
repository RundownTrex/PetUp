import React, { useState, useEffect } from "react";
import {
  View,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons, Feather } from "@expo/vector-icons";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";

import colors from "../../../utils/colors";
import CustomHeader from "../../../components/CustomHeader";
import CustomInput from "../../../components/CustomInput";
import MainButton from "../../../components/MainButton";

const ProfileScreen = () => {
  const user = auth().currentUser;

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [profileImage, setProfileImage] = useState(
    user?.photoURL || "https://via.placeholder.com/150"
  );
  const [formChanged, setFormChanged] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageChanged, setImageChanged] = useState(false);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection("users")
      .doc(user.uid)
      .onSnapshot((doc) => {
        if (doc.exists) {
          const data = doc.data();
          setFirstName(data.firstname || "");
          setLastName(data.lastname || "");
          setEmail(data.email || "");
          setPhoneNumber(data.phoneNumber || "");
          if (data.pfpUrl) {
            setProfileImage(data.pfpUrl);
          }
        }
      });
    return () => unsubscribe();
  }, []);

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(
        "Permission Required",
        "Permission to access camera roll is required!"
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
      setFormChanged(true);
      setImageChanged(true);
    }
  };

  const uploadProfilePhoto = async (uri) => {
    try {
      const file = {
        uri,
        name: `${user.uid}-${Date.now()}.jpg`,
        type: "image/jpeg",
      };

      const formData = new FormData();
      formData.append("file", file);
      formData.append("uid", user.uid);

      const response = await fetch("https://petup.onrender.com/uploadPfp", {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        console.error("Upload failed with status", response.status);
        return null;
      }
    } catch (error) {
      console.error("Error uploading profile photo:", error);
      return null;
    }
  };

  const handleSaveChanges = async () => {
    setLoading(true);
    let newPhotoUrl = profileImage;

    if (imageChanged) {
      const uploadResult = await uploadProfilePhoto(profileImage);
      if (uploadResult && uploadResult.url) {
        newPhotoUrl = uploadResult.url;
        setProfileImage(uploadResult.url);
      } else {
        Alert.alert("Error", "Profile photo upload failed.");
        setLoading(false);
        return;
      }
    }

    try {
      await firestore()
        .collection("users")
        .doc(user.uid)
        .update({
          firstname: firstName,
          lastname: lastName,
          phoneNumber: phoneNumber,
          ...(imageChanged ? { pfpUrl: newPhotoUrl } : {}),
        });
      Alert.alert("Success", "Changes have been saved.");
      setFormChanged(false);
      setImageChanged(false);
    } catch (err) {
      console.error("Error updating Firestore:", err);
      Alert.alert("Error", "Failed to update your profile in Firestore.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <CustomHeader title="Profile" />
      <ScrollView contentContainerStyle={styles.container}>
        <Pressable onPress={pickImage} style={styles.profilePressable}>
          <View style={styles.profilePicContainer}>
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
            <View style={styles.editIconContainer}>
              <Feather name="edit" size={18} color={colors.accent} />
            </View>
          </View>
        </Pressable>

        <CustomInput
          label="First Name"
          value={firstName}
          onChangeText={(text) => {
            setFirstName(text);
            setFormChanged(true);
          }}
        />

        <CustomInput
          label="Last Name"
          value={lastName}
          onChangeText={(text) => {
            setLastName(text);
            setFormChanged(true);
          }}
        />

        <CustomInput
          label="Email"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
          }}
          disable={true}
        />

        <CustomInput
          label="Phone Number"
          value={phoneNumber}
          keyboardType="phone-pad"
          onChangeText={(text) => {
            setPhoneNumber(text);
            setFormChanged(true);
          }}
        />

        {formChanged && (
          <MainButton
            title="Save Changes"
            onPress={handleSaveChanges}
            loading={loading}
            disabled={loading}
          />
        )}
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexGrow: 1,
    backgroundColor: colors.white,
  },
  profilePressable: {
    marginBottom: 20,
    alignItems: "center",
  },
  profilePicContainer: {
    width: 95,
    height: 95,
  },
  profileImage: {
    width: "100%",
    height: "100%",
    borderRadius: 60,
  },
  editIconContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    borderRadius: 50,
    padding: 6,
    backgroundColor: colors.white,
  },
});

export default ProfileScreen;
