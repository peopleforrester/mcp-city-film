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
