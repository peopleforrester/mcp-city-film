// ABOUTME: Scene 11: the person at the gate, the lines that end the talk, the URL, and the spider.
// ABOUTME: Talk to your users.

import React from "react";
import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { CYAN, Caption, Screen, Shadow, useBeats } from "../ui";

export const Close: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const b = useBeats("close");
  const url = spring({ frame: frame - b.at(3), fps, config: { damping: 16 } });
  const spider = interpolate(frame, [durationInFrames - 90, durationInFrames], [2000, -200], { extrapolateLeft: "clamp" });
  return (
    <Screen horizon={0.7}>
      <Shadow name="gate" />
      <Caption from={b.at(0)} top size={64}>Talk to your users.</Caption>
      <Caption from={b.at(1)} end={b.at(2)} size={44}>The biggest lever is a relationship with the users who consume your MCP servers.</Caption>
      <Caption from={b.at(2)} end={b.at(3)} size={44}>Talk and listen. More than ever it is a human problem, and humans can help us solve it.</Caption>
      <div style={{ position: "absolute", right: 96, top: 170, fontSize: 40, fontFamily: "ui-monospace, monospace", color: CYAN, textShadow: "0 0 10px #000, 0 2px 14px #000", background: "rgba(3,16,31,0.55)", padding: "8px 18px", borderRadius: 10, opacity: url, transform: `translateY(${(1 - url) * 20}px)` }}>mcp.michaelrishiforrester.com</div>
      <Img src={staticFile("art/spider.png")} style={{ position: "absolute", left: spider, bottom: -6, width: 110, transform: `rotate(${Math.sin(frame / 3) * 6}deg)` }} />
    </Screen>
  );
};
