# Project State: mcp-city-film

Phase: 3.2 Confirm CI
Approved: 2026-10-06T01:08:25Z by Michael (sha256:29720f9c3c5f)

## Lifecycle
- [x] 1.1 Research
- [x] 1.2 Plan
- [x] 1.3 Approve
- [x] 2.1 Test
- [x] 2.2 Implement
- [x] 2.3 Verify
- [x] 3.1 Stage
- [x] 3.2 Confirm CI
- [ ] 3.3 Promote

## Contracts
- 2026-10-06T01:08:25Z PRD-3 "Remotion deck" (sha256:29720f9c3c5f): the keynote deck as a video, redrawn from the Slides API, voiced from the speaker notes, with a swappable voice track.

## Current Plan
PRD 3 (`prds/3-remotion-deck.md`). M1 extract, M2 layouts and M3 voice are done and shipped in release v0.5. M4, the talk recording, is built on staging (issue #15): the deck video plays Michael's 16:03 room recording, with each slide's frames from the cue times in `src/deck/cues.json` (decisions.md, 2026-10-31). It ships as a release once a full render has been watched. If the Linux Foundation's recording is posted and may be used here, it replaces the room recording by changing `track`, `end` and the cues in `cues.json`.

Waiting on Michael:
- A watch of release v0.6, the architecture walkthrough. Promotion to main follows it, per AGENTS.md.
- A watch of the deck video on the room recording (PRD 3 M4, issue #15), which then ships as a release. The recording no longer waits on him: it is the room recording he made, cleaned to 16:03 on 2026-10-07.

Handed off, not ours: peopleforrester/mcp-city#32 swaps the site's film 720p to v0.5 and rebuilds its captions and chapters; peopleforrester/mcp-city#35 embeds the architecture walkthrough on /architecture.

## Branch & Tests
- Branch: staging, ahead of main by the architecture video.
- Working tree: clean after the test-suite commit.
- Last CI: green on c28d36b (lint, type check, unit and integration tests). The e2e render test runs locally: 8 pass with no warnings.
- Releases: v0.6 is the architecture walkthrough (tag at 2aaaad4); v0.5 is the current film and deck video (tag at 265eb56). v0.4 is the first deck pre-release; v0.3 and earlier are superseded.

## Phase History
- 2026-10-06T01:08:25Z 1.2 → 1.3 PRD-3 approved
- 2026-10-06T01:41:25Z 2.1 → 3.1 M1 to M3 built, checked slide by slide against the deck's PDF export, staged (4742a10)
- 2026-10-06T11:44:59Z 3.1 review changes from issue #4 staged and released as v0.5 (265eb56)
- 2026-10-06T12:17:52Z 2.1 → 3.1 test suite added (unit, integration, e2e), dead scenes removed
- 2026-10-06T12:20:32Z 3.1 → 3.2 CI added and green on c28d36b; 3.3 waits on Michael's watch of v0.5
- 2026-10-06T12:23:50Z 3.2 → 3.3 Michael approved v0.5; main fast-forwarded to 7cd1606, CI green on main
- 2026-10-06T13:38:19Z 2.1 → 3.2 architecture walkthrough built, tested, released as v0.6 (2aaaad4), CI green; 3.3 waits on a watch
- 2026-10-31 2.1 → 3.1 PRD 3 M4: the deck video set to the room recording with per-slide cues (#15); 3.3 waits on a watch
