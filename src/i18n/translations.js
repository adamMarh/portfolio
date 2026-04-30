export const translations = {
  en: {
    nav: {
      backToSystem: '◄ Back to system',
      dragToOrbit: 'Drag to orbit · Click on a planet',
      dragToRotate: 'Drag to rotate',
      language: 'Language',
    },
    panel: {
      category: 'Project',
    },
    profile: {
      category: 'Profile',
      title: 'Sun',
      sub: 'Personal summary',
      desc: 'I am a full-stack developer passionate about immersive experiences, interactive interfaces and robust systems. I love transforming complex ideas into clear, performant and useful products. This sun represents my global vision: energy, direction, and ability to connect design, technology and user impact.',
      tags: ['Full-Stack', '3D Web', 'UX', 'Architecture', 'Performance'],
    },
    intro: {
      fade: 'Loading...',
    },
  },
  fr: {
    nav: {
      backToSystem: '◄ Retour au système',
      dragToOrbit: 'Glisser pour orbiter · Cliquer sur une planète',
      dragToRotate: 'Glisser pour faire tourner',
      language: 'Langue',
    },
    panel: {
      category: 'Projet',
    },
    profile: {
      category: 'Profil',
      title: 'Soleil',
      sub: 'Résumé personnel',
      desc: 'Je suis un développeur full-stack passionné par les expériences immersives, les interfaces interactives et les systèmes robustes. J\'aime transformer des idées complexes en produits clairs, performants et utiles. Ce soleil représente ma vision globale: énergie, direction, et capacité à relier design, technique et impact utilisateur.',
      tags: ['Full-Stack', '3D Web', 'UX', 'Architecture', 'Performance'],
    },
    intro: {
      fade: 'Chargement...',
    },
  },
};

export function getTranslation(lang, path) {
  const keys = path.split('.');
  let current = translations[lang];
  for (const key of keys) {
    current = current?.[key];
  }
  return current || path;
}
