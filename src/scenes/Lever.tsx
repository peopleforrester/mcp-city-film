// ABOUTME: Scene 10: the biggest lever, in six of the deck's shadow pictures with the deck's lines.
// ABOUTME: Hearts and minds, love your users, say no with a why, send the signals, run it like a product.

import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { Caption, Screen, Shadow } from "../ui";

const BEATS: [string, string][] = [
  ["question-city", "So what was the biggest lever? Not the policy, the architecture, the proxies or the registries alone."],
  ["human-problems", "We had to win the hearts and minds of users. An internal team is now a SaaS company, and its biggest threat is its own end users."],
  ["want", "Love your users. Figure out what they need, and get them to yes."],
  ["no-alternatives", "Say no when you must, and explain why. A no without a why is a workaround waiting to happen."],
  ["listening", "Send the signals. Let them vote, let them ask, let them tell you where the openings are."],
  ["artifacts", "Run the service like a product: self-service, feedback, a leaderboard, a community."],
];

export const Lever: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const STEP = Math.floor(durationInFrames / BEATS.length);
  const i = Math.min(BEATS.length - 1, Math.floor(frame / STEP));
  return (
    <Screen horizon={0.7}>
      <Shadow key={BEATS[i][0]} name={BEATS[i][0]} from={0} />
      <Caption key={i} from={i * STEP + 4} size={48}>{BEATS[i][1]}</Caption>
    </Screen>
  );
};
