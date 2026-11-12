// Preguntas locales de demostración. Los títulos tradicionales son de dominio público.
// Cada audioSrc queda preparado para asociar un archivo propio con licencia confirmada.
export const questions = [
  {
    id: 'melody-01',
    prompt: '¿Qué melodía tradicional escuchas?',
    hint: 'Una canción de cuna conocida en todo el mundo.',
    audioSrc: null,
    // Short, locally synthesized public-domain melody for testing the player.
    demoMelody: [[60, 1], [60, 1], [67, 1], [67, 1], [69, 1], [69, 1], [67, 2], [65, 1], [65, 1], [64, 1], [64, 1], [62, 1], [62, 1], [60, 2]],
    options: ['Estrellita, ¿dónde estás?', 'Frère Jacques', 'Greensleeves', 'Himno a la alegría'],
    answer: 0,
  },
  {
    id: 'melody-02',
    prompt: '¿Cuál es la canción de esta ronda?',
    hint: 'Una melodía que suele cantarse en canon.',
    audioSrc: null,
    demoMelody: [[60, 1], [62, 1], [64, 1], [60, 1], [60, 1], [62, 1], [64, 1], [60, 1], [64, 1], [65, 1], [67, 2], [64, 1], [65, 1], [67, 2]],
    options: ['Greensleeves', 'Frère Jacques', 'Estrellita, ¿dónde estás?', 'Himno a la alegría'],
    answer: 1,
  },
  {
    id: 'melody-03',
    prompt: '¿Qué tema tradicional es?',
    hint: 'Una antigua melodía inglesa con aire folk.',
    audioSrc: null,
    demoMelody: [[69, 1], [74, 1], [76, 1], [77, 1], [79, 1], [77, 1], [76, 1], [72, 1], [69, 1], [71, 1], [72, 1], [74, 1], [71, 1], [67, 1], [69, 2]],
    options: ['Frère Jacques', 'Himno a la alegría', 'Greensleeves', 'Estrellita, ¿dónde estás?'],
    answer: 2,
  },
  {
    id: 'melody-04',
    prompt: '¿Reconoces esta melodía clásica?',
    hint: 'Su tema principal celebra la alegría.',
    audioSrc: null,
    demoMelody: [[66, 1], [66, 1], [67, 1], [69, 1], [69, 1], [67, 1], [66, 1], [64, 1], [62, 1], [62, 1], [64, 1], [66, 1], [66, 1.5], [64, 0.5], [64, 2]],
    options: ['Greensleeves', 'Estrellita, ¿dónde estás?', 'Frère Jacques', 'Himno a la alegría'],
    answer: 3,
  },
  {
    id: 'melody-05',
    prompt: '¿Qué canción de cuna es?',
    hint: 'Comparte melodía con una canción tradicional en español.',
    audioSrc: null,
    demoMelody: [[60, 1], [60, 1], [67, 1], [67, 1], [69, 1], [69, 1], [67, 2], [65, 1], [65, 1], [64, 1], [64, 1], [62, 1], [62, 1], [60, 2]],
    options: ['Estrellita, ¿dónde estás?', 'Himno a la alegría', 'Frère Jacques', 'Greensleeves'],
    answer: 0,
  },
];
