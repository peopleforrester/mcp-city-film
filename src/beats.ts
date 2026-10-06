// ABOUTME: The arithmetic behind beat-synced captions: where each voice beat starts in a scene, and which one is current.
// ABOUTME: Pure functions, so the timing can be tested without rendering.

/**
 * Start frame of each beat in a scene. `sceneFrames` is the narrated scene length the beats were
 * measured against; when the scene is shorter (the captions-only cut), the starts scale to fit.
 */
export function beatStarts(beats: readonly number[], sceneFrames: number, durationInFrames: number): number[] {
  const scale = sceneFrames > 0 ? durationInFrames / sceneFrames : 1;
  const starts: number[] = [];
  let acc = 0;
  for (const f of beats) {
    starts.push(Math.round(acc * scale));
    acc += f;
  }
  return starts;
}

/** Index of the last beat that has started by `frame`; 0 before the first. */
export function currentBeat(starts: readonly number[], frame: number): number {
  return Math.max(0, starts.filter((s) => s <= frame).length - 1);
}
