import { useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, Text, View, type LayoutChangeEvent } from "react-native";

import {
  isQteOrbVisible,
  qteOrbOpacity,
  qteRating,
  qteStage,
  QTE_ORB_COUNT,
  QTE_WAVE_SIZE,
  QTE_TIMING,
  segmentHitsCircle,
  type Point,
} from "../presentation-rules";
import { useGame } from "../game-context";
import type { Element } from "../types";
import { elementColors, palette } from "../theme";

const symbols: Record<Element, string> = {
  fire: "✦",
  water: "●",
  grass: "❧",
  ice: "❄",
  psychic: "◎",
  dark: "☾",
};

type OrbPosition = { x: number; y: number; size: number };

function createOrbPositions(): OrbPosition[] {
  const positions: OrbPosition[] = [];
  for (let index = 0; index < QTE_ORB_COUNT; index += 1) {
    let candidate: OrbPosition = { x: 0.5, y: 0.5, size: 44 };
    for (let attempt = 0; attempt < 30; attempt += 1) {
      candidate = {
        x: 0.1 + Math.random() * 0.8,
        y: 0.12 + Math.random() * 0.76,
        size: 40 + Math.round(Math.random() * 12),
      };
      const wave = Math.floor(index / QTE_WAVE_SIZE);
      const clear = positions.every((other, otherIndex) => {
        const otherWave = Math.floor(otherIndex / QTE_WAVE_SIZE);
        if (Math.abs(otherWave - wave) > 1) return true;
        return Math.hypot(candidate.x - other.x, candidate.y - other.y) > 0.13;
      });
      if (clear) break;
    }
    positions.push(candidate);
  }
  return positions;
}

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
  const [fieldSize, setFieldSize] = useState({ width: 300, height: 300 });
  const positions = useMemo(() => createOrbPositions(), []);
  const [elapsed, setElapsed] = useState(0);
  const [collectedAt, setCollectedAt] = useState<Record<number, number>>({});
  const collectedRef = useRef<Record<number, number>>({});
  const elapsedRef = useRef(0);
  const previousTouch = useRef<Point | null>(null);
  const finished = useRef(false);
  const onDone = useRef(onComplete);

  useEffect(() => {
    onDone.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (!active) return;
    const startedAt = Date.now();
    const timer = setInterval(() => {
      const nextElapsed = Date.now() - startedAt;
      elapsedRef.current = nextElapsed;
      setElapsed(nextElapsed);
      if (qteStage(nextElapsed) === "done" && !finished.current) {
        finished.current = true;
        markHint("qteHintSeen");
        onDone.current(Object.keys(collectedRef.current).length);
      }
    }, 40);
    return () => clearInterval(timer);
  }, [active, markHint]);

  const collectAlong = (point: Point) => {
    const start = previousTouch.current;
    previousTouch.current = point;
    if (
      !start ||
      !active ||
      finished.current ||
      qteStage(elapsedRef.current) !== "collect"
    )
      return;

    const additions: Record<number, number> = {};
    positions.forEach((orb, index) => {
      if (
        collectedRef.current[index] !== undefined ||
        !isQteOrbVisible(index, elapsedRef.current) ||
        !segmentHitsCircle(
          start,
          point,
          { x: orb.x * fieldSize.width, y: orb.y * fieldSize.height },
          orb.size * 0.72,
        )
      )
        return;
      additions[index] = elapsedRef.current;
    });
    if (Object.keys(additions).length === 0) return;
    collectedRef.current = { ...collectedRef.current, ...additions };
    setCollectedAt(collectedRef.current);
  };

  const onLayout = (event: LayoutChangeEvent) =>
    setFieldSize({
      width: event.nativeEvent.layout.width,
      height: event.nativeEvent.layout.height,
    });
  const stage = qteStage(elapsed);
  const collectEnd = QTE_TIMING.prepare + QTE_TIMING.collect;
  const count = Object.keys(collectedAt).length;

  return (
    <View style={styles.overlay}>
      <Text style={styles.title}>
        {stage === "ready"
          ? "GET READY"
          : stage === "result" || stage === "done"
            ? qteRating(count)
            : "CHARGE YOUR ULTIMATE"}
      </Text>
      <Text style={styles.copy}>
        {!save.qteHintSeen
          ? "Hold and sweep through the orbs"
          : `${element.toUpperCase()} ENERGY`}
      </Text>
      <Text style={styles.counter}>
        {stage === "ready"
          ? "0.8s"
          : `${Math.max(0, (collectEnd - elapsed) / 1000).toFixed(1)}s`}{" "}
        · COLLECTED {count}/{QTE_ORB_COUNT}
      </Text>
      <View
        style={styles.field}
        onLayout={onLayout}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={(event) => {
          previousTouch.current = {
            x: event.nativeEvent.locationX,
            y: event.nativeEvent.locationY,
          };
        }}
        onResponderMove={(event) =>
          collectAlong({
            x: event.nativeEvent.locationX,
            y: event.nativeEvent.locationY,
          })
        }
        onResponderRelease={() => {
          previousTouch.current = null;
        }}
        onResponderTerminate={() => {
          previousTouch.current = null;
        }}
      >
        {stage === "collect"
          ? positions.map((orb, index) => {
              const collected = collectedAt[index];
              const opacity = qteOrbOpacity(index, elapsed, collected);
              if (opacity <= 0) return null;
              return (
                <View
                  key={index}
                  pointerEvents="none"
                  style={[
                    styles.orb,
                    {
                      width: orb.size,
                      height: orb.size,
                      borderRadius: orb.size / 2,
                      left: orb.x * fieldSize.width - orb.size / 2,
                      top: orb.y * fieldSize.height - orb.size / 2,
                      backgroundColor: elementColors[element],
                      opacity,
                      transform: [
                        { scale: collected === undefined ? 1 : 1.25 },
                      ],
                    },
                  ]}
                >
                  <Text style={[styles.symbol, { fontSize: orb.size * 0.55 }]}>
                    {symbols[element]}
                  </Text>
                </View>
              );
            })
          : null}
      </View>
      <Text style={styles.rating}>{qteRating(count)}</Text>
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
  counter: {
    color: "white",
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 10,
  },
  field: { height: 300, width: "100%", overflow: "hidden" },
  orb: {
    position: "absolute",
    borderWidth: 3,
    borderColor: "white",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "white",
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 6,
  },
  symbol: { color: "white" },
  rating: {
    color: palette.yellow,
    fontSize: 20,
    fontWeight: "bold",
    minHeight: 28,
    textAlign: "center",
  },
});
