# Mohamed Rizwan K — Portfolio

A fast, dependency-light **3D portfolio** built as a static site and designed to be hosted on **GitHub Pages**. IDE-inspired UI, an animated Three.js skill-graph with travelling "data pulses," a light/dark theme, scroll reveals, and count-up stats.

Everything runs client-side — no build step, no framework, no server.

---

## Preview locally

Because the page loads assets over relative paths and uses WebGL, open it through a tiny local server (not `file://`):

```bash
# from the project folder
python3 -m http.server 8000
# then visit http://localhost:8000
```

Any static server works (`npx serve`, VS Code "Live Server", etc.).

---

## Project structure

```
portfolio/
├── index.html                 # Page markup + content
├── css/
│   └── styles.css             # All styling + light/dark themes
├── js/
│   └── main.js                # Interactions + Three.js scenes
├── .github/workflows/
│   └── deploy.yml             # Auto-deploy to GitHub Pages
├── .nojekyll                  # Serve files as-is (skip Jekyll)
├── .gitignore
└── README.md
```

Three.js is loaded from a CDN, so there are no local dependencies to install.

---

## Deploy to GitHub Pages

### Option A — automated (recommended, already set up)

1. Create a new GitHub repository (public) and push this folder:

   ```bash
   git init
   git add .
   git commit -m "Initial portfolio"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo>.git
   git push -u origin main
   ```

2. In the repo, go to **Settings → Pages → Build and deployment**, and set
   **Source = GitHub Actions**.

3. The included workflow ([.github/workflows/deploy.yml](.github/workflows/deploy.yml))
   builds and publishes on every push to `main`. Your site goes live at:

   ```
   https://<your-username>.github.io/<your-repo>/
   ```

   > Tip: for a root URL like `https://<your-username>.github.io/`, name the repo
   > `<your-username>.github.io`.

### Option B — no workflow (deploy from a branch)

1. Push the code as above.
2. **Settings → Pages → Source = Deploy from a branch**, pick `main` and `/ (root)`.
3. GitHub serves the site directly. The `.nojekyll` file keeps asset folders intact.

### Custom domain (optional)

Add a `CNAME` file containing your domain (e.g. `rizwan.dev`) to the project root,
then configure the domain under **Settings → Pages**.

---

## Customize

- **Content** — edit the sections in [index.html](index.html) (hero, about, experience, projects, skills, certifications, contact).
- **Colors / theme** — tweak the CSS variables at the top of [css/styles.css](css/styles.css); dark-theme overrides live in the `html[data-theme="dark"]` block.
- **3D skill labels** — change the `labels` array in [js/main.js](js/main.js) to update the floating node names.
- **Stats** — the animated numbers use `data-count` / `data-suffix` attributes on the hero `.stat` elements.

---

## Accessibility & performance

- Honors `prefers-reduced-motion` (disables animation and the moving 3D pulses).
- Honors `prefers-color-scheme` on first visit; the theme choice is remembered.
- WebGL rendering pauses when the hero scrolls off-screen or the tab is hidden.
- Single CSS + single JS file; Three.js served from CDN.

---

Built as a static page — deploy anywhere.
