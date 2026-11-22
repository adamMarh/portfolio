import { useCallback, useState } from 'react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { getTranslation } from '../i18n/translations.js';
import { getRadioState, radioCommand } from '../services/radio/radioPlayer.js';
import { globalEventBus } from '../utils/eventBus.js';
import { useBusEvent } from '../hooks/useStage.js';
import { NextIcon, PauseIcon, PlayIcon } from './Icons.jsx';

function useRadio() {
  const [state, setState] = useState(getRadioState);
  useBusEvent('radio-changed', useCallback((next) => setState(next), []));
  return state;
}

const send = (action) => {
  globalEventBus.emit('radio-command', { action });
  radioCommand(action);
};

// Room: the 3D radio is the real control; these mirror it for keyboard and
// screen-reader users and appear only when focused.
export function RoomRadioControls() {
  const { language } = useLanguage();
  const t = (key) => getTranslation(language, key);
  const radio = useRadio();
  if (radio.status === 'empty') return null;
  const track = [radio.artist, radio.title].filter(Boolean).join(' – ');
  const on = radio.status === 'playing' || radio.status === 'pending';

  return (
    <div className="radio-controls" role="group" aria-label={t('radio.label')}>
      <p className="radio-controls__now" aria-live="polite">
        {on ? `${t('radio.nowPlaying')}: ${track}` : t('radio.stopped')}
      </p>
      <button type="button" className="icon-button" aria-label={on ? t('radio.pause') : t('radio.play')} onClick={() => send('toggle')}>
        {on ? <PauseIcon /> : <PlayIcon />}
      </button>
      <button type="button" className="icon-button" aria-label={t('radio.next')} onClick={() => send('next')}><NextIcon /></button>
    </div>
  );
}

// Site: while music plays, a small "on air" button in the top bar stops it.
export function SiteRadioButton() {
  const { language } = useLanguage();
  const radio = useRadio();
  if (radio.status !== 'playing' && radio.status !== 'pending') return null;
  const track = [radio.artist, radio.title].filter(Boolean).join(' – ');
  return (
    <button
      type="button"
      className="icon-button radio-mini"
      aria-label={`${getTranslation(language, 'radio.stopRadio')} (${track})`}
      title={track}
      onClick={() => send('pause')}
    >
      <span className="radio-mini__bars" aria-hidden="true"><i /><i /><i /></span>
    </button>
  );
}
