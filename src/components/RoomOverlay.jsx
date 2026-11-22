import { useCallback, useEffect, useRef, useState } from 'react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { getTranslation } from '../i18n/translations.js';
import { useBusEvent, useCoarsePointer, useStage } from '../hooks/useStage.js';
import { requestStage } from '../services/stage/state.js';
import LanguageToggle from './LanguageToggle.jsx';
import { RoomRadioControls } from './RadioControls.jsx';
import { EnterKeyIcon } from './Icons.jsx';

function hintKey({ computer, mode }, coarse) {
  const touch = coarse ? 'Touch' : '';
  if (computer === 'off') return `room.hint${touch}`;
  if (computer === 'boot') return 'room.hintBooting';
  if (mode === 'seat') return `room.hintSeatOn${touch}`;
  if (computer === 'paint') return `room.hintPaint${touch}`;
  if (computer === 'encyclopedia') return `room.hintEncyclopedia${touch}`;
  return `room.hintDesktop${touch}`;
}

// The few controls that sit over the dark room: who this is, the language,
// and a real button mirroring "click the computer".
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

  // Coming back from the site, give keyboard focus back to the start button.
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
          key={nudge}
          ref={startRef}
          type="button"
          className={`room-start ${nudge ? 'is-nudged' : ''}`}
          onClick={() => requestStage('stage-start')}
        >
          <span className="room-start__label">{t('room.start')}</span>
          {!coarse && (
            <kbd className="room-start__key">
              Enter
              <EnterKeyIcon />
            </kbd>
          )}
        </button>
        <p className="room-start__hint" aria-live="polite">{t(hintKey(desk, coarse))}</p>
      </div>
    </div>
  );
}
