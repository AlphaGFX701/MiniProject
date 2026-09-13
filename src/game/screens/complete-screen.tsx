import { useEffect, useState } from "react";
import { Animated, Image, ImageBackground, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { creatureArt, echoOrb, titleBackground } from "../assets";
import { GameButton, Panel } from "../components/game-ui";
import { useGame } from "../game-context";
import { fonts, palette } from "../theme";

export function CompleteScreen() {
  const { returnToMap, openCollection, markHint } = useGame();

  // Shimmer animation for creature bubbles
  const [shimmer] = useState(() => new Animated.Value(0));
  const [orbScale] = useState(() => new Animated.Value(0.5));
  const [orbOpacity] = useState(() => new Animated.Value(0));
  const [titleOpacity] = useState(() => new Animated.Value(0));
  const [titleScale] = useState(() => new Animated.Value(0.85));

  useEffect(() => {
    markHint("facultyNoticeSeen");

    // Entrance animations
    Animated.sequence([
      Animated.parallel([
        Animated.spring(orbScale, { toValue: 1, useNativeDriver: true, speed: 6, bounciness: 18 }),
        Animated.timing(orbOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(titleOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(titleScale, { toValue: 1, useNativeDriver: true, speed: 8, bounciness: 10 }),
      ]),
    ]).start();

    // Shimmer loop on creatures
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ]),
    ).start();
  }, [shimmer, orbScale, orbOpacity, titleOpacity, titleScale, markHint]);

  const shimmerOpacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.0, 0.25] });

  return (
    <ImageBackground
      source={titleBackground}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.scrim} />
      <SafeAreaView style={styles.safeArea}>
        <Animated.View style={{ transform: [{ scale: orbScale }], opacity: orbOpacity }}>
          <Image source={echoOrb} style={styles.orb} />
        </Animated.View>
        <Text style={styles.eyebrow}>ALL THREE LEGENDS FOUND</Text>
        <Animated.Text
          style={[
            styles.title,
            { opacity: titleOpacity, transform: [{ scale: titleScale }] },
          ]}
        >
          {"FACULTY\nCHALLENGES\nUNLOCKED"}
        </Animated.Text>
        <View style={styles.creatures}>
          {(["friolera", "draem", "pouch"] as const).map((id, i) => (
            <Animated.View
              key={id}
              style={[
                styles.creatureBubble,
                {
                  transform: [{ scale: shimmer.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, i % 2 === 0 ? 1.06 : 0.97, 1] }) }],
                },
              ]}
            >
              <Image
                source={creatureArt[id].icon}
                style={styles.creature}
                resizeMode="contain"
              />
              <Animated.View
                style={[
                  StyleSheet.absoluteFill,
                  { backgroundColor: palette.white, borderRadius: 48, opacity: shimmerOpacity },
                ]}
              />
            </Animated.View>
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
    backgroundColor: "rgba(7, 22, 39, 0.62)",
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
    gap: 4,
  },
  orb: { height: 72, width: 72 },
  eyebrow: {
    color: palette.yellow,
    fontFamily: fonts.pixelBold,
    fontSize: 9,
    letterSpacing: 2,
    marginTop: 16,
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  title: {
    color: palette.white,
    fontFamily: fonts.pixelBold,
    fontSize: 30,
    lineHeight: 40,
    marginTop: 10,
    textAlign: "center",
    textShadowColor: palette.navy,
    textShadowOffset: { height: 6, width: 0 },
    textShadowRadius: 0,
  },
  creatures: { flexDirection: "row", gap: 12, marginVertical: 24 },
  creatureBubble: {
    alignItems: "center",
    backgroundColor: palette.cream,
    borderColor: palette.navy,
    borderRadius: 48,
    borderWidth: 3,
    height: 88,
    justifyContent: "center",
    width: 88,
    overflow: "hidden",
    shadowColor: palette.aqua,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  creature: { height: 70, width: 70 },
  panel: { gap: 12, width: "100%" },
  body: {
    color: palette.ink,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 23,
    textAlign: "center",
  },
});
