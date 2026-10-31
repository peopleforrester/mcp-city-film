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
