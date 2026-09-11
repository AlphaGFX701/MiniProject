const listeners = new Set<() => void>();
export function announceCombatSound() {
  listeners.forEach((listener) => listener());
}
export function onCombatSound(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
