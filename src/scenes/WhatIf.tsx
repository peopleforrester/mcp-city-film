// ABOUTME: Scene 8: what if you gave your end users generative AI and MCP, and told them to go.
// ABOUTME: The shout pops word by word.

import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Caption, Screen, Shadow, ZONE } from "../ui";

const WORDS = ["Use AI!", "Explore!", "Experiment!", "MCP!"];

export const WhatIf: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  return (
    <Screen horizon={0.7}>
      <Shadow name="superpowers" opacity={0.9} />
      <Caption from={0} top size={52}>What if you gave your end users generative AI, and MCP, and then said:</Caption>
      <div style={{ position: "absolute", left: 96, right: 96, top: 420, display: "flex", gap: 40, flexWrap: "wrap" }}>
        {WORDS.map((w, i) => {
          const s = spring({ frame: frame - Math.round(durationInFrames * 0.3) - i * Math.round(durationInFrames * 0.05), fps, config: { damping: 8, stiffness: 160 } });
          return (
            <div key={w} style={{ fontSize: 100, fontWeight: 800, color: ZONE[i], opacity: s, transform: `scale(${s}) rotate(${(i % 2 ? 4 : -4) * (1 - s)}deg)`, textShadow: "0 4px 30px rgba(0,0,0,0.6)" }}>
              {w}
            </div>
          );
        })}
      </div>
      <Caption from={Math.round(durationInFrames * 0.55)} end={Math.round(durationInFrames * 0.8)} size={44}>You handed everyone a relentless hacker. On your hardware. Inside your zones. With your tokens.</Caption>
      <Caption from={Math.round(durationInFrames * 0.82)} size={44}>It runs on the end-user device, as that user. People forget that a laptop is a server.</Caption>
    </Screen>
  );
};
