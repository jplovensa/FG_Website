# Fjäll Group

A lightweight corporate website built with semantic HTML, CSS and vanilla JavaScript. The architectural monograph direction uses locally hosted Inter, the supplied Fjäll Group logo, white and charcoal surfaces, teal accents and editorial typography inspired by the supplied live Fjäll reference. No frontend framework, external font requests, runtime packages or credentials are required.

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

- `assets/intro.mp4` is the complete supplied modular-block opening film, compressed to H.264 with fast-start metadata. It fills the viewport using `object-fit: cover`, which crops the edges on narrow screens rather than letterboxing. The supplied logo reveals during the last 1.25 seconds and briefly holds before opening the website. It plays on each load and refresh, with a skip button, Escape key, and an 8.5-second maximum waiting time.
- `assets/hero.mp4` is the complete supplied hero film, compressed in the same way. Its download begins after the intro closes so the two videos do not compete for bandwidth.
- Both videos are muted and play inline. The hero pauses when offscreen or when the browser tab is hidden.
- Reduced-motion or data-saving preferences bypass the intro and leave a static hero poster; the hero can be played manually. A rejected autoplay request or failed intro download reveals the page immediately.
- Project images are optimized WebP extracts from the supplied 2026 corporate profile and load lazily. Some profile imagery may be architectural renderings; it is presented as imagery from that profile, not as independently verified completion photography.
- Original uploads remain outside the Git checkout. Only optimized web assets are included; no large ZIP or PDF is committed.
- `assets/retrofit.mp4` preserves the complete 51-second Garuda Spark Innovation Hub / Malang Creative Center film and its audio. It is encoded as browser-compatible H.264/AAC at 720p. The player downloads the film only after an explicit click; native controls provide pause, seek, sound and fullscreen. Playback pauses when offscreen or in a hidden tab.
- `assets/fjall-logo.png` is the logo matching the supplied artwork, extracted from the corporate profile with its original embedded transparency mask. It is used in the header, footer and preloader. The favicon uses its geometric mark.

## Interactive experience

`experience.js` owns the five-stage customer journey and animated world map. Visitors can choose home, hospitality, retrofit, modular, mass-scale housing or workers’ accommodation projects; move between stages; play or pause the guided sequence; and download a text starter brief. The lazy-loaded `construction-scene.js` renders a WebGL construction site, guide character, delivery vehicle and staged building components. Forest, mountain and beachfront settings include trees or palms, atmospheric distance, warm directional lighting, simple ground shadows and coastal water. A lower camera angle and optional slow orbit let visitors explore the surroundings. Camera rotation works by dragging, keyboard or buttons. Housing, modular and workers’ accommodation scenes show repeated units; retrofit begins with an existing building. The renderer is self-contained, caps pixel density and frame rate, pauses offscreen or in a hidden tab, and stops drawing settled stages unless a camera orbit is playing. Scene motion and camera orbit have separate controls. Reduced-motion preferences produce static views. If WebGL is unavailable or the context is lost, the original SVG illustration and all journey controls remain available. The scene is an illustrative concept, not an engineering specification or a pricing/timeline calculator. The brief download happens locally and sends no data to a server.

The Group section includes animated SVG diagrams showing GreenShift's brief-to-design coordination and FAD's repeatable community layout. Graphics pause offscreen, in a hidden tab, on request and for reduced-motion preferences.

The portfolio transformation connects the Fjäll logo to a structural drawing and then project imagery or a labelled programme summary. All nine entries can be selected; a keyboard-accessible range slider controls the sequence and an explicit play button animates it. Motion stops offscreen or in a hidden tab. Reduced motion shows the final imagery and retains manual slider control. Every entry links to its existing detail dialog or the flagship retrofit film. The transformation illustrates the process and does not assign a construction status to projects.

The map uses a lightweight SVG derived from Natural Earth's public-domain [110m land dataset](https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_110m_land.geojson). Connections represent Indonesia as the production base, Sweden as the engineering origin, Japan as a precision/deployment connection, and Australasia as a regional focus; they do not claim offices in every destination. Visitors can select a connection and pause motion. Animation pauses offscreen or in a hidden tab and is disabled for reduced-motion preferences.

Inter is distributed under its included license in `assets/fonts/LICENSE.txt`. The locally hosted variable font is `assets/fonts/inter-latin.woff2`.

## Content

The portfolio now includes all eight programmes named in the company profile plus the Garuda Spark Innovation Hub / Malang Creative Center flagship retrofit film: Nuanu, Ulaman, Kuta Lombok Estates, The Bamboo Lab & Underground Club, Drop Pod Network, Lombok Housing Initiative, Multi-Sport Facility and Private Turnkey Villas. When the profile supplies no image, a labelled programme summary is used rather than unrelated photography. The user’s updated business direction replaces Fjäll Green Tech in the group overview with Fjäll Affordable Development, focused on mass-scale housing and workers’ accommodation. The contact number remains from the supplied company profile. Project details are maintained in `app.js`; section content is in `index.html`. Technical performance and certification claims require supporting documentation before adding them to the site. The initial contact action calls the Bali team rather than submitting an unconnected form.
