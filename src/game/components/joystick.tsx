import { useMemo, useState } from "react";
import { Animated, PanResponder, StyleSheet, View } from "react-native";

import { palette } from "../theme";

const RADIUS = 38;

export function Joystick({
  onVectorChange,
}: {
  onVectorChange: (vector: { x: number; y: number }) => void;
}) {
  const [knob] = useState(() => new Animated.ValueXY());

  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderMove: (_, gesture) => {
          const length = Math.hypot(gesture.dx, gesture.dy);
          const scale = length > RADIUS ? RADIUS / length : 1;
          const x = gesture.dx * scale;
          const y = gesture.dy * scale;
          knob.setValue({ x, y });
          onVectorChange({ x: x / RADIUS, y: y / RADIUS });
        },
        onPanResponderRelease: () => {
          onVectorChange({ x: 0, y: 0 });
          Animated.spring(knob, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: true,
          }).start();
        },
        onPanResponderTerminate: () => {
          onVectorChange({ x: 0, y: 0 });
          knob.setValue({ x: 0, y: 0 });
        },
      }),
    [knob, onVectorChange],
  );

  return (
    <View
      accessibilityLabel="Demo movement joystick"
      style={styles.base}
      {...responder.panHandlers}
    >
      <View style={styles.axisHorizontal} />
      <View style={styles.axisVertical} />
      <Animated.View
        style={[styles.knob, { transform: knob.getTranslateTransform() }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    backgroundColor: "rgba(255, 247, 230, 0.88)",
    borderColor: palette.navy,
    borderRadius: 58,
    borderWidth: 3,
    height: 116,
    justifyContent: "center",
    width: 116,
  },
  axisHorizontal: {
    backgroundColor: "rgba(16,38,62,0.12)",
    height: 2,
    position: "absolute",
    width: 76,
  },
  axisVertical: {
    backgroundColor: "rgba(16,38,62,0.12)",
    height: 76,
    position: "absolute",
    width: 2,
  },
  knob: {
    backgroundColor: palette.aqua,
    borderColor: palette.navy,
    borderRadius: 24,
    borderWidth: 3,
    height: 48,
    width: 48,
  },
});
