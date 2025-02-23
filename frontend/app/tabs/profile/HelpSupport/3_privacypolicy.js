import React from "react";
import { ScrollView, Text, StyleSheet } from "react-native";

import colors from "../../../../utils/colors";
import CustomHeader from "../../../../components/CustomHeader";

export default function PrivacyPolicy() {
  return (
    <>
      <CustomHeader title="Privacy Policy" />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Privacy Policy</Text>
        <Text style={styles.paragraph}>
          This Privacy Policy explains how we collect, use, disclose, and
          safeguard your information when you use our mobile application. Please
          read this policy carefully.
        </Text>
        <Text style={styles.subHeader}>Information Collection</Text>
        <Text style={styles.paragraph}>
          We collect personal information that you provide directly to us. This
          may include your name, email address, and other personal details
          necessary to create and maintain your account.
        </Text>
        <Text style={styles.subHeader}>Use of Information</Text>
        <Text style={styles.paragraph}>
          Your information is used to provide and improve our services,
          communicate with you, and comply with legal obligations. We will never
          sell your data without your consent.
        </Text>
        <Text style={styles.subHeader}>Data Sharing</Text>
        <Text style={styles.paragraph}>
          We may share your information with trusted third-party service
          providers, but only to the extent necessary and in accordance with
          this Privacy Policy.
        </Text>
        <Text style={styles.subHeader}>Your Rights</Text>
        <Text style={styles.paragraph}>
          You have the right to access, correct, or delete your personal data.
          For more information, please contact our support team.
        </Text>
        <Text style={styles.subHeader}>Contact Us</Text>
        <Text style={styles.paragraph}>
          If you have any questions about this Privacy Policy, please contact us
          at [petupsupport@gmail.com].
        </Text>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: colors.white,
  },
  header: {
    fontSize: 24,
    marginBottom: 16,
    color: colors.black,
    fontFamily: "AptosBold",
  },
  subHeader: {
    fontSize: 18,
    fontFamily: "AptosSemiBold",
    marginTop: 16,
    marginBottom: 8,
    color: colors.black,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.black,
    marginBottom: 12,
    fontFamily: "Aptos",
  },
});
