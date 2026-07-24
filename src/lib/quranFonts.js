// Selectable Quran text fonts. The ayah NUMBER always uses UthmanicHafs (its
// ornate rosette digit); this list is only the ayah TEXT font.
import { UTHMANIC_FONT_BASE64 } from './uthmanicFontBase64';
import { AMIRI_QURAN_BASE64 } from './amiriQuranBase64';
import { NOTO_NASKH_BASE64 } from './notoNaskhBase64';

export const QURAN_FONTS = [
  // family: CSS/@font-face name used in the WebView.
  // rnFamily: the name registered with expo-font for the web fallback.
  // b64/fmt: embedded font for the WebView @font-face.
  { id: 'amiri', name: 'ئەمیری — سکونی خڕنەبوو', family: 'AmiriQuran', rnFamily: 'AmiriQuran', b64: AMIRI_QURAN_BASE64, fmt: 'truetype' },
  { id: 'naskh', name: 'نەسخ — سکونی خڕنەبوو', family: 'NotoNaskh', rnFamily: 'NotoNaskhArabic', b64: NOTO_NASKH_BASE64, fmt: 'truetype' },
  { id: 'hafs', name: 'عوسمانی مۆسحەف — سکونی خڕ', family: 'UthmanicHafs', rnFamily: 'UthmanicHafs', b64: UTHMANIC_FONT_BASE64, fmt: 'truetype' },
];

export const DEFAULT_QURAN_FONT = 'amiri';

export function getQuranFont(id) {
  return QURAN_FONTS.find((f) => f.id === id) || QURAN_FONTS[0];
}
