import { useCallback, useEffect, useRef, useState } from 'react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { getTranslation } from '../i18n/translations.js';
import { useBusEvent, useCoarsePointer, useStage } from '../hooks/useStage.js';
import { requestStage } from '../services/stage/state.js';
import { globalEventBus } from '../utils/eventBus.js';
import LanguageToggle from './LanguageToggle.jsx';
import { RoomRadioControls } from './RadioControls.jsx';
import { CloseIcon, EnterKeyIcon } from './Icons.jsx';

function hintKey({ computer, mode }, coarse) {
  const touch = coarse ? 'Touch' : '';
  if (computer === 'off') return `room.hint${touch}`;
  if (computer === 'boot') return 'room.hintBooting';
  if (mode === 'seat') return `room.hintSeatOn${touch}`;
  if (computer === 'paint') return `room.hintPaint${touch}`;
  if (computer === 'encyclopedia') return `room.hintEncyclopedia${touch}`;
  return `room.hintDesktop${touch}`;
}

// What the keyboard button does next: the same step a pointer would take.
function stepKey({ computer, mode }) {
  if (computer === 'off' || mode === 'seat') return 'room.powerOn';
  if (computer === 'boot' || computer === 'opening' || computer === 'program') return 'room.hintBooting';
  return 'room.openPortfolio';
}

// The few controls that sit over the dark room: who this is, the language,
// and the hint. Visitors reach the portfolio through the computer itself; for
// keyboard and screen-reader users a button (shown only when focused) walks
// the same path one step at a time, with no shortcut past it.
export default function RoomOverlay() {
  const { language } = useLanguage();
  const t = (key) => getTranslation(language, key);
  const stage = useStage();
  const startRef = useRef(null);
  const [nudge, setNudge] = useState(0);
  const coarse = useCoarsePointer();
  const [desk, setDesk] = useState({ computer: 'off', mode: 'seat' });
  useBusEvent('room-desk', useCallback((next) => setDesk(next), []));

  useBusEvent('room-missed-click', useCallback(() => setNudge((n) => n + 1), []));
  // On a phone the app window's close box is a few pixels wide: touch screens
  // get a real, finger-sized button for it.
  const openApp = desk.mode === 'closeup' && (desk.computer === 'paint' || desk.computer === 'encyclopedia') ? desk.computer : null;

  // Coming back from the site, give keyboard focus back to the step button.
  const previous = useRef(stage);
  useEffect(() => {
    if (stage === 'room' && previous.current === 'leaving') startRef.current?.focus({ preventScroll: true });
    previous.current = stage;
  }, [stage]);

  return (
    <div className={`room-ui ${desk.mode === 'closeup' ? 'is-closeup' : ''}`} inert={stage !== 'room'}>
      <header className="room-id">
        <h1 className="wordmark">Adam Marhraoui</h1>
        <p className="room-id__role">{t('room.role')}</p>
      </header>

      <div className="room-lang">
        <LanguageToggle />
      </div>

      <RoomRadioControls />

      <div className="room-start-wrap">
        <button
          ref={startRef}
          type="button"
          className="room-start"
          aria-disabled={stepKey(desk) === 'room.hintBooting'}
          onClick={() => requestStage('room-advance')}
        >
          <span className="room-start__label">{t(stepKey(desk))}</span>
          <kbd className="room-start__key">
            Enter
            <EnterKeyIcon />
          </kbd>
        </button>
        {coarse && openApp && (
          <button type="button" className="room-close-app" onClick={() => globalEventBus.emit('room-close-app')}>
            <CloseIcon />
            {t('room.closeApp').replace('{app}', t(`room.screen.${openApp}`))}
          </button>
        )}
        <p key={nudge} className={`room-start__hint ${nudge ? 'is-nudged' : ''}`} aria-live="polite">{t(hintKey(desk, coarse))}</p>
      </div>
    </div>
  );
}
