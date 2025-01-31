import React from "react";
import { View, Text } from "react-native";

import colors from "../utils/colors";

export default function CustomDivider({ text }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        marginTop: 20,
      }}
    >
      <View
        style={{
          flex: 1,
          height: 1,
          backgroundColor: colors.darkgray,
        }}
      />
      <View>
        <Text
          style={{
            width: 50,
            textAlign: "center",
            color: colors.darkgray,
          }}
        >
          {text}
        </Text>
      </View>
      <View
        style={{
          flex: 1,
          height: 1,
          backgroundColor: colors.darkgray,
        }}
      />
    </View>
  );
}
