// ABOUTME: Scene 9a: the email ask (yes, yes, no), and the whisper to the agent.
// ABOUTME: Then the city scene shows where the traffic went.

import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CYAN, Caption, PINK, Screen, Shadow } from "../ui";

const ASKS: [string, string, string][] = [["Read my email", "Yes", CYAN], ["Draft for me", "Yes", CYAN], ["Send as me", "No", PINK]];

export const TheNo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const whisper = spring({ frame: frame - 150, fps, config: { damping: 20 } });
  return (
    <Screen horizon={0.7}>
      <Shadow name="doors" opacity={1 - whisper * 0.9} />
      <Shadow name="whisper" from={150} opacity={whisper} />
      <Caption from={0} top size={52}>"I want to give the agent access to my email."</Caption>
      <div style={{ position: "absolute", left: 96, top: 300, opacity: 1 - whisper }}>
        {ASKS.map(([ask, ans, color], i) => {
          const s = spring({ frame: frame - 30 - i * 30, fps, config: { damping: 12 } });
          return (
            <div key={ask} style={{ display: "flex", gap: 30, alignItems: "baseline", fontSize: 56, marginBottom: 18, opacity: s, transform: `translateX(${(1 - s) * -60}px)` }}>
              <span style={{ fontWeight: 800, color, width: 120 }}>{ans}</span>
              <span>{ask}</span>
            </div>
          );
        })}
      </div>
      <Caption from={160} size={46}>"I don't see an MCP server for Outlook. Is there some other way we might do this?"</Caption>
    </Screen>
  );
};
