# CreAIte — Website (Static)

A clean, responsive CreAIte website built for presentations and demos.

## Files
- `index.html` — Home + interactive “Generate” demo + pricing tabs
- `features.html` — Feature demo page (interactive)
- `styles.css` — UI styling
- `script.js` — Interactions (generate demo, tabs, sign-in simulation, video edit simulation)

## Run locally
Just open `index.html` in your browser.

## Deploy on GitHub Pages (Free)
1. Push these files to your GitHub repo root
2. Go to **Settings → Pages**
3. Set:
   - Source: `Deploy from a branch`
   - Branch: `main` / `root`
4. Save — GitHub will provide your site URL.

## Tips (if changes don't show)
- Hard refresh: `Ctrl + Shift + R`
- Add cache-bust: change `?v=1` to `?v=2` in:
  - `styles.css?v=2`
  - `script.js?v=2`
- Make sure the files are not pasted into each other:
  - `index.html` must be HTML only
  - `script.js` must be JS only
