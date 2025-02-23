import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet } from "react-native";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";

import CustomHeader from "../../../../components/CustomHeader";
import CustomInput from "../../../../components/CustomInput";
import MainButton from "../../../../components/MainButton";
import colors from "../../../../utils/colors";

export default function Feedback() {
  const [feedback, setFeedback] = useState("");

  const handleSubmit = () => {
    if (!feedback.trim()) {
      Alert.alert("Error", "Please enter your feedback.");
      return;
    }

    const feedbackData = {
      uid: auth().currentUser.uid,
      feedback,
      createdAt: firestore.FieldValue.serverTimestamp(),
    };

    firestore()
      .collection("feedbacks")
      .add(feedbackData)
      .then(() => {
        Alert.alert("Thank you!", "Your feedback has been submitted.");
        setFeedback("");
      })
      .catch((error) => {
        Alert.alert("Error", error.message);
      });
  };

  return (
    <>
      <CustomHeader title="Feedback" />
      <ScrollView contentContainerStyle={styles.container}>
        <CustomInput
          label="Your Feedback"
          value={feedback}
          onChangeText={setFeedback}
          multiline={true}
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
