import { Stack } from "expo-router";
import CustomHeader from "../../components/CustomHeader";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        header: ({ route }) => <CustomHeader title="" />,
        animation: "ios_from_right",
      }}
    />
  );
}
