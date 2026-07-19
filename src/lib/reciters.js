// Quran reciters. `url` streams the whole surah; `ayahFolder` (when present)
// enables true per-ayah playback via everyayah.com (file NNNMMM.mp3).
const pad = (n) => String(n).padStart(3, '0');
const EVERYAYAH = 'https://everyayah.com/data';

export const RECITERS = [
  {
    id: 'peshawa',
    name: 'پێشەوا قادر',
    nameEn: 'Peshawa Qadir',
    kurdish: true,
    url: (s) => `https://media.githubusercontent.com/media/w-coding/Peshawa-Qadir/main/mp3%20files/${pad(s)}.mp3`,
    // No per-ayah files available for this reciter.
  },
  {
    id: 'ghamdi',
    name: 'سعد الغامدی',
    nameEn: 'Saad Al-Ghamdi',
    url: (s) => `https://server7.mp3quran.net/s_gmd/${pad(s)}.mp3`,
    ayahFolder: 'Ghamadi_40kbps',
  },
  {
    id: 'alafasy',
    name: 'مشاری العفاسی',
    nameEn: 'Mishary Alafasy',
    url: (s) => `https://server8.mp3quran.net/afs/${pad(s)}.mp3`,
    ayahFolder: 'Alafasy_128kbps',
  },
  {
    id: 'sudais',
    name: 'عبدالرحمن السدیس',
    nameEn: 'Abdulrahman Al-Sudais',
    url: (s) => `https://server11.mp3quran.net/sds/${pad(s)}.mp3`,
    ayahFolder: 'Abdurrahmaan_As-Sudais_192kbps',
  },
  {
    id: 'maher',
    name: 'ماهر المعیقلی',
    nameEn: 'Maher Al-Muaiqly',
    url: (s) => `https://server12.mp3quran.net/maher/${pad(s)}.mp3`,
    ayahFolder: 'Maher_AlMuaiqly_64kbps',
  },
  {
    id: 'husary',
    name: 'محمود الحصری',
    nameEn: 'Mahmoud Al-Husary',
    url: (s) => `https://server7.mp3quran.net/husr/${pad(s)}.mp3`,
    ayahFolder: 'Husary_128kbps',
  },
  {
    id: 'abdulbasit',
    name: 'عبدالباسط',
    nameEn: 'Abdul Basit',
    url: (s) => `https://server7.mp3quran.net/basit/${pad(s)}.mp3`,
    ayahFolder: 'Abdul_Basit_Murattal_192kbps',
  },
  {
    id: 'minshawi',
    name: 'المنشاوی',
    nameEn: 'Al-Minshawi',
    url: (s) => `https://server10.mp3quran.net/minsh/${pad(s)}.mp3`,
    ayahFolder: 'Minshawy_Murattal_128kbps',
  },
  {
    id: 'shuraim',
    name: 'سعود الشریم',
    nameEn: 'Saud Al-Shuraim',
    url: (s) => `https://server7.mp3quran.net/shur/${pad(s)}.mp3`,
    ayahFolder: 'Saood_ash-Shuraym_128kbps',
  },
];

export function getReciter(id) {
  return RECITERS.find((r) => r.id === id) || RECITERS[0];
}

export function recitationUrl(reciterId, surahNumber) {
  return getReciter(reciterId).url(surahNumber);
}

// True per-ayah audio (or null if this reciter has no per-ayah files).
export function ayahUrl(reciterId, surah, ayah) {
  const r = getReciter(reciterId);
  if (!r.ayahFolder) return null;
  return `${EVERYAYAH}/${r.ayahFolder}/${pad(surah)}${pad(ayah)}.mp3`;
}

export function supportsAyahAudio(reciterId) {
  return !!getReciter(reciterId).ayahFolder;
}
