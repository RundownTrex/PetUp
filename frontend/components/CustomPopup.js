import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Modal, Portal, Button } from "react-native-paper";

export default function CustomPopup({ visible, onDismiss, text1, text2 }) {
  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContainer}
      >
        <Text style={styles.title}>{text1}</Text>
        <Text style={styles.message}>{text2}</Text>
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
