---
version: 1
slug: "index-html"
primary_target: "index.html"
related_targets: ["src/App.jsx"]
---

# Surface: portfolio entry (room) + solar portfolio

Mode: Experience. Audience: internship recruiters skimming many portfolios (PRODUCT.md). Job: leave remembering Adam as an engineer who builds ambitious things, and reach every project fact quickly.

Constraints: solar-system concept fixed; EN/FR parity; every project and profile fact reachable by keyboard and screen reader without the WebGL scene; no skip link (removed at the user's request; the "Enter the portfolio" button and Enter key are the fast path); the radio starts on load or on the first gesture; Enter starts the dive; reduced-motion path crossfades instead of flying.

## Direction contract

THESIS: The portfolio is a program running on a lit 90s computer in a dark room at night. The visitor arrives as the person sitting down at that desk; the machine is already working when they arrive. Refuses the category default: a dark hero with a name, a tagline and a "View projects" button over a starfield.

OWN-WORLD: Room: near-black blue-green plaster, worn walnut desk, yellowed beige plastic CRT and tower, a coral-red "HELLO WORLD" neon and an ice-cyan Saturn neon, a rain-streaked window with sodium-orange city bokeh, a retro Saturn poster, labelled floppy disks. Light comes only from the screen, the neons and the window, with bloom. CRT: curved glass, scanlines, phosphor glow; a fictional desktop in the portfolio's navy and gold, pixel type. Site: the established identity, deep navy, gold #f5c842, Orbitron display, Exo 2 text, rebuilt as a top bar, a persistent project index and an editorial detail panel; drawn SVG icons, no eyebrows, no side bars.

STORY: The visitor sees a real room and a computer already on; the cursor on the CRT double-clicks SOLAR.EXE, a window opens and the solar system boots inside it, then maximizes. They click the screen (or press Enter), the camera dives through the glass, and the portfolio fills the browser. They open planets or index rows to read projects, step project to project, and can power the CRT off to return to the room.

FIRST VIEWPORT: Seated eye height, the CRT slightly right of centre at about a third of the viewport width, its screen readable; HELLO WORLD neon on the back wall upper left, Saturn neon above the window on the right, rain window right, poster left, tower with blinking LED at the desk's left, floppies beside the keyboard. DOM: the start button first in tab order, a quiet bottom hint "Click the computer to turn it on". Primary action: the CRT screen itself (hover brightens it, the camera leans in), mirrored by Enter and a real button.

FORM: seed: none (pinned). "what if the user spawns in a small dark room, with one computer in front of him. He clicks on the computer, and only then the camera goes to the old computer screen and the current website is displayed" / "The dark room should have a 90s retro style with one or two neons that flicker" / "I want the 90s computer to be already lit up, with a program opening. The program that is opening is the space constellation portfolio that we already had before." Signature interaction: the dive, a camera push into the curved glass, then a full-viewport CRT layer whose curvature and scanlines relax to zero over the live site; the reverse collapses the picture to a line and a dot, then the camera pulls back. Motion grammar: camera 1.6–1.8 s strong ease-in-out; UI 150–300 ms strong ease-out; only the WORLD tube stutters, Saturn hums.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
