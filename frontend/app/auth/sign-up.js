import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Button, Divider } from "react-native-paper";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesome } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

import CustomInput from "../../components/CustomInput";
import MainButton from "../../components/MainButton";
import CustomDivider from "../../components/CustomDivider";
import colors from "../../utils/colors";

import { GOOGLE_WEB_CLIENT_ID } from "@env";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
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

  const signUpWEmailnPass = async () => {
    setLoading(true);
    if (!email.trim() || !password.trim()) {
      Toast.show({
        type: "info",
        text1: "Error",
        text2: "Please fill in all fields",
      });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const userCredential = await auth().createUserWithEmailAndPassword(
        email,
        password
      );
      console.log("Signing up...");
      await AsyncStorage.setItem(
        "userData",
        JSON.stringify(userCredential.user.uid)
      );
      console.log("Signed up!");
      router.replace("/tabs");
      console.log("Navigated to home page");
    } catch (error) {
      console.error("Error signing up: ", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message,
      });
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
        router.replace("/tabs");
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
      <View style={styles.inputContainer}>
        <Text style={styles.title}>Sign Up</Text>
        <CustomInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <CustomInput
          label="Password"
          value={password}
          onChangeText={setPassword}
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
        Sign Up with Google
      </Button>

      <Pressable
        style={styles.signinbutton}
        onPress={() => router.replace("/auth/sign-in")}
      >
        <Text style={styles.signintext}>Already have an account? Sign In</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  inputContainer: {
    alignItems: "center",
  },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  button: { borderRadius: 80 },
  signintext: {
    color: colors.blacktext,
    fontWeight: "500",
    textAlign: "center",
  },

  signinbutton: {
    paddingVertical: 5,
  },
});
