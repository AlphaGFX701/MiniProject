import { useEffect, useState } from "react";
import {
  Animated,
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
import { elementColors, elementGlows, fonts, palette } from "../theme";

export function OnboardingScreen() {
  const { beginExpedition, continueFromTitle, save } = useGame();
  const [starter, setStarter] = useState<CreatureId>("charmadillo");

  // Pulsing orb animation
  const [orbPulse] = useState(() => new Animated.Value(1));
  const [orbGlow] = useState(() => new Animated.Value(0.4));
  // Fade-in for hero text
  const [titleOpacity] = useState(() => new Animated.Value(0));
  const [titleTranslate] = useState(() => new Animated.Value(16));

  useEffect(() => {
    // Pulsing loop
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(orbPulse, { toValue: 1.08, duration: 900, useNativeDriver: true }),
          Animated.timing(orbGlow, { toValue: 0.85, duration: 900, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(orbPulse, { toValue: 1, duration: 900, useNativeDriver: true }),
          Animated.timing(orbGlow, { toValue: 0.4, duration: 900, useNativeDriver: true }),
        ]),
      ]),
    ).start();

    // Fade-in title
    Animated.parallel([
      Animated.timing(titleOpacity, { toValue: 1, duration: 700, delay: 200, useNativeDriver: true }),
      Animated.timing(titleTranslate, { toValue: 0, duration: 600, delay: 200, useNativeDriver: true }),
    ]).start();
  }, [orbPulse, orbGlow, titleOpacity, titleTranslate]);

  return (
    <ImageBackground
      source={titleBackground}
      style={styles.background}
      resizeMode="cover"
    >
      {/* Gradient scrim: dark at top, lighter at bottom */}
      <View style={styles.scrimTop} />
      <View style={styles.scrimBottom} />
      <SafeAreaView style={styles.safeArea}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to trainer login"
          onPress={continueFromTitle}
          style={styles.backButton}
        >
          <Text style={styles.backText}>‹ TRAINER LOGIN</Text>
        </Pressable>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "space-between",
            gap: 20,
            padding: 20,
          }}
        >
          <Animated.View
            style={[
              styles.hero,
              { opacity: titleOpacity, transform: [{ translateY: titleTranslate }] },
            ]}
          >
            {/* Glow ring behind orb */}
            <Animated.View
              style={[
                styles.orbGlowRing,
                { opacity: orbGlow, transform: [{ scale: orbPulse }] },
              ]}
            />
            <Animated.View style={{ transform: [{ scale: orbPulse }] }}>
              <Image source={echoOrb} style={styles.orb} resizeMode="contain" />
            </Animated.View>
            <Text style={styles.eyebrow}>KMUTNB CAMPUS ADVENTURE</Text>
            <Text style={styles.title}>{"ECHO\nHUNT"}</Text>
            <Text style={styles.subtitle}>CAMPUS LEGENDS</Text>
          </Animated.View>

          <Panel style={styles.panel}>
            <View style={styles.panelHeading}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>01</Text></View>
              <View style={styles.panelHeadingCopy}>
                <Text style={styles.step}>CHOOSE YOUR COMPANION</Text>
                <Text style={styles.panelTitle}>Your expedition begins here.</Text>
              </View>
            </View>
            <Text style={styles.body}>
              {save.playerName
                ? `Welcome, ${save.playerName}! `
                : ""}
              Explore three campus landmarks, challenge elemental creatures, and
              capture every Echo.
            </Text>
            <View style={styles.starterGrid}>
              {STARTER_IDS.map((id) => {
                const isSelected = starter === id;
                const elColor = elementColors[CREATURES[id].element];
                const elGlow = elementGlows[CREATURES[id].element];
                return (
                  <Pressable
                    key={id}
                    accessibilityRole="button"
                    accessibilityLabel={`Choose ${CREATURES[id].name}`}
                    accessibilityState={{ selected: isSelected }}
                    onPress={() => setStarter(id)}
                    style={({ pressed }) => [
                      styles.starterCard,
                      pressed ? styles.starterPressed : null,
                      isSelected
                        ? {
                            borderColor: elColor,
                            backgroundColor: `${elColor}18`,
                            shadowColor: elGlow,
                            shadowOffset: { width: 0, height: 0 },
                            shadowOpacity: 1,
                            shadowRadius: 14,
                            elevation: 10,
                          }
                        : { borderColor: palette.line },
                    ]}
                  >
                    {isSelected ? <View style={[styles.selectedMark, { backgroundColor: elColor }]}><Text style={styles.selectedMarkText}>✓</Text></View> : null}
                    <Image
                      source={creatureArt[id].icon}
                      style={styles.starterIcon}
                    />
                    <Text
                      style={[
                        styles.starterName,
                        isSelected ? { color: palette.navy } : { color: palette.muted },
                      ]}
                    >
                      {CREATURES[id].name}
                    </Text>
                    <View
                      style={[
                        styles.starterElementBadge,
                        { backgroundColor: isSelected ? elColor : palette.line },
                      ]}
                    >
                      <Text style={[styles.starterElementText, { color: isSelected ? palette.white : palette.muted }]}>
                        {CREATURES[id].element.toUpperCase()}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
            <View style={[styles.selectedSummary, { borderLeftColor: elementColors[CREATURES[starter].element] }]}>
              <Text style={styles.selectedSummaryTitle}>{CREATURES[starter].name.toUpperCase()} IS READY</Text>
              <Text style={styles.selectedSummaryBody}>{CREATURES[starter].description} · {CREATURES[starter].buff.label}</Text>
            </View>
            <View style={styles.demoHint}><Text style={styles.demoHintIcon}>✦</Text><Text style={styles.note}>Demo Walk is available when you are away from campus.</Text></View>
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
  scrimTop: {
    backgroundColor: "rgba(7, 22, 39, 0.72)",
    bottom: "50%",
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  scrimBottom: {
    backgroundColor: "rgba(7, 22, 39, 0.25)",
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: "50%",
  },
  safeArea: { flex: 1 },
  backButton: {
    alignItems: "center",
    flexDirection: "row",
    left: 18,
    minHeight: 48,
    paddingHorizontal: 8,
    position: "absolute",
    top: 24,
    zIndex: 2,
  },
  backText: { color: palette.cream, fontFamily: fonts.pixelBold, fontSize: 9 },
  hero: { alignItems: "center", marginTop: 34 },
  orbGlowRing: {
    backgroundColor: palette.aqua,
    borderRadius: 70,
    height: 120,
    position: "absolute",
    width: 120,
    top: -14,
  },
  orb: { height: 92, marginBottom: 2, width: 92 },
  eyebrow: {
    color: palette.yellow,
    fontFamily: fonts.pixelBold,
    fontSize: 10,
    letterSpacing: 1.5,
    marginTop: 6,
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  title: {
    color: palette.white,
    fontFamily: fonts.pixelBold,
    fontSize: 52,
    lineHeight: 52,
    marginTop: 12,
    textAlign: "center",
    textShadowColor: palette.navy,
    textShadowOffset: { height: 6, width: 0 },
    textShadowRadius: 0,
  },
  subtitle: {
    color: palette.aqua,
    fontFamily: fonts.pixelBold,
    fontSize: 14,
    letterSpacing: 5,
    marginTop: 12,
    textShadowColor: "rgba(33,182,168,0.5)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  panel: { gap: 14, marginBottom: 4 },
  panelHeading: { alignItems: "center", flexDirection: "row", gap: 10 },
  panelHeadingCopy: { flex: 1, gap: 5 },
  stepNumber: {
    alignItems: "center", backgroundColor: palette.navy, borderRadius: 12,
    height: 38, justifyContent: "center", width: 38,
  },
  stepNumberText: { color: palette.yellow, fontFamily: fonts.pixelBold, fontSize: 10 },
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
  step: { color: palette.aquaDark, fontFamily: fonts.pixelBold, fontSize: 9, letterSpacing: 0.5 },
  starterGrid: { flexDirection: "row", gap: 8 },
  starterCard: {
    flex: 1,
    borderWidth: 3,
    borderRadius: 14,
    minHeight: 126,
    padding: 8,
    position: "relative",
    alignItems: "center",
    gap: 5,
    backgroundColor: palette.cream,
  },
  starterPressed: { opacity: 0.78, transform: [{ scale: 0.97 }] },
  selectedMark: {
    alignItems: "center", borderColor: palette.white, borderRadius: 9, borderWidth: 2,
    height: 18, justifyContent: "center", position: "absolute", right: 4, top: 4, width: 18, zIndex: 1,
  },
  selectedMarkText: { color: palette.white, fontFamily: fonts.pixelBold, fontSize: 9 },
  starterIcon: { width: 64, height: 64 },
  starterName: {
    fontFamily: fonts.pixelBold,
    fontSize: 10,
    textAlign: "center",
  },
  starterElementBadge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  starterElementText: {
    fontFamily: fonts.pixelBold,
    fontSize: 8,
  },
  selectedSummary: {
    backgroundColor: "rgba(16,38,62,0.06)", borderLeftWidth: 4, borderRadius: 8,
    gap: 4, paddingHorizontal: 10, paddingVertical: 9,
  },
  selectedSummaryTitle: { color: palette.navy, fontFamily: fonts.pixelBold, fontSize: 9 },
  selectedSummaryBody: { color: palette.ink, fontFamily: fonts.body, fontSize: 11, lineHeight: 16 },
  demoHint: { alignItems: "center", flexDirection: "row", gap: 7 },
  demoHintIcon: { color: palette.aquaDark, fontFamily: fonts.pixelBold, fontSize: 12 },
  note: { color: palette.muted, flex: 1, fontFamily: fonts.body, fontSize: 11, lineHeight: 16 },
});
