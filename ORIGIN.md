# Founder's Desk — Origin

This is toolcrib's third real-world example app (after
[feed-farmer-pwa](https://github.com/escape-llc/feed-farmer-pwa)), and this
file exists for the same reason `feed-farmer-pwa`'s own README states its
purpose directly: a real product built with the toolkit, not a component
showcase. Unlike the code, this file is the origin conversation itself —
kept verbatim rather than summarized, so the next session (a fresh chat,
by design — see the end of the transcript) has the actual reasoning
instead of a paraphrase of it.

## The concept

**Founder's Desk** — a personal command-center PWA for a fictitious CEO
("Acme Analytics") who journals meeting notes and tracks discretionary/
reimbursable spend in one place. No backend, fully local (IndexedDB),
same deployment model as `feed-farmer-pwa` (Vite + React + TS + toolcrib,
GitHub Pages).

Three areas, tied together by a fourth:

- **Notebook** — meeting notes and journal entries in `Tree`-organized
  notebooks, quick-open via `CommandPalette`, multiple open notes via
  `TabStrip`, `Splitter` for editor + preview.
- **Ledger** — transactions in `DataTable`, category spend breakdown via
  the `@visx` chart wrapper, `Calendar`/date-range filtering for monthly
  views.
- **Overview** — a home dashboard tying both together: KPI `Card`s, this
  month's spend vs. budget, and open action items pulled straight out of
  note text (e.g. a `#action` tag scanned out of the Notebook). This is
  what makes it one product instead of two demos in a trenchcoat — the
  overview reads real data out of both halves.
- Zero external dependency, deliberately: every byte of data is something
  the CEO persona entered themselves, which is actually a step up from
  `feed-farmer-pwa`'s one real weakness (reliance on flaky public CORS
  proxies for feed fetches, documented in that repo's own README).

## The conversation that got here

> **User:** what is another popular vibe coded genre we could make into another example app?

**Assistant:** An admin/analytics SaaS dashboard is probably the strongest
pick — it's the single most common "build me a dashboard" vibe-coded
request, and it's the best complement to Feed Farmer specifically because
it forces coverage of components that app never touched: `DataTable`
(sorting/filtering/pagination), the `@visx`-based chart wrapper,
`Splitter` for resizable panel layouts, and `Calendar`/date-range
filtering. Tradeoff: it's a genre with a lot of "vibe coded and forgotten"
prior art, so it needs a specific enough angle (e.g. a fake SaaS's
usage/billing dashboard) to feel like a real product rather than a
generic component showcase — same discipline Feed Farmer followed by
being a real feed reader, not a kitchen-sink demo.

A second-place option worth naming: a Kanban/project board (drag-heavy
card layout, `Splitter` columns, a `Wizard`-style multi-step "new board"
form) — complementary from a different axis (structural/spatial rather
than data-dense), but less universally recognized as "the" vibe-coded
genre than a dashboard is.

> **User:** can we come up with something actually functional like the feed reader?

**Assistant:** A personal finance/budget tracker fits best — it's
genuinely one of the most common vibe-coded requests, and unlike a
fake-data dashboard it's real and useful with zero external dependency:
the user enters (or CSV-imports) their own transactions, stored locally
via IndexedDB, same pattern as Feed Farmer's own local-first storage but
without that app's one real weakness — reliance on flaky public CORS
proxies for feed fetches. It'd exercise the components Feed Farmer never
touched: `DataTable` for the transaction list, `@visx` charts for
spending breakdown, `Calendar`/date-range filtering for monthly views,
and `Splitter` for a categories-sidebar + table layout.

A close second: a local-first notes app (Obsidian/Notion-style) — also a
top vibe-coded genre, also zero external dependencies, and would showcase
`Splitter` (sidebar + editor + preview), `TabStrip` (multiple open
notes), and `CommandPalette` (quick-open) instead of data-table/chart-
heavy components. Budget tracker leans data-dense, notes app leans
structural/spatial — worth picking based on which gap you'd rather close
first.

> **User:** can we combine them? maybe for the ficticious CEO of Acme Analytics?

**Assistant:** Yes — and the "fictitious CEO" framing actually gives it a
believable reason to exist as one product instead of two bolted-together
features. Call it **"Acme Analytics — Founder's Desk"**: a personal
command-center PWA for a CEO who journals meeting notes and tracks
discretionary/reimbursable spend in one place. Three areas, no backend,
all local via IndexedDB: **Notebook** (`Tree`-organized notebooks,
`CommandPalette` quick-open, `TabStrip` for multiple open notes,
`Splitter` for editor + preview), **Ledger** (`DataTable` transactions,
`@visx` category spend chart, `Calendar`/date-range filtering), and
**Overview** (a home dashboard tying both together — KPI `Card`s, spend
vs. budget, and open action items read straight out of note text via a
`#action` tag). That third piece is what actually makes it one product —
the overview reads real data out of both halves. It's genuinely more
"functional" than Feed Farmer in one respect: zero external dependency,
since every byte of data is something the CEO persona entered themselves.

> **User:** yes. however, can we start from a new chat? maybe include the chat transcript in the repo somewhere?

**Assistant:** (this file — written into the new project directory before
handing off, so a fresh session starts from the concept above instead of
re-deriving it.)

## Next steps, for the fresh session

Mirror `feed-farmer-pwa`'s own bootstrap, start to finish:

1. `npm create vite@latest` (React + TypeScript), get it running.
2. `npx toolcrib init --situation new`, review, `npx toolcrib apply`.
3. Wire `<ToolcribProvider>` in `main.tsx` with a theme fitting an
   executive/analytics tone (a confident, "corporate but not sterile" hue
   — pick something distinct from Feed Farmer's green).
4. Dexie (IndexedDB) for local storage, same as `feed-farmer-pwa`'s
   `db.ts` — schema for notebooks/notes and transactions/categories.
5. Build the three areas (Notebook, Ledger, Overview) per the concept
   above, then the `#action`-tag scan that ties Overview to Notebook's
   real content.
6. Playwright e2e suite covering UI behavior only (no external network
   dependency to route around this time, unlike Feed Farmer's CORS-proxy
   carve-out).
7. New public repo (`escape-llc/founders-desk`, matching this directory's
   name) + GitHub Pages deploy, same workflow pattern as
   `feed-farmer-pwa`'s `.github/workflows/deploy-pages.yml`.
8. Link it from toolcrib's README `# Examples` section alongside
   `feed-farmer-pwa`.
