# The shadow-play film

A cartoon walkthrough of **Governing MCP for a Workforce the Size of a City**,
the keynote at MCP Dev Summit Toronto on 6 October 2026, as a shadow play:
cut-paper silhouettes on a backlit screen, the deck's own art, the site's
ideas, and the talk's words as captions. Built with Remotion.

- The talk's site: https://mcp.michaelrishiforrester.com
- The collateral: https://github.com/peopleforrester/mcp-for-a-city
- The site's source: https://github.com/peopleforrester/mcp-city

## Run it

```bash
npm install
npm run dev                                        # Remotion Studio
npx remotion render src/index.ts Film out/film.mp4  # the narrated film
npx remotion render src/index.ts FilmSilent out/film-silent.mp4  # the captions-only cut
npx remotion still src/index.ts scene-gates out/gates.jpg --frame=200
```

## License

Code: Apache 2.0. The art is generated for the talk; the ship outlines depict
designs that belong to their studios and are fan art for a scale comparison.
