# Decisions Log

Append-only audit trail of approvals, amendments, backward steps, and conditional-skip rationales. See [[state-persistence]] for schema.

## 2026-10-06T01:08:25Z · 1.3 · PRD-3 approved

PRD `3-remotion-deck.md` sealed on Michael's instruction to build it now ("do it right now and don't wait").
- Approved-by: Michael@2026-10-06T01:08:25Z
- Plan checksum: sha256:29720f9c3c5f
- Title: Remotion deck

## 2026-10-16 · question 37 · Node toolchain for the hecaton gate

The gate host had no Node or npm, so the declared test command could not run there, and a fresh clone has no `node_modules`.
- Answer: install Node 26 on the gate host (matching CI) and have the gate run `npm ci`; declare `Test command: npm ci && npm run lint && npm test`. The host change is tracked as peopleforrester/hecaton#118 and lands through the root runner; until then this repo's gate waits.
- Changes: AGENTS.md's `Test command:` and `E2E command:` both start with `npm ci`, so each runs from a fresh clone. No uv or nodejs-wheel workaround.
- Approved-by: Michael (issue #6, question 37)
