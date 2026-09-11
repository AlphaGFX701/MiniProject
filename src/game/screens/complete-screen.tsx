import { useEffect } from "react";
import { Image, ImageBackground, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { creatureArt, echoOrb, titleBackground } from "../assets";
import { GameButton, Panel } from "../components/game-ui";
import { useGame } from "../game-context";
import { fonts, palette } from "../theme";

export function CompleteScreen() {
  const { returnToMap, openCollection, markHint } = useGame();

  useEffect(() => {
    markHint("facultyNoticeSeen");
  }, [markHint]);
  return (
    <ImageBackground
      source={titleBackground}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.scrim} />
      <SafeAreaView style={styles.safeArea}>
        <Image source={echoOrb} style={styles.orb} />
        <Text style={styles.eyebrow}>ALL THREE LEGENDS FOUND</Text>
        <Text style={styles.title}>
          FACULTY{`\n`}CHALLENGES{`\n`}UNLOCKED
        </Text>
        <View style={styles.creatures}>
          {(["friolera", "draem", "pouch"] as const).map((id) => (
            <View key={id} style={styles.creatureBubble}>
              <Image
                source={creatureArt[id].icon}
                style={styles.creature}
                resizeMode="contain"
              />
            </View>
          ))}
        </View>
        <Panel style={styles.panel}>
          <Text style={styles.body}>
            Three landmarks explored! Faculty challenges and the other two
            starters are now available at the campus landmarks.
          </Text>
          <GameButton label="VIEW COLLECTION" onPress={openCollection} />
          <GameButton
            label="BACK TO MAP"
            variant="secondary"
            onPress={returnToMap}
          />
        </Panel>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  scrim: {
    backgroundColor: "rgba(7, 22, 39, 0.58)",
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  safeArea: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  orb: { height: 68, width: 68 },
  eyebrow: {
    color: palette.yellow,
    fontFamily: fonts.pixelBold,
    fontSize: 9,
    marginTop: 14,
  },
  title: {
    color: palette.white,
    fontFamily: fonts.pixelBold,
    fontSize: 28,
    lineHeight: 37,
    marginTop: 14,
    textAlign: "center",
  },
  creatures: { flexDirection: "row", gap: 10, marginVertical: 22 },
  creatureBubble: {
    alignItems: "center",
    backgroundColor: palette.cream,
    borderColor: palette.navy,
    borderRadius: 48,
    borderWidth: 3,
    height: 86,
    justifyContent: "center",
    width: 86,
  },
  creature: { height: 68, width: 68 },
  panel: { gap: 12, width: "100%" },
  body: {
    color: palette.ink,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 23,
    textAlign: "center",
  },
});
