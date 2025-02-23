import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import auth from "@react-native-firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import firestore from "@react-native-firebase/firestore";

import CustomHeader from "../../../components/CustomHeader";
import CustomInput from "../../../components/CustomInput";
import MainButton from "../../../components/MainButton";
import colors from "../../../utils/colors";
import { useRouter } from "expo-router";

export default function AccountSecurity() {
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const user = auth().currentUser;
  const isEmailUser =
    user && user.providerData.some((p) => p.providerId === "password");

  const reauthenticate = (password) => {
    const credential = auth.EmailAuthProvider.credential(user.email, password);
    return user.reauthenticateWithCredential(credential);
  };

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill all fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New password and confirmation do not match.");
      return;
    }
    auth()
      .currentUser.updatePassword(newPassword)
      .then(() => {
        Alert.alert("Success", "Password updated successfully!");
      })
      .catch((error) => {
        Alert.alert("Error", error.message);
      });
  };

  const handleDeleteAccount = () => {
    const deleteAccount = () => {
      firestore()
        .collection("users")
        .doc(user.uid)
        .delete()
        .then(() => {
          user
            .delete()
            .then(async () => {
              Alert.alert("Account Deleted", "Your account has been deleted.");
              await AsyncStorage.removeItem("userData");
              router.replace("/landing");
            })
            .catch((error) => {
              Alert.alert("Error", error.message);
            });
        })
        .catch((error) => {
          Alert.alert("Error deleting user data", error.message);
        });
    };

    if (isEmailUser) {
      if (!currentPassword) {
        Alert.alert(
          "Reauthentication Required",
          "Please enter your current password to delete your account."
        );
        return;
      }
      reauthenticate(currentPassword)
        .then(() => {
          deleteAccount();
        })
        .catch((error) => {
          Alert.alert("Reauthentication failed", error.message);
        });
    } else {
      deleteAccount();
    }
  };

  return (
    <>
      <CustomHeader title="Account & Security" />
      <View style={styles.container}>
        {isEmailUser ? (
          <>
            <Text style={styles.sectionTitle}>Change Password</Text>
            <CustomInput
              value={currentPassword}
              onChangeText={setCurrentPassword}
              label="Current Password"
              secureTextEntry={true}
            />
            <CustomInput
              value={newPassword}
              onChangeText={setNewPassword}
              label="New Password"
              secureTextEntry={true}
            />
            <CustomInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              label="Confirm New Password"
              secureTextEntry={true}
            />
            <MainButton
              title="Update Password"
              onPress={handleChangePassword}
            />
          </>
        ) : (
          <View>
            <Text style={styles.sectionTitle}>Account Security</Text>
            <Text style={styles.infoText}>
              You are signed in using Google. Password changes are managed
              through your Google account.
            </Text>
          </View>
        )}
        {/* Delete Account Option */}
        <View style={styles.deleteContainer}>
          <MainButton
            title="Delete Account"
            onPress={handleDeleteAccount}
            style={styles.deleteButton}
          />
          <Text style={styles.deleteInfo}>
            Warning: This action cannot be undone.
          </Text>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexGrow: 1,
    backgroundColor: colors.white,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "AptosBold",
    marginBottom: 10,
  },
  infoText: {
    fontSize: 16,
    fontFamily: "Aptos",
    color: colors.darkgray,
    marginBottom: 20,
  },
  deleteContainer: {
    marginTop: 40,
    alignItems: "center",
  },
  deleteButton: {
    backgroundColor: colors.red,
  },
  deleteInfo: {
    marginTop: 10,
    color: colors.darkgray,
    fontSize: 14,
    fontFamily: "Aptos",
    textAlign: "center",
  },
});
