// Tafsir data layer — 13 Kurdish editions + Arabic + English.
// Each edition file is an array of { s, a, t } rows.
import asan from '../data/tafsir_asan.json';
import hazhar from '../data/tafsir_hazhar.json';
import rebar from '../data/tafsir_rebar.json';
import mokhtasar from '../data/tafsir_mokhtasar.json';
import puxta from '../data/tafsir_puxta.json';
import raman from '../data/tafsir_raman.json';
import zhin from '../data/tafsir_zhin.json';
import sanahi from '../data/tafsir_sanahi.json';
import runahi from '../data/tafsir_runahi.json';
import maisar from '../data/tafsir_maisar.json';
import roshn from '../data/tafsir_roshn.json';
import tawhid from '../data/tafsir_tawhid.json';
import krd from '../data/tafsir_krd.json';
import arMuyassar from '../data/tafsir_ar_muyassar.json';
import enMukhtasar from '../data/tafsir_en_mukhtasar.json';

export const TAFSIR_OPTIONS = [
  // Kurdish (Sorani)
  { id: 'asan', name: 'ئاسان', lang: 'ku', dir: 'rtl' },
  { id: 'hazhar', name: 'هەژار', lang: 'ku', dir: 'rtl' },
  { id: 'rebar', name: 'ڕێبار', lang: 'ku', dir: 'rtl' },
  { id: 'mokhtasar', name: 'موختەسەر', lang: 'ku', dir: 'rtl' },
  { id: 'puxta', name: 'پوختە', lang: 'ku', dir: 'rtl' },
  { id: 'raman', name: 'ڕامان', lang: 'ku', dir: 'rtl' },
  { id: 'maisar', name: 'مویەسەر', lang: 'ku', dir: 'rtl' },
  { id: 'roshn', name: 'ڕۆشن', lang: 'ku', dir: 'rtl' },
  { id: 'tawhid', name: 'تەوحیدی', lang: 'ku', dir: 'rtl' },
  { id: 'krd', name: 'کوردی (ڕابەری خوێندن)', lang: 'ku', dir: 'rtl' },
  // Kurdish (Badini / Kurmanji)
  { id: 'zhin', name: 'ژیان (بادینی)', lang: 'ku', dir: 'rtl' },
  { id: 'sanahi', name: 'سەناهی (بادینی)', lang: 'ku', dir: 'rtl' },
  { id: 'runahi', name: 'ڕوناهی (بادینی)', lang: 'ku', dir: 'rtl' },
  // Arabic
  { id: 'ar_muyassar', name: 'الميسّر', lang: 'ar', dir: 'rtl' },
  // English
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
  puxta,
  raman,
  zhin,
  sanahi,
  runahi,
  maisar,
  roshn,
  tawhid,
  krd,
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
