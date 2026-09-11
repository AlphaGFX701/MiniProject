export const QTE_TIMING = {
  prepare: 1000,
  collect: 5000,
  result: 800,
} as const;
export const WILD_BASIC_DAMAGE = 4;
export const WILD_ULTIMATE_DAMAGE = 15;

export function qteStage(
  elapsed: number,
): "ready" | "collect" | "result" | "done" {
  if (elapsed < QTE_TIMING.prepare) return "ready";
  if (elapsed < QTE_TIMING.prepare + QTE_TIMING.collect) return "collect";
  if (elapsed < QTE_TIMING.prepare + QTE_TIMING.collect + QTE_TIMING.result)
    return "result";
  return "done";
}

export function orbAvailable(index: number, elapsed: number) {
  return (
    index >= 0 &&
    index < 10 &&
    qteStage(elapsed) === "collect" &&
    elapsed >= QTE_TIMING.prepare + Math.floor(index / 2) * 800
  );
}

export function collectOrbHits(
  previous: ReadonlySet<number>,
  orbs: { x: number; y: number }[],
  point: { x: number; y: number },
  elapsed: number,
): Set<number> {
  const hits = new Set(previous);
  orbs.forEach((orb, index) => {
    if (
      orbAvailable(index, elapsed) &&
      Math.hypot(orb.x - point.x, orb.y - point.y) <= 36
    )
      hits.add(index);
  });
  return hits;
}
