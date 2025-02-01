import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Modal, Portal, Button } from "react-native-paper";

export default function CustomPopup({ visible, onDismiss }) {
  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContainer}
      >
        <Text style={styles.title}>Verify your email</Text>
        <Text style={styles.message}>
          Verify your email to use Google sign in along with email sign in.
        </Text>
        <Button mode="contained" onPress={onDismiss} style={styles.button}>
          Got It!
        </Button>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: "white",
    padding: 20,
    margin: 20,
    borderRadius: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 15,
  },
  button: {
    alignSelf: "center",
  },
});
