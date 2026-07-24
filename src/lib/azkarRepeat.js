// Correct repetition counts for azkar.
//
// The bundled dhikr data ships every item with count = 1, so the counter
// finished after a single tap even for a zikr meant to be said 3, 7, 33 or 100
// times. These overrides were recovered from the repetition stated in each
// zikr's own text (e.g. "ثلاث مرات", "مائة مرة") cross-checked against the
// Hisn al-Muslim REPEAT field. Ids not listed here are said once.

const AZKAR_REPEAT = {
  33: 3,
  41: 3,
  69: 33,
  76: 3,
  80: 4,
  82: 3,
  83: 7,
  86: 3,
  87: 3,
  91: 100,
  92: 10,
  93: 100,
  94: 3,
  96: 100,
  97: 10,
  99: 3,
  103: 4,
  105: 3,
  106: 7,
  109: 3,
  110: 3,
  114: 100,
  115: 10,
  116: 100,
  117: 3,
  118: 10,
  119: 3,
  134: 3,
  139: 3,
  166: 7,
  210: 100,
  263: 100,
  267: 100,
  268: 100,
  269: 10,
  272: 100,
};

// How many times a dhikr should be repeated (defaults to 1).
export function azkarRepeat(dhikrId) {
  return AZKAR_REPEAT[dhikrId] || 1;
}
