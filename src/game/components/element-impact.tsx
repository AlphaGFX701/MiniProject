import { useEffect, useState } from "react";
import { Animated, Image, StyleSheet, Text, View } from "react-native";
import type { Element } from "../types";
const sources = {
  ice: require("../../../assets/game/effects/splash.png"),
  dark: require("../../../assets/game/effects/scratch.png"),
  fire: require("../../../assets/game/effects/fire.png"),
  water: require("../../../assets/game/effects/splash.png"),
  grass: require("../../../assets/game/effects/green.png"),
};
export function ElementImpact({ element }: { element: Element }) {
  if (element === "psychic") return <PsychicImpact />;
  return <SpriteImpact element={element} />;
}

function PsychicImpact() {
  const [pulse] = useState(() => new Animated.Value(0));
  useEffect(() => {
    Animated.timing(pulse, {
      toValue: 1,
      duration: 520,
      useNativeDriver: true,
    }).start();
  }, [pulse]);
  return (
    <View pointerEvents="none" style={styles.psychicWrap}>
      {[0, 1, 2].map((ring) => (
        <Animated.View
          key={ring}
          style={[
            styles.psychicRing,
            {
              borderColor: ring % 2 ? "#FF78E8" : "#A779FF",
              opacity: pulse.interpolate({
                inputRange: [0, 0.7, 1],
                outputRange: [0.95, 0.65, 0],
              }),
              transform: [
                {
                  scale: pulse.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.2 + ring * 0.12, 0.9 + ring * 0.18],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
      <Text style={styles.psychicSymbol}>◎</Text>
    </View>
  );
}

function SpriteImpact({ element }: { element: Exclude<Element, "psychic"> }) {
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

const styles = StyleSheet.create({
  psychicWrap: {
    position: "absolute",
    width: 150,
    height: 150,
    alignItems: "center",
    justifyContent: "center",
  },
  psychicRing: {
    position: "absolute",
    width: 118,
    height: 118,
    borderRadius: 59,
    borderWidth: 6,
  },
  psychicSymbol: {
    color: "#FFD6FA",
    fontSize: 54,
    fontWeight: "900",
    textShadowColor: "#7928CA",
    textShadowRadius: 8,
  },
});
