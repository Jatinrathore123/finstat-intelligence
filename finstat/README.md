# FinStat Intelligence

A financial statement analysis platform: upload a company's financial statements
(CSV/Excel) and get ratio analysis, trend charts, DuPont decomposition,
common-size statements, rule-based red-flag screening, and optional AI-generated
narrative commentary — all computed **in your browser**. There is no backend
and no server cost, which makes it free to host and run.

## How it works

- **Parsing**: CSV/Excel files are parsed client-side (`papaparse`, `xlsx`).
- **Normalization**: Row labels are matched against a taxonomy of ~35 standard
  financial line items (see `src/lib/taxonomy.js`) so different companies'
  terminology ("Net Sales" vs "Revenue from Operations") maps to the same
  internal key.
- **Human review**: Nothing is trusted blindly — the Review Data screen shows
  match confidence and lets you correct any value or mapping before analysis runs.
- **Calculations**: All ratios (`src/lib/calculations.js`) and the red-flag
  engine (`src/lib/redFlags.js`) are pure JavaScript functions — no server call.
- **"Dynamic" latest-year behavior**: every analysis page reads
  `data.years[data.years.length - 1]` as the current period. Add a new year's
  column on the Review Data screen and the whole app re-centers on it automatically.
- **AI Analyst** (optional): calls Google's Gemini API directly from your
  browser using a **free-tier API key you provide** — no backend, no cost to you
  as the developer. The key is stored only in the visitor's own browser
  (`localStorage`).

## Local setup

```bash
npm install
npm run dev
```

Then open the printed local URL.

## Deploying to GitHub Pages (free)

1. Create a new GitHub repo, e.g. `finstat-intelligence`.
2. In `vite.config.js`, set `base: '/YOUR_REPO_NAME/'` (must match exactly,
   including slashes).
3. In `package.json`, update `homepage` to your GitHub Pages URL.
4. Push this project to the repo's `main` branch.
5. In the repo settings → **Pages**, set the source to **GitHub Actions**.
6. The included workflow (`.github/workflows/deploy.yml`) builds and deploys
   automatically on every push to `main`. Check the **Actions** tab for progress.
7. Your app will be live at `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/`.

## Using the AI Analyst

1. Get a free API key at https://aistudio.google.com/apikey (Google account required).
2. Paste it into the AI Analyst page. It's saved only in your browser.
3. Click "Run analysis" — this calls Google's API directly from the browser tab.

If you don't want the AI feature at all, just don't add a key; every other
page works without it.

## What's intentionally out of scope for a $0 budget

- **PDF/scanned statement OCR**: reliable table extraction from arbitrary
  annual-report PDF layouts needs paid OCR services to be trustworthy. Instead,
  copy line items into the provided CSV template, or use the manual entry table.
- **Live industry benchmark data**: no free, reliable, redistributable source
  for this exists, so benchmarking isn't included. This is called out
  explicitly in the Methodology page rather than faking numbers.

## Project structure

```
src/
  lib/
    taxonomy.js       standardized line-item categories + alias matching
    parsers.js        CSV/Excel → normalized rows
    calculations.js   all ratio formulas, DuPont, common-size, health score
    redFlags.js       rule-based red flag / positive signal detection
    aiAnalyst.js       Gemini API call (client-side, user's own key)
  store/
    useStore.js       global state (zustand)
  pages/               one file per sidebar nav item
  components/          Sidebar, shared UI (KpiCard, RatioRow, etc.)
```

## Disclaimer

This is a student/personal project for educational purposes, not a licensed
financial analysis tool, and the Financial Health Score is explicitly not
investment advice.
