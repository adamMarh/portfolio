---
name: Portfolio Solaire
description: A lit 90s computer in a dark room, running a navy-and-gold solar-system portfolio.
colors:
  gold: "#f5c842"
  gold-strong: "#ffd968"
  gold-soft: "rgba(245, 200, 66, 0.12)"
  gold-line: "rgba(245, 200, 66, 0.24)"
  signal-cyan: "#65dcff"
  navy-950: "#02050f"
  surface: "rgba(5, 11, 29, 0.88)"
  surface-solid: "#070e24"
  panel-scrim: "rgba(4, 8, 22, 0.98)"
  panel-scrim-mid: "rgba(4, 8, 22, 0.94)"
  panel-scrim-edge: "rgba(4, 8, 22, 0.86)"
  ink: "#f4f1e8"
  ink-2: "rgba(244, 241, 232, 0.76)"
  ink-3: "rgba(244, 241, 232, 0.6)"
  hairline: "rgba(244, 241, 232, 0.1)"
  neon-pink: "#ff3d9a"
  neon-ice: "#3ef0ff"
  crt-plastic: "#d8cba6"
  plaster: "#2a3533"
  walnut: "#6a4329"
  room-black: "#020304"
  desktop-navy: "#07122a"
  desktop-paper: "#e9e4d4"
  desktop-ink: "#0a0f1d"
  phosphor-green: "#9fe7a8"
  led-green: "#46ff7a"
  led-amber: "#ffa529"
typography:
  display:
    fontFamily: "Orbitron, Exo 2, sans-serif"
    fontSize: "clamp(28px, 1.6vw + 18px, 46px)"
    fontWeight: 800
    lineHeight: 1.08
    letterSpacing: "0.01em"
  wordmark:
    fontFamily: "Orbitron, Exo 2, sans-serif"
    fontSize: "15px"
    fontWeight: 700
    letterSpacing: "0.3em"
  headline:
    fontFamily: "Exo 2, system-ui, sans-serif"
    fontSize: "clamp(18px, 0.6vw + 14px, 24px)"
    fontWeight: 500
    lineHeight: 1.3
  title-lg:
    fontFamily: "Exo 2, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: 1.35
  title:
    fontFamily: "Exo 2, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: 1.25
  small:
    fontFamily: "Exo 2, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 600
  body-compact:
    fontFamily: "Exo 2, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.65
  body:
    fontFamily: "Exo 2, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "Orbitron, Exo 2, sans-serif"
    fontSize: "11px"
    fontWeight: 600
    letterSpacing: "0.26em"
  label-sm:
    fontFamily: "Orbitron, Exo 2, sans-serif"
    fontSize: "10px"
    fontWeight: 600
    letterSpacing: "0.22em"
  meta:
    fontFamily: "Exo 2, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    letterSpacing: "0.02em"
  meta-sm:
    fontFamily: "Exo 2, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    letterSpacing: "0.04em"
  pixel:
    fontFamily: "VT323, ui-monospace, monospace"
    fontSize: "20px"
    fontWeight: 400
    lineHeight: 1
  neon-sign:
    fontFamily: "Tilt Neon, Exo 2, sans-serif"
    fontSize: "190px"
    fontWeight: 400
  marker:
    fontFamily: "Permanent Marker, Exo 2, sans-serif"
    fontSize: "34px"
    fontWeight: 400
rounded:
  ring: "4px"
  row: "10px"
  panel: "14px"
  sheet: "18px"
  pill: "999px"
spacing:
  gutter: "clamp(16px, 2.2vw, 32px)"
  topbar: "68px"
  topbar-compact: "60px"
  hit: "44px"
components:
  button-primary:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.navy-950}"
    rounded: "{rounded.pill}"
    padding: "0 22px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.gold-strong}"
  button-icon:
    backgroundColor: "rgba(2, 5, 15, 0.6)"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    size: "44px"
  button-icon-hover:
    textColor: "{colors.gold}"
  lang-toggle-active:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.navy-950}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    height: "36px"
  room-start:
    backgroundColor: "rgba(3, 6, 16, 0.78)"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0 10px 0 24px"
    height: "52px"
  index-panel:
    backgroundColor: "{colors.surface-solid}"
    rounded: "{rounded.panel}"
    padding: "18px 10px 10px"
    width: "304px"
  index-row-current:
    backgroundColor: "{colors.gold-soft}"
    textColor: "{colors.ink}"
    rounded: "{rounded.row}"
    padding: "8px 10px"
  tag:
    textColor: "{colors.ink-2}"
    rounded: "{rounded.pill}"
    padding: "6px 12px"
  pager-link:
    textColor: "{colors.ink}"
    rounded: "{rounded.row}"
    padding: "12px 14px"
    height: "64px"
---

# Design System: Portfolio Solaire

## Overview

**Creative North Star: "The Machine Already Running"**

Two worlds, one light source each. The first is a small room at night, rendered in WebGL: blue-green plaster, a walnut desk, a yellowed beige CRT and tower, a pink HELLO WORLD neon, an ice-cyan Saturn neon, a rain window full of sodium bokeh, and a black portable stereo whose amber dot-matrix display scrolls the artist and song (play, stop, next). Nothing in it is lit except by the screen, the neons and the window, all pushed through bloom. The second world lives on that screen: the established navy-and-gold portfolio, a Three.js solar system with Orbitron display type and Exo 2 text. The camera dive through the curved glass is the hinge between them, and the CRT's scanlines and barrel curvature relax to zero over the live site so the two read as one machine.

The site layer is quiet and dark so the 3D carries the impression. Controls are pill-shaped, hairline-bordered in translucent gold, set on near-black navy, with gold reserved for the one thing that is active, current or primary. Reading surfaces (the detail panel, the project index) are solid navy, never glass. Type is uppercase Orbitron only for the name, project titles and short container labels; everything a visitor reads is Exo 2 in warm off-white.

Motion has two speeds. The camera moves slowly and decisively (1.5 to 1.8 s, strong ease-in-out); interface responds fast (140 to 300 ms, strong ease-out), with a 0.96 to 0.98 press scale on every tappable control. Only one neon tube stutters; the other hums.

**Key Characteristics:**
- Room world lit only by emissive sources and bloom; no fill light that reveals the room evenly.
- Site world: deep navy ground, single gold accent, warm off-white ink at three opacities.
- Pills for every control, 10px rows, 14px panels; no sharp-cornered buttons.
- Depth by tone and diffuse dark shadow, never by hard offset shadow.
- One stroke family for every interface icon: drawn SVG, 24px grid, 1.75 stroke, round caps.
- Two motion speeds: slow camera, fast interface.

## Colors

A near-black navy field with one gold accent on the site, and a room palette of warm yellowed plastics against cold plaster, split by a pink and an ice-cyan neon.

### Primary
- **Beacon Gold** (`gold`): the single site accent. Primary buttons, the active language option, the current index row border and tint, the panel's back link and date meta, container labels, zoom thumb and focus ring. Also the CRT desktop's accent, so the program on screen and the site after the dive share it.
- **Lamp Gold** (`gold-strong`): primary-button hover only.
- **Gold Wash / Gold Rule** (`gold-soft`, `gold-line`): tinted hover and current-row fills; hairline borders on pills, the index panel, the detail panel edge and dividers.

### Secondary
- **Signal Cyan** (`signal-cyan`): sparing secondary voice on the site: employer names in the profile timeline and the hover glow on the custom cursor.

### Tertiary (room world, WebGL only)
- **Neon Pink** (`neon-pink`): the HELLO WORLD tube and its pink room light; also the left reflection tint on the CRT glass.
- **Neon Ice** (`neon-ice`): the Saturn tube and its cyan light; the right reflection tint on the glass.
- **Yellowed Plastic** (`crt-plastic`): CRT, tower, keyboard and mouse shells; floppy labels and poster tape sit in the same beige family.
- **Night Plaster** (`plaster`) and **Worn Walnut** (`walnut`): wall and desk base tones, both textured procedurally.
- **Room Black** (`room-black`): scene background and fog.
- **LED Green / HDD Amber** (`led-green`, `led-amber`): power and drive LEDs, emissive and bloomed.

### Neutral
- **Abyss Navy** (`navy-950`): page background, text on gold, and the 0.6 to 0.9 alpha base for floating pills, tooltips and the top-bar gradient.
- **Panel Navy** (`surface-solid`): solid reading surfaces (index panel, mobile detail sheet, mobile index toggle). `surface` is its 0.88-alpha form for the zoom rail.
- **Panel Scrim** (`panel-scrim`, `panel-scrim-mid`, `panel-scrim-edge`): the desktop detail drawer's background, a left-to-right gradient in the navy-950 family (0.98 at 0%, 0.94 at 80%, 0.86 at 100%), so the drawer is near-opaque where text sits and lets the scene breathe at its right edge. Used only for that drawer; on mobile the sheet switches to `surface-solid`.
- **Warm Paper Ink** (`ink`, `ink-2`, `ink-3`): titles and names at full; body copy, subtitles and tags at 0.76; meta, hints and inactive options at 0.6.
- **Hairline** (`hairline`): neutral dividers in the timeline, tag outlines and pager borders.
- **CRT Desktop** (`desktop-navy`, `desktop-paper`, `desktop-ink`, `phosphor-green`): the fictional AM-OS desktop drawn to canvas: navy wallpaper, paper-beige menu bar and windows, near-black pixel ink, green boot-log text.

### Named Rules
**The One Gold Rule.** On the site, gold marks what is primary, active or current, plus short container labels. A screen with two gold-filled elements competing for the same action is wrong.

**The Emissive-Only Rule.** The room is lit by the screen, the two neons and the window. Any new object in the room takes its light from those sources; never add a neutral key light to show it off.

## Typography

**Display Font:** Orbitron (with Exo 2, sans-serif)
**Body Font:** Exo 2 (with system-ui, sans-serif)
**Pixel Font:** VT323 (with ui-monospace), for the CRT desktop and the Enter key cap
**Room-prop faces:** Tilt Neon (`neon-sign`, the HELLO WORLD sign, 190px) and Permanent Marker (`marker`, handwritten floppy-disk labels, 34px). Both are loaded with the site fonts but drawn only into WebGL canvas textures in the room scene; they never appear in DOM UI.

**Character:** Orbitron's wide geometric caps carry the name and project titles like a machine's nameplate; Exo 2 keeps the reading humane and readable. VT323 belongs to the computer itself.

### Hierarchy
- **Display** (Orbitron 800, clamp 28 to 46px, 1.08, uppercase, balanced wrap): project and profile titles in the detail panel.
- **Wordmark** (Orbitron 700, 15px, 0.3em tracking, uppercase): "ADAM MARHRAOUI" in the top bar and room corner; steps down to 13px / 0.24em at 820px and 12px / 0.14em at 480px.
- **Headline** (Exo 2 500, clamp 18 to 24px, 1.3): the project subtitle under the display title, in `ink-2`.
- **Title Large** (Exo 2 600, 16px, 1.35): timeline roles.
- **Title** (Exo 2 600, 15px, 1.25): index row names, primary and start button text, mobile index toggle.
- **Small** (Exo 2 500 to 600, 14px): back link, power button label, pager titles, timeline company (cyan), selection-arrow label (13px).
- **Body** (Exo 2 400, 17px, 1.65, max 62ch): panel descriptions. Timeline detail 15px / 1.6, max 60ch.
- **Body Compact** (Exo 2 400, 16px, 1.65): panel descriptions on mobile (under 820px).
- **Label** (Orbitron 600, 11 to 12px, 0.18 to 0.26em, uppercase, gold): the name of a container (the index panel, the timeline section), language options. Never placed above a headline as a kicker.
- **Label Small** (Orbitron 600, 10px, 0.22em, uppercase, gold): the planet-name tooltip that follows the pointer.
- **Meta** (Exo 2 400, 13px, 0.02 to 0.04em, `ink-3`): roles, room hint, site hint, tags, timeline dates.
- **Meta Small** (Exo 2 400 to 700, 12px, 0.04 to 0.08em, `ink-3`, tabular numerals for dates): planet and year under index rows, pager labels, drag hint, mobile site hint, the mobile index count badge (700, navy on gold).
- **Pixel** (VT323 20px, 1): the Enter key cap on the room start control; 22 to 52px on the CRT canvas.

### Named Rules
**The Nameplate Rule.** Uppercase Orbitron is for names (the person, a project, a container). Sentences are always Exo 2 in sentence case.

## Layout

The site is a full-bleed WebGL canvas with controls floated over it at a fluid gutter (`spacing.gutter`, 16 to 32px). A 68px top bar (60px under 820px) holds the wordmark and role on the left and language, LinkedIn and power on the right, over a navy gradient that fades to transparent. The project index is a 304px panel pinned under the top bar at the left; the zoom rail sits bottom right; a single centred hint line sits at the bottom.

Opening a body replaces the index with the detail panel: a left drawer `min(600px, 46vw)` wide (54vw under 1100px), padded `clamp(24px, 3.4vw, 56px)`, with the scene still visible to the right. Title, subtitle, meta, description, links and tags stack with 10 to 32px steps; a two-column pager sits at the bottom.

Compact layouts (under 820px wide, or under 520px tall, i.e. landscape phones; see `src/utils/layout.js`): the top bar slims to 60px (54px when short), the role and zoom rail drop out (pinch replaces the rail), and the index becomes a bottom pill toggle with a count badge that opens a sheet sized to the free height (up to 62dvh). Narrow portrait screens additionally turn the detail panel into a 62dvh bottom sheet with a drag handle (swipe down to close); landscape phones keep the side drawer. Under 480px the top-bar wordmark stacks on two lines. Every edge-pinned control keeps the gutter or the device safe-area inset, whichever is larger. All controls keep a 44px minimum hit area (`spacing.hit`).

The room layer is a fixed composition: identity top left, language top right, and the start control centred at the bottom.

## Elevation & Depth

Depth is tonal first: solid navy panels over the dark scene, gold hairlines for edges. Shadows exist but are only diffuse, dark and offset downward or sideways, there to seat a surface over a bright 3D scene. Light-world depth (bloom, emissive glow, fog) belongs to WebGL and is never imitated in CSS outside the jump gate.

### Shadow Vocabulary
- **Panel seat** (`box-shadow: 0 24px 60px -30px rgba(0,0,0,0.9)`): the index panel; `0 16px 40px -16px` for the mobile toggle; `0 18px 40px -18px` for the room start control.
- **Drawer edge** (`box-shadow: 30px 0 80px -40px rgba(0,0,0,0.9)`): the detail panel over the scene.
- **Gold lift** (`box-shadow: 0 8px 24px -10px rgba(245,200,66,0.55)`; hover `0 12px 28px -10px rgba(245,200,66,0.7)`): primary button only.
- **Neon halo text** (`text-shadow: 0 1px 2px rgba(0,0,0,0.9), 0 0 18px rgba(0,0,0,0.85)`): room overlay text, which sits in front of lit neons.
- **Nudge ring** (`0 0 0 0 → 0 0 0 18px` gold fading out, 700ms): the start control when the visitor tries to act before the room is ready.

### Named Rules
**The Dark Seat Rule.** Shadows are black, blurred and negative-spread; the only coloured shadow is gold under the primary button.

## Shapes

Every control is a pill (`rounded.pill`): buttons, language toggle, icon buttons, tags, tooltips, the selection label, the zoom rail and the start control. Rows and pager links are gently rounded (10px); the index panel is 14px; the mobile detail sheet rounds only its top corners (18px). Borders are 1px, in `gold-line` for controls and panels and `hairline` for neutral dividers. The focus ring is a 2px gold outline, 3px offset, 4px radius (inset -2px on index rows).

Icons are drawn inline SVG on a 24px grid, 1.75 stroke, round caps and joins, at 15 to 18px, coloured by `currentColor`.

## Components

### Buttons
Confident and warm; they press back.
- **Shape:** full pill (999px).
- **Primary:** gold fill, navy text, Exo 2 700 15px, 48px tall, 22px sides, gold lift shadow. Used for "view repository" and LinkedIn links in the panel. Hover: lamp gold and a 2px diagonal nudge of the arrow icon.
- **Icon / Power:** 44px, translucent navy fill, gold-line border, ink icon; hover turns border and icon gold, the power icon rotates -12deg. The power button carries a label that collapses to icon-only under 820px.
- **Back link:** borderless gold text with a chevron, gold wash on hover, chevron slides -3px.
- **Press:** every button scales to 0.96 to 0.97 on `:active` in 160ms ease-out. Hover effects only under `(hover: hover) and (pointer: fine)`.

### Language Toggle
A pill track with two 36px Orbitron options; the pressed option fills gold with navy text, the other sits at `ink-3` and brightens to `ink` on hover.

### Tags
Hairline-outlined pills, 13px `ink-2`, 6px by 12px padding, no fill. Stack lists only, not interactive.

### Project Index (signature)
A solid navy panel with a gold Orbitron label naming the list. Each row is a 40px rendered planet thumbnail beside the name (2-line clamp) and a meta line of planet and year. Hover tints the row with a faint gold wash, scales the thumbnail to 1.08 and turns the name gold; the current row carries a gold-line border and gold-soft fill. It hides while a detail panel is open.

### Detail Panel
A left drawer of near-opaque navy with a gold-line right edge; slides in on a 560ms drawer curve, out in 420ms. Content switches between bodies by dimming to 0.25 opacity with a 3px blur for 220ms. Profile adds a timeline of hairline-separated rows (128px date column, cyan employer). A previous/next pager closes the panel.

### Room Start Control
The room's DOM-mirrored primary action: a 52px dark pill with a label and a gold key cap in VT323 holding "Enter" and the drawn return-arrow icon. A hint line below in `ink-3`. Full width under 820px.

### CRT Layer (signature)
The computer is dark until the visitor clicks it: it boots (power-on line, BIOS text), the camera leans in, and the AM-OS desktop offers two pixel icons, Portfolio (Saturn) and Paint, a small drawing app on off-white paper with brush, eraser, three sizes, clear and a 12-colour palette. The screen material composites the AM-OS desktop canvas and the live solar render, with barrel curvature, scanlines, a slight 62Hz brightness ripple, and pink/ice glass reflections. After the dive, the same CRT post pass runs full-viewport over the site and relaxes `strength` from 1 to 0 over 1100ms; powering off collapses the picture to a line and a dot (700ms) before the 1500ms pull-back.

### External links
Links to other sites (GitHub, LinkedIn) open immediately in a new tab, so the portfolio stays where the visitor left it. On click the control answers with a 380ms gold scanline sweep (a CRT refresh, transform-only, removed under reduced motion), and a solid navy pill toast reads "Opening github.com" with the arrow-up-right icon for 1.8 s. No full-screen transition and no delay before the tab opens: browsers block tabs opened after an animation.

### Neons
HELLO WORLD steady with a slight 4% shimmer; WORLD bursts into stutter every 4 to 11 s for 0.4 to 1 s; Saturn hums on a slow sine and dips briefly every 9 to 17 s. All flicker stops under reduced motion.

## Do's and Don'ts

### Do:
- **Do** keep gold for the primary, active or current element and for container labels; everything else is ink at 1, 0.76 or 0.6.
- **Do** give every control a pill shape, a 44px hit area, a 160ms ease-out (`cubic-bezier(0.23, 1, 0.32, 1)`) state change and a 0.96 to 0.98 press scale.
- **Do** move the camera on `cubic-bezier(0.77, 0, 0.175, 1)` over 1.5 to 1.8 s, and slide drawers on `cubic-bezier(0.32, 0.72, 0, 1)`.
- **Do** draw new icons as inline SVG in the shared stroke family (24px grid, 1.75 stroke, round caps).
- **Do** light anything added to the room from the screen, neons or window, and let bloom carry the glow.
- **Do** put reading content on solid navy (`surface-solid`) with Exo 2 body at 17px / 1.65 and 62ch.
- **Do** collapse every transition to opacity-only (300ms) and stop neon flicker under `prefers-reduced-motion`.

### Don't:
- **Don't** put a small tracked uppercase label above a headline as a kicker; Orbitron labels name containers only.
- **Don't** use frosted-glass panels for reading surfaces; panels are solid or near-opaque navy.
- **Don't** add hard offset or coloured shadows beyond the gold primary lift.
- **Don't** use emoji or font glyphs as interface icons.
- **Don't** add a neutral key or fill light to the room that flattens it.
- **Don't** set sentences in Orbitron or in uppercase.
