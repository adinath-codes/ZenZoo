import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        {/* This locks in your main Zen Zoo screen without a header */}
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>

      {/* This ensures the time/battery icons at the top of the phone match your theme */}
      <StatusBar style="light" />
    </ThemeProvider>
  );
}
