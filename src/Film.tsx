// ABOUTME: The film: eleven scenes in order, cut with fades, the keynote's story as a shadow play.
// ABOUTME: Durations are in frames at 30 fps; the total is computed so the composition and the series agree.

import React from "react";
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

export const SCENES: { id: string; frames: number; node: React.ReactNode }[] = [
  { id: "orbit", frames: 270, node: <Orbit /> },
  { id: "cables", frames: 270, node: <Cables /> },
  { id: "expected", frames: 180, node: <Expected /> },
  { id: "city", frames: 270, node: <City /> },
  { id: "gates", frames: 320, node: <Gates /> },
  { id: "attack", frames: 340, node: <Attack /> },
  { id: "wrapped", frames: 280, node: <Wrapped /> },
  { id: "whatif", frames: 260, node: <WhatIf /> },
  { id: "theno", frames: 300, node: <TheNo /> },
  { id: "sayno", frames: 300, node: <City sayNo /> },
  { id: "acceptance", frames: 420, node: <Acceptance /> },
  { id: "close", frames: 300, node: <Close /> },
];

export const TOTAL_FRAMES = SCENES.reduce((n, s) => n + s.frames, 0) - CUT * (SCENES.length - 1);

export const Film: React.FC = () => (
  <TransitionSeries>
    {SCENES.flatMap((s, i) => [
      <TransitionSeries.Sequence key={s.id} durationInFrames={s.frames}>{s.node}</TransitionSeries.Sequence>,
      ...(i < SCENES.length - 1 ? [<TransitionSeries.Transition key={`${s.id}-cut`} presentation={fade()} timing={linearTiming({ durationInFrames: CUT })} />] : []),
    ])}
  </TransitionSeries>
);
