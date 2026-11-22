import { PROJECTS } from './portfolio.js';
import { getPlanetName, getProjectTranslation, getTranslation } from '../i18n/translations.js';

// Order used by the index and by previous/next in the detail panel.
export const BODY_ORDER = [-1, ...PROJECTS.map((_, i) => i)];

function yearOf(sub = '') {
  const match = sub.match(/—\s*([0-9]{4}(?:\s*[–-]\s*[0-9]{4})?)\s*$/);
  return match ? match[1] : '';
}

export function getBody(language, idx) {
  if (idx === -1) {
    return {
      idx,
      title: getTranslation(language, 'profile.title'),
      planet: getPlanetName(language, 'Soleil'),
      sub: getTranslation(language, 'room.role'),
      desc: getTranslation(language, 'profile.desc'),
      tags: getTranslation(language, 'profile.tags'),
      links: getTranslation(language, 'profile.links'),
      internships: getTranslation(language, 'profile.internships'),
      color: 0xffd768,
      accent: 0xff8a18,
      isSun: true,
      year: '',
    };
  }
  const project = PROJECTS[idx];
  const copy = getProjectTranslation(language, idx) || {};
  return {
    idx,
    title: copy.title,
    planet: getPlanetName(language, project.planet),
    sub: copy.sub,
    desc: copy.desc,
    tags: copy.tags || [],
    links: copy.links || [],
    color: project.hex,
    accent: project.emissive || project.hex,
    ring: Boolean(project.ring),
    year: yearOf(copy.sub),
  };
}

// "Role — Company (dates): detail" → parts, in either language.
export function parseInternship(text) {
  const match = text.match(/^(.*?)\s+—\s+(.*?)\s*\(([^)]*)\)\s*:\s*(.*)$/);
  if (!match) return { role: text, company: '', dates: '', detail: '' };
  return { role: match[1], company: match[2], dates: match[3], detail: match[4] };
}

// The detail meta line: year (+ "ongoing" when the range runs past this year),
// plus the subtitle's context only when it says something the tag chips do not.
export function metaFor(body, ongoingLabel) {
  if (body.idx === -1) return { context: body.sub, when: '' };
  const [context = ''] = (body.sub || '').split(/\s+—\s+/);
  const tags = new Set((body.tags || []).map((tag) => tag.toLowerCase()));
  const items = context.split(/\s*·\s*/).filter(Boolean);
  const redundant = items.length > 0 && items.every((item) => tags.has(item.toLowerCase()));
  const end = Number((body.year.match(/(\d{4})\s*$/) || [])[1]);
  const ongoing = end > new Date().getFullYear();
  return {
    context: redundant ? '' : context,
    when: [body.year, ongoing ? ongoingLabel : ''].filter(Boolean).join(' · '),
  };
}
