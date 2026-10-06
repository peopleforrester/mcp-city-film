// ABOUTME: The keynote deck as a video: every slide from deck.json in order, each held as long as its stretch of the voice track.
// ABOUTME: The voice is one clip per slide, or one recording with each slide's start, as src/deck/timing.json says.

import React from "react";
import { Audio, Sequence, Series, staticFile } from "remotion";
import deck from "./deck.json";
import timing from "./timing.json";
import { Slide, type SlideData, signature } from "./Slide";

export type Timing = { track: string | null; slides: { frames: number; clip: string | null }[] };

const SLIDES = deck.slides as unknown as SlideData[];
const T = timing as Timing;
const FALLBACK = 150;

export const DECK_FRAMES = SLIDES.reduce((n, _, i) => n + (T.slides[i]?.frames ?? FALLBACK), 0);
export const DECK_SIZE = { width: deck.width, height: deck.height };
export const deckSlides = SLIDES;

/** The signatures each slide inherits from the one before it, so a build adds only what is new. */
const HELD = SLIDES.map((s, i) => (i === 0 ? new Set<string>() : new Set(SLIDES[i - 1]!.elements.map(signature))));
export const heldFor = (i: number): Set<string> => HELD[i] ?? new Set();

export function Deck(): React.ReactElement {
  return (
    <>
      <Series>
        {SLIDES.map((s, i) => {
          const t = T.slides[i];
          return (
            <Series.Sequence key={s.id} durationInFrames={t?.frames ?? FALLBACK}>
              <Slide slide={s} held={HELD[i]} />
              {!T.track && t?.clip && <Audio src={staticFile(t.clip)} />}
            </Series.Sequence>
          );
        })}
      </Series>
      {T.track && (
        <Sequence>
          <Audio src={staticFile(T.track)} />
        </Sequence>
      )}
    </>
  );
}
