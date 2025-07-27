import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" backgroundColor="#f5f5f0" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: "#f5f5f0",
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: "Murmure",
          }}
        />
      </Stack>
    </>
  );
}
