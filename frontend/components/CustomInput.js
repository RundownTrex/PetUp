import React from "react";
import { TextInput } from "react-native-paper";
import { StyleSheet } from "react-native";

import colors from "../utils/colors";

export default function CustomInput({
  label,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType = "default",
  autoCapitalize = "none",
  style,
}) {
  return (
    <TextInput
      label={label}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
      mode="outlined"
      style={[styles.input, style]}
      theme={{ colors: { primary: colors.accent } }}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    width: "100%",
    marginBottom: 15,
    height: 50,
  },
});
