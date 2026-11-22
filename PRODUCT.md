# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: recruiters and HR staff screening candidates for software internships and co-op terms. They arrive from a link (LinkedIn, an application, a résumé), skim many candidate portfolios in a session, and decide quickly whether this person is memorable enough to shortlist. Other visitors (engineers, classmates, network) are welcome but are not the design target.

## Product Purpose

A personal portfolio for Adam Marhraoui, a Software Engineering student at Polytechnique Montréal working as a full-stack and AI developer. It presents his profile, internships, and projects.

Success means the visitor leaves remembering him as an engineer who builds ambitious things. The site is judged on the impression it leaves; collecting contact requests or driving repo visits are secondary.

## Positioning

The portfolio is itself a piece of work: an explorable, custom-built Three.js solar system where Adam's profile is the Sun and each project is a planet. Its claim is proof by demonstration. A visitor experiences the 3D, real-time, and architecture skill the projects describe instead of only reading about it.

## Operating Context

- Visitors open the site in a browser, usually after a single click from somewhere else, with limited time and attention.
- Navigation flow: a drawer lists every body in the system; selecting one highlights it; clicking the body animates the camera into a detail view; a panel shows the project or profile content; "Back to system" returns to the overview. Visitors can drag to orbit and zoom.
- Content lives in `src/i18n/translations.js` (copy, both languages) and `src/data/portfolio.js` (planet metadata).

## Capabilities and Constraints

- Stack: React 19, Vite 5, Three.js 0.166, Motion. Visual system in `styles/portfolio-solaire.css`.
- Bilingual, English and French, with full parity: every visitor-facing string must exist in both languages. French is the default (`lang="fr"`, stored preference in `localStorage` key `portfolio-language`).
- The solar-system concept is fixed: profile as Sun, projects as planets, explorable 3D scene. Future work refines it, not replaces it.
- All project and profile content must be reachable by keyboard and by screen reader, not only by pointer interaction with the 3D scene.
- Mobile and tablet: required. Phones and iPads (portrait and landscape) must get the same experience as desktop, in every major browser (Safari, Chrome, Firefox, Edge): tap and pinch equivalents for every click, drag and wheel interaction, safe-area aware layout. Layout breakpoints live in `src/utils/layout.js` and are mirrored in the CSS.
- Contact: LinkedIn is the only contact channel today. No email address or downloadable résumé exists; do not invent either.

## Brand Commitments

- Name: Adam Marhraoui, displayed as "ADAM MARHRAOUI".
- Project name in code: "Portfolio Solaire".
- Content policy (from README): project descriptions are based on the source repositories and the résumé; ongoing work is labelled as ongoing; prototypes and dataset-only projects are never presented as production applications.

## Evidence on Hand

- Profile summary, three internships (IVADO Labs, Hutchinson Aéronautique & Industrie, Quebec Ministry of Cybersecurity and Digital Technologies), skill tags, LinkedIn link: `src/i18n/translations.js`.
- Eight projects with descriptions, stack tags, and (for six of them) GitHub repository links: NLP Classification Pipeline, FindSecure, MoodCam, Gym application ecosystem, Speed card game, Software Evolution Project, Satellite Constellation Design (ongoing, 2026–2027), Gemineat.
- One quantified result: executive data tools improved by 74% at Hutchinson.
- Absent, never to be fabricated: testimonials, employer logos used as endorsements, user counts, awards, press, screenshots or demos not in the repo.

## Product Principles

1. **Memorable in the first seconds.** A recruiter skimming many portfolios must feel the difference before reading a word.
2. **The site is the proof.** Craft in the experience itself carries the claim of engineering ability; it must never feel broken, slow, or confusing.
3. **Never block the substance.** The spectacle frames the content; a visitor who wants the facts (who he is, what he built, where he worked) must reach them quickly and without needing to master the 3D controls.
4. **Truthful, verifiable claims.** Every description traces back to a repo or the résumé; ongoing work says so.
5. **Equal in both languages.** French and English are both first-class; neither is a partial translation.

## Accessibility & Inclusion

- Keyboard and screen-reader access to all profile and project content is required, with an equivalent path that does not depend on manipulating the WebGL scene.
- No formal WCAG level was specified.
