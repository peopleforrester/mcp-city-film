// ABOUTME: Scene 5: one line in a log, told in the deck's five attack pictures with a tracer that carries the token out.
// ABOUTME: CVE-2026-47250, as the public record tells it; each picture lands on its spoken line.

import React from "react";
import { Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Caption, PINK, Screen, useBeats } from "../ui";

const STEPS = [
  ["1-plant", "An attacker plants one line in a log."],
  ["2-ask", "An operator asks the agent to read the logs."],
  ["3-run", "The agent runs kubectl against the attacker's server, TLS verification off."],
  ["4-token", "kubectl sends the operator's bearer token."],
  ["5-replay", "The attacker now holds a token for a cluster they could not reach."],
];

export const Attack: React.FC = () => {
  const frame = useCurrentFrame();
  const b = useBeats("attack");
  const i = Math.min(STEPS.length - 1, Math.max(0, b.current - 1));
  const local = frame - b.at(Math.max(1, Math.min(5, b.current)));
  const fade = interpolate(local, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const tracer = interpolate(frame, [b.at(1), b.at(6)], [160, 1760], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <Screen horizon={0.9}>
      <Img src={staticFile(`art/attack/${STEPS[i][0]}.jpg`)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: (b.current === 0 ? 1 : fade) * 0.92, transform: `scale(${1 + Math.max(0, local) * 0.0006})` }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 360, background: "linear-gradient(180deg, transparent, rgba(3,16,31,0.95))" }} />
      <div style={{ position: "absolute", left: tracer, bottom: 236, width: 26, height: 26, borderRadius: 13, background: PINK, boxShadow: `0 0 30px ${PINK}, 0 0 60px ${PINK}` }} />
      <div style={{ position: "absolute", left: 160, right: 160, bottom: 248, height: 2, background: "rgba(255,60,100,0.35)" }} />
      <Caption from={b.at(0)} top size={44}>A security tale: CVE-2026-47250, one line in a log file. mcp-server-kubernetes, fixed in 3.7.0.</Caption>
      {STEPS.map(([, line], k) => (
        <Caption key={line} from={b.at(1 + k)} end={b.at(2 + k)} size={50}>{line}</Caption>
      ))}
      <Caption from={b.at(6)} size={46}>A hacker's game is multi-dimensional chess. The day that cluster is exposed, they have one more piece.</Caption>
    </Screen>
  );
};
