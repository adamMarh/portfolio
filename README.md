# Portfolio Solaire

Interactive portfolio web app built with React, Vite, and Three.js. The experience is centered around a solar-system-style interface with bilingual content and a language switcher.

## Features

- React + Vite setup for fast local development
- Three.js scene rendered through a custom portfolio runtime
- Bilingual content with language switching
- Modular UI components for the overlay, HUD, and canvas layers

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Project Structure

- `src/components` contains the portfolio UI pieces
- `src/services` contains scene loading and Three.js runtime logic
- `src/context` and `src/i18n` handle language state and translations
- `styles/portfolio-solaire.css` contains the main visual styling

## Notes

The app is designed as a single-page experience. Most of the interactive behavior is controlled from the scene loader and the portfolio runtime modules.
