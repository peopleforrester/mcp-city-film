// ABOUTME: Scene 8: the email ask (yes, yes, no), the human-tools line, the no, and the whisper to the agent.
// ABOUTME: Then the city scene shows where the traffic went.

import React, { useContext } from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CYAN, Caption, CaptionsShown, PINK, Screen, Shadow, useBeats } from "../ui";

const ASKS: [string, string, string][] = [["Read my email", "Yes", CYAN], ["Draft my replies", "Yes", CYAN], ["Send as me", "No", PINK]];

export const TheNo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const b = useBeats("theno");
  const words = useContext(CaptionsShown);
  const whisper = spring({ frame: frame - b.at(5), fps, config: { damping: 20 } });
  return (
    <Screen horizon={0.7}>
      <Shadow name="doors" opacity={1 - whisper * 0.9} />
      <Shadow name="whisper" from={b.at(5)} opacity={whisper} />
      <Caption from={b.at(0)} top size={52}>Then the user made a reasonable request: "I want to give the agent access to my email."</Caption>
      <div style={{ position: "absolute", left: 96, top: 300, opacity: 1 - whisper }}>
        {ASKS.map(([ask, ans, color], i) => {
          const s = spring({ frame: frame - b.at(i) - (i === 0 ? 40 : 0), fps, config: { damping: 12 } });
          return (
            <div key={ask} style={{ display: "flex", gap: 30, alignItems: "baseline", fontSize: 56, marginBottom: 18, opacity: s, transform: `translateX(${(1 - s) * -60}px)` }}>
              {words ? (
                <>
                  <span style={{ fontWeight: 800, color, width: 120 }}>{ans}</span>
                  <span>{ask}</span>
                </>
              ) : (
                <span style={{ fontWeight: 800, color, fontSize: 120, lineHeight: 1, textShadow: "0 4px 24px rgba(0,0,0,0.7)" }}>{ans === "Yes" ? "✔" : "✘"}</span>
              )}
            </div>
          );
        })}
      </div>
      <Caption from={b.at(3)} end={b.at(4)} size={46}>Human tools for human communication. Accountability. Auditability. Attribution.</Caption>
      <Caption from={b.at(4)} end={b.at(5)} size={46}>We said no. We offered alternatives.</Caption>
      <Caption from={b.at(5)} size={46}>"I don't see an MCP server for Outlook. Is there some other way we might do this?"</Caption>
    </Screen>
  );
};
