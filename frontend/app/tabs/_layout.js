import { useState, useEffect } from "react";
import { Tabs, useLocalSearchParams } from "expo-router";
import CustomPopup from "../../components/CustomPopup";

export default function TabLayout() {
  const { signUpWEmail } = useLocalSearchParams();
  const [showPopup, setShowPopup] = useState(false);

  const isSignUpWithEmail = signUpWEmail === "true";

  useEffect(() => {
    // Check if signUpWEmail is "true"
    console.log("signUpWEmail:", signUpWEmail);
    if (signUpWEmail === "true") {
      console.log("Signed up with email and password");
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
      <Tabs>
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: "Search",
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
          }}
        />
      </Tabs>
    </>
  );
}
