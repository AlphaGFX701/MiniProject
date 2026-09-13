import { useEffect, useState } from "react";
import {
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import type { ReactNode } from "react";

import { elementColors, elementGlows, fonts, palette, shadows } from "../theme";
import type { Element } from "../types";

export function ElementBadge({ element }: { element: Element }) {
  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: elementColors[element],
          ...shadows.glow(elementGlows[element]),
        },
      ]}
    >
      <Text style={styles.badgeText}>{element.toUpperCase()}</Text>
    </View>
  );
}

export function GameButton({
  label,
  variant = "primary",
  disabled,
  style,
  ...props
}: PressableProps & {
  label: string;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  style?: StyleProp<ViewStyle>;
}) {
  const [scale] = useState(() => new Animated.Value(1));

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 50,
      bounciness: 0,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 8,
    }).start();
  };

  const glowColor =
    variant === "primary"
      ? palette.glowYellow
      : variant === "secondary"
        ? palette.glowAqua
        : variant === "danger"
          ? palette.glowDanger
          : "transparent";

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: Boolean(disabled) }}
        disabled={disabled}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        {...props}
        style={() => [
          styles.button,
          styles[`${variant}Button`],
          disabled ? styles.disabled : null,
          !disabled && glowColor !== "transparent"
            ? { shadowColor: glowColor, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.8, shadowRadius: 8, elevation: 6 }
            : null,
        ]}
      >
        <Text
          style={[
            styles.buttonText,
            variant === "ghost" ? styles.ghostButtonText : null,
            variant === "danger" ? styles.dangerButtonText : null,
          ]}
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export function ProgressBar({
  value,
  maximum,
  color,
  height = 14,
}: {
  value: number;
  maximum: number;
  color: string;
  height?: number;
}) {
  const percentage = Math.max(0, Math.min(100, (value / maximum) * 100));
  const [shimmer] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [shimmer]);

  const shimmerOpacity = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0.0, 0.35],
  });

  return (
    <View style={[styles.progressTrack, { height }]}>
      <View
        style={[
          styles.progressFill,
          { width: `${percentage}%`, backgroundColor: color },
        ]}
      >
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: palette.white,
              borderRadius: 999,
              opacity: shimmerOpacity,
            },
          ]}
        />
      </View>
    </View>
  );
}

export function Panel({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.panel, style]}>{children}</View>;
}

export function IconButton({
  source,
  label,
  onPress,
}: {
  source: ImageSourcePropType;
  label: string;
  onPress: () => void;
}) {
  const [scale] = useState(() => new Animated.Value(1));

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.9, useNativeDriver: true, speed: 50, bounciness: 0 }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 10 }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.iconButton}
      >
        <Image source={source} style={styles.iconImage} resizeMode="contain" />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    borderColor: palette.navy,
    borderRadius: 999,
    borderWidth: 2,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  badgeText: { color: palette.white, fontFamily: fonts.pixelBold, fontSize: 9 },
  button: {
    alignItems: "center",
    borderColor: palette.navy,
    borderRadius: 16,
    borderWidth: 3,
    justifyContent: "center",
    minHeight: 52,
    paddingHorizontal: 18,
    paddingBottom: 10,
    paddingTop: 12,
  },
  primaryButton: { backgroundColor: palette.yellow, borderBottomWidth: 6 },
  secondaryButton: { backgroundColor: palette.aqua, borderBottomWidth: 6 },
  dangerButton: { backgroundColor: palette.danger, borderBottomWidth: 6 },
  ghostButton: { backgroundColor: palette.cream },
  buttonText: {
    color: palette.navy,
    fontFamily: fonts.pixelBold,
    fontSize: 12,
    textAlign: "center",
  },
  ghostButtonText: { color: palette.navy },
  dangerButtonText: { color: palette.white },
  disabled: { opacity: 0.45 },
  progressTrack: {
    backgroundColor: "rgba(16,38,62,0.18)",
    borderColor: palette.navy,
    borderRadius: 999,
    borderWidth: 2,
    overflow: "hidden",
  },
  progressFill: { height: "100%", overflow: "hidden" },
  panel: {
    backgroundColor: palette.cream,
    borderColor: palette.navy,
    borderRadius: 22,
    borderWidth: 3,
    padding: 18,
    shadowColor: palette.navy,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 8,
  },
  iconButton: {
    alignItems: "center",
    backgroundColor: palette.cream,
    borderColor: palette.navy,
    borderRadius: 14,
    borderWidth: 3,
    height: 52,
    justifyContent: "center",
    width: 52,
    shadowColor: palette.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 0,
    elevation: 5,
  },
  iconImage: { height: 34, width: 34 },
});
