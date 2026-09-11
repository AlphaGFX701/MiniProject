import { useEffect, useState } from "react";
import { StyleSheet, type ImageStyle, type StyleProp } from "react-native";
import { Image } from "expo-image";

import anchors from "../creature-anchors.json";
import { creatureArt } from "../assets";
import type { CreatureId } from "../types";

export function AnimatedCreature({
  creatureId,
  action = "idle",
  size = 168,
  flipped = false,
  grounded = false,
  receivingHit = false,
  style,
}: {
  creatureId: CreatureId;
  action?: "idle" | "attack";
  size?: number;
  flipped?: boolean;
  grounded?: boolean;
  receivingHit?: boolean;
  style?: StyleProp<ImageStyle>;
}) {
  const [frame, setFrame] = useState(0);
  const anchor = anchors[creatureId];
  const frames = creatureArt[creatureId][action];

  useEffect(() => {
    const timer = setInterval(
      () => setFrame((current) => (current + 1) % frames.length),
      action === "attack" ? 90 : 220,
    );
    return () => clearInterval(timer);
  }, [action, frames.length]);

  return (
    <Image
      source={frames[frame]}
      contentFit="contain"
      cachePolicy="memory-disk"
      transition={0}
      style={[
        styles.image,
        {
          height: size,
          width: size,
          transform: [
            {
              translateX:
                (grounded
                  ? size * (0.5 - anchor.center) * (flipped ? -1 : 1)
                  : 0) +
                (action === "attack"
                  ? flipped
                    ? 8
                    : -8
                  : receivingHit
                    ? frame % 2
                      ? -4
                      : 4
                    : 0),
            },
            { translateY: grounded ? size * (1 - anchor.bottom) - 40 : 0 },
            { scaleX: flipped ? -1 : 1 },
          ],
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({ image: {} });
