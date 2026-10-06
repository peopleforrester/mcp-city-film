// ABOUTME: Unit tests for the beat timing that lands film captions and motion on their spoken lines.
// ABOUTME: Covers accumulation, scaling to the shorter captions-only scene, and which beat is current.
import assert from "node:assert/strict";
import { test } from "node:test";
import { beatStarts, currentBeat } from "../src/beats.ts";

test("beat starts accumulate the beat lengths", () => {
  assert.deepEqual(beatStarts([10, 20, 30], 70, 70), [0, 10, 30]);
});

test("beat starts scale to a shorter scene, as in the captions-only cut", () => {
  assert.deepEqual(beatStarts([10, 20, 30], 70, 35), [0, 5, 15]);
});

test("no timing means no beats", () => {
  assert.deepEqual(beatStarts([], 0, 90), []);
});

test("the current beat is the last one that has started", () => {
  const starts = [0, 10, 30];
  assert.equal(currentBeat(starts, 0), 0);
  assert.equal(currentBeat(starts, 9), 0);
  assert.equal(currentBeat(starts, 10), 1);
  assert.equal(currentBeat(starts, 29), 1);
  assert.equal(currentBeat(starts, 400), 2);
});
