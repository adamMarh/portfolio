export const translations = {
  en: {
    hero: {
      eyebrow: 'Solar portfolio',
      title: 'Portfolio in orbit',
      subtitle: 'Open the side pannel, pick a world, then click the highlighted body to dive in.',
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
      dragToOrbit: 'Drag to orbit · Use the side pannel to choose an element',
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
      Neptune: 'Neptune',
      Soleil: 'Sun',
      Pluto: 'Pluto',
    },
    profile: {
      category: 'Profile',
      title: 'Sun',
      sub: 'Personal summary',
      desc: 'Software engineering student at Polytechnique Montréal with a passion for building creative, interactive applications and exploring the potential of AI. I enjoy turning ideas into polished experiences, while also drawing from experience in digital transformation, KPI automation, AI-assisted workflows, and internal tooling.',
      tags: ['Creative Apps', 'Interactive Experiences', 'AI / ML', 'Software Engineering', 'Automation', 'LLMs'],
    },
    projects: [
      {
        category: 'Software Refactor',
        title: 'Software Evolution Project',
        sub: 'Electron · Flutter · Firebase · GitLab — 2026',
        desc: 'Executed a comprehensive refactoring of a legacy web application into a modern cross-platform ecosystem. Architected a desktop client using Electron with native file system integration and offline capabilities, while developing a Flutter mobile application targeting both iOS and Android platforms. Implemented a centralized Firebase backend with real-time synchronization, granular security rules, and Cloud Functions for backend logic. Achieved 40% reduction in code duplication through shared TypeScript/Dart libraries, improved application startup time by 60%, and enhanced user data synchronization reliability through conflict resolution algorithms.',
        tags: ['Electron', 'Flutter', 'Firebase', 'GitLab'],
      },
      {
        category: 'AI Matching Platform',
        title: 'FindSecure - Lost & Found AI Matcher',
        sub: 'React · Python · Supabase — Winter 2026',
        desc: 'Developed an end-to-end AI-powered matching platform for lost and found items, leveraging computer vision and NLP to analyze item descriptions and images. Implemented FAISS vector similarity search with embeddings generated from fine-tuned transformer models, achieving 92% matching accuracy for relevant item pairs. Built a React frontend with intuitive image upload, real-time search capabilities, and collaborative matching workflows. Designed role-based access control with JWT authentication, implemented transaction-level security using Supabase RLS policies, and integrated fraud detection mechanisms using anomaly detection algorithms to identify suspicious listing patterns.',
        tags: ['React', 'Python', 'Supabase', 'Similarity Models'],
      },
      {
        category: 'NLP Pipeline',
        title: 'NLP Classification Pipeline',
        sub: 'GCP · Deep Learning — 2025',
        desc: 'Engineered a production-grade NLP classification pipeline on Google Cloud Platform processing thousands of documents daily. Designed data ingestion layer using Cloud Pub/Sub with automatic batching and deduplication logic. Implemented comprehensive preprocessing including tokenization, lemmatization, and custom domain-specific vocabulary expansion, reducing input dimensionality by 35%. Fine-tuned BERT and RoBERTa transformer models using Cloud TPUs, achieving F1 scores of 0.94+ on multi-class classification tasks. Deployed models to Vertex AI with containerized inference servers, implemented A/B testing framework for model comparisons, and established automated retraining pipelines with performance monitoring dashboards.',
        tags: ['GCP', 'Deep Learning', 'Transformers', 'NLP'],
      },
      {
        category: 'Computer Vision',
        title: 'Vision AI Mood Detector',
        sub: 'Machine Learning · Computer Vision — 2025',
        desc: 'Built a real-time facial expression recognition system capable of detecting seven distinct emotional states with 89% accuracy. Leveraged pre-trained CNN models (ResNet50, MobileNetV3) fine-tuned on custom annotated dataset of 5,000+ facial images across diverse demographics. Implemented video streaming inference with sub-100ms latency using model quantization and edge optimization techniques. Integrated confidence scoring, temporal smoothing to reduce flicker, and multi-face tracking for simultaneous detection of multiple subjects. Deployed as WebGL-enabled web application and native mobile app, enabling real-time mood visualization with statistical aggregation and sentiment trends over time.',
        tags: ['Computer Vision', 'Machine Learning', 'Real-Time'],
      },
      {
        category: 'Mobile App',
        title: 'Mobile Application Development Project',
        sub: 'Flutter · Firebase — Winter 2025',
        desc: 'Delivered a feature-rich cross-platform mobile application (iOS/Android) using Flutter with 98% code reuse between platforms. Architected a comprehensive Firebase backend including Firestore for real-time data synchronization, Cloud Storage for user-generated content, and Cloud Functions for serverless business logic. Integrated multiple third-party APIs (payment processing, mapping services, notification systems) with robust error handling and automatic retry mechanisms. Implemented offline-first architecture with local caching strategy ensuring seamless UX even with poor connectivity. Built sophisticated state management using Provider pattern, achieved 95% code test coverage, and optimized app bundle size to 45MB through tree-shaking and code splitting.',
        tags: ['Flutter', 'Firebase', 'API Integration'],
      },
      {
        category: 'Distributed Web App',
        title: 'Web Application Software Project',
        sub: 'Angular · WebSockets · AWS — Winter 2025',
        desc: 'Architected and delivered a distributed real-time web application using Angular 15+ frontend framework with a microservices backend on AWS. Implemented WebSocket-based bi-directional communication for live data updates, chat functionality, and collaborative editing features, supporting 1,000+ concurrent connections. Designed backend microservices deployed on ECS with load balancing and auto-scaling policies. Utilized RDS for persistent storage, ElastiCache for session management, and S3 for static assets with CloudFront CDN. Followed Agile/Scrum methodology with 2-week sprints, implemented comprehensive CI/CD pipeline using GitLab CI, automated testing with Jest and Cypress, and achieved 99.5% uptime SLA through resilience patterns and graceful degradation.',
        tags: ['Angular', 'WebSockets', 'AWS', 'Agile'],
      },
      {
        category: 'Embedded Systems',
        title: 'Embedded Systems Project',
        sub: 'C++ · ATMega — Winter 2024',
        desc: 'Developed embedded firmware for ATMega microcontroller projects in C++ with direct hardware register manipulation and interrupt-driven architectures. Optimized memory footprint to 90% utilization efficiency through careful data structure design and algorithm optimization. Implemented multi-threaded cooperative scheduling for real-time task management, integrated analog-to-digital converters for sensor reading, and developed custom communication protocols (I2C, SPI, UART) for peripheral interfacing. Debugged using oscilloscope analysis and JTAG debugging tools, profiled power consumption achieving 70% reduction through sleep modes and dynamic frequency scaling. Wrote comprehensive technical documentation and conducted rigorous testing including edge case validation and stress testing on resource-constrained hardware.',
        tags: ['C++', 'ATMega', 'Microcontrollers'],
      },
      {
        category: 'Available Soon',
        title: 'Project 08',
        sub: 'Reserved for the next case study',
        desc: 'This orbit is reserved for a future project so the portfolio can expand without changing the system layout.',
        tags: ['Coming soon'],
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
      subtitle: 'Ouvrez le panneau, choisissez un monde, puis cliquez sur le corps mis en évidence pour entrer.',
    },
    drawer: {
      title: 'Éléments',
      subtitle: 'Chaque corps du système',
      open: 'Ouvrir le panneau',
      close: 'Fermer le panneau',
      clickToVisit: 'Cliquez sur la planète pour visiter',
      comingSoon: 'Destination en préparation',
    },
    nav: {
      backToSystem: '◄ Retour au système',
      dragToOrbit: 'Glisser pour orbiter · Utiliser le panneau pour choisir un élément',
      dragToRotate: 'Glisser pour faire tourner',
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
      Neptune: 'Neptune',
      Pluto: 'Pluton',
      Soleil: 'Soleil',
    },
    profile: {
      category: 'Profil',
      title: 'Soleil',
      sub: 'Résumé personnel',
      desc: 'Étudiant en génie logiciel à Polytechnique Montréal, passionné par le développement d’applications créatives et interactives ainsi que par l’IA. J’aime transformer des idées en expériences soignées, tout en m’appuyant sur mon expérience en transformation numérique, automatisation de KPI, flux de travail assistés par l’IA et outils internes.',
      tags: ['Applications créatives', 'Expériences interactives', 'IA / ML', 'Génie logiciel', 'Automatisation', 'LLM'],
    },
    projects: [
      {
        category: 'Refonte logicielle',
        title: 'Projet d’évolution logicielle',
        sub: 'Electron · Flutter · Firebase · GitLab — 2026',
        desc: "Exécuté une refonte complète d'une application web héritée en un écosystème moderne multiplateforme. Architecté un client de bureau utilisant Electron avec intégration du système de fichiers natif et capacités hors ligne, tout en développant une application mobile Flutter ciblant les plates-formes iOS et Android. Implémenté un backend Firebase centralisé avec synchronisation temps réel, règles de sécurité granulaires et Cloud Functions pour la logique métier. Réalisé une réduction de 40% de la duplication de code grâce à des bibliothèques TypeScript/Dart partagées, amélioré le temps de démarrage de l'application de 60% et renforcé la fiabilité de la synchronisation des données utilisateur grâce à des algorithmes de résolution de conflits.",
        tags: ['Electron', 'Flutter', 'Firebase', 'GitLab'],
      },
      {
        category: 'Plateforme IA',
        title: 'FindSecure – plateforme IA d’objets perdus et retrouvés',
        sub: 'React · Python · Supabase — Hiver 2026',
        desc: "Développé une plateforme complète de jumelage propulsée par l'IA pour les objets perdus et trouvés, exploitant la vision par ordinateur et le traitement du langage naturel pour analyser les descriptions et images d'objets. Implémenté la recherche de similarité vectorielle FAISS avec des intégrations générées à partir de modèles transformers ajustés, atteignant 92% de précision d'appariement pour les paires d'articles pertinentes. Construit une interface React avec téléchargement d'images intuitif, capacités de recherche en temps réel et flux de travail d'appariement collaboratifs. Conçu le contrôle d'accès basé sur les rôles avec authentification JWT, implémenté la sécurité au niveau des transactions à l'aide des stratégies RLS de Supabase et intégré les mécanismes de détection de fraude utilisant des algorithmes de détection d'anomalies.",
        tags: ['React', 'Python', 'Supabase', 'Modèles de similarité'],
      },
      {
        category: 'Pipeline NLP',
        title: 'Pipeline de classification NLP',
        sub: 'GCP · Deep Learning — 2025',
        desc: "Conçu un pipeline NLP de qualité production sur Google Cloud Platform traitant des milliers de documents quotidiennement. Conçu une couche d'ingestion de données utilisant Cloud Pub/Sub avec mise en lot automatique et logique de déduplication. Implémenté un prétraitement complet incluant la tokenisation, la lemmatisation et l'expansion du vocabulaire spécifique au domaine, réduisant la dimensionnalité d'entrée de 35%. Ajusté les modèles transformers BERT et RoBERTa à l'aide des TPU Cloud, atteignant des scores F1 supérieurs à 0,94 sur les tâches de classification multi-classes. Déployé des modèles sur Vertex AI avec des serveurs d'inférence conteneurisés, implémenté un cadre de test A/B pour les comparaisons de modèles et établi des pipelines de réentraînement automatisés avec tableaux de bord de surveillance des performances.",
        tags: ['GCP', 'Deep Learning', 'Transformers', 'NLP'],
      },
      {
        category: 'Vision par ordinateur',
        title: 'Détecteur d’humeur par vision artificielle',
        sub: 'Apprentissage automatique · Vision par ordinateur — 2025',
        desc: "Construit un système de reconnaissance d'expression faciale en temps réel capable de détecter sept états émotionnels distincts avec 89% de précision. Exploité des modèles CNN pré-entraînés (ResNet50, MobileNetV3) ajustés sur un ensemble de données annoté personnalisé de plus de 5 000 images faciales provenant de démographies diverses. Implémenté l'inférence en flux vidéo avec une latence inférieure à 100ms en utilisant les techniques de quantification de modèles et d'optimisation en périphérie. Intégré le score de confiance, le lissage temporel pour réduire le scintillement et le suivi multi-visages pour la détection simultanée de plusieurs sujets. Déployé en tant qu'application web compatible WebGL et application mobile native, permettant la visualisation d'humeur en temps réel avec agrégation statistique et tendances de sentiment au fil du temps.",
        tags: ['Vision par ordinateur', 'Apprentissage automatique', 'Temps réel'],
      },
      {
        category: 'Application mobile',
        title: 'Projet d’application mobile',
        sub: 'Flutter · Firebase — Hiver 2025',
        desc: "Livré une application mobile riche en fonctionnalités (iOS/Android) utilisant Flutter avec 98% de réutilisabilité du code entre les plates-formes. Architecté un backend Firebase complet incluant Firestore pour la synchronisation des données en temps réel, Cloud Storage pour le contenu généré par les utilisateurs et Cloud Functions pour la logique métier sans serveur. Intégré plusieurs API tierces (traitement des paiements, services de cartographie, systèmes de notification) avec gestion des erreurs robuste et mécanismes de relance automatiques. Implémenté une architecture offline-first avec stratégie de mise en cache locale garantissant une UX transparente même avec une connectivité médiocre. Construit une gestion d'état sophistiquée à l'aide du pattern Provider, réalisé une couverture de tests de 95% et optimisé la taille du bundle de l'application à 45MB grâce au tree-shaking et code splitting.",
        tags: ['Flutter', 'Firebase', 'Intégration API'],
      },
      {
        category: 'Application web distribuée',
        title: 'Projet d’application web',
        sub: 'Angular · WebSockets · AWS — Hiver 2025',
        desc: "Architecté et livré une application web distribuée en temps réel utilisant le framework frontend Angular 15+ avec un backend de microservices sur AWS. Implémenté la communication bidirectionnelle basée sur WebSocket pour les mises à jour de données en direct, la fonctionnalité de chat et les fonctionnalités d'édition collaborative, supportant plus de 1 000 connexions simultanées. Conçu les microservices backend déployés sur ECS avec équilibrage de charge et stratégies de mise à l'échelle automatique. Utilisé RDS pour le stockage persistant, ElastiCache pour la gestion des sessions et S3 pour les actifs statiques avec CloudFront CDN. Suivi la méthodologie Agile/Scrum avec sprints de 2 semaines, implémenté un pipeline CI/CD complet à l'aide de GitLab CI, des tests automatisés avec Jest et Cypress et réalisé un SLA de 99,5% de disponibilité grâce aux modèles de résilience et à la dégradation gracieuse.",
        tags: ['Angular', 'WebSockets', 'AWS', 'Agile'],
      },
      {
        category: 'Systèmes embarqués',
        title: 'Projet de systèmes embarqués',
        sub: 'C++ · ATMega — Hiver 2024',
        desc: "Développé le firmware pour les projets de microcontrôleur ATMega en C++ avec manipulation directe des registres matériels et architectures pilotées par les interruptions. Optimisé l'empreinte mémoire pour une efficacité d'utilisation de 90% grâce à une conception soigneuse des structures de données et l'optimisation des algorithmes. Implémenté l'ordonnancement coopératif multi-thread pour la gestion des tâches en temps réel, intégré les convertisseurs analogique-numérique pour la lecture des capteurs et développé des protocoles de communication personnalisés (I2C, SPI, UART) pour l'interfaçage des périphériques. Débogage à l'aide de l'analyse de l'oscilloscope et des outils de débogage JTAG, profilage de la consommation d'énergie réalisant une réduction de 70% grâce aux modes de veille et à la mise à l'échelle dynamique des fréquences. Rédaction d'une documentation technique complète et réalisation de tests rigoureux incluant la validation des cas limites et les tests de stress sur du matériel aux ressources limitées.",
        tags: ['C++', 'ATMega', 'Microcontrôleurs'],
      },
      {
        category: 'À venir',
        title: 'Projet 08',
        sub: 'Réservé pour le prochain projet',
        desc: 'Cette orbite reste disponible pour un futur projet afin de faire évoluer le portfolio sans modifier la structure du système.',
        tags: ['À venir'],
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
