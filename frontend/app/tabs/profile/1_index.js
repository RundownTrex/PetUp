import React, { useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  Image,
  ScrollView,
  Pressable,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import auth from "@react-native-firebase/auth";
import { Ionicons, MaterialIcons, Feather } from "@expo/vector-icons";

import CustomHeader from "../../../components/CustomHeader";
import colors from "../../../utils/colors";

export default function ProfilePage() {
  const router = useRouter();
  const user = auth().currentUser;
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const logout = async () => {
    try {
      await auth().signOut();
      await AsyncStorage.removeItem("userData");
      router.replace("/landing");
      console.log("User signed out successfully");
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <>
      <CustomHeader title="Profile" />

      <ScrollView
        style={{ flex: 1, backgroundColor: colors.white }}
        contentContainerStyle={{ flexGrow: 1, padding: 20 }}
      >
        <View style={styles.profileContainer}>
          <View style={styles.profileInfoContainer}>
            <Image
              source={{
                uri: user?.photoURL || "https://via.placeholder.com/100/jpg",
              }}
              style={styles.profileImage}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {user?.displayName || "Anonymous"}
              </Text>
              <Text style={styles.profileEmail}>
                {user?.email || "No Email Provided"}
              </Text>
            </View>
          </View>
          {/* <MaterialIcons name="keyboard-arrow-right" size={24} color="black" /> */}
        </View>

        <View style={styles.menuContainer}>
          <Pressable
            style={styles.menuItem}
            onPress={() => router.push("tabs/profile/2_myprofile")}
          >
            <Ionicons name="person-outline" size={24} color="black" />
            <Text style={styles.menuText}>My Profile</Text>
            <MaterialIcons
              name="keyboard-arrow-right"
              size={24}
              color="black"
            />
          </Pressable>

          <Pressable
            style={styles.menuItem}
            onPress={() => router.push("tabs/profile/3_mypets")}
          >
            <Ionicons name="paw-outline" size={24} color="black" />
            <Text style={styles.menuText}>My Pets</Text>
            <MaterialIcons
              name="keyboard-arrow-right"
              size={24}
              color="black"
            />
          </Pressable>

          <Pressable
            style={styles.menuItem}
            onPress={() => router.push("tabs/profile/4_favourites")}
          >
            <Ionicons name="heart-outline" size={24} color="black" />
            <Text style={styles.menuText}>Favourites</Text>
            <MaterialIcons
              name="keyboard-arrow-right"
              size={24}
              color="black"
            />
          </Pressable>

          <Pressable
            style={styles.menuItem}
            onPress={() => router.push("tabs/profile/5_accountSecurity")}
          >
            <Ionicons name="shield-checkmark-outline" size={24} color="black" />
            <Text style={styles.menuText}>Account & Security</Text>
            <MaterialIcons
              name="keyboard-arrow-right"
              size={24}
              color="black"
            />
          </Pressable>

          <Pressable style={styles.menuItem}>
            <Ionicons name="help-circle-outline" size={24} color="black" />
            <Text style={styles.menuText}>Help & Support</Text>
            <MaterialIcons
              name="keyboard-arrow-right"
              size={24}
              color="black"
            />
          </Pressable>
        </View>

        <Pressable
          style={styles.menuItem}
          onPress={() => setShowLogoutConfirm(true)}
        >
          <Ionicons name="log-out-outline" size={24} color={colors.red} />
          <Text style={[styles.menuText, { color: colors.red }]}>Logout</Text>
        </Pressable>
      </ScrollView>

      <Modal
        visible={showLogoutConfirm}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLogoutConfirm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.bottomSheet}>
            <Text style={styles.bottomSheetTitle}>Logout</Text>
            <Text style={styles.bottomSheetText}>
              Are you sure you want to log out?
            </Text>
            <View style={styles.bottomSheetButtons}>
              <Pressable
                style={[styles.bottomSheetButton, styles.cancelButton]}
                onPress={() => setShowLogoutConfirm(false)}
              >
                <Text style={styles.bottomSheetButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.bottomSheetButton, styles.confirmButton]}
                onPress={() => {
                  setShowLogoutConfirm(false);
                  logout();
                }}
              >
                <Text
                  style={[
                    styles.bottomSheetButtonText,
                    { color: colors.white },
                  ]}
                >
                  Logout
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: colors.white,
  },
  header: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightgray,
  },
  profileInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 60,
  },
  profileInfo: {
    marginLeft: 10,
    alignSelf: "center",
  },
  profileName: {
    fontSize: 18,
    fontFamily: "UbuntuBold",
  },
  profileEmail: {
    fontSize: 14,
    color: "gray",
    fontFamily: "Aptos",
  },
  menuContainer: {
    width: "100%",
    marginTop: 20,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
  },
  menuText: {
    flex: 1,
    marginHorizontal: 10,
    fontSize: 16,
    color: colors.black,
    fontFamily: "Aptos",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  bottomSheet: {
    backgroundColor: colors.white,
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  bottomSheetTitle: {
    fontSize: 18,
    marginBottom: 10,
    fontFamily: "AptosBold",
    textAlign: "center",
    color: colors.red,
  },
  bottomSheetText: {
    fontSize: 16,
    marginBottom: 20,
    fontFamily: "Aptos",
    textAlign: "center",
  },
  bottomSheetButtons: {
    flexDirection: "row",
  },
  bottomSheetButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 500,
    marginLeft: 10,
    flex: 1,
  },
  cancelButton: {
    backgroundColor: colors.lightwhite,
  },
  confirmButton: {
    backgroundColor: colors.accent,
  },
  bottomSheetButtonText: {
    color: colors.black,
    fontSize: 16,
    textAlign: "center",
    fontFamily: "Aptos",
  },
});
