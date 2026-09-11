import { useEffect } from "react";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { MusicDirector } from "@/game/music-director";
import { GameProvider } from "@/game/game-context";
import { palette } from "@/game/theme";

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Pixel: require("../../assets/game/fonts/dogicapixel.otf"),
    PixelBold: require("../../assets/game/fonts/dogicapixelbold.otf"),
    PixelBody: require("../../assets/game/fonts/PixeloidSans.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) void SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={{ backgroundColor: palette.navy, flex: 1 }}>
      <GameProvider>
        <MusicDirector />
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            animation: "fade",
            contentStyle: { backgroundColor: palette.navy },
          }}
        />
      </GameProvider>
    </GestureHandlerRootView>
  );
}
