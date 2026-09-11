import {
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

import { elementColors, fonts, palette } from "../theme";
import type { Element } from "../types";

export function ElementBadge({ element }: { element: Element }) {
  return (
    <View style={[styles.badge, { backgroundColor: elementColors[element] }]}>
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
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      {...props}
      style={({ pressed }) => [
        styles.button,
        styles[`${variant}Button`],
        disabled ? styles.disabled : null,
        pressed && !disabled ? styles.pressed : null,
        style,
      ]}
    >
      <Text
        style={[
          styles.buttonText,
          variant === "ghost" ? styles.ghostButtonText : null,
        ]}
      >
        {label}
      </Text>
    </Pressable>
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
  return (
    <View style={[styles.progressTrack, { height }]}>
      <View
        style={[
          styles.progressFill,
          { width: `${percentage}%`, backgroundColor: color },
        ]}
      />
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
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={styles.iconButton}
    >
      <Image source={source} style={styles.iconImage} resizeMode="contain" />
    </Pressable>
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
    borderRadius: 14,
    borderWidth: 3,
    justifyContent: "center",
    minHeight: 52,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  primaryButton: { backgroundColor: palette.yellow },
  secondaryButton: { backgroundColor: palette.aqua },
  dangerButton: { backgroundColor: palette.danger },
  ghostButton: { backgroundColor: palette.cream },
  buttonText: {
    color: palette.navy,
    fontFamily: fonts.pixelBold,
    fontSize: 12,
    textAlign: "center",
  },
  ghostButtonText: { color: palette.navy },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.8, transform: [{ translateY: 2 }] },
  progressTrack: {
    backgroundColor: "rgba(16,38,62,0.18)",
    borderColor: palette.navy,
    borderRadius: 999,
    borderWidth: 2,
    overflow: "hidden",
  },
  progressFill: { height: "100%" },
  panel: {
    backgroundColor: palette.cream,
    borderColor: palette.navy,
    borderRadius: 20,
    borderWidth: 3,
    padding: 16,
    shadowColor: palette.navy,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 0,
    elevation: 5,
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
  },
  iconImage: { height: 34, width: 34 },
});
