import React, { useState } from "react";
import { View, Alert, ScrollView, StyleSheet } from "react-native";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";

import CustomHeader from "../../../../components/CustomHeader";
import CustomInput from "../../../../components/CustomInput";
import MainButton from "../../../../components/MainButton";
import colors from "../../../../utils/colors";

export default function ContactSupport() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = () => {
    if (!subject || !message) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    const supportRequest = {
      uid: auth().currentUser.uid,
      subject,
      message,
      createdAt: firestore.FieldValue.serverTimestamp(),
    };

    firestore()
      .collection("supportRequests")
      .add(supportRequest)
      .then(() => {
        Alert.alert("Submitted", "Your support request has been submitted.");
        setSubject("");
        setMessage("");
      })
      .catch((error) => {
        Alert.alert("Error", error.message);
      });
  };

  return (
    <>
      <CustomHeader title="Contact Support" />
      <ScrollView contentContainerStyle={styles.container}>
        <CustomInput
          label="Subject"
          value={subject}
          onChangeText={setSubject}
        />
        <CustomInput
          label="Your Message"
          value={message}
          onChangeText={setMessage}
          multiline={true}
          numberOfLines={4}
        />
        <MainButton title="Submit" onPress={handleSubmit} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: colors.white,
  },
});
