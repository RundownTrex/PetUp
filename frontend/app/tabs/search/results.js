import React from "react";
import { View, Text, StyleSheet } from "react-native";

const Results = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Search Results</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
});

export default Results;
