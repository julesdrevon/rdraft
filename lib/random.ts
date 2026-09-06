/** Fisher-Yates. Returns a new array; the input is left untouched. */
export function shuffle<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function sample<T>(items: readonly T[]): T | undefined {
  if (items.length === 0) return undefined;
  return items[Math.floor(Math.random() * items.length)];
}

/** `count` distinct items, or as many as the pool holds. */
export function sampleMany<T>(items: readonly T[], count: number): T[] {
  return shuffle(items).slice(0, count);
}
