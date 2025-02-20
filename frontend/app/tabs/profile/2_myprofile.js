// ProfileScreen.js
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
import { Picker } from "@react-native-picker/picker";
import { Ionicons, Feather } from "@expo/vector-icons";
import auth from "@react-native-firebase/auth";

import colors from "../../../utils/colors";
import CustomHeader from "../../../components/CustomHeader";
import CustomInput from "../../../components/CustomInput";
import MainButton from "../../../components/MainButton";

const ProfileScreen = () => {
  const user = auth().currentUser;

  // Initialize state values from user
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [phoneNumber, setPhoneNumber] = useState("+1 111 467 378 399");
  const [gender, setGender] = useState("Male");
  const [profileImage, setProfileImage] = useState(
    user?.photoURL || "https://via.placeholder.com/150"
  );
  const [formChanged, setFormChanged] = useState(false);

  // Setup first & last name from user's displayName, if available
  useEffect(() => {
    if (user?.displayName) {
      const nameArr = user.displayName.split(" ");
      setFirstName(nameArr[0]);
      setLastName(nameArr.slice(1).join(" "));
    }
  }, [user]);

  // Function to pick and crop image from gallery
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
      allowsEditing: true, // allows cropping
      aspect: [1, 1], // square crop
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
      setFormChanged(true);
      // Optionally update Firebase: await user.updateProfile({ photoURL: result.assets[0].uri });
    }
  };

  // Function to handle saving changes
  const handleSaveChanges = async () => {
    // TODO: Add logic to update user profile in Firebase if desired.
    // For example: await user.updateProfile({ displayName: `${firstName} ${lastName}` });
    // Also update phone number and gender if needed.
    setFormChanged(false);
    Alert.alert("Success", "Changes have been saved.");
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
          onChangeText={(text) => {
            setPhoneNumber(text);
            setFormChanged(true);
          }}
        />

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={gender}
            onValueChange={(itemValue) => {
              setGender(itemValue);
              setFormChanged(true);
            }}
          >
            <Picker.Item label="Male" value="Male" />
            <Picker.Item label="Female" value="Female" />
            <Picker.Item label="Other" value="Other" />
          </Picker>
        </View>

        {formChanged && (
          <MainButton title="Save Changes" onPress={handleSaveChanges} />
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
  pickerContainer: {
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    marginBottom: 15,
  },
});

export default ProfileScreen;
