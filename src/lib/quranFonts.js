// Single Quran text font — the non-round-sukoon mushaf face (Amiri Quran).
// The KFGQPC "UthmanicHafs" file draws the sukoon as a round filled circle,
// which we don't want; this face renders the correct non-round head sukoon.
// (The ayah NUMBER rosette still uses UthmanicHafs — see TajweedWebView.)
import { AMIRI_QURAN_BASE64 } from './amiriQuranBase64';

export const QURAN_FONTS = [
  { id: 'amiri', name: 'عوسمانی موسحەف', family: 'AmiriQuran', rnFamily: 'AmiriQuran', b64: AMIRI_QURAN_BASE64, fmt: 'truetype' },
];

export const DEFAULT_QURAN_FONT = 'amiri';

export function getQuranFont(id) {
  return QURAN_FONTS.find((f) => f.id === id) || QURAN_FONTS[0];
}
