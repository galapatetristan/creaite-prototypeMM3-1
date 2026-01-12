# CreAIte — Website (Static)

A simple, responsive landing website for **CreAIte** (“Create with AI”).  
Built as a static site for presentations and GitHub Pages deployment.

## Files
- `index.html` — main landing page + pricing tabs + demo generator + demo auth modal
- `features.html` — feature overview + admin dashboard (backend concept)
- `styles.css` — all styling (dark UI)
- `script.js` — all interactions (generate, pricing tabs, auth modal, video demo)

## Run locally
Just open `index.html` in your browser.

## Deploy to GitHub Pages (free)
1. Create a GitHub repository (public is easiest).
2. Upload these files to the repo root:
   - `index.html`, `features.html`, `styles.css`, `script.js`, `creaite-logo.png`
3. Go to **Settings → Pages**
4. Under **Build and deployment**:
   - Source: `Deploy from a branch`
   - Branch: `main` / `(root)`
5. Save. GitHub will give you a Pages link like:
   `https://<username>.github.io/<repo>/`

## Notes
- The “Sign in” is demo-only (no real authentication).
- Export buttons are demo-only (simulated).
- Pricing is structured by customer type: Personal, Student, Business, Enterprise.
