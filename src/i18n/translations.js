export const translations = {
  en: {
    hero: {
      eyebrow: 'Solar portfolio',
      title: 'Portfolio in orbit',
      subtitle: 'Open the drawer, pick a world, then click the highlighted body to dive in.',
    },
    drawer: {
      title: 'Elements',
      subtitle: 'Every body in the system',
      open: 'Open elements',
      close: 'Close elements',
      clickToVisit: 'Click the planet to visit',
      comingSoon: 'Coming soon',
    },
    nav: {
      backToSystem: '◄ Back to system',
      dragToOrbit: 'Drag to orbit · Use the drawer to choose an element',
      dragToRotate: 'Drag to rotate',
      language: 'Language',
    },
    panel: {
      category: 'Project',
    },
    planets: {
      Mercure: 'Mercury',
      Vénus: 'Venus',
      Terre: 'Earth',
      Mars: 'Mars',
      Jupiter: 'Jupiter',
      Saturne: 'Saturn',
      Uranus: 'Uranus',
      Soleil: 'Sun',
    },
    profile: {
      category: 'Profile',
      title: 'Profile',
      sub: 'Personal summary',
      desc: 'I am a Software Engineering student at Polytechnique Montreal and a full-stack and AI developer focused on turning complex operational problems into reliable products. My work spans data ingestion, machine learning, cloud-connected systems, real-time applications, and cross-platform interfaces. I care about clean architecture, measurable performance, and software that helps people make better decisions.',
      internships: [
        'AI Software Developer Intern — IVADO Labs (Aug 2026–present): Building scalable Python data-ingestion modules and cloud-agnostic architectures for AI training and deployment.',
        'Software Engineer Intern — Hutchinson Aéronautique & Industrie (May–Aug 2026): Improved executive data tools by 74%, designed ERP/PLM SQL pipelines, and automated operations with Python.',
        'Software Engineer Intern — Quebec Ministry of Cybersecurity and Digital Technologies (Aug–Dec 2025): Advised on feasibility, digitized internal workflows, and integrated AI/ML automation to improve operational efficiency.',
      ],
      tags: ['Full-Stack', '3D Web', 'AI/ML', 'Architecture', 'Performance'],
      links: [{label: 'Linkedin', url: 'https://www.linkedin.com/in/adam-marhraoui'}]
    },
    projects: [
      {
        category: 'AI/ML',
        title: 'NLP Classification Pipeline',
        sub: 'Python · TensorFlow · FastAPI · GCP — 2025',
        desc: 'Built a production-oriented text-classification workflow pipeline with cloud or local data ingestion, covering data preprocessing and tokenization, model training, evaluation against the current best model, Google Cloud Storage model promotion, and a FastAPI prediction endpoint. The work focused on transformer-based text classification and the operational decisions needed to move an experiment toward a reliable service.',
        tags: ['Python', 'Deep Learning', 'GCP', 'Model Deployment'],
        tags: ['Python', 'TensorFlow', 'NLP', 'FastAPI', 'GCP'],
        links: [{label: 'View Repository', url: 'https://github.com/adamMarh/Hate-Speech-Recognition'}]
      },
      {
        category: 'Project',
        title: 'FindSecure — Lost & Found Matcher',
        sub: 'React · TypeScript · Supabase · Edge Functions — 2026',
        desc: 'Created a secure lost-and-found workflow where authenticated users submit text and up to five images, track inquiry status, and receive candidate matches from a server-side Supabase Edge Function. The platform combines private inventory, storage, PostgreSQL migrations, role-aware administration, and a responsive shadcn/ui interface.',
        tags: ['React', 'TypeScript', 'Supabase', 'PostgreSQL', 'Edge Functions'],
        links: [{ label: 'View repository', url: 'https://github.com/adamMarh/FindSecure' }],
      },
      {
        category: 'Open Source',
        title: 'MoodCam — Real-Time Mood Detector',
        sub: 'Python · PyTorch · OpenCV · Tkinter — 2025',
        desc: 'Implemented a desktop computer-vision application that detects the largest face from a webcam stream and classifies seven facial-expression categories. The app supports a ViT model with a lightweight CNN fallback, CPU/GPU selection, normalized preprocessing, threaded inference, and a user-facing Tkinter interface.',
        tags: ['Python', 'PyTorch', 'OpenCV', 'Tkinter'],
        links: [{ label: 'View repository', url: 'https://github.com/adamMarh/MoodCam' }],
      },
      {
        category: 'Project',
        title: 'Gym application ecosystem',
        sub: 'Flutter · Node.js · TypeScript · JWT — 2025',
        desc: 'Developed a role-based gym platform with Flutter clients and an Express/TypeScript API. Clients can book classes, log workouts, browse calendars, and use a community feed; staff manage shifts and reports; administrators manage members, classes, moderation, and report review.',
        tags: ['Flutter', 'Node.js', 'TypeScript', 'JWT'],
        links: [{ label: 'View repository', url: 'https://github.com/adamMarh/gym-app' }],
      },
      {
        category: 'Distributed System',
        title: 'Speed — Online Card Game',
        sub: 'React · TypeScript · WebSockets · uWebSockets.js — 2025',
        desc: 'Built an authoritative two-player Speed card game with anonymous lobby codes, shared TypeScript protocol types, drag-and-drop play, live opponent cursors, legal-move validation, deadlock recovery, reshuffling, and immediate win detection. The server owns game state while the Vite client provides the interactive table.',
        tags: ['React', 'TypeScript', 'WebSockets', 'uWebSockets.js', 'Vitest'],
        links: [{ label: 'View repository', url: 'https://github.com/adamMarh/Spit_Card_Game' }],

      },
      {
        category: 'SaaS Platform',
        title: 'Software Evolution Project',
        sub: 'Electron · Flutter · Firebase · GitLab — 2026',
        desc: 'Refactored an existing web application into desktop and mobile experiences, balancing shared functionality with platform-specific UX. The project strengthened my practice in incremental refactoring, maintainable interfaces, backend integration, and collaborative GitLab delivery.',
        tags: ['Electron', 'Flutter', 'Firebase', 'GitLab'],
      },
      {
        category: 'Generative AI',
        title: 'Satellite Constellation Design',
        sub: 'Onboard Computer Team · Polytechnique Montréal & MDA Space — 2026–2027',
        desc: 'Contributing to the onboard-computer team in a seven-team interdisciplinary satellite design project. The scope includes flight-computer architecture, operating-system decisions, and communication protocols for a space-surveillance platform.',
        tags: ['Embedded Systems', 'Operating Systems', 'Protocols', 'Systems Engineering'],
      },
    ],
    intro: {
      fade: 'Loading...',
    },
  },
  fr: {
    hero: {
      eyebrow: 'Portfolio solaire',
      title: 'Portfolio en orbite',
      subtitle: 'Ouvrez le panneau, choisissez un monde, puis cliquez sur le corps mis en évidence pour explorer son projet.',
    },
    drawer: {
      title: 'Éléments',
      subtitle: 'Chaque corps du système',
      open: 'Ouvrir les éléments',
      close: 'Fermer les éléments',
      clickToVisit: 'Cliquez sur la planète pour visiter le projet',
      comingSoon: 'Bientôt disponible',
    },
    nav: {
      backToSystem: '◄ Retour au système',
      dragToOrbit: 'Faites glisser pour orbiter · Utilisez le panneau pour choisir un élément',
      dragToRotate: 'Faites glisser pour faire pivoter',
      language: 'Langue',
    },
    panel: {
      category: 'Projet',
    },
    planets: {
      Mercure: 'Mercure',
      Vénus: 'Vénus',
      Terre: 'Terre',
      Mars: 'Mars',
      Jupiter: 'Jupiter',
      Saturne: 'Saturne',
      Uranus: 'Uranus',
      Soleil: 'Soleil',
    },
    profile: {
      category: 'Profil',
      title: 'Profil',
      sub: 'Résumé personnel',
      desc: 'Je suis étudiant en génie logiciel à Polytechnique Montréal et développeur full-stack et IA. Je transforme des problèmes opérationnels complexes en produits fiables, en combinant ingestion de données, apprentissage automatique, systèmes connectés au cloud, applications en temps réel et interfaces multiplateformes. Je privilégie les architectures claires, la performance mesurable et les logiciels qui aident à prendre de meilleures décisions.',
      tags: ['Full-Stack', '3D Web', 'UX', 'Architecture', 'Performance'],
      internships: [
        'Stagiaire en développement logiciel IA — IVADO Labs (août 2026–présent) : création de modules Python d’ingestion de données évolutifs et d’architectures indépendantes du fournisseur cloud pour l’entraînement et le déploiement de modèles IA.',
        'Stagiaire en génie logiciel — Hutchinson Aéronautique & Industrie (mai–août 2026) : amélioration de 74 % des outils de données destinés aux cadres, conception de pipelines SQL ERP/PLM et automatisation des opérations avec Python.',
        'Stagiaire en génie logiciel — ministère de la Cybersécurité et du Numérique du Québec (août–décembre 2025) : analyse de faisabilité, numérisation de flux de travail internes et intégration d’automatisations IA/ML pour améliorer l’efficacité opérationnelle.',
      ],
      links: [{label: 'Linkedin', url: 'https://www.linkedin.com/in/adam-marhraoui'}]
    },
    projects: [
      {
        category: 'IA/ML',
        title: 'Pipeline de classification NLP',
        sub: 'Python · TensorFlow · FastAPI · GCP — 2025',
        desc: 'Création d’un pipeline de classification de textes orienté production avec ingestion de données locale ou infonuagique. Le workflow couvre le prétraitement et la tokenisation, l’entraînement du modèle, son évaluation par rapport au meilleur modèle actuel, la promotion du modèle dans Google Cloud Storage et un endpoint de prédiction FastAPI. Le projet porte sur la classification de textes fondée sur des transformeurs et sur les choix opérationnels nécessaires pour transformer une expérience en service fiable.',
        tags: ['Python', 'TensorFlow', 'NLP', 'FastAPI', 'GCP'],
        links: [{ label: 'Voir le dépôt', url: 'https://github.com/adamMarh/Hate-Speech-Recognition' }],
      },
      {
        category: 'Projet',
        title: 'FindSecure — Recherche d’objets perdus',
        sub: 'React · TypeScript · Supabase · Edge Functions — 2026',
        desc: 'Création d’un processus sécurisé de recherche d’objets perdus où les utilisateurs authentifiés soumettent du texte et jusqu’à cinq images, suivent l’état de leurs demandes et reçoivent des correspondances potentielles depuis une Edge Function Supabase côté serveur. La plateforme combine un inventaire privé, le stockage de fichiers, des migrations PostgreSQL, une administration selon les rôles et une interface shadcn/ui adaptative.',
        tags: ['React', 'TypeScript', 'Supabase', 'PostgreSQL', 'Edge Functions'],
        links: [{ label: 'Voir le dépôt', url: 'https://github.com/adamMarh/FindSecure' }],
      },
      {
        category: 'Open Source',
        title: 'MoodCam — Détection d’humeur en temps réel',
        sub: 'Python · PyTorch · OpenCV · Tkinter — 2025',
        desc: 'Implémentation d’une application de vision par ordinateur qui détecte le plus grand visage dans un flux webcam et classe sept catégories d’expressions faciales. L’application prend en charge un modèle ViT avec un modèle CNN de repli léger, la sélection CPU/GPU, un prétraitement normalisé, l’inférence dans un thread dédié et une interface Tkinter destinée aux utilisateurs.',
        tags: ['Python', 'PyTorch', 'OpenCV', 'Tkinter'],
        links: [{ label: 'Voir le dépôt', url: 'https://github.com/adamMarh/MoodCam' }],
      },
      {
        category: 'Projet',
        title: 'Écosystème logiciel pour une salle d\'entraînement',
        sub: 'Flutter · Node.js · TypeScript · JWT — 2025',
        desc: 'Développement d’une plateforme de gym à gestion des rôles multiples avec des clients Flutter et une API Express/TypeScript. Les clients peuvent réserver des cours, enregistrer leurs entraînements, consulter les calendriers et utiliser un fil communautaire; le personnel gère les horaires et les rapports, tandis que les administrateurs gèrent les membres, les cours, la modération et l’examen des rapports.',
        tags: ['Flutter', 'Node.js', 'TypeScript', 'JWT'],
        links: [{ label: 'Voir le dépôt', url: 'https://github.com/adamMarh/gym-app' }],
      },
      {
        category: 'Système Distribué',
        title: 'Speed — Jeu de cartes en ligne',
        sub: 'React · TypeScript · WebSockets · uWebSockets.js — 2025',
        desc: 'Création d’un jeu de cartes Speed à deux joueurs avec état géré par le serveur, codes de salons anonymes, types de protocole TypeScript partagés, jeu par glisser-déposer, curseurs de l’adversaire en temps réel, validation des coups légaux, récupération après blocage, rebrassage et détection immédiate de la victoire. Le client Vite fournit la table de jeu interactive.',
        tags: ['React', 'TypeScript', 'WebSockets', 'uWebSockets.js', 'Vitest'],
        links: [{ label: 'Voir le dépôt', url: 'https://github.com/adamMarh/Spit_Card_Game' }],
      },
      {
        category: 'Plateforme SaaS',
        title: 'Projet d’évolution logicielle',
        sub: 'Electron · Flutter · Firebase · GitLab — 2026',
        desc: 'Refactorisation d’une application web existante en expériences desktop et mobile, en conciliant les fonctionnalités partagées avec une UX adaptée à chaque plateforme. Le projet a renforcé ma pratique de la refactorisation progressive, des interfaces maintenables, de l’intégration backend et de la livraison collaborative avec GitLab.',
        tags: ['Electron', 'Flutter', 'Firebase', 'GitLab'],
      },
      {
        category: 'IA générative',
        title: 'Conception d’une constellation satellite',
        sub: 'Onboard Computer Team · Polytechnique Montréal & MDA Space — 2026–2027',
        desc: 'Contribution à l’équipe ordinateur de bord d’un projet interdisciplinaire de conception satellite réunissant sept équipes. Le périmètre comprend l’architecture du calculateur de vol, les choix de système d’exploitation et les protocoles de communication d’une plateforme de surveillance spatiale.',
        tags: ['Embedded Systems', 'Operating Systems', 'Protocols', 'Systems Engineering'],
      },
    ],
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

export function getProjectTranslation(lang, projectIndex) {
  const projects = translations[lang]?.projects;
  if (projects && projects[projectIndex]) {
    return projects[projectIndex];
  }
  return null;
}

export function getPlanetName(lang, frenchName) {
  return translations[lang]?.planets?.[frenchName] || frenchName;
}
