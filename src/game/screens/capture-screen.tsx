import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  AppState,
  ImageBackground,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
} from "react-native";
import { useAudioPlayer, type AudioPlayer } from "expo-audio";
import { SafeAreaView } from "react-native-safe-area-context";

import { battleBackgrounds, echoOrb, gameAudio } from "../assets";
import { AnimatedCreature } from "../components/animated-creature";
import { GameButton, Panel } from "../components/game-ui";
import { CREATURES, ENCOUNTERS } from "../data";
import { useGame } from "../game-context";
import { captureShakes } from "../combat-rules";
import { captureSucceeds } from "../logic";
import { fonts, palette } from "../theme";
import type { CaptureState } from "../types";

const INITIAL_CAPTURE: CaptureState = {
  hitCount: 0,
  throwCount: 0,
  status: "ready",
};

export function CaptureScreen() {
  const {
    activeEncounterId,
    save,
    completeCapture,
    returnToMap,
    awardCapture,
    setVictoryMusic,
  } = useGame();
  const encounter = activeEncounterId
    ? ENCOUNTERS[activeEncounterId]
    : ENCOUNTERS.faculty;
  const creature = CREATURES[encounter.creatureId];
  const [resultReady, setResultReady] = useState(false);
  const resultElapsed = useRef(0);
  const [capture, setCapture] = useState<CaptureState>(INITIAL_CAPTURE);
  const [appActive, setAppActive] = useState(true);
  const [message, setMessage] = useState("SWIPE THE ECHO ORB UP");
  const [arenaWidth, setArenaWidth] = useState(360);
  const [targetX] = useState(() => new Animated.Value(0));
  const targetXRef = useRef(0);
  const [ball] = useState(() => new Animated.ValueXY());
  const [absorb] = useState(() => new Animated.Value(1));
  const throwLocked = useRef(false);
  const [spin] = useState(() => new Animated.Value(0));
  const [scene, setScene] = useState<{
    caught: boolean;
    shakes: number;
    step: number;
  } | null>(null);
  const sceneElapsed = useRef(0);
  const hitCountRef = useRef(0);
  const targetLoopRef = useRef<Animated.CompositeAnimation | null>(null);

  const audioOptions = { downloadFirst: true };
  const throwPlayer = useAudioPlayer(gameAudio.throw, audioOptions);
  const bouncePlayer = useAudioPlayer(gameAudio.bounce, audioOptions);
  const capturePlayer = useAudioPlayer(gameAudio.capture, audioOptions);

  const play = useCallback(
    (player: AudioPlayer) => {
      if (!save.soundEnabled) return;
      player.volume = 1;
      void player.seekTo(0).catch(() => undefined);
      player.play();
    },
    [save.soundEnabled],
  );

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) =>
      setAppActive(state === "active"),
    );
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (
      !appActive ||
      capture.status === "captured" ||
      capture.status === "sealing"
    )
      return;
    const listener = targetX.addListener(({ value }) => {
      targetXRef.current = value;
    });
    const range = Math.max(54, Math.min(112, arenaWidth * 0.28));
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(targetX, {
          duration: 1_100,
          toValue: range,
          useNativeDriver: true,
        }),
        Animated.timing(targetX, {
          duration: 2_200,
          toValue: -range,
          useNativeDriver: true,
        }),
        Animated.timing(targetX, {
          duration: 1_100,
          toValue: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    targetLoopRef.current = loop;
    loop.start();
    return () => {
      loop.stop();
      targetX.removeListener(listener);
    };
  }, [appActive, arenaWidth, capture.status, targetX]);

  useEffect(() => {
    if (!appActive || capture.status !== "captured" || resultReady) return;
    const timer = setInterval(() => {
      resultElapsed.current += 50;
      if (resultElapsed.current >= 1500) setResultReady(true);
    }, 50);
    return () => clearInterval(timer);
  }, [appActive, capture.status, resultReady]);
  useEffect(() => {
    if (capture.status === "captured") {
      awardCapture();
      setVictoryMusic(true);
    }
  }, [capture.status, awardCapture, setVictoryMusic]);

  const resetBall = useCallback(() => {
    throwLocked.current = false;
    absorb.setValue(1);
    ball.setValue({ x: 0, y: 0 });
    spin.setValue(0);
    setCapture((current) => ({ ...current, status: "ready" }));
  }, [absorb, ball, spin]);

  const resolveThrow = useCallback(
    (releaseX: number, validThrow: boolean) => {
      if (throwLocked.current) return;
      throwLocked.current = true;
      const hit = validThrow && Math.abs(releaseX - targetXRef.current) <= 66;
      play(throwPlayer);
      setCapture((current) => ({
        ...current,
        throwCount: current.throwCount + 1,
        status: "flying",
      }));
      setMessage(hit ? "DIRECT HIT!" : "THE ORB MISSED");

      Animated.parallel([
        Animated.timing(ball, {
          duration: 520,
          toValue: { x: releaseX, y: validThrow ? -310 : -150 },
          useNativeDriver: true,
        }),
        Animated.timing(spin, {
          duration: 520,
          toValue: 1,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (!hit) {
          play(bouncePlayer);
          setCapture((current) => ({ ...current, status: "missed" }));
          Animated.sequence([
            Animated.timing(ball.y, {
              duration: 180,
              toValue: -15,
              useNativeDriver: true,
            }),
            Animated.timing(ball.y, {
              duration: 120,
              toValue: -55,
              useNativeDriver: true,
            }),
            Animated.timing(ball.y, {
              duration: 160,
              toValue: 0,
              useNativeDriver: true,
            }),
          ]).start(() => {
            setMessage("AIM AHEAD OF THE MOVING ECHO");
            resetBall();
          });
          return;
        }

        Animated.timing(absorb, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
        hitCountRef.current += 1;
        const hitCount = hitCountRef.current;
        const caught = captureSucceeds(hitCount, Math.random());
        targetLoopRef.current?.stop();
        setCapture((current) => ({ ...current, hitCount, status: "sealing" }));
        setMessage("HOLD YOUR BREATH...");
        sceneElapsed.current = 0;
        setScene({
          caught,
          shakes: captureShakes(caught, Math.random()),
          step: 0,
        });
        Animated.timing(ball, {
          duration: 350,
          toValue: { x: 0, y: -110 },
          useNativeDriver: true,
        }).start();
      });
    },
    [absorb, ball, bouncePlayer, play, resetBall, spin, throwPlayer],
  );

  useEffect(() => {
    if (!appActive || !scene || capture.status !== "sealing") return;
    const timer = setInterval(() => {
      sceneElapsed.current += 50;
      if (sceneElapsed.current < 650) return;
      sceneElapsed.current = 0;
      if (scene.step < scene.shakes) {
        play(bouncePlayer);
        setMessage("• ".repeat(scene.step + 1).trim());
        Animated.sequence([
          Animated.timing(spin, {
            toValue: 0.04,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(spin, {
            toValue: -0.04,
            duration: 140,
            useNativeDriver: true,
          }),
          Animated.timing(spin, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
          }),
        ]).start();
        setScene((current) =>
          current ? { ...current, step: current.step + 1 } : null,
        );
      } else {
        if (scene.caught) {
          play(capturePlayer);
          setMessage("✦ CAPTURED! ✦");
          setCapture((current) => ({ ...current, status: "captured" }));
        } else {
          absorb.setValue(1);
          setMessage(creature.name.toUpperCase() + " BROKE FREE!");
          setCapture((current) => ({ ...current, status: "escaped" }));
        }
        setScene(null);
      }
    }, 50);
    return () => clearInterval(timer);
  }, [
    appActive,
    scene,
    capture.status,
    play,
    bouncePlayer,
    capturePlayer,
    creature.name,
    spin,
    absorb,
  ]);
  useEffect(() => {
    if (!appActive || capture.status !== "escaped") return;
    const timer = setTimeout(() => {
      resetBall();
      setMessage("TRY AGAIN · THIRD LANDED HIT IS GUARANTEED");
    }, 850);
    return () => clearTimeout(timer);
  }, [appActive, capture.status, resetBall]);

  const panResponder = useMemo(
    () =>
      // PanResponder invokes these handlers after render; targetXRef only mirrors the native animation value.
      // eslint-disable-next-line react-hooks/refs
      PanResponder.create({
        onStartShouldSetPanResponder: () => capture.status === "ready",
        onMoveShouldSetPanResponder: () => capture.status === "ready",
        onPanResponderMove: (_, gesture) => {
          if (capture.status !== "ready") return;
          ball.setValue({ x: gesture.dx, y: Math.min(0, gesture.dy) });
          spin.setValue(Math.min(0.5, Math.abs(gesture.dx) / 240));
        },
        onPanResponderRelease: (_, gesture) => {
          if (capture.status !== "ready") return;
          const validThrow = gesture.dy < -70 || gesture.vy < -0.65;
          const projectedX = Math.max(
            -arenaWidth * 0.38,
            Math.min(arenaWidth * 0.38, gesture.dx + gesture.vx * 55),
          );
          resolveThrow(projectedX, validThrow);
        },
        onPanResponderTerminate: resetBall,
      }),
    [arenaWidth, ball, capture.status, resetBall, resolveThrow, spin],
  );

  const onArenaLayout = (event: LayoutChangeEvent) =>
    setArenaWidth(event.nativeEvent.layout.width);
  const rotation = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "900deg"],
  });

  return (
    <ImageBackground
      source={battleBackgrounds[creature.element]}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.scrim} />
      <SafeAreaView style={styles.safeArea}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Leave capture"
          disabled={capture.status !== "ready"}
          onPress={returnToMap}
          style={{
            position: "absolute",
            top: 50,
            left: 12,
            width: 48,
            height: 48,
            zIndex: 5,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: palette.cream,
            borderRadius: 16,
          }}
        >
          <Text style={{ fontSize: 32, color: palette.navy }}>‹</Text>
        </Pressable>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>CAPTURE PHASE</Text>
          <Text style={styles.title}>SECURE THE CAMPUS ECHO</Text>
          <Text style={styles.counter}>
            HITS {capture.hitCount}/3 · THROWS {capture.throwCount}
          </Text>
        </View>

        <View style={styles.arena} onLayout={onArenaLayout}>
          <Animated.View
            style={[
              styles.target,
              {
                opacity: absorb,
                transform: [{ translateX: targetX }, { scale: absorb }],
              },
            ]}
          >
            <View style={styles.targetRing} />
            <AnimatedCreature creatureId={creature.id} size={190} />
          </Animated.View>

          <View
            style={styles.throwZone}
            pointerEvents={capture.status === "ready" ? "auto" : "none"}
            {...panResponder.panHandlers}
          >
            <Animated.Image
              source={echoOrb}
              resizeMode="contain"
              style={[
                styles.orb,
                {
                  transform: [
                    ...ball.getTranslateTransform(),
                    { rotate: rotation },
                  ],
                },
              ]}
            />
          </View>
        </View>

        {/* Keep the outcome and its action in one panel on compact screens. */}
        <Panel style={styles.instructionPanel}>
          <Text
            style={[
              styles.message,
              capture.status === "captured" ? styles.capturedText : null,
            ]}
          >
            {message}
          </Text>
          <Text style={styles.help}>
            {capture.status === "captured"
              ? `${creature.name} has joined your Pokédex.`
              : "Drag from the orb and release upward. Lead the target as it moves."}
          </Text>
          {capture.status === "ready" ? (
            <View style={styles.swipeIndicator}>
              <Text style={styles.arrow}>↑</Text>
            </View>
          ) : null}
          {capture.status === "captured" ? (
            <GameButton
              label="CONTINUE"
              disabled={!resultReady || !appActive}
              onPress={completeCapture}
            />
          ) : null}
        </Panel>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  scrim: {
    backgroundColor: "rgba(7,22,39,0.30)",
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  safeArea: { flex: 1, padding: 14 },
  header: { alignItems: "center", paddingTop: 8 },
  eyebrow: { color: palette.yellow, fontFamily: fonts.pixelBold, fontSize: 9 },
  title: {
    color: palette.white,
    fontFamily: fonts.pixelBold,
    fontSize: 17,
    lineHeight: 24,
    marginTop: 9,
    textAlign: "center",
  },
  counter: {
    backgroundColor: palette.navy,
    borderColor: palette.aqua,
    borderRadius: 999,
    borderWidth: 2,
    color: palette.white,
    fontFamily: fonts.pixelBold,
    fontSize: 8,
    marginTop: 10,
    overflow: "hidden",
    paddingHorizontal: 13,
    paddingVertical: 7,
  },
  arena: { flex: 1, marginBottom: 190 },
  target: {
    alignItems: "center",
    left: "50%",
    marginLeft: -100,
    position: "absolute",
    top: 18,
    width: 200,
  },
  targetRing: {
    backgroundColor: "rgba(255,209,102,0.18)",
    borderColor: palette.yellow,
    borderRadius: 76,
    borderWidth: 3,
    height: 152,
    position: "absolute",
    top: 22,
    width: 152,
  },
  throwZone: {
    alignItems: "center",
    bottom: 0,
    height: 160,
    justifyContent: "flex-end",
    left: 0,
    position: "absolute",
    right: 0,
  },
  orb: { height: 94, width: 94 },
  instructionPanel: {
    bottom: 14,
    gap: 9,
    left: 14,
    position: "absolute",
    right: 14,
  },
  message: {
    color: palette.navy,
    fontFamily: fonts.pixelBold,
    fontSize: 12,
    lineHeight: 19,
    textAlign: "center",
  },
  capturedText: { color: palette.success },
  help: {
    color: palette.ink,
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 17,
    textAlign: "center",
  },
  swipeIndicator: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: palette.aqua,
    borderColor: palette.navy,
    borderRadius: 18,
    borderWidth: 2,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  arrow: { color: palette.white, fontFamily: fonts.pixelBold, fontSize: 22 },
});
