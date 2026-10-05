// ABOUTME: Scene 2: the five questions the audience expects, set aside in rainbow tiles.
// ABOUTME: "My message today is remarkably untechnical."

import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Caption, Screen, ZONE, useBeats } from "../ui";

const TOPICS = ["How many people adopted MCP?", "What architecture do you use?", "What is your process for evaluation?", "Did you run into security issues?", "Things we thought were unusual"];

export const Expected: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const b = useBeats("expected");
  const leave = interpolate(frame, [durationInFrames - 40, durationInFrames - 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <Screen horizon={0.9}>
      <Caption from={b.at(0)} top size={56}>What you expect, and what I want you to leave with.</Caption>
      <div style={{ position: "absolute", top: 300, left: 96, right: 96, display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 24 }}>
        {TOPICS.map((t, i) => {
          const s = spring({ frame: frame - b.at(1) - i * 10, fps, config: { damping: 10 } });
          return (
            <div key={t} style={{ background: ZONE[i], color: "#000", borderRadius: 18, padding: 28, height: 300, fontSize: 34, fontWeight: 700, display: "flex", alignItems: "flex-end", opacity: s * (1 - leave), transform: `translateY(${(1 - s) * 80 + leave * 500}px) rotate(${leave * (i - 2) * 8}deg)` }}>
              {t}
            </div>
          );
        })}
      </div>
      <Caption from={b.at(2)} end={b.at(3)} size={44}>It is all on the website.</Caption>
      <Caption from={b.at(3)} size={44}>What I want you to leave with: the most effective lever for MCP adoption.</Caption>
    </Screen>
  );
};
