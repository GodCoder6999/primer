# Target Website

## URL
https://www.primevideo.com/

## Scope

### Pages to Replicate
- [x] Home page (billboard hero + carousel rows)
- [x] Browse / category grid
- [x] Title detail page
- [x] Signed-in app shell — profile switcher, My Stuff
- [ ] Video player / playback UI (out of scope)

### Fidelity Level
- [x] **Pixel-perfect** — exact match in colors, spacing, typography, animations
- [ ] **High fidelity** — visually similar, same layout and feel, minor deviations OK
- [ ] **Structural** — same layout and components, custom styling acceptable

### In Scope
- Visual layout and styling
- Component structure and interactions
- Responsive design
- Mock data for demo purposes
- Locally mirrored assets (images, fonts, icons) in `public/`

### Out of Scope
- Real backend / database
- Real authentication (signed-in surfaces built from mock data)
- Real-time features / video playback
- SEO optimization
- Accessibility audit

## Why
Portfolio piece / learning exercise — reverse-engineering a large-scale
production streaming UI.

## Decisions (2026-07-25)
- **Assets:** mirror everything locally into `public/` (user decision).
- **Auth:** no live login is performed — no credentials are handled. Signed-in
  views (profile switcher, My Stuff, detail page) are reconstructed from
  logged-out DOM structure, public markup, and mock data.
- **Content volatility:** carousel rows are personalized and geo-gated, so
  captured row content is a point-in-time snapshot frozen into mock data.

## Observed Stack (target)
- React SPA, CSS Modules with hashed class names (e.g. `Y7xAWu yeU6bH`)
- Fonts: `Amazon Ember` (rg / sbd / bd woff2), fallback `Amazon Arabic Ember`, Arial
- Base background: `rgb(0, 5, 13)`
- Image CDN: `m.media-amazon.com`, `images-eu.ssl-images-amazon.com`

## Customization Plans
- none — pure emulation
