// Offline Quran data layer (React Native / Metro friendly — static requires).
import quranData from '../data/quran.json';

const SURAHS = quranData.surahs;
const AYAHS = quranData.ayahs;

// Index ayahs by surah once for fast lookups.
const bySurah = {};
for (const a of AYAHS) {
  (bySurah[a.surah] = bySurah[a.surah] || []).push(a);
}

export const metadata = quranData.metadata;

export function getSurahs() {
  return SURAHS;
}

export function getSurah(n) {
  return SURAHS.find((s) => s.number === n);
}

export function getSurahAyahs(n) {
  return bySurah[n] || [];
}

export function getPageAyahs(page) {
  return AYAHS.filter((a) => a.page === page);
}

export function getJuzAyahs(juz) {
  return AYAHS.filter((a) => a.juz === juz);
}

// Normalize Arabic for search: drop harakat/quranic marks/tatweel and unify
// alef, alef-maksura and ta-marbuta so plain typing matches Uthmani text.
export function normalizeArabic(s) {
  return (s || '')
    .replace(/[ً-ْٰـٓ-ٕۖ-ࣰۭ-ࣿ]/g, '')
    .replace(/[آأإٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .trim();
}

// Precomputed normalized text for fast, diacritic-insensitive search.
const NORM_TEXT = AYAHS.map((a) => normalizeArabic(a.text));

export function searchQuran(query, limit = 50) {
  const q = normalizeArabic((query || '').trim());
  if (!q) return [];
  const out = [];
  for (let i = 0; i < AYAHS.length; i++) {
    if (NORM_TEXT[i].includes(q)) {
      out.push(AYAHS[i]);
      if (out.length >= limit) break;
    }
  }
  return out;
}

// Group surahs by juz for the "Juz" tab (approximate — uses ayah page/juz data).
export function getJuzList() {
  const list = [];
  for (let j = 1; j <= 30; j++) {
    const first = AYAHS.find((a) => a.juz === j);
    list.push({ number: j, firstSurah: first ? getSurah(first.surah) : null, page: first ? first.page : null });
  }
  return list;
}
