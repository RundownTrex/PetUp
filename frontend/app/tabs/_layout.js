import { useState, useEffect } from "react";
import { Tabs, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, usePathname } from "expo-router";
import messaging from "@react-native-firebase/messaging";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";

import { BottomSheetProvider } from "../../contexts/BottomSheetContext";
import CustomPopup from "../../components/CustomPopup";
import CustomTabBar from "../../components/CustomTabBar";
import colors from "../../utils/colors";

globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = true;

export default function TabLayout() {
  const { signUpWEmail } = useLocalSearchParams();
  const [showPopup, setShowPopup] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (signUpWEmail === "true") {
      setShowPopup(true);
    }
  }, [signUpWEmail]);

  useEffect(() => {
    console.log("Current path:", pathname);
  }, [pathname]);

  useEffect(() => {
    const saveFCMToken = async () => {
      try {
        const currentUser = auth().currentUser;

        if (!currentUser) {
          console.log("No user signed in, can't save FCM token");
          return;
        }

        const token = await messaging().getToken();
        console.log("FCM Token:", token);

        await firestore().collection("users").doc(currentUser.uid).update({
          fcmToken: token,
          lastActive: firestore.FieldValue.serverTimestamp(),
        });

        console.log("FCM token saved to Firestore");

        const unsubscribe = messaging().onTokenRefresh(async (newToken) => {
          await firestore().collection("users").doc(currentUser.uid).update({
            fcmToken: newToken,
          });
          console.log("FCM token refreshed and saved");
        });

        return unsubscribe;
      } catch (error) {
        console.error("Error saving FCM token:", error);
      }
    };

    saveFCMToken();
  }, []);

  return (
    <>
      <CustomPopup
        visible={showPopup}
        onDismiss={() => setShowPopup(false)}
        text1="Verify your email"
        text2="Please check your email to verify your account"
      />
      <BottomSheetProvider>
        <Tabs
          tabBar={(props) => <CustomTabBar {...props} />}
          screenOptions={{
            headerShown: false,
            tabBarHideOnKeyboard: true,
          }}
        >
          <Tabs.Screen name="home" />
          <Tabs.Screen name="search" />
          <Tabs.Screen name="chat" />
          <Tabs.Screen name="profile" />
        </Tabs>
      </BottomSheetProvider>
    </>
  );
}
