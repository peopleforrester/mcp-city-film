# Agent guidance for this repo

ABOUTME: Repo-local rules for the shadow-play film of the MCP Dev Summit keynote.
ABOUTME: The film says what the deck says; the deck is the source of every claim.

- Captions carry the deck's words. A number on screen is one the deck already
  sources; the sources live in `peopleforrester/mcp-for-a-city`.
- The look is cut paper on the cyan-to-navy screen (`src/ui.tsx`). New scenes
  use `Screen`, `Caption` and `Shadow`; nothing photoreal.
- `npm run dev` opens Remotion Studio; `npx remotion render src/index.ts Film out/film.mp4`
  renders the narrated film and `FilmSilent` the captions-only cut; `scene-<id>` compositions render one scene.
- Work on `staging`; promote to `main` once a render has been watched.
