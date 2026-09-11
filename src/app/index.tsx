import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { useGame } from "@/game/game-context";
import { fonts, palette } from "@/game/theme";
import { BattleScreen } from "@/game/screens/battle-screen";
import { CaptureScreen } from "@/game/screens/capture-screen";
import { CollectionScreen } from "@/game/screens/collection-screen";
import { CompleteScreen } from "@/game/screens/complete-screen";
import { MapScreen } from "@/game/screens/map-screen";
import { OnboardingScreen } from "@/game/screens/onboarding-screen";
import { SettingsScreen } from "@/game/screens/settings-screen";
import { TrainerScreen } from "@/game/screens/trainer-screen";

export default function GameRoot() {
  const { hydrated, screen } = useGame();

  if (!hydrated) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={palette.aqua} size="large" />
        <Text style={styles.loadingText}>LOADING FIELD GUIDE</Text>
      </View>
    );
  }

  if (screen === "onboarding") return <OnboardingScreen />;
  if (screen === "trainer") return <TrainerScreen />;
  if (screen === "battle") return <BattleScreen />;
  if (screen === "capture") return <CaptureScreen />;
  if (screen === "collection") return <CollectionScreen />;
  if (screen === "settings") return <SettingsScreen />;
  if (screen === "complete") return <CompleteScreen />;
  return <MapScreen />;
}

const styles = StyleSheet.create({
  loading: {
    alignItems: "center",
    backgroundColor: palette.navy,
    flex: 1,
    gap: 18,
    justifyContent: "center",
  },
  loadingText: {
    color: palette.cream,
    fontFamily: fonts.pixelBold,
    fontSize: 10,
  },
});
