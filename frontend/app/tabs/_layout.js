import { useState, useEffect } from "react";
import { Tabs, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, usePathname } from "expo-router";

import CustomPopup from "../../components/CustomPopup";
import CustomTabBar from "../../components/CustomTabBar";
import colors from "../../utils/colors";

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

  return (
    <>
      <CustomPopup
        visible={showPopup}
        onDismiss={() => setShowPopup(false)}
        text1="Verify your email"
        text2="Please check your email to verify your account"
      />
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
    </>
  );
}
