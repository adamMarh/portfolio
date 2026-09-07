# Portfolio Solaire

Interactive bilingual portfolio built with React, Vite, and Three.js. Projects are presented as a navigable solar system: the drawer selects a body, the Three.js scene animates the camera into a detail view, and the panel displays verified project and experience content in English or French.

## Features

- React 19 and Vite development/build workflow
- Custom Three.js solar-system scene with orbiting, selection, camera transitions, and procedural visual styling
- Responsive detail panel with project tags and structured internship bullets
- English/French language switcher with content stored in `src/i18n/translations.js`
- Modular UI components for the drawer, HUD, overlay, panel, and canvas

## Getting started

```bash
npm install
npm run dev
```

Build and preview the production bundle:

```bash
npm run build
npm run preview
```

## Architecture

- `src/components/` — React overlay and navigation components
- `src/services/solar/` — Three.js scene, runtime, texture, and math services
- `src/data/portfolio.js` — solar-system project metadata
- `src/i18n/translations.js` — bilingual profile and project copy
- `styles/portfolio-solaire.css` — visual system and responsive layout

## Content policy

Project descriptions are based on the source repositories and the accompanying resume. Ongoing work is labelled as such, and prototype or dataset-only projects are not presented as production applications.
