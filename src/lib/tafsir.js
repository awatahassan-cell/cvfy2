// Kurdish tafsir data layer. Bundled tafsirs are loaded lazily and cached.
import asan from '../data/tafsir_asan.json';
import hazhar from '../data/tafsir_hazhar.json';
import rebar from '../data/tafsir_rebar.json';

export const TAFSIR_OPTIONS = [
  { id: 'asan', name: 'تەفسیری ئاسان' },
  { id: 'hazhar', name: 'تەفسیری هەژار' },
  { id: 'rebar', name: 'تەفسیری ڕێبار' },
];

const RAW = { asan, hazhar, rebar };

// Cache of { tafsirId: { "surah:ayah": text } }
const cache = {};

function ensure(id) {
  if (cache[id]) return cache[id];
  const map = {};
  const rows = RAW[id] || [];
  for (const r of rows) {
    map[`${r.s}:${r.a}`] = (r.t || '').trim();
  }
  cache[id] = map;
  return map;
}

export function getTafsirForAyah(id, surah, ayah) {
  const map = ensure(id);
  return map[`${surah}:${ayah}`] || '';
}

export function getTafsirForSurah(id, surah) {
  const map = ensure(id);
  const out = {};
  for (const key in map) {
    const [s, a] = key.split(':');
    if (+s === surah) out[+a] = map[key];
  }
  return out;
}
