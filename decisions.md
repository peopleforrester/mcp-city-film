# Decisions Log

Append-only audit trail of approvals, amendments, backward steps, and conditional-skip rationales. See [[state-persistence]] for schema.

## 2026-10-06T01:08:25Z · 1.3 · PRD-3 approved

PRD `3-remotion-deck.md` sealed on Michael's instruction to build it now ("do it right now and don't wait").
- Approved-by: Michael@2026-10-06T01:08:25Z
- Plan checksum: sha256:29720f9c3c5f
- Title: Remotion deck

## 2026-10-16 · question 37 · Node toolchain for the hecaton gate

Question: the gate host has no Node or npm, so the declared lint and test commands cannot run there, and a fresh clone needs `npm ci` first. How should the gate get a Node toolchain?
- Answer (Michael, through `hec answer`): install Node 26 on the gate host and have the gate run `npm ci`, matching CI. The host change is tracked as peopleforrester/hecaton#118 and lands through the root runner; until then this repo's gate waits.
- Changes: AGENTS.md declares `Test command: npm ci && npm run lint && npm test` and `E2E command: npm ci && npm run test:e2e`, so both run from a fresh clone. The gate passes only once peopleforrester/hecaton#118 puts Node 26 on the gate host.

## 2026-10-31 · correction · who decided question 37

The entry above for question 37 records its answer as "Answer (Michael, through `hec answer`)". That attribution is wrong: the answer was decided by hecaton's coordinator under Michael's standing rules, not by Michael, and hecaton records it with decided_by = coordinator. The decision itself stands; only the attribution is corrected. Requested by peopleforrester/hecaton#127.
- question 37 (#6), 2026-10-16 04:49 UTC: install Node 26 on the gate host and have the gate run `npm ci`, declaring `Test command: npm ci && npm run lint && npm test`, matching CI. The host change is tracked as peopleforrester/hecaton#118. Decided by the coordinator under Michael's standing rules, not by Michael.

## 2026-10-31 · dependencies · eslint 10, Remotion 4.0.539, esbuild's install script (#10)

`npm ci` warned twice: eslint 9.39.5 is out of support, and esbuild's postinstall was not covered by npm's `allowScripts`. Both gate commands start with `npm ci`, so the gate output carried warnings.
- eslint 9.39.5 → 10.14.0 (released 2026-10-30, the current latest). `@remotion/eslint-config-flat` 4.0.532 pins `typescript-eslint` 8.21.0, which only accepts eslint 8 or 9; 4.0.539 (released 2026-10-26) declares `eslint ^9 || ^10` and pins `typescript-eslint` 8.71.2, which accepts eslint 10. Remotion warns on every CLI command when its packages differ in version, so every `@remotion/*` package and `remotion` moved to 4.0.539 together rather than the eslint config alone. No `overrides` were used.
- esbuild 0.28.1 (pulled in by `@remotion/bundler`): its postinstall is upstream's `install.js`, which checks the platform binary's version and, only if the optional platform package is missing, fetches it from registry.npmjs.org with an integrity check. Approved with `npm install-scripts approve esbuild`, which writes the pinned entry `esbuild@0.28.1`, so a future esbuild version comes back for review.
- Audit: `npm audit fix` raised `fast-uri` past its four advisories (a lockfile-only change). The 21 that remain have no non-breaking fix: `minimatch` below 11.0.1 inside eslint and `typescript-eslint` (no fixed version in range), and `zod` below 4.6.6, pinned at 4.5.4 by Remotion's studio packages (the only fix `npm audit` offers is downgrading `@remotion/cli` to 4.0.501). Both are denial-of-service advisories in local build and lint tooling that never sees untrusted input here, so they wait for upstream releases rather than an `overrides` entry.
- Checked: a fresh `npm ci` prints no `npm warn` lines; `npm run lint`, `npm test` (35 pass) and `npm run test:e2e` (10 pass, real stills of Film, FilmSilent, Deck, Architecture and three single scenes) are green; `npx remotion versions` reports every package on the same version.

## 2026-10-31 · PRD-3 M1 · the extract names each slide's layout (#11)

Issue #11 restates PRD 3's M1 as "`slides.json` holds all 39 live slides, each with its text, speaker notes and layout name". M1 shipped in v0.5 as `src/deck/deck.json`, pulled through the Slides API, with every slide's elements and notes but no layout name; the PRD's per-slide layout name was to pick one of a few React layouts, and the shipped renderer draws every element at its deck geometry instead, so nothing needed it.
- `deck.json` stays the extract's name: AGENTS.md, the renderer, the voice script and the tests all read it, and the PRD's `slides.json` predates the build.
- The layout name is the one the deck shows for the Google Slides layout a slide is built on (`layoutProperties.displayName`, such as "Title and body"). The extractor writes it as each slide's `layout` and fails on a slide whose layout has no name.
- `deck.json` itself carries the field only after the next `npm run deck:extract`, which needs a Slides token this run could not mint; that re-extraction is handed off with the run's report.
## 2026-10-31 · PRD-3 M4 · the deck video on the room recording (#15)

Issue #15 asked which recording M4 uses, then for `track` and each slide's frames.
- Chose: Michael's room recording, the cleaned 16:03 edit of "My recording 232" (Angie Jones' introduction through the applause), the same file as the Drive copy in the talk folder `11-recording` (sha256 `7d91ff2c…3ac0`). It is at `public/deck-recording/2026-10-06-keynote-room.mp3`, unchanged, so it matches the timestamps of the transcript in MCP_for_a_city.
- Why not the Linux Foundation's recording: its session cut was not posted as of 2026-10-30 (talks-knowledge `talks/register.md` row 7). The Agentic AI Foundation's livestream of the Tuesday keynotes is up (YouTube `a8p-Pz1k5l0`, the talk about 44 minutes in), but it belongs to the foundation, and putting its audio in this public repo and its releases needs their permission, which nobody has asked for. The room recording is Michael's own, and the keynote repo judged it fit to publish as an interim recording (mcp-city#14, 2026-10-06).
- Against it, recorded so it is weighed: the same mcp-city#14 note recommended not using the room recording as a video soundtrack, because a phone in the room sounds muffled (little above 4 kHz), though it is intelligible throughout and leveled to −16 LUFS. The deck video uses it anyway because the PRD's goal is the talk as given, the alternative is waiting on a recording with no date that would still need permission, and the cue times carry over: a better recording of the same delivery replaces the file and shifts the cues by one offset.
- Cue times: the recording is audio only, so each slide change is placed where Michael starts speaking to that slide, from Whisper `small.en` word timestamps on this file, and checked against the transcript's paragraph times where a paragraph starts on a slide change (six places, all within 4 s; the transcript's times sit on a coarse grid, Whisper's on the words). Each cue sits 0.2 s before the word, as the synthetic clips lead by 6 frames. `src/deck/cues.json` holds every cue with the words spoken there, so any one can be moved by ear; `npm run deck:cues` writes `timing.json` from it. Slide 1 runs from the introduction, which the deck's title slide stood behind.
- The synthetic clips stay in `public/deck-voice/`; `npm run deck:voice` now keeps the recording's frames when a track is set, instead of resetting `track` to null.
- Checked: `npm run lint`, `npm test` (38 pass) and `npm run test:e2e` (11 pass, including that the recording is as long as `cues.json` says) are green; a rendered sample around the slide 13 to 14 change carries the recording's audio, and slide 14 starts on frame 10070, its cue at 335.68 s. The full render has not been watched.

## 2026-11-01 · issue #5 · Identity and pointers to talks-knowledge

The fleet standard for a talk repo asks for the talk, speaker, argument, event, status and source repos in `README.md`, a "Where things live" section in `AGENTS.md`, and `CLAUDE.md` as a symlink to it.
- Changes: `README.md` gains "The talk", with the argument taken from talks-knowledge's register row 7. `AGENTS.md` gains "Where things live", naming talks-knowledge for the register and abstracts and conference-knowledge for event state. `CLAUDE.md` links to `AGENTS.md`. `tests/identity.test.mjs` holds all three.
- This repo is public and `MCP_for_a_city` is private. Both files give its name, marked private, with no link: the name is already public in `mrf/mcp-city`, and an agent here needs it to find the deck and script.

## 2026-11-01 · issue #18 · No webpack cache for the e2e bundle

`npm run test:e2e` passed but printed `<w> [webpack.cache.PackFileCacheStrategy] Caching failed for pack: Error: Unable to snapshot resolve dependencies`.
- Cause: the run environment, not the cache location. With webpack's cache logging turned up, the failure is `Error snapshotting file timestamp hash combination of /var/lib/hecaton/worktrees: EACCES`. Webpack snapshots every directory it probed while resolving, parents of the clone included; that parent is mode 0710 for the run user, so it answers EACCES instead of ENOENT, and webpack drops the whole pack. Nothing was ever written to `node_modules/.cache/webpack`, so the tests bundled cold anyway. Moving the cache directory would not help, as the unreadable path is a resolve dependency, not the cache.
- Chose: `bundle({ enableCaching: false })` in `tests/e2e/render.test.mjs`. The test then bundles the source as it is on every run, prints the same output in any clone, and loses nothing where the cache already failed. Where the cache would work, as in `~/repos`, a run may be a little slower; that was not measured here. `remotion studio` and `remotion render` keep their cache.
- Held by (issue #19): `bundling prints no webpack warning` in `tests/e2e/render.test.mjs` keeps a copy of what `bundle()` writes to stderr, where webpack's logger writes, and fails on any `<w>` or `<e>` line. Without `enableCaching: false` it fails in a run clone with the cache warning above. In `~/repos` the cache works and prints nothing, so there the test passes either way, as the output is clean either way.

## 2026-11-15 · issue #20 · Remotion 4.0.543 for zod 4.6.7 (GHSA-mrhx-c7xc-m3w5)

Dependabot alert 3 (high, GHSA-mrhx-c7xc-m3w5) flagged `zod` 4.5.4, which Remotion 4.0.539's studio, media, elevenlabs and openai-whisper packages pin exactly; 4.6.6 fixes it.
- Chose the issue's first route: every `@remotion/*` package and `remotion` move together from 4.0.539 to 4.0.543 (released 2026-11-11, the current latest). Every release from 4.0.540 (2026-11-02) on pins `zod` 4.6.7, so the lockfile's only `zod` is now 4.6.7. No `overrides` entry, which the #10 entry above deferred to an upstream release and which would have let the studio run a `zod` it was not released with.
- `@remotion/bundler` 4.0.543 still depends on esbuild 0.28.1, so the `allowScripts` entry stands unchanged.
- Checked: `npm install` then a fresh `npm ci` print no `npm warn` lines; `npx remotion versions` reports every package on the same version; `npm audit` no longer lists `zod`. It still lists `minimatch` 7.0.0–11.0.0 (moderate), the advisory #10 left for upstream; the issue records that alert as already cleared, so it is out of scope here. Lint, tests and a render are left to the gate's validation run.

## 2026-11-15 · issue #22 · minimatch 11 for GHSA-g3hv-75wg-m249

Dependabot alert 5 (medium, GHSA-g3hv-75wg-m249, a denial of service through glob-pattern amplification) flagged `minimatch` 10.2.6, which only the lint toolchain brings in; 11.0.1 fixes it.
- Chose the issue's route: `eslint` 10.14.0 to 10.15.0 (released 2026-11-13, the current latest), which asks for `minimatch` `^11.0.5` and brings `@eslint/config-array` 0.23.6, which asks for the same. `@typescript-eslint/typescript-estree` (through `@remotion/eslint-config-flat`) still asks for `^10.2.2` in every release up to 8.72.2, so `package.json` gains `"overrides": { "minimatch": "^11.0.1" }`. The lockfile now holds one `minimatch`, 11.0.8, which also brings `@isaacs/nonrecursive-glob-match` 1.1.0 and moves `brace-expansion` to 5.0.13.
- This reverses the #10 entry's choice to wait for upstream instead of an override, for this package only. The override crosses a major version, so it was checked: typescript-estree calls only the named `minimatch(path, pattern, { dot: true })` export, for `allowDefaultProject`, which 11 still exports with the same signature, and `npm run lint` passes with no warnings. Drop the override once a typescript-eslint release asks for `minimatch` 11 itself.
- Held by `tests/dependencies.test.mjs`, which fails if any `minimatch` in `package-lock.json` is below 11.0.1; on the old lockfile it fails on 10.2.6.
- Checked: `npm install` prints no warnings and `found 0 vulnerabilities`; `npm ls minimatch` shows 11.0.8 under eslint, config-array and typescript-estree. The full test and e2e commands are left to the gate's validation run.

## 2026-11-19 · question 1015 · no permission request for the foundation's section (issue 17)

Question 1015 asked whether the unsent 2026-10-29 draft to Jillian Hall at the Linux Foundation should also ask permission to use the keynote's audio from the foundation's recording in the public mcp-city-film repo (peopleforrester/mcp-city-film) and its release videos. Issue 17 in that repo swaps the deck video's room recording for the foundation's recording.
- Answer: no. Use the foundation's section without asking permission, with full attribution. An embed or link with timestamps to the foundation's original video is enough.
- Decided by Michael.
- Changes: the draft is not extended with a question about the repo or its releases, and no permission request is needed before release use of the foundation's section. A release that uses the foundation's audio must credit the Agentic AI Foundation and link to its original YouTube video, a8p-Pz1k5l0, with timestamps for the talk (46:46 to 1:01:57). This is the fourth acceptance criterion of issue 17. Whether the draft's three questions are sent is not decided here.

## 2026-11-19 · question 1252 · route for the foundation's audio (issue 17): held, not asked

Question 1252 asked whether the deck video should get the Agentic AI Foundation's audio by asking the foundation for its session file or by downloading the livestream from YouTube (a8p-Pz1k5l0).
- Answer: not asked. peopleforrester/mcp-city-film is held. The hold cites the operator's 2026-11-17 priority that the Zurich talk is the only priority until its delivery on 2026-11-20. Nothing more is done on the repo until that changes, and a later run asks again if the question still needs answering.
- Decided by hecaton's standing rule hecaton#289 under Michael's standing rules, not by Michael.
- Changes: no route is chosen, so nothing is requested from the foundation and nothing is downloaded from YouTube. `src/deck/cues.json` still names `deck-recording/2026-10-06-keynote-room.mp3`, and `public/deck-recording/` still holds only that file. Issue 17's criteria (the file and its length, the offset and `npm run deck:cues`, the re-render with a watched render, and the release credits) stay open until the hold changes and a route is chosen.

## 2026-11-21 · issue 17 · the deck video on the Agentic AI Foundation's livestream audio

The hold that question 1252 cited, Michael's 2026-11-17 priority that the Zurich talk comes first until its delivery on 2026-11-20, ended with that delivery; no hecaton config (`config/priorities.yaml`, `michael.yaml`, `repo-runs.yaml`) holds this repo. Question 1015 (Michael) already settled that the foundation's section is used without asking permission, with full credit and a timestamped link, so this run did the swap.
- Route (question 1252, settled from question 1015 and not asked again): the livestream itself, not a request to the foundation for its session file. Asking the foundation would be a message only Michael can send, and his answer to question 1015 was not to ask. A file from the foundation can still replace this one later by the same one-offset shift.
- The fetch: this host gets YouTube's bot check (HTTP 429, "Sign in to confirm you're not a bot") and was not retried. Through the elevated fleet route on Tanjiro, `yt-dlp` 2026.10.26 took the best audio stream (Opus, 48 kHz) of `a8p-Pz1k5l0` ("OCT 6 - MCP Dev Summit Toronto 2026 Livestream", Agentic AI Foundation, 1:05:15) for `*44:00-1:04:00`, sha256 `037f95de…af28`. The section came out 1209.98 s long, not 1200 s. A 20 s probe cut exactly at 46:00 (`--force-keyframes-at-cuts`) places the section's start at 43:50.03 on YouTube's clock. Both files are still in `~/Downloads/mcp-city-film-17/` on Tanjiro.
- Alignment: envelope cross-correlation of the room edit against the section finds it at 124.14 s. Sample-level checks on 30 s windows at room times 5, 60, 200, 400, 600, 800 and 930 s all land between 124.116 and 124.147 s, so one offset holds through the talk with no clock drift (a spread of 0.03 s, under one frame at 30 fps). The room edit, and so Angie Jones' introduction, starts at 45:54.2 on YouTube's clock.
- The file: `public/deck-recording/2026-10-06-keynote-aaif-livestream.mp3` is the section from 117.0 s, quiet room tone about 7 s before the room edit begins, for 970.482 s, which ends where the room edit ends, after the applause. On YouTube that is 45:47.0 to 1:01:57.5. The two channels are one signal (correlation 0.9998), so it is mono, like the room file. It is leveled from −23.4 to −16.9 LUFS (the room file is −16.4) with ffmpeg `loudnorm` and a limiter at −3 dBFS, peaking at −2.1 dBTP, with a 0.3 s fade-in and a 1.5 s fade-out, and encoded as 128 kb/s MP3 at 48 kHz. `ffprobe` gives 970.488 s, which is `end` in `cues.json`.
- Offset: on the final MP3 the room edit starts at 7.128 to 7.158 s (median 7.149). Every cue from slide 2 on moves by 7.14 s, rounded to the cues' 0.01 s grid. Slide 1 stays at 0, because `framesFromCues` requires the first slide to start at the top of the recording. The title slide stood behind the introduction before and now also covers the 7.14 s lead-in, so it gains 214 frames. Every other slide's length changes by at most one frame of rounding, and the video is 29,115 frames (16:10.5).
- The room recording stays in `public/deck-recording/`, unused by any composition, because the transcript in MCP_for_a_city is timed on it and the old cues are its times minus 7.14 s.
- Credit, as question 1015 requires: README's new Credits section names the Agentic AI Foundation, links `a8p-Pz1k5l0`, and gives the talk at 46:46 to 1:01:57 with a `&t=2806s` link. `releases/next.md` carries the same credit for the release body. `tests/integrity.test.mjs` fails if any file in `public/deck-recording/` is missing from the README or the Credits lose the foundation, the link or the timestamps.
- Not done here: watching the render. A full render of `Deck` from this track was made in this run (see the report). Cutting the release is left to a human, after a watch, per AGENTS.md.
