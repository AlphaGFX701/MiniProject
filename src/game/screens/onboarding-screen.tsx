import { useState } from "react";
import {
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
} from "react-native";
import { STARTER_IDS, CREATURES } from "../data";
import type { CreatureId } from "../types";
import { SafeAreaView } from "react-native-safe-area-context";

import { echoOrb, titleBackground, creatureArt } from "../assets";
import { GameButton, Panel } from "../components/game-ui";
import { useGame } from "../game-context";
import { fonts, palette } from "../theme";

export function OnboardingScreen() {
  const { beginExpedition } = useGame();
  const [starter, setStarter] = useState<CreatureId>("charmadillo");

  return (
    <ImageBackground
      source={titleBackground}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.scrim} />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "space-between",
            gap: 24,
            padding: 20,
          }}
        >
          <View style={styles.hero}>
            <Image source={echoOrb} style={styles.orb} resizeMode="contain" />
            <Text style={styles.eyebrow}>KMUTNB CAMPUS ADVENTURE</Text>
            <Text style={styles.title}>ECHO{`\n`}HUNT</Text>
            <Text style={styles.subtitle}>CAMPUS LEGENDS</Text>
          </View>

          <Panel style={styles.panel}>
            <Text style={styles.panelTitle}>Your expedition begins here.</Text>
            <Text style={styles.body}>
              Explore three campus landmarks, challenge elemental creatures, and
              capture every Echo.
            </Text>
            <Text style={styles.step}>CHOOSE ONE STARTER</Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {STARTER_IDS.map((id) => (
                <Pressable
                  key={id}
                  accessibilityRole="button"
                  accessibilityLabel={`Choose ${CREATURES[id].name}`}
                  onPress={() => setStarter(id)}
                  style={{
                    flex: 1,
                    borderWidth: 3,
                    borderColor: starter === id ? palette.aqua : palette.line,
                    borderRadius: 12,
                    padding: 6,
                    alignItems: "center",
                  }}
                >
                  <Image
                    source={creatureArt[id].icon}
                    style={{ width: 60, height: 60 }}
                  />
                  <Text style={{ fontSize: 11 }}>{CREATURES[id].name}</Text>
                  <Text style={{ fontSize: 10 }}>
                    {CREATURES[id].element.toUpperCase()}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.note}>
              Use Demo Walk when presenting away from campus.
            </Text>
            <GameButton
              label="START EXPEDITION"
              onPress={() => beginExpedition(starter)}
            />
          </Panel>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  scrim: {
    backgroundColor: "rgba(7, 22, 39, 0.45)",
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  safeArea: { flex: 1 },
  hero: { alignItems: "center", marginTop: 34 },
  orb: { height: 92, marginBottom: 2, width: 92 },
  eyebrow: {
    color: palette.yellow,
    fontFamily: fonts.pixelBold,
    fontSize: 10,
    letterSpacing: 1.5,
  },
  title: {
    color: palette.white,
    fontFamily: fonts.pixelBold,
    fontSize: 48,
    lineHeight: 48,
    marginTop: 12,
    textAlign: "center",
    textShadowColor: palette.navy,
    textShadowOffset: { height: 5, width: 0 },
    textShadowRadius: 0,
  },
  subtitle: {
    color: palette.aqua,
    fontFamily: fonts.pixelBold,
    fontSize: 13,
    letterSpacing: 4,
    marginTop: 10,
  },
  panel: { gap: 14, marginBottom: 4 },
  panelTitle: {
    color: palette.navy,
    fontFamily: fonts.pixelBold,
    fontSize: 15,
    lineHeight: 21,
  },
  body: {
    color: palette.ink,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
  },
  steps: { gap: 9 },
  step: { color: palette.aquaDark, fontFamily: fonts.pixelBold, fontSize: 10 },
  note: { color: palette.muted, fontFamily: fonts.body, fontSize: 12 },
});
