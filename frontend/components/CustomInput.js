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
  multiline = false,
  numberOfLines = 1,
  maxLength,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const initialHeight = multiline
    ? styles.multilineInput.height
    : styles.input.height;
  const [inputHeight, setInputHeight] = useState(initialHeight);

  return (
    <TextInput
      label={label}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry && !showPassword}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
      mode="outlined"
      multiline={multiline}
      numberOfLines={numberOfLines}
      maxLength={maxLength}
      onContentSizeChange={(e) => {
        if (multiline) {
          setInputHeight(
            Math.max(e.nativeEvent.contentSize.height, initialHeight)
          );
        }
      }}
      style={[
        styles.input,
        multiline && { height: inputHeight, textAlignVertical: "top" },
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
  multilineInput: {
    height: 80,
    // textAlignVertical ensures the text starts from the top as height increases
    textAlignVertical: "top",
  },
});
