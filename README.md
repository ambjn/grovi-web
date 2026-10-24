# grovi web

Marketing + legal site for [grovi](https://buildwithgrovi.xyz), the film & digicam camera app for iPhone. Astro 7 + Tailwind 4 on Cloudflare Workers.

```bash
bun install
bun run dev        # local
bun run build      # static + worker
bun run deploy     # wrangler deploy
```

- `src/pages/index.astro` — landing (cameras + AI Looks list are inline data; keep in sync with the app's `assets/cameras` and `assets/looks/looks.json`).
- `src/content/legal/*.md` — privacy, terms, support. Rendered by `src/lib/markdown.ts` (h2/h3/p/ul/ol + inline links/bold/code only).
- Palette and fonts mirror the app's `tokens.json` (ink / cream / bone / ember).

App repo: [ambjn/grovi-mobile](https://github.com/ambjn/grovi-mobile).
