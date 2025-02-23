import React from "react";
import { View, Text, StyleSheet, Pressable, Linking } from "react-native";
import CustomHeader from "../../../../components/CustomHeader";
import colors from "../../../../utils/colors";
import { FontAwesome, Ionicons } from "@expo/vector-icons";

export default function SocialMedia() {
  const socials = [
    {
      name: "Instagram",
      icon: <Ionicons name="logo-instagram" size={32} color="#E1306C" />,
      link: "https://www.instagram.com/aditya_goriwale/",
    },
    {
      name: "Twitter",
      icon: <FontAwesome name="twitter" size={32} color="#1DA1F2" />,
      link: "https://x.com/RundownTrex",
    },
    {
      name: "YouTube",
      icon: <FontAwesome name="youtube-play" size={32} color="#FF0000" />,
      link: "https://www.youtube.com/@rundowntrex",
    },
  ];

  const handlePress = async (url) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        alert("Unsupported URL: " + url);
      }
    } catch (error) {
      alert("Error: " + error);
    }
  };

  return (
    <>
      <CustomHeader title="Follow us on Social Media" />
      <View style={styles.container}>
        {socials.map((social, index) => (
          <Pressable
            key={index}
            style={styles.menuItem}
            onPress={() => handlePress(social.link)}
          >
            <View style={styles.leftContainer}>
              {social.icon}
              <Text style={styles.menuText}>{social.name}</Text>
            </View>
            <Ionicons
              name="chevron-forward-outline"
              size={24}
              color={colors.black}
            />
          </Pressable>
        ))}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomColor: colors.lightgray,
    borderBottomWidth: 1,
  },
  leftContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuText: {
    marginLeft: 16,
    fontSize: 16,
    color: colors.black,
    fontFamily: "Aptos",
  },
});
