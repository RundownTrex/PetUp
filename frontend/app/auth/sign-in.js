import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Button } from "react-native-paper";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesome } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import CustomInput from "../../components/CustomInput";
import MainButton from "../../components/MainButton";
import CustomDivider from "../../components/CustomDivider";
import colors from "../../utils/colors";

import { GOOGLE_WEB_CLIENT_ID } from "@env";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: GOOGLE_WEB_CLIENT_ID,
    });
  }, []);

  const signInWEmail = async () => {
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
      console.log("First try block");
      const userCredential = await auth().signInWithEmailAndPassword(
        email.trim(),
        password.trim()
      );

      console.log("Signing in...");

      const user = userCredential.user;
      const userDoc = await firestore().collection("users").doc(user.uid).get();

      if (userDoc.exists) {
        const userData = userDoc.data();
        await AsyncStorage.setItem(
          "userData",
          JSON.stringify(userCredential.user.uid)
        );
        console.log("Signed in!");
        Toast.show({
          type: "success",
          text1: "Logged in successfully",
          text2: "Redirecting to home screen...",
        });
        router.replace("/tabs/");
        console.log("Navigated to home page");
      } else {
        await auth().signOut();
        await AsyncStorage.removeItem("userData");
        Toast.show({
          type: "error",
          text1: "Account not found",
          text2: "Try registering for a new account",
        });
        setLoading(false);
      }
    } catch (error) {
      console.error("Error signing in: ", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message,
      });

      setEmail(() => "");
      setPassword(() => "");
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const signInWGoogle = async () => {
    setLoading(true);
    try {
      await GoogleSignin.signOut();
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
      const userInfo = await GoogleSignin.signIn({
        prompt: "select_account",
      });

      if (!userInfo.data.idToken) {
        throw new Error("No ID Token received");
      }

      const googleCredential = auth.GoogleAuthProvider.credential(
        userInfo.data.idToken
      );

      console.log(userInfo);

      const userCredential = await auth().signInWithCredential(
        googleCredential
      );

      const userDoc = await firestore()
        .collection("users")
        .doc(userCredential.user.uid)
        .get();

      if (userDoc.exists) {
        const userData = userDoc.data();
        await AsyncStorage.setItem(
          "userData",
          JSON.stringify(userCredential.user.uid)
        );
        console.log("Signed in with Google");
        router.replace("/tabs/");
      } else {
        await auth().signOut();
        await AsyncStorage.removeItem("userData");
        Toast.show({
          type: "error",
          text1: "Account not found",
          text2: "Try registering for a new account",
        });
        setLoading(false);
      }
    } catch (error) {
      console.error("Error signing in with Google: ", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const forgetPassword = async () => {
    setLoading(true);
    if (!email.trim()) {
      Toast.show({
        type: "info",
        text1: "Error",
        text2: "Please enter your email address",
      });
      setLoading(false);
      return;
    }

    try {
      await auth().sendPasswordResetEmail(email.trim());
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Password reset email sent",
      });
    } catch (error) {
      console.error("Error sending password reset email: ", error);
      Toast.show({
        type: "error",
        text1: "Error sending password reset email",
        text2: "Ensure the email in the field is right or try again later",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAwareScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.inputContainer}>
          <Text style={styles.title}>Sign In</Text>
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
          <Pressable onPress={forgetPassword}>
            <Text style={styles.signintext}>Forgot password?</Text>
          </Pressable>
        </View>
        <MainButton
          onPress={signInWEmail}
          title="Sign In"
          style={styles.button}
          loading={loading}
          disabled={loading}
        />
        <CustomDivider text="OR" />
        <Button
          icon={() => <FontAwesome name="google" size={24} color="white" />}
          buttonColor={colors.accent}
          mode="contained"
          onPress={signInWGoogle}
          style={{ marginTop: 20 }}
          loading={loading}
          disabled={loading}
        >
          Sign in with Google
        </Button>

        <Pressable
          style={styles.signinbutton}
          onPress={() => router.push("/auth/sign-up")}
        >
          <Text style={styles.signintext}>Don't have an account? Sign Up</Text>
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
  },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  inputContainer: { alignItems: "center" },
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
