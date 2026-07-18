// Hijri (Islamic) date helpers.
import { toHijri } from 'hijri-converter';
import { toArabicDigits } from './format';

const HIJRI_MONTHS = [
  'موحەڕەم',
  'سەفەر',
  'ڕەبیعی یەکەم',
  'ڕەبیعی دووەم',
  'جومادەی یەکەم',
  'جومادەی دووەم',
  'ڕەجەب',
  'شەعبان',
  'ڕەمەزان',
  'شەووال',
  'زوالقەعدە',
  'زولحیججە',
];

export function getHijri(date = new Date()) {
  const h = toHijri(date.getFullYear(), date.getMonth() + 1, date.getDate());
  return {
    year: h.hy,
    month: h.hm,
    day: h.hd,
    monthName: HIJRI_MONTHS[h.hm - 1] || '',
  };
}

export function formatHijri(date = new Date()) {
  const h = getHijri(date);
  return `${toArabicDigits(h.day)} ${h.monthName} ${toArabicDigits(h.year)} ک`;
}
