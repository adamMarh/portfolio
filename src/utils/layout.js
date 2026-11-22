// The layout breakpoints, shared by the CSS (styles/portfolio-solaire.css) and
// the 3D framing, so the camera always frames for the panel the visitor sees.
//
//   compact : small screens and landscape phones. Slimmer top bar, the index
//             folds into a button, the zoom slider gives way to pinch.
//   sheet   : narrow portrait screens. The detail panel is a bottom sheet and
//             the body is framed in the free space above it.
export const COMPACT_QUERY = '(max-width: 820px), (max-height: 520px)';
export const SHEET_QUERY = '(max-width: 820px) and (orientation: portrait)';

const compactMedia = window.matchMedia(COMPACT_QUERY);
const sheetMedia = window.matchMedia(SHEET_QUERY);

export const isCompact = () => compactMedia.matches;
export const isSheet = () => sheetMedia.matches;
