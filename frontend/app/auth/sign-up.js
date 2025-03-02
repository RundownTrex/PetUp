import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, Image } from "react-native";
import { useRouter } from "expo-router";
import { Button, Divider } from "react-native-paper";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import * as ImagePicker from "expo-image-picker";

import CustomInput from "../../components/CustomInput";
import MainButton from "../../components/MainButton";
import CustomDivider from "../../components/CustomDivider";
import colors from "../../utils/colors";

import { GOOGLE_WEB_CLIENT_ID } from "@env";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [password, setPassword] = useState("");
  const [cpassword, setcPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const router = useRouter();

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: GOOGLE_WEB_CLIENT_ID,
    });
    try {
      curUser = GoogleSignin.getCurrentUser();

      console.log("Current Google User:", curUser);
    } catch {
      (error) => {
        console.error("Google Sign-In Configuration Error:", error);
      };
    }
  }, []);

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Toast.show({
        type: "error",
        text1: "Permission required",
        text2: "You need to allow access to your photos",
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0]);
    }
  };

  const uploadProfileImage = async (uid) => {
    if (!profileImage) return null;

    try {
      const formData = new FormData();
      formData.append("file", {
        uri: profileImage.uri,
        type: "image/jpeg",
        name: "profile.jpg",
      });
      formData.append("uid", uid);

      const response = await fetch("https://petup.onrender.com/uploadPfp", {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const data = await response.json();

      if (data.url) {
        return data.url;
      } else {
        throw new Error("No URL returned from upload");
      }
    } catch (error) {
      console.error("Error uploading profile image:", error);
      return null;
    }
  };

  const signUpWEmailnPass = async () => {
    setLoading(true);
    if (
      !email.trim() ||
      !password.trim() ||
      !cpassword.trim() ||
      !firstname.trim() ||
      !lastname.trim()
    ) {
      Toast.show({
        type: "info",
        text1: "Error",
        text2: "Please fill in all fields",
      });
      setLoading(false);
      return;
    }

    if (password !== cpassword) {
      Toast.show({
        type: "error",
        text1: "Passwords do not match",
      });
      setLoading(false);
      return;
    }

    try {
      console.log("Starting sign-up process...");
      setLoading(true);
      const userCredential = await auth().createUserWithEmailAndPassword(
        email,
        password
      );
      console.log("Signing up...");

      const user = userCredential.user;
      await user.sendEmailVerification();

      const profilePictureUrl = await uploadProfileImage(user.uid);

      await firestore()
        .collection("users")
        .doc(user.uid)
        .set({
          email: user.email,
          firstname: firstname.trim(),
          lastname: lastname.trim(),
          pfpUrl: profilePictureUrl || "",
        });

      await AsyncStorage.setItem(
        "userData",
        JSON.stringify(userCredential.user.uid)
      );

      Toast.show({
        type: "info",
        text1: "Verification email sent",
        text2: "Check your inbox for the verification email",
      });

      router.replace("/tabs/home?signUpWEmail=true");
      console.log("Navigated to home page");
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        Toast.show({
          type: "error",
          text1: "Email is already in use",
          text2: "Try logging in instead",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Error signing up",
          text2: error.message,
        });
      }
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const signUpWGoogle = async () => {
    setLoading(true);
    try {
      console.log("Starting Google sign-in process...");

      await GoogleSignin.signOut();
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      const userInfo = await GoogleSignin.signIn();
      console.log("Google Sign-In Success:", userInfo);

      if (!userInfo.data.idToken) {
        throw new Error("No ID Token received");
      }

      const googleCredential = auth.GoogleAuthProvider.credential(
        userInfo.data.idToken
      );
      const userCredential = await auth().signInWithCredential(
        googleCredential
      );

      const user = userCredential.user;

      const userDoc = firestore().collection("users").doc(user.uid);
      const docSnap = await userDoc.get();

      if (docSnap.exists) {
        Toast.show({
          type: "info",
          text1: "User already present",
          text2: "Try signing in instead",
        });
      } else {
        await userDoc.set({
          email: user.email,
          firstname: user.displayName.split(" ")[0],
          lastname: user.displayName.split(" ")[1],
          pfpUrl: user.photoURL,
        });
        console.log("User signed in:", userCredential.user);
        await AsyncStorage.setItem(
          "userData",
          JSON.stringify(userCredential.user.uid)
        );
        Toast.show({
          type: "success",
          text1: "Signed up with Google!",
          text2: "Redirecting...",
        });
        router.replace("/tabs/home");
      }
    } catch (error) {
      console.error("Error signing up:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAwareScrollView>
        <View style={styles.inputContainer}>
          <Text style={styles.title}>Sign Up</Text>

          <Pressable style={styles.profileImageContainer} onPress={pickImage}>
            {profileImage ? (
              <Image
                source={{ uri: profileImage.uri }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.profilePlaceholder}>
                <MaterialIcons
                  name="add-a-photo"
                  size={32}
                  color={colors.lightgray}
                />
              </View>
            )}
          </Pressable>
          <Text style={styles.addPhotoText}>Add profile photo</Text>

          <CustomInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <CustomInput
            label="First Name"
            value={firstname}
            onChangeText={setFirstname}
            autoCapitalize="words"
          />

          <CustomInput
            label="Last Name"
            value={lastname}
            onChangeText={setLastname}
            autoCapitalize="words"
          />

          <CustomInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <CustomInput
            label="Confim password"
            value={cpassword}
            onChangeText={setcPassword}
            secureTextEntry
          />
        </View>
        <MainButton
          title="Create account"
          loading={loading}
          disabled={loading}
          onPress={signUpWEmailnPass}
          style={styles.button}
        />

        <CustomDivider text="OR" />

        <Button
          mode="contained"
          icon={() => <FontAwesome name="google" size={20} color="white" />}
          onPress={() => signUpWGoogle()}
          loading={loading}
          disabled={loading}
          style={{
            backgroundColor: colors.accent,
            marginTop: 10,
            paddingVertical: 5,
            borderRadius: 80,
          }}
        >
          <Text style={{ fontFamily: "AptosBold" }}>Sign Up with Google</Text>
        </Button>

        <Pressable
          style={styles.signinbutton}
          onPress={() => router.push("/auth/sign-in")}
        >
          <Text style={styles.signintext}>
            Already have an account? Sign In
          </Text>
        </Pressable>
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
  },
  inputContainer: {
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontFamily: "AptosDisplayBold",
  },
  profileImageContainer: {
    width: 90,
    height: 90,
    borderRadius: 50,
    marginBottom: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.lightgray,
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  profilePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: colors.offwhite,
    justifyContent: "center",
    alignItems: "center",
  },
  addPhotoText: {
    fontFamily: "Aptos",
    fontSize: 14,
    color: colors.darkgray,
    marginBottom: 20,
  },
  button: {
    borderRadius: 80,
  },
  signintext: {
    color: colors.black,
    textAlign: "center",
    fontFamily: "AptosSemiBold",
  },
  signinbutton: {
    paddingVertical: 5,
  },
});
