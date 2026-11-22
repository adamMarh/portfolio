// One stroke family for every interface icon: 24px grid, 1.75 stroke, round caps.
function Svg({ children, className = 'icon', ...rest }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...rest}>
      {children}
    </svg>
  );
}

export const ArrowRightIcon = (p) => (
  <Svg {...p}><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></Svg>
);

export const EnterKeyIcon = (p) => (
  <Svg {...p}><path d="M20 5v6a4 4 0 0 1-4 4H5" /><path d="m9 11-4 4 4 4" /></Svg>
);

export const PlayIcon = (p) => (
  <Svg {...p}><path d="M7 5v14l11-7z" fill="currentColor" /></Svg>
);

export const PauseIcon = (p) => (
  <Svg {...p}><rect x="6.5" y="5.5" width="3.5" height="13" rx="1" fill="currentColor" /><rect x="14" y="5.5" width="3.5" height="13" rx="1" fill="currentColor" /></Svg>
);

export const NextIcon = (p) => (
  <Svg {...p}><path d="M5 6v12l8-6z" fill="currentColor" /><path d="M12 6v12l8-6z" fill="currentColor" /><path d="M20 6v12" /></Svg>
);

export const ArrowUpRightIcon = (p) => (
  <Svg {...p}><path d="M7 17 17 7" /><path d="M8 7h9v9" /></Svg>
);

export const ChevronLeftIcon = (p) => (
  <Svg {...p}><path d="m15 18-6-6 6-6" /></Svg>
);

export const ChevronRightIcon = (p) => (
  <Svg {...p}><path d="m9 18 6-6-6-6" /></Svg>
);

export const PowerIcon = (p) => (
  <Svg {...p}><path d="M12 3v8" /><path d="M6.4 6.9a8 8 0 1 0 11.2 0" /></Svg>
);

export const ListIcon = (p) => (
  <Svg {...p}><path d="M9 6h11" /><path d="M9 12h11" /><path d="M9 18h11" /><circle cx="4.5" cy="6" r="1" /><circle cx="4.5" cy="12" r="1" /><circle cx="4.5" cy="18" r="1" /></Svg>
);

export const CloseIcon = (p) => (
  <Svg {...p}><path d="M6 6l12 12" /><path d="M18 6 6 18" /></Svg>
);

// LinkedIn's own mark (Simple Icons, CC0), filled rather than stroked.
export const LinkedInIcon = ({ className = 'icon' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);
