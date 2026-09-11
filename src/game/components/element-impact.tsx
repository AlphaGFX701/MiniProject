import { useEffect, useState } from "react";
import { Image, View } from "react-native";
import type { Element } from "../types";
const sources = {
  ice: require("../../../assets/game/effects/splash.png"),
  psychic: require("../../../assets/game/effects/explosion.png"),
  dark: require("../../../assets/game/effects/scratch.png"),
  fire: require("../../../assets/game/effects/fire.png"),
  water: require("../../../assets/game/effects/splash.png"),
  grass: require("../../../assets/game/effects/green.png"),
};
export function ElementImpact({ element }: { element: Element }) {
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    let next = 0;
    const timer = setInterval(() => {
      next++;
      setFrame(next);
      if (next >= 4) clearInterval(timer);
    }, 65);
    return () => clearInterval(timer);
  }, []);
  if (frame >= 4) return null;
  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        width: 150,
        height: 150,
        overflow: "hidden",
      }}
    >
      <Image
        source={sources[element]}
        style={{
          position: "absolute",
          width: 600,
          height: 150,
          left: -150 * frame,
          top: 0,
        }}
      />
    </View>
  );
}
