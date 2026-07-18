// Tafsir data layer — Kurdish, Arabic and English editions.
// Each edition file is an array of { s, a, t } rows.
import asan from '../data/tafsir_asan.json';
import hazhar from '../data/tafsir_hazhar.json';
import rebar from '../data/tafsir_rebar.json';
import mokhtasar from '../data/tafsir_mokhtasar.json';
import arMuyassar from '../data/tafsir_ar_muyassar.json';
import enMukhtasar from '../data/tafsir_en_mukhtasar.json';

export const TAFSIR_OPTIONS = [
  { id: 'asan', name: 'ئاسان', lang: 'ku', dir: 'rtl' },
  { id: 'hazhar', name: 'هەژار', lang: 'ku', dir: 'rtl' },
  { id: 'rebar', name: 'ڕێبار', lang: 'ku', dir: 'rtl' },
  { id: 'mokhtasar', name: 'موختەسەر', lang: 'ku', dir: 'rtl' },
  { id: 'ar_muyassar', name: 'الميسّر', lang: 'ar', dir: 'rtl' },
  { id: 'en_mukhtasar', name: 'Al-Mukhtasar', lang: 'en', dir: 'ltr' },
];

export const TAFSIR_LANGS = [
  { id: 'ku', label: 'کوردی' },
  { id: 'ar', label: 'عربي' },
  { id: 'en', label: 'English' },
];

const RAW = {
  asan,
  hazhar,
  rebar,
  mokhtasar,
  ar_muyassar: arMuyassar,
  en_mukhtasar: enMukhtasar,
};

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

export function getTafsirOption(id) {
  return TAFSIR_OPTIONS.find((t) => t.id === id) || TAFSIR_OPTIONS[0];
}

export function getTafsirForAyah(id, surah, ayah) {
  return ensure(id)[`${surah}:${ayah}`] || '';
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
