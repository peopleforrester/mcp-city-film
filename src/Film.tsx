// ABOUTME: The film: eleven scenes in order, cut with fades, the keynote's story as a shadow play.
// ABOUTME: Each scene lasts as long as its voice-over clip plus a breath (src/timing.json); the total is computed from that.

import React from "react";
import { Audio, staticFile } from "remotion";
import timing from "./timing.json";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { Acceptance } from "./scenes/Acceptance";
import { Attack } from "./scenes/Attack";
import { Cables } from "./scenes/Cables";
import { City } from "./scenes/City";
import { Close } from "./scenes/Close";
import { Expected } from "./scenes/Expected";
import { Gates } from "./scenes/Gates";
import { TheNo } from "./scenes/TheNo";
import { WhatIf } from "./scenes/WhatIf";
import { Wrapped } from "./scenes/Wrapped";
import { Orbit } from "./scenes/Orbit";

export const FPS = 30;
const CUT = 18;

const T = timing as Record<string, { frames: number }>;
const frames = (id: string, fallback: number) => T[id]?.frames ?? fallback;

export const SCENES: { id: string; frames: number; node: React.ReactNode }[] = [
  { id: "orbit", frames: frames("orbit", 270), node: <Orbit /> },
  { id: "cables", frames: frames("cables", 270), node: <Cables /> },
  { id: "expected", frames: frames("expected", 180), node: <Expected /> },
  { id: "city", frames: frames("city", 270), node: <City /> },
  { id: "gates", frames: frames("gates", 320), node: <Gates /> },
  { id: "attack", frames: frames("attack", 340), node: <Attack /> },
  { id: "wrapped", frames: frames("wrapped", 280), node: <Wrapped /> },
  { id: "whatif", frames: frames("whatif", 260), node: <WhatIf /> },
  { id: "theno", frames: frames("theno", 300), node: <TheNo /> },
  { id: "sayno", frames: frames("sayno", 300), node: <City sayNo /> },
  { id: "acceptance", frames: frames("acceptance", 420), node: <Acceptance /> },
  { id: "close", frames: frames("close", 300), node: <Close /> },
];

export const TOTAL_FRAMES = SCENES.reduce((n, s) => n + s.frames, 0) - CUT * (SCENES.length - 1);

export const Film: React.FC = () => (
  <TransitionSeries>
    {SCENES.flatMap((s, i) => [
      <TransitionSeries.Sequence key={s.id} durationInFrames={s.frames}>
        {s.node}
        {T[s.id] && <Audio src={staticFile(`voice/${s.id}.mp3`)} />}
      </TransitionSeries.Sequence>,
      ...(i < SCENES.length - 1 ? [<TransitionSeries.Transition key={`${s.id}-cut`} presentation={fade()} timing={linearTiming({ durationInFrames: CUT })} />] : []),
    ])}
  </TransitionSeries>
);
