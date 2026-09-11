import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { collectOrbHits, qteStage } from "../presentation-rules";
import { useGame } from "../game-context";
import type { Element } from "../types";
import { elementColors, palette } from "../theme";
import { randomOrbLayout } from "../team-battle";
const symbols: Record<Element, string> = {
  fire: "✦",
  water: "●",
  grass: "❧",
  ice: "❄",
  psychic: "◎",
  dark: "☾",
};

export function ChargeChallenge({
  element,
  active,
  onComplete,
}: {
  element: Element;
  active: boolean;
  onComplete: (count: number) => void;
}) {
  const { save, markHint } = useGame();
  const [width, setWidth] = useState(300);
  const [layout] = useState(() => randomOrbLayout());
  const [elapsed, setElapsed] = useState(0);
  const [collected, setCollected] = useState<number[]>([]);
  const hits = useRef(new Set<number>());
  const finished = useRef(false);
  const elapsedRef = useRef(0);
  const onDone = useRef(onComplete);
  useEffect(() => {
    onDone.current = onComplete;
  }, [onComplete]);
  useEffect(() => {
    if (!active) return;
    const timer = setInterval(() => {
      elapsedRef.current += 50;
      setElapsed(elapsedRef.current);
      if (qteStage(elapsedRef.current) === "done" && !finished.current) {
        finished.current = true;
        markHint("qteHintSeen");
        onDone.current(hits.current.size);
      }
    }, 50);
    return () => clearInterval(timer);
  }, [active, markHint]);
  const orbs = layout.map((orb) => ({
    x: width * orb.x,
    y: orb.y + Math.sin(elapsed / 350 + orb.offset) * 2,
  }));
  const collect = (x: number, y: number) => {
    if (!active || finished.current || elapsed < 1000 || elapsed >= 6000)
      return;
    hits.current = collectOrbHits(hits.current, orbs, { x, y }, elapsed);
    setCollected([...hits.current]);
  };
  return (
    <View style={styles.overlay}>
      <Text style={styles.title}>
        {elapsed < 1000
          ? "GET READY"
          : elapsed >= 6000
            ? "CHARGE COMPLETE"
            : "CHARGE YOUR ULTIMATE"}
      </Text>
      <Text style={styles.copy}>
        {!save.qteHintSeen
          ? "Drag through the orbs"
          : `${element.toUpperCase()} ENERGY`}
      </Text>
      <Text style={styles.title}>
        {Math.max(0, (6000 - Math.max(1000, elapsed)) / 1000).toFixed(1)}s ·{" "}
        {collected.length}
        /10
      </Text>
      <View
        style={styles.field}
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={(e) =>
          collect(e.nativeEvent.locationX, e.nativeEvent.locationY)
        }
        onResponderMove={(e) =>
          collect(e.nativeEvent.locationX, e.nativeEvent.locationY)
        }
      >
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          {orbs.map((orb, i) => (
            <View
              key={i}
              style={[
                styles.orb,
                {
                  left: orb.x - 25,
                  top: orb.y - 25,
                  backgroundColor: elementColors[element],
                  opacity:
                    elapsed < 1000 + Math.floor(i / 2) * 800
                      ? 0
                      : collected.includes(i)
                        ? 0.12
                        : 1,
                },
              ]}
            >
              <Text style={styles.symbol}>{symbols[element]}</Text>
            </View>
          ))}
        </View>
      </View>
      <Text style={styles.title}>
        {collected.length >= 9
          ? "EXCELLENT"
          : collected.length >= 6
            ? "GREAT"
            : collected.length >= 1
              ? "NICE"
              : "KEEP SWIPING"}
      </Text>
    </View>
  );
}
const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#10233EF5",
    zIndex: 40,
    justifyContent: "center",
    padding: 16,
  },
  title: {
    color: palette.yellow,
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    margin: 12,
  },
  copy: { color: "white", textAlign: "center" },
  field: { height: 300, width: "100%" },
  orb: {
    position: "absolute",
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  symbol: { fontSize: 28, color: "white" },
});
