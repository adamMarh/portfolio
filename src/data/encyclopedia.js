// Content for the ENCYCLOPEDIA app on the old computer: one entry per body in
// the portfolio's solar system, keyed like PROJECTS (French planet names).
// Dot colours come from each body's own colour in portfolio.js.
// Figures are rounded, commonly cited values; moon counts are "known moons"
// and keep growing, so they are written as minimums.

export const ENCYCLOPEDIA_ORDER = ['Soleil', 'Mercure', 'Vénus', 'Terre', 'Mars', 'Jupiter', 'Saturne', 'Uranus', 'Neptune'];

export const ENCYCLOPEDIA = {
  Soleil: {
    en: {
      name: 'Sun',
      kind: 'Yellow dwarf star',
      summary: 'The star at the centre of the solar system: a 4.6-billion-year-old ball of hydrogen and helium that holds 99.8% of all its mass.',
      stats: [['Diameter', '1,392,700 km'], ['From Earth', '149.6 million km'], ['Surface', 'about 5,500 °C'], ['Age', '4.6 billion years']],
      facts: [
        'Sunlight takes about 8 minutes 20 seconds to reach Earth.',
        'About 1.3 million Earths would fit inside it.',
        'Its core reaches roughly 15 million °C.',
      ],
    },
    fr: {
      name: 'Soleil',
      kind: 'Étoile naine jaune',
      summary: 'L’étoile au centre du système solaire : une boule d’hydrogène et d’hélium de 4,6 milliards d’années qui contient 99,8 % de toute sa masse.',
      stats: [['Diamètre', '1 392 700 km'], ['De la Terre', '149,6 millions de km'], ['Surface', 'environ 5 500 °C'], ['Âge', '4,6 milliards d’années']],
      facts: [
        'La lumière du Soleil met environ 8 minutes 20 secondes à atteindre la Terre.',
        'Environ 1,3 million de Terres tiendraient à l’intérieur.',
        'Son cœur atteint environ 15 millions de °C.',
      ],
    },
  },
  Mercure: {
    en: {
      name: 'Mercury',
      kind: 'Rocky planet',
      summary: 'The smallest planet and the closest to the Sun: a cratered, almost airless world with the wildest temperature swings of any planet.',
      stats: [['Diameter', '4,879 km'], ['From the Sun', '57.9 million km'], ['Year', '88 Earth days'], ['Moons', 'none']],
      facts: [
        'One sunrise to the next lasts 176 Earth days: two of its years.',
        'Days reach about 430 °C; nights drop to about −180 °C.',
        'It is the closest planet to the Sun, but Venus is hotter.',
      ],
    },
    fr: {
      name: 'Mercure',
      kind: 'Planète rocheuse',
      summary: 'La plus petite planète et la plus proche du Soleil : un monde cratérisé, presque sans atmosphère, aux écarts de température les plus extrêmes.',
      stats: [['Diamètre', '4 879 km'], ['Du Soleil', '57,9 millions de km'], ['Année', '88 jours terrestres'], ['Lunes', 'aucune']],
      facts: [
        'D’un lever de Soleil au suivant : 176 jours terrestres, soit deux de ses années.',
        'Le jour atteint environ 430 °C ; la nuit descend vers −180 °C.',
        'C’est la planète la plus proche du Soleil, mais Vénus est plus chaude.',
      ],
    },
  },
  'Vénus': {
    en: {
      name: 'Venus',
      kind: 'Rocky planet',
      summary: 'Earth’s near-twin in size, smothered in a thick carbon-dioxide atmosphere that traps heat and makes it the hottest planet.',
      stats: [['Diameter', '12,104 km'], ['From the Sun', '108.2 million km'], ['Year', '225 Earth days'], ['Moons', 'none']],
      facts: [
        'It spins backwards: the Sun rises in the west.',
        'One rotation takes 243 Earth days, longer than its year.',
        'The surface is about 465 °C, hot enough to melt lead.',
      ],
    },
    fr: {
      name: 'Vénus',
      kind: 'Planète rocheuse',
      summary: 'La quasi-jumelle de la Terre par la taille, étouffée par une épaisse atmosphère de dioxyde de carbone qui piège la chaleur : la planète la plus chaude.',
      stats: [['Diamètre', '12 104 km'], ['Du Soleil', '108,2 millions de km'], ['Année', '225 jours terrestres'], ['Lunes', 'aucune']],
      facts: [
        'Elle tourne à l’envers : le Soleil s’y lève à l’ouest.',
        'Une rotation dure 243 jours terrestres, plus que son année.',
        'La surface atteint environ 465 °C, de quoi faire fondre le plomb.',
      ],
    },
  },
  Terre: {
    en: {
      name: 'Earth',
      kind: 'Rocky planet',
      summary: 'The only world known to host life, with liquid water covering about 71% of its surface and one large Moon steadying its tilt.',
      stats: [['Diameter', '12,742 km'], ['From the Sun', '149.6 million km'], ['Year', '365.25 days'], ['Moons', '1']],
      facts: [
        'It is the densest planet in the solar system.',
        'The Moon drifts about 3.8 cm farther away every year.',
        'Its spin is slowing: days grow about 2 milliseconds longer per century.',
      ],
    },
    fr: {
      name: 'Terre',
      kind: 'Planète rocheuse',
      summary: 'Le seul monde connu à abriter la vie : l’eau liquide couvre environ 71 % de sa surface, et une grande Lune stabilise son inclinaison.',
      stats: [['Diamètre', '12 742 km'], ['Du Soleil', '149,6 millions de km'], ['Année', '365,25 jours'], ['Lunes', '1']],
      facts: [
        'C’est la planète la plus dense du système solaire.',
        'La Lune s’éloigne d’environ 3,8 cm chaque année.',
        'Sa rotation ralentit : les jours s’allongent d’environ 2 millisecondes par siècle.',
      ],
    },
  },
  Mars: {
    en: {
      name: 'Mars',
      kind: 'Rocky planet',
      summary: 'The cold, dusty red planet, coloured by iron oxide, with polar ice caps and the tallest volcano in the solar system.',
      stats: [['Diameter', '6,779 km'], ['From the Sun', '227.9 million km'], ['Year', '687 Earth days'], ['Moons', '2']],
      facts: [
        'Olympus Mons rises about 22 km, roughly 2.5 times Everest.',
        'The Valles Marineris canyon runs about 4,000 km.',
        'Martian sunsets look blue.',
      ],
    },
    fr: {
      name: 'Mars',
      kind: 'Planète rocheuse',
      summary: 'La planète rouge, froide et poussiéreuse, colorée par l’oxyde de fer, avec des calottes polaires et le plus haut volcan du système solaire.',
      stats: [['Diamètre', '6 779 km'], ['Du Soleil', '227,9 millions de km'], ['Année', '687 jours terrestres'], ['Lunes', '2']],
      facts: [
        'Olympus Mons culmine à environ 22 km, près de 2,5 fois l’Everest.',
        'Le canyon Valles Marineris s’étend sur environ 4 000 km.',
        'Les couchers de Soleil martiens sont bleus.',
      ],
    },
  },
  Jupiter: {
    en: {
      name: 'Jupiter',
      kind: 'Gas giant',
      summary: 'The largest planet, a gas giant more than twice as massive as all the other planets combined, striped by storms and jet streams.',
      stats: [['Diameter', '139,820 km'], ['From the Sun', '778.5 million km'], ['Year', '11.9 Earth years'], ['Moons', '95+ known']],
      facts: [
        'A day lasts under 10 hours: the fastest spin of any planet.',
        'The Great Red Spot is a storm wider than Earth.',
        'Its moon Ganymede is bigger than the planet Mercury.',
      ],
    },
    fr: {
      name: 'Jupiter',
      kind: 'Géante gazeuse',
      summary: 'La plus grande planète, une géante gazeuse plus de deux fois plus massive que toutes les autres réunies, striée de tempêtes et de courants-jets.',
      stats: [['Diamètre', '139 820 km'], ['Du Soleil', '778,5 millions de km'], ['Année', '11,9 années terrestres'], ['Lunes', '95+ connues']],
      facts: [
        'Une journée dure moins de 10 heures : la rotation la plus rapide.',
        'La Grande Tache rouge est une tempête plus large que la Terre.',
        'Sa lune Ganymède est plus grande que la planète Mercure.',
      ],
    },
  },
  Saturne: {
    en: {
      name: 'Saturn',
      kind: 'Gas giant',
      summary: 'The ringed giant. Its rings are ice and rock, from dust grains to chunks the size of houses, spread across hundreds of thousands of kilometres.',
      stats: [['Diameter', '116,460 km'], ['From the Sun', '1.43 billion km'], ['Year', '29.4 Earth years'], ['Moons', '270+ known']],
      facts: [
        'On average it is less dense than water.',
        'The main rings are mostly only tens of metres thick.',
        'Its moon Titan has lakes of liquid methane.',
      ],
    },
    fr: {
      name: 'Saturne',
      kind: 'Géante gazeuse',
      summary: 'La géante aux anneaux. Ils sont faits de glace et de roche, de grains de poussière à des blocs grands comme des maisons, sur des centaines de milliers de kilomètres.',
      stats: [['Diamètre', '116 460 km'], ['Du Soleil', '1,43 milliard de km'], ['Année', '29,4 années terrestres'], ['Lunes', '270+ connues']],
      facts: [
        'Sa densité moyenne est inférieure à celle de l’eau.',
        'Ses anneaux principaux ne font souvent que quelques dizaines de mètres d’épaisseur.',
        'Sa lune Titan possède des lacs de méthane liquide.',
      ],
    },
  },
  Uranus: {
    en: {
      name: 'Uranus',
      kind: 'Ice giant',
      summary: 'A pale cyan ice giant knocked onto its side: tilted about 98°, it rolls around the Sun like a ball.',
      stats: [['Diameter', '50,724 km'], ['From the Sun', '2.87 billion km'], ['Year', '84 Earth years'], ['Moons', '28+ known']],
      facts: [
        'Each pole gets about 42 years of daylight, then 42 of night.',
        'The first planet found with a telescope, by William Herschel in 1781.',
        'Its atmosphere is the coldest of any planet, near −224 °C.',
      ],
    },
    fr: {
      name: 'Uranus',
      kind: 'Géante de glace',
      summary: 'Une géante de glace cyan pâle couchée sur le côté : inclinée d’environ 98°, elle roule autour du Soleil comme une balle.',
      stats: [['Diamètre', '50 724 km'], ['Du Soleil', '2,87 milliards de km'], ['Année', '84 années terrestres'], ['Lunes', '28+ connues']],
      facts: [
        'Chaque pôle connaît environ 42 ans de jour, puis 42 ans de nuit.',
        'La première planète découverte au télescope, par William Herschel en 1781.',
        'Son atmosphère est la plus froide des planètes, près de −224 °C.',
      ],
    },
  },
  Neptune: {
    en: {
      name: 'Neptune',
      kind: 'Ice giant',
      summary: 'The farthest planet: a deep-blue ice giant swept by the fastest winds in the solar system.',
      stats: [['Diameter', '49,244 km'], ['From the Sun', '4.5 billion km'], ['Year', '165 Earth years'], ['Moons', '16+ known']],
      facts: [
        'Its winds reach about 2,100 km/h.',
        'It was predicted by mathematics before being seen, in 1846.',
        'It finished its first orbit since discovery in 2011.',
      ],
    },
    fr: {
      name: 'Neptune',
      kind: 'Géante de glace',
      summary: 'La planète la plus lointaine : une géante de glace d’un bleu profond, balayée par les vents les plus rapides du système solaire.',
      stats: [['Diamètre', '49 244 km'], ['Du Soleil', '4,5 milliards de km'], ['Année', '165 années terrestres'], ['Lunes', '16+ connues']],
      facts: [
        'Ses vents atteignent environ 2 100 km/h.',
        'Elle a été prédite par le calcul avant d’être observée, en 1846.',
        'Elle a bouclé sa première orbite depuis sa découverte en 2011.',
      ],
    },
  },
};
