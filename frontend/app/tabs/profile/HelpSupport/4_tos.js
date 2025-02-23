import React from "react";
import { ScrollView, Text, StyleSheet } from "react-native";

import colors from "../../../../utils/colors";
import CustomHeader from "../../../../components/CustomHeader";

export default function TOS() {
  return (
    <>
      <CustomHeader title="Terms of Service" />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Terms of Service</Text>

        <Text style={styles.sectionHeader}>1. Introduction</Text>
        <Text style={styles.paragraph}>
          Welcome to PetUp. These Terms of Service govern your use of our app.
          By using our services, you agree to these terms.
        </Text>

        <Text style={styles.sectionHeader}>2. User Responsibilities</Text>
        <Text style={styles.paragraph}>
          You are responsible for maintaining the confidentiality of your
          account and for all activities that occur under your account.
        </Text>

        <Text style={styles.sectionHeader}>3. License</Text>
        <Text style={styles.paragraph}>
          We grant you a limited, non-exclusive, non-transferable license to use
          our app, subject to these Terms. You may only access the
          functionalities provided by our service.
        </Text>

        <Text style={styles.sectionHeader}>4. Prohibited Activities</Text>
        <Text style={styles.paragraph}>
          You agree not to misuse our services, including engaging in prohibited
          activities such as unauthorized data collection, distribution of
          harmful content, or interfering with the integrity of the application.
        </Text>

        <Text style={styles.sectionHeader}>5. Termination</Text>
        <Text style={styles.paragraph}>
          We reserve the right to suspend or terminate your account at any time
          for violations of these Terms or any harmful activity.
        </Text>

        <Text style={styles.sectionHeader}>6. Changes to Terms</Text>
        <Text style={styles.paragraph}>
          Our Terms of Service may change from time to time. Continued use of
          the app constitutes acceptance of any updated terms.
        </Text>

        <Text style={styles.sectionHeader}>7. Governing Law</Text>
        <Text style={styles.paragraph}>
          These Terms are governed by the laws of your jurisdiction. Any
          disputes will be resolved under your local laws.
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
    fontFamily: "AptosBold",
    color: colors.black,
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 18,
    fontFamily: "AptosSemiBold",
    color: colors.black,
    marginTop: 10,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 14,
    fontFamily: "Aptos",
    color: colors.black,
    lineHeight: 20,
    marginBottom: 12,
  },
});
