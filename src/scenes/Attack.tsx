// ABOUTME: Scene 6: one line in a log, told in the deck's five attack pictures with a tracer that carries the token out.
// ABOUTME: CVE-2026-47250, as the public record tells it.

import React from "react";
import { Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Caption, PINK, Screen } from "../ui";

const STEPS = [
  ["1-plant", "An attacker plants one line in a log."],
  ["2-ask", "An operator asks the agent to read the logs."],
  ["3-run", "The agent runs kubectl against the attacker's server, TLS verification off."],
  ["4-token", "kubectl sends the operator's bearer token."],
  ["5-replay", "The attacker replays the token. Every call was authorized."],
];
const STEP = 66;

export const Attack: React.FC = () => {
  const frame = useCurrentFrame();
  const i = Math.min(STEPS.length - 1, Math.floor(frame / STEP));
  const local = frame - i * STEP;
  const fade = interpolate(local, [0, 12], [0, 1], { extrapolateRight: "clamp" });
  const tracer = interpolate(frame, [0, STEP * STEPS.length], [160, 1760], { extrapolateRight: "clamp" });
  return (
    <Screen horizon={0.9}>
      <Img src={staticFile(`art/attack/${STEPS[i][0]}.jpg`)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: fade * 0.92, transform: `scale(${1 + local * 0.0006})` }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 360, background: "linear-gradient(180deg, transparent, rgba(3,16,31,0.95))" }} />
      <div style={{ position: "absolute", left: tracer, bottom: 236, width: 26, height: 26, borderRadius: 13, background: PINK, boxShadow: `0 0 30px ${PINK}, 0 0 60px ${PINK}` }} />
      <div style={{ position: "absolute", left: 160, right: 160, bottom: 248, height: 2, background: "rgba(255,60,100,0.35)" }} />
      <Caption from={0} top size={44}>One line in a log file. CVE-2026-47250, mcp-server-kubernetes, fixed in 3.7.0.</Caption>
      <Caption key={i} from={i * STEP + 2} size={50}>{STEPS[i][1]}</Caption>
    </Screen>
  );
};
