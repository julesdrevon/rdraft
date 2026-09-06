import { describe, expect, it } from "vitest";

import { sample, sampleMany, shuffle } from "./random";

const source = [1, 2, 3, 4, 5, 6, 7, 8];

describe("shuffle", () => {
  it("keeps every element exactly once", () => {
    expect([...shuffle(source)].sort((a, b) => a - b)).toEqual(source);
  });

  it("leaves the input untouched", () => {
    const input = [...source];
    shuffle(input);
    expect(input).toEqual(source);
  });

  it("handles the empty case", () => {
    expect(shuffle([])).toEqual([]);
  });
});

describe("sample", () => {
  it("returns an element of the array", () => {
    expect(source).toContain(sample(source));
  });

  it("returns undefined for an empty array", () => {
    expect(sample([])).toBeUndefined();
  });
});

describe("sampleMany", () => {
  it("returns the requested count", () => {
    expect(sampleMany(source, 5)).toHaveLength(5);
  });

  it("never repeats an element", () => {
    const picked = sampleMany(source, 8);
    expect(new Set(picked).size).toBe(8);
  });

  it("caps at the pool size rather than padding", () => {
    expect(sampleMany(source, 99)).toHaveLength(source.length);
  });

  it("draws every element over enough runs", () => {
    // A draw of one should not be biased towards the head of the array, which
    // is the mistake a naive `slice(0, n)` would make.
    const seen = new Set<number>();
    for (let i = 0; i < 500; i++) seen.add(sampleMany(source, 1)[0]);
    expect(seen.size).toBe(source.length);
  });
});
