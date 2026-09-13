export const QTE_TIMING = {
  prepare: 750,
  collect: 4000,
  result: 700,
} as const;
export const QTE_ORB_COUNT = 20;
export const QTE_WAVE_SIZE = 5;
export const QTE_WAVE_INTERVAL = 950;
export const QTE_ORB_LIFETIME = 1450;
export const QTE_ORB_FADE = 200;
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

export type Point = { x: number; y: number };

export function qteOrbSpawnAt(index: number) {
  return QTE_TIMING.prepare + Math.floor(index / QTE_WAVE_SIZE) * QTE_WAVE_INTERVAL;
}

export function isQteOrbVisible(
  index: number,
  elapsed: number,
  collectedAt?: number,
) {
  const spawnAt = qteOrbSpawnAt(index);
  if (qteStage(elapsed) !== "collect" || elapsed < spawnAt) return false;
  if (collectedAt !== undefined) return elapsed < collectedAt + QTE_ORB_FADE;
  return elapsed <= spawnAt + QTE_ORB_LIFETIME;
}

export function qteOrbOpacity(
  index: number,
  elapsed: number,
  collectedAt?: number,
) {
  const spawnAt = qteOrbSpawnAt(index);
  if (!isQteOrbVisible(index, elapsed, collectedAt)) return 0;
  if (collectedAt !== undefined)
    return Math.max(0, 1 - (elapsed - collectedAt) / QTE_ORB_FADE);
  const fadeAt = spawnAt + QTE_ORB_LIFETIME - QTE_ORB_FADE;
  return elapsed <= fadeAt
    ? 1
    : Math.max(0, 1 - (elapsed - fadeAt) / QTE_ORB_FADE);
}

export function segmentHitsCircle(
  start: Point,
  end: Point,
  center: Point,
  radius: number,
) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lengthSquared = dx * dx + dy * dy;
  const t =
    lengthSquared === 0
      ? 0
      : Math.max(
          0,
          Math.min(
            1,
            ((center.x - start.x) * dx + (center.y - start.y) * dy) /
              lengthSquared,
          ),
        );
  return (
    Math.hypot(start.x + t * dx - center.x, start.y + t * dy - center.y) <=
    radius
  );
}

export function qteRating(hits: number) {
  if (hits >= 17) return "EXCELLENT";
  if (hits >= 12) return "GREAT";
  if (hits >= 7) return "NICE";
  return "KEEP SWIPING";
}
