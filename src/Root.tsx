// ABOUTME: Registers the narrated film, the captions-only cut, the deck video and the architecture video at 1920 by 1080, 30 fps.
// ABOUTME: Each film scene and each deck slide is also registered on its own so one can be rendered or previewed.

import React from "react";
import { Composition } from "remotion";
import { ARCHITECTURE_FRAMES, Architecture } from "./architecture/Architecture";
import { DECK_FRAMES, DECK_SIZE, Deck, deckSlides, heldFor } from "./deck/Deck";
import { Slide } from "./deck/Slide";
import { FPS, Film, SCENES, SILENT_SCENES, TOTAL_FRAMES, totalFrames } from "./Film";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Film" component={Film} durationInFrames={TOTAL_FRAMES} fps={FPS} width={1920} height={1080} />
    <Composition id="FilmSilent" component={() => <Film narrated={false} />} durationInFrames={totalFrames(SILENT_SCENES)} fps={FPS} width={1920} height={1080} />
    <Composition id="Architecture" component={Architecture} durationInFrames={ARCHITECTURE_FRAMES} fps={FPS} width={1920} height={1080} />
    <Composition id="Deck" component={Deck} durationInFrames={DECK_FRAMES} fps={FPS} {...DECK_SIZE} />
    {deckSlides.map((s, i) => (
      <Composition key={s.id} id={`slide-${String(s.number).padStart(2, "0")}`} component={() => <Slide slide={s} held={heldFor(i)} />} durationInFrames={120} fps={FPS} {...DECK_SIZE} />
    ))}
    {SCENES.map((s) => (
      <Composition key={s.id} id={`scene-${s.id}`} component={() => <>{s.node}</>} durationInFrames={s.frames} fps={FPS} width={1920} height={1080} />
    ))}
  </>
);
