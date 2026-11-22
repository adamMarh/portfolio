import { useLanguage } from '../context/LanguageContext.jsx';
import { getTranslation } from '../i18n/translations.js';
import { globalEventBus } from '../utils/eventBus.js';
import ExternalLink from './ExternalLink.jsx';
import LanguageToggle from './LanguageToggle.jsx';
import { SiteRadioButton } from './RadioControls.jsx';
import { LinkedInIcon, PowerIcon } from './Icons.jsx';

export default function SiteTopBar() {
  const { language } = useLanguage();
  const t = (key) => getTranslation(language, key);
  const linkedin = getTranslation(language, 'profile.links')?.[0]?.url;

  return (
    <header className="topbar">
      <div className="topbar__id" id="portfolio" tabIndex={-1}>
        <p className="wordmark">Adam Marhraoui</p>
        <p className="topbar__role">{t('room.role')}</p>
      </div>
      <div className="topbar__actions">
        <SiteRadioButton />
        <LanguageToggle />
        {linkedin && (
          <ExternalLink className="icon-button" href={linkedin} label={t('site.linkedin')}>
            <LinkedInIcon />
          </ExternalLink>
        )}
        <button
          type="button"
          className="power-button"
          aria-label={t('site.powerOffLabel')}
          onClick={() => globalEventBus.emit('stage-power-off')}
        >
          <PowerIcon />
          <span className="power-button__label">{t('site.powerOff')}</span>
        </button>
      </div>
    </header>
  );
}
