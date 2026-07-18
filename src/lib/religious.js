// Islamic content data layer: azkar (dhikr), hadiths, 99 names, seerah, companions.
import dhikrData from '../data/dhikr.json';
import hadithsData from '../data/hadiths.json';
import namesData from '../data/names_of_allah.json';
import seerahData from '../data/seerah.json';
import companionsData from '../data/companions.json';

export const DHIKR_CATEGORIES = dhikrData.categories || [];
export const DHIKR_ITEMS = dhikrData.items || [];

export function getDhikrCategory(catId) {
  return DHIKR_CATEGORIES.find((c) => c.id === catId);
}

export function getDhikrByCategory(catId) {
  return DHIKR_ITEMS.filter((i) => i.categoryId === catId);
}

export function dhikrCount(catId) {
  return getDhikrByCategory(catId).length;
}

export const HADITHS = hadithsData;
export const NAMES = namesData;
export const SEERAH = seerahData;
export const COMPANIONS = companionsData;

export function getHadith(id) {
  return HADITHS.find((h) => h.id === id);
}
