import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function AppLayout() {
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
        {/* Ajoutez d'autres screens de votre app si nécessaire */}
      </Stack>
    </>
  );
}
