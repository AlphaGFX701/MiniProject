import { useEffect, useState } from "react";
import { Animated, Image, StyleSheet, View } from "react-native";

import { echoOrb } from "@/game/assets";
import { useGame } from "@/game/game-context";
import { BattleScreen } from "@/game/screens/battle-screen";
import { CaptureScreen } from "@/game/screens/capture-screen";
import { CollectionScreen } from "@/game/screens/collection-screen";
import { CompleteScreen } from "@/game/screens/complete-screen";
import { MapScreen } from "@/game/screens/map-screen";
import { OnboardingScreen } from "@/game/screens/onboarding-screen";
import { PlayerNameScreen } from "@/game/screens/player-name-screen";
import { PressToPlayScreen } from "@/game/screens/press-to-play-screen";
import { SaveSlotScreen } from "@/game/screens/save-slot-screen";
import { SettingsScreen } from "@/game/screens/settings-screen";
import { TrainerScreen } from "@/game/screens/trainer-screen";
import { fonts, palette } from "@/game/theme";
import type { GameScreen } from "@/game/types";

function LoadingScreen() {
  const [pulse] = useState(() => new Animated.Value(1));
  const [textOpacity] = useState(() => new Animated.Value(0.4));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulse, { toValue: 1.12, duration: 800, useNativeDriver: true }),
          Animated.timing(textOpacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
          Animated.timing(textOpacity, { toValue: 0.4, duration: 800, useNativeDriver: true }),
        ]),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse, textOpacity]);

  return (
    <View style={styles.loading}>
      <Animated.View style={[styles.loadingOrb, { transform: [{ scale: pulse }] }]}>
        <Image source={echoOrb} style={styles.orbImage} resizeMode="contain" />
      </Animated.View>
      <Animated.Text style={[styles.loadingText, { opacity: textOpacity }]}>LOADING FIELD GUIDE</Animated.Text>
    </View>
  );
}

function screenContent(screen: GameScreen) {
  switch (screen) {
    case "title": return <PressToPlayScreen />;
    case "login": return <SaveSlotScreen />;
    case "name": return <PlayerNameScreen />;
    case "onboarding": return <OnboardingScreen />;
    case "trainer": return <TrainerScreen />;
    case "battle": return <BattleScreen />;
    case "capture": return <CaptureScreen />;
    case "collection": return <CollectionScreen />;
    case "settings": return <SettingsScreen />;
    case "complete": return <CompleteScreen />;
    case "map": return <MapScreen />;
  }
}

export default function GameRoot() {
  const { hydrated, screen } = useGame();
  const [displayedScreen, setDisplayedScreen] = useState<GameScreen>(screen);
  const [opacity] = useState(() => new Animated.Value(1));
  const [translateY] = useState(() => new Animated.Value(0));
  const [battleFade] = useState(() => new Animated.Value(0));
  const [revealAfterBlack, setRevealAfterBlack] = useState(false);

  useEffect(() => {
    if (!revealAfterBlack || displayedScreen !== screen) return;
    const reveal = Animated.timing(battleFade, {
      toValue: 0,
      duration: 320,
      useNativeDriver: true,
    });
    reveal.start(() => setRevealAfterBlack(false));
    return () => reveal.stop();
  }, [battleFade, displayedScreen, revealAfterBlack, screen]);

  useEffect(() => {
    if (!hydrated || screen === displayedScreen) return;
    let active = true;
    const requiresBattleFade =
      screen === "battle" ||
      screen === "trainer" ||
      screen === "login" ||
      displayedScreen === "battle" ||
      displayedScreen === "trainer" ||
      displayedScreen === "login";
    if (requiresBattleFade) {
      const fadeToBlack = Animated.timing(battleFade, {
        toValue: 1,
        duration: 240,
        useNativeDriver: true,
      });
      fadeToBlack.start(({ finished }) => {
        if (!active || !finished) return;
        setDisplayedScreen(screen);
        setRevealAfterBlack(true);
      });
      return () => {
        active = false;
        fadeToBlack.stop();
      };
    }
    const fadeOut = Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 130, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: -10, duration: 130, useNativeDriver: true }),
    ]);

    fadeOut.start(({ finished }) => {
      if (!active || !finished) return;
      setDisplayedScreen(screen);
      opacity.setValue(0);
      translateY.setValue(12);
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.spring(translateY, { toValue: 0, speed: 18, bounciness: 5, useNativeDriver: true }),
      ]).start();
    });
    return () => {
      active = false;
      fadeOut.stop();
    };
  }, [battleFade, displayedScreen, hydrated, opacity, screen, translateY]);

  if (!hydrated) return <LoadingScreen />;

  return (
    <View style={styles.screenTransition}>
      <Animated.View style={[styles.screenTransition, { opacity, transform: [{ translateY }] }]}>
        {screenContent(displayedScreen)}
      </Animated.View>
      <Animated.View pointerEvents="none" style={[styles.battleFade, { opacity: battleFade }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  screenTransition: { flex: 1 },
  battleFade: { backgroundColor: "#000000", bottom: 0, left: 0, position: "absolute", right: 0, top: 0 },
  loading: { alignItems: "center", backgroundColor: palette.navy, flex: 1, gap: 22, justifyContent: "center" },
  loadingOrb: { elevation: 10, shadowColor: palette.aqua, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 20 },
  orbImage: { height: 80, width: 80 },
  loadingText: { color: palette.cream, fontFamily: fonts.pixelBold, fontSize: 10, letterSpacing: 2 },
});
