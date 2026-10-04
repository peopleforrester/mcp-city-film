// ABOUTME: The film: ten scenes in order, cut with fades, the keynote's story as a shadow play.
// ABOUTME: Each scene lasts as long as its voice-over clip plus a breath (src/timing.json); the total is computed from that.

import React from "react";
import { Audio, staticFile } from "remotion";
import timing from "./timing.json";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { Attack } from "./scenes/Attack";
import { City } from "./scenes/City";
import { Close } from "./scenes/Close";
import { Expected } from "./scenes/Expected";
import { Gates } from "./scenes/Gates";
import { Lever } from "./scenes/Lever";
import { TheNo } from "./scenes/TheNo";
import { WhatIf } from "./scenes/WhatIf";
import { Wrapped } from "./scenes/Wrapped";
import { Orbit } from "./scenes/Orbit";

export const FPS = 30;
const CUT = 18;

const T = timing as Record<string, { frames: number }>;

/** The scenes in order. With `narrated` each lasts as long as its clip; without, the shorter captions-only length. */
export const scenes = (narrated: boolean): { id: string; frames: number; node: React.ReactNode }[] => {
  const frames = (id: string, fallback: number) => (narrated ? T[id]?.frames : undefined) ?? fallback;
  return [
  { id: "orbit", frames: frames("orbit", 270), node: <Orbit /> },
  { id: "expected", frames: frames("expected", 180), node: <Expected /> },
  { id: "city", frames: frames("city", 270), node: <City /> },
  { id: "gates", frames: frames("gates", 320), node: <Gates /> },
  { id: "attack", frames: frames("attack", 340), node: <Attack /> },
  { id: "wrapped", frames: frames("wrapped", 280), node: <Wrapped /> },
  { id: "whatif", frames: frames("whatif", 260), node: <WhatIf /> },
  { id: "theno", frames: frames("theno", 300), node: <TheNo /> },
  { id: "sayno", frames: frames("sayno", 300), node: <City sayNo /> },
  { id: "lever", frames: frames("lever", 480), node: <Lever /> },
  { id: "close", frames: frames("close", 300), node: <Close /> },
  ];
};

export const SCENES = scenes(true);
export const SILENT_SCENES = scenes(false);
export const totalFrames = (list: { frames: number }[]) => list.reduce((n, s) => n + s.frames, 0) - CUT * (list.length - 1);
export const TOTAL_FRAMES = totalFrames(SCENES);

export const Film: React.FC<{ narrated?: boolean }> = ({ narrated = true }) => (
  <TransitionSeries>
    {(narrated ? SCENES : SILENT_SCENES).flatMap((s, i) => [
      <TransitionSeries.Sequence key={s.id} durationInFrames={s.frames}>
        {s.node}
        {narrated && T[s.id] && <Audio src={staticFile(`voice/${s.id}.mp3`)} />}
      </TransitionSeries.Sequence>,
      ...(i < (narrated ? SCENES : SILENT_SCENES).length - 1 ? [<TransitionSeries.Transition key={`${s.id}-cut`} presentation={fade()} timing={linearTiming({ durationInFrames: CUT })} />] : []),
    ])}
  </TransitionSeries>
);
