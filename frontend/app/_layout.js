import { Stack } from "expo-router";
import { StatusBar, StyleSheet } from "react-native";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { PaperProvider, DefaultTheme } from "react-native-paper";
import Toast from "react-native-toast-message";

import colors from "../utils/colors";

const customTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.accent,
    background: colors.white,
    text: colors.black,
    placeholder: "#aaa",
  },
};

export default function Layout() {
  return (
    <PaperProvider theme={customTheme}>
      <GestureHandlerRootView style={styles.container}>
        <BottomSheetModalProvider>
          <StatusBar barStyle="dark-content" />
          <Stack
            screenOptions={{ headerShown: false, animation: "ios_from_right" }}
          />
          <Toast />
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
