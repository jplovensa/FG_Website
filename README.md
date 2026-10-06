# Fjäll Group

A lightweight corporate website built with semantic HTML, CSS and vanilla JavaScript. No frontend framework, external font requests, runtime packages or credentials are required.

## Local development

Use Node.js 22 or newer:

```sh
npm run dev
```

The development server uses port 3000. Set `PORT` to change it. Edit `index.html`, `styles.css`, and `app.js`, then refresh your browser.

## Build and validate

```sh
npm run build
npm test
node scripts/serve.js --dist
```

The build creates `dist/` with only public site files. Tests check production assets at both the domain root and a repository subpath, as well as video range delivery. Browser checks should additionally cover intro completion, refresh replay, skip/Escape, video pause/play, mobile navigation, project filtering and details, reduced motion, and failed video requests.

## GitHub Pages

All asset URLs are relative so the same website works at `https://jplovensa.github.io/FG_Website/` and at the domain root on Vercel.

For publishing through GitHub Actions, open the repository's **Settings → Pages** and choose **GitHub Actions** as the source. The included `.github/workflows/pages.yml` builds, tests and deploys `dist/` on pushes to `main`. If needed, run **Deploy GitHub Pages** manually from the Actions tab after changing the source.

Existing branch-based publishing is also supported: use branch **main**, folder **/ (root)**. The root `.nojekyll` file tells GitHub to serve the static files directly. Branch-based publishing uses the repository root, rather than the generated `dist/` folder.

To reproduce GitHub Pages locally:

```sh
npm run build
node scripts/serve.js --dist --base-path=/FG_Website/
```

Visit the server's `/FG_Website/` path. Requests outside that path intentionally return 404 so broken root-relative URLs are caught during testing.

## Vercel

Import this GitHub repository into Vercel. Select **Other** as the framework. The included `vercel.json` sets `npm run build` as the build command and `dist` as the output directory. No environment variables are needed. Deployment is static; the Node server is for local development only.

## Media and playback

- `assets/intro.mp4` is the complete supplied modular-block opening film, compressed to H.264 with fast-start metadata. It plays on each load and refresh, with a skip button, Escape key, and an 8.5-second maximum waiting time.
- `assets/hero.mp4` is the complete supplied hero film, compressed in the same way. Its download begins after the intro closes so the two videos do not compete for bandwidth.
- Both videos are muted and play inline. The hero pauses when offscreen or when the browser tab is hidden.
- Reduced-motion or data-saving preferences bypass the intro and leave a static hero poster; the hero can be played manually. A rejected autoplay request or failed intro download reveals the page immediately.
- Project images are optimized WebP extracts from the supplied 2026 corporate profile and load lazily. Some profile imagery may be architectural renderings; it is presented as imagery from that profile, not as independently verified completion photography.
- Original uploads remain outside the Git checkout. Only optimized web assets are included; no large ZIP or PDF is committed.

## Content

The business descriptions, four featured projects, and contact number come from the supplied company profile. Project details are maintained in `app.js`; section content is in `index.html`. Technical performance and certification claims require supporting documentation before adding them to the site. The initial contact action calls the Bali team rather than submitting an unconnected form.
