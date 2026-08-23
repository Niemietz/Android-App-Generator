# Kotlin App Generator — React port

This is a React (Vite) port of the original static HTML/CSS/JS project. All
behavior from the original `index.html` / `styles.css` / `app.js` has been
preserved — form state, the entity/SDK builders, the live-updating stats,
the SVG module dependency graph, and the contact form — but it's now driven
by React state instead of direct DOM manipulation.

## Running it

```bash
npm install
npm run dev
```

Then open the printed local URL (usually `http://localhost:5173`).

To build for production:

```bash
npm run build
npm run preview
```

## Structure

- `src/App.jsx` — top-level layout and view switching (generator ↔ contact form)
- `src/hooks/useGeneratorState.js` — all form state + mutation actions (replaces
  the DOM-query-based `collectSpec()`/event-listener wiring from `app.js`)
- `src/utils/spec.js` — pure helpers: stats calculation, spec-payload building,
  module-name preview
- `src/utils/moduleGraph.js` — pure layout computation for the SVG dependency graph
- `src/components/` — UI components, split roughly one-to-one with the original
  page's panels (Project, Backend sync, Image cache, Entities, Extra screens,
  External SDKs, Release signing, Preview) plus the sidebar (module graph,
  generate/preview buttons) and the contact form

## Notes / things carried over as-is

- The backend API base URL is in `src/config.js` (`localhost:3000` by
  default, same as the original) — update it to point at your real API.
- Google Fonts, the reCAPTCHA Enterprise script, and SweetAlert2 are still
  loaded via `<script>`/`<link>` tags in `index.html` from their original
  CDNs, exactly like the source project, rather than being pulled in as npm
  packages.
- One small behavior fix: in the original, the Google/Azure Maps API key
  fields' disabled state toggled independently of the "Include Google/Azure
  Maps" checkbox (it flipped on every change event regardless of the new
  checked value). In this port, the key field's disabled state now directly
  tracks its checkbox, which matches the apparent intent.
