@AGENTS.md

# Aurora McKnight — portfolio

Personal portfolio for **Aurora McKnight** (professional name). The bar: industry-standard, CS-grad level or above, in both the product and the code.

## Stack
- Next.js (App Router) + React + TypeScript, `src/` layout. Read `node_modules/next/dist/docs/` before using a Next.js API (see AGENTS.md).
- Styling: plain CSS with CSS Modules. Design tokens live in `src/app/globals.css`. No Tailwind.
- Tests: Vitest. Formatting: Prettier. Linting: ESLint (next config).
- Deploy target: Vercel, domain auroramcknight.com.

## Commands
- `npm run dev` — local dev server at http://localhost:3000
- `npm run build` — production build (must pass before merging)
- `npm run lint` — ESLint
- `npm test` — Vitest unit tests
- `npm run format` — Prettier

## Structure
- `src/app/` — routes: `/` (entry + home), `/work`, `/work/[slug]`, `/play`, `/ask`, `/about`; `layout.tsx` is the shared shell.
- `src/components/` — UI building blocks.
- `src/content/` — site content as typed data (`projects.ts`). Add content here, not in components.
- `src/lib/quoridor/` — pure game engine + bot with unit tests. Keep rules out of React components.

## Product decisions (don't undo without asking)
- Entry screen first ("Hi, I'm Aurora." + roles + "Step inside" / "Let's connect"), then the app shell.
- Five sections, one purpose each: Home, Work, Play, Ask, About. Play is separate from Work.
- Sticky identity sidebar on desktop; bottom tab bar on phones.
- Look: lilac lead with rose and marigold companions, deep plum ink; dark mode is deep aubergine. Floral and whimsical in the details, professional at first glance.
- Fonts: Bricolage Grotesque (headings), Instrument Sans (body), JetBrains Mono (labels), Caveat (hand-written notes).
- No Ivy League/academic styling, no serif display fonts.
- Every animation respects `prefers-reduced-motion`. Every interactive element is keyboard accessible with a visible focus state.

## Conventions
- Small, focused commits with conventional prefixes (`feat:`, `fix:`, `chore:`, `test:`, `docs:`).
- Work on a branch, open a PR, merge after `lint`, `test` and `build` pass.
- Text in `[square brackets]` is placeholder content waiting for Aurora's words. Never invent facts about her.
- Commit identity is Aurora McKnight with a GitHub noreply email; never commit personal emails or real-name details.
