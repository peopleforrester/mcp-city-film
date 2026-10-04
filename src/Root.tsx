// ABOUTME: Registers the narrated film and the captions-only cut at 1920 by 1080, 30 fps.
// ABOUTME: Each scene is also registered on its own so a single one can be rendered or previewed.

import React from "react";
import { Composition } from "remotion";
import { FPS, Film, SCENES, SILENT_SCENES, TOTAL_FRAMES, totalFrames } from "./Film";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Film" component={Film} durationInFrames={TOTAL_FRAMES} fps={FPS} width={1920} height={1080} />
    <Composition id="FilmSilent" component={() => <Film narrated={false} />} durationInFrames={totalFrames(SILENT_SCENES)} fps={FPS} width={1920} height={1080} />
    {SCENES.map((s) => (
      <Composition key={s.id} id={`scene-${s.id}`} component={() => <>{s.node}</>} durationInFrames={s.frames} fps={FPS} width={1920} height={1080} />
    ))}
  </>
);
