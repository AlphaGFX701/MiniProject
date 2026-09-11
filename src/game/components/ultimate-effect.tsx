import { useEffect, useState } from "react";
import { Image, StyleSheet } from "react-native";

import { ultimateFrames } from "../assets";

export function UltimateEffect({ onFinished }: { onFinished?: () => void }) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    let current = 0;
    const timer = setInterval(() => {
      current += 1;
      if (current >= ultimateFrames.length) {
        clearInterval(timer);
        setFrame(-1);
        onFinished?.();
      } else {
        setFrame(current);
      }
    }, 55);
    return () => clearInterval(timer);
  }, [onFinished]);

  if (frame < 0) return null;
  return (
    <Image
      source={ultimateFrames[frame]}
      resizeMode="contain"
      style={styles.effect}
    />
  );
}

const styles = StyleSheet.create({
  effect: { height: 190, position: "absolute", width: 190, zIndex: 20 },
});
