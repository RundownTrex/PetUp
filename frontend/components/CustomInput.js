import React, { useState } from "react";
import { TextInput } from "react-native-paper";
import { StyleSheet } from "react-native";

import colors from "../utils/colors";

export default function CustomInput({
  label,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = "default",
  autoCapitalize = "none",
  style,
  disable,
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <TextInput
      label={label}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry && !showPassword}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
      mode="outlined"
      style={[
        styles.input,
        { backgroundColor: disable ? colors.lightwhite : colors.white },
        style,
      ]}
      theme={{ colors: { primary: colors.accent } }}
      editable={!disable}
      right={
        secureTextEntry ? (
          <TextInput.Icon
            icon={showPassword ? "eye" : "eye-off"}
            onPress={() => setShowPassword(!showPassword)}
          />
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  input: {
    width: "100%",
    marginBottom: 15,
    height: 50,
    fontFamily: "Aptos",
  },
});
