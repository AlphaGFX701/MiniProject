import type { PropsWithChildren } from "react";
import { useEffect, useState } from "react";
import {
  Animated,
  AppState,
  Easing,
  Image,
  StyleSheet,
  View,
} from "react-native";

import { titleBackground } from "../assets";
import { palette } from "../theme";

type Props = PropsWithChildren<{
  scrimOpacity?: number;
}>;

export function PanningMountainBackground({
  children,
  scrimOpacity = 0.68,
}: Props) {
  const [pan] = useState(() => new Animated.Value(0));

  useEffect(() => {
    let animation: Animated.CompositeAnimation | null = null;

    const start = () => {
      animation?.stop();
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pan, {
            duration: 9000,
            easing: Easing.inOut(Easing.sin),
            toValue: 1,
            useNativeDriver: true,
          }),
          Animated.timing(pan, {
            duration: 9000,
            easing: Easing.inOut(Easing.sin),
            toValue: 0,
            useNativeDriver: true,
          }),
        ]),
      );
      animation.start();
    };

    if (AppState.currentState === "active") start();
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") start();
      else animation?.stop();
    });

    return () => {
      animation?.stop();
      subscription.remove();
    };
  }, [pan]);

  return (
    <View style={styles.container}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.movingLayer,
          {
            transform: [
              {
                translateX: pan.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-42, 42],
                }),
              },
            ],
          },
        ]}
      >
        <Image source={titleBackground} resizeMode="cover" style={styles.image} />
      </Animated.View>
      <View
        pointerEvents="none"
        style={[styles.scrim, { backgroundColor: `rgba(7, 22, 39, ${scrimOpacity})` }]}
      />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: palette.navy,
    flex: 1,
    overflow: "hidden",
  },
  movingLayer: {
    bottom: -16,
    left: -72,
    position: "absolute",
    right: -72,
    top: -16,
  },
  image: { height: "100%", width: "100%" },
  scrim: {
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  content: { flex: 1 },
});
