# Founder's Desk 🏢

A personal command-center PWA for a fictitious CEO ("Acme Analytics") who journals meeting notes and tracks discretionary/reimbursable spend in one place — fully client-side, offline-capable, no backend of any kind. Built as a real-world toolcrib sample app: not a component showcase, an actual small product built with the toolkit. See [ORIGIN.md](ORIGIN.md) for the verbatim conversation that shaped this app's concept.

## What it does

- **Overview** — a home dashboard tying the other two areas together: KPI cards for this month's spend/budget remaining/pending reimbursement, a per-category budget breakdown, and open action items read straight out of note text via a `#action` tag.
- **Notebook** — meeting notes and journal entries organized into folders/notebooks, multiple open notes via tabs, a resizable editor + live-preview split pane.
- **Ledger** — transactions in a sortable/paginated table, a category-spend bar chart, and month-by-month browsing.
- Zero external dependency, deliberately: every byte of data is something the CEO persona entered themselves (or the seeded demo data), unlike [feed-farmer-pwa](https://github.com/escape-llc/feed-farmer-pwa)'s reliance on flaky public CORS proxies for feed fetches.

## Toolcrib features this demonstrates

- **`Tree`** — folders/notebooks/notes rendered as one nested hierarchy, with notes as selectable leaves.
- **`TabStrip`** — multiple open notes, each with its own close affordance, backed by independently-mounted panels.
- **`Splitter`** — editor/preview inside the Notebook, and table/chart inside the Ledger.
- **`DataTable`** — sortable, paginated transaction ledger with custom cell rendering and row actions.
- **`@visx`-based `BarChart`** — category spend breakdown for the selected month.
- **`DatePicker`/`Calendar`** — month navigation in the Ledger.
- **Zod-driven forms** — new notebook/note creation and transaction entry both validate via `<Form schema={...}>`/`<FormField>`/`<Input>`/`<Select>`/`<RadioGroup>`/`<SubmitButton>`, no manual `useState`/`onChange` wiring.
- **`CommandPalette`** — Cmd/Ctrl+K to jump to any area or any note directly, or run an action (new transaction, new notebook).
- **Event bus (`aiBus`)** — toasts on create/add, and `CommandPalette`/`Modal` coordination the same way the toolkit's own components do internally.
- Full theme customization (`main.tsx`'s HSV `initialParameters`, a confident corporate blue) and the toolkit's responsive layout primitives throughout.

## Running it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build       # production build + service worker
npm run test:e2e    # Playwright suite — real end-to-end coverage, no network dependency to route around
```
