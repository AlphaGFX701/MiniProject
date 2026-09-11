export function chargedDamage(count: number): number {
  return Math.round(15 + Math.max(0, Math.min(10, count)) * 3.5);
}
export function shieldDamage(damage: number, shielded: boolean): number {
  return shielded ? Math.max(1, Math.round(damage * 0.2)) : damage;
}
export function captureShakes(caught: boolean, random: number): number {
  return caught ? 3 : random < 0.5 ? 1 : 2;
}
