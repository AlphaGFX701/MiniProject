import { Image, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { echoOrb } from "../assets";
import { GameButton } from "../components/game-ui";
import { PanningMountainBackground } from "../components/panning-mountain-background";
import { useGame } from "../game-context";
import { fonts, palette } from "../theme";

export function PressToPlayScreen() {
  const { continueFromTitle, save } = useGame();

  return (
    <PanningMountainBackground scrimOpacity={0.66}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.hero}>
            <Image source={echoOrb} style={styles.orb} />
            <Text style={styles.eyebrow}>KMUTNB CAMPUS ADVENTURE</Text>
            <Text style={styles.title}>{"ECHO\nHUNT"}</Text>
            <Text style={styles.subtitle}>CAMPUS LEGENDS</Text>
          </View>
          <View style={styles.footer}>
            {save.playerName ? (
              <Text style={styles.welcome}>WELCOME BACK, {save.playerName.toUpperCase()}</Text>
            ) : (
              <Text style={styles.welcome}>YOUR EXPEDITION AWAITS</Text>
            )}
            <GameButton label="PRESS TO PLAY" onPress={continueFromTitle} />
          </View>
        </View>
      </SafeAreaView>
    </PanningMountainBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { flex: 1, justifyContent: "space-between", padding: 28 },
  hero: { alignItems: "center", marginTop: "28%" },
  orb: { height: 112, marginBottom: 12, width: 112 },
  eyebrow: {
    color: palette.yellow,
    fontFamily: fonts.pixelBold,
    fontSize: 9,
    letterSpacing: 1.2,
  },
  title: {
    color: palette.white,
    fontFamily: fonts.pixelBold,
    fontSize: 54,
    lineHeight: 54,
    marginTop: 14,
    textAlign: "center",
    textShadowColor: palette.navy,
    textShadowOffset: { height: 6, width: 0 },
    textShadowRadius: 0,
  },
  subtitle: {
    color: palette.aqua,
    fontFamily: fonts.pixelBold,
    fontSize: 13,
    letterSpacing: 4,
    marginTop: 13,
  },
  footer: { gap: 14, marginBottom: 12 },
  welcome: {
    color: palette.cream,
    fontFamily: fonts.pixelBold,
    fontSize: 10,
    textAlign: "center",
  },
});
