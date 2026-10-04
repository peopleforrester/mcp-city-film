// ABOUTME: Scene 3: the five things the title promised, set aside in rainbow tiles.
// ABOUTME: "Now, I lied to you."

import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Caption, Screen, ZONE } from "../ui";

const TOPICS = ["The architecture", "The number", "The process", "The security incidents", "Wrapping MCP in MCP"];

export const Expected: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const leave = interpolate(frame, [durationInFrames - 40, durationInFrames - 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <Screen horizon={0.9}>
      <Caption from={0} top size={56}>What you expected me to talk about.</Caption>
      <div style={{ position: "absolute", top: 300, left: 96, right: 96, display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 24 }}>
        {TOPICS.map((t, i) => {
          const s = spring({ frame: frame - 10 - i * 8, fps, config: { damping: 10 } });
          return (
            <div key={t} style={{ background: ZONE[i], color: "#000", borderRadius: 18, padding: 28, height: 300, fontSize: 40, fontWeight: 700, display: "flex", alignItems: "flex-end", opacity: s * (1 - leave), transform: `translateY(${(1 - s) * 80 + leave * 500}px) rotate(${leave * (i - 2) * 8}deg)` }}>
              {t}
            </div>
          );
        })}
      </div>
      <Caption from={Math.round(durationInFrames * 0.45)} size={44}>Other people here have covered all of these. I can answer every one. Quickly, then.</Caption>
    </Screen>
  );
};
