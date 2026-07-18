// Quran reciters with per-surah audio URL generators (streamed online).
const pad = (n) => String(n).padStart(3, '0');

export const RECITERS = [
  {
    id: 'peshawa',
    name: 'پێشەوا قادر',
    nameEn: 'Peshawa Qadir',
    kurdish: true,
    url: (s) => `https://media.githubusercontent.com/media/w-coding/Peshawa-Qadir/main/mp3%20files/${pad(s)}.mp3`,
  },
  { id: 'alafasy', name: 'مشاری العفاسی', nameEn: 'Mishary Alafasy', url: (s) => `https://server8.mp3quran.net/afs/${pad(s)}.mp3` },
  { id: 'sudais', name: 'عبدالرحمن السدیس', nameEn: 'Abdulrahman Al-Sudais', url: (s) => `https://server11.mp3quran.net/sds/${pad(s)}.mp3` },
  { id: 'maher', name: 'ماهر المعیقلی', nameEn: 'Maher Al-Muaiqly', url: (s) => `https://server12.mp3quran.net/maher/${pad(s)}.mp3` },
  { id: 'husary', name: 'محمود الحصری', nameEn: 'Mahmoud Al-Husary', url: (s) => `https://server7.mp3quran.net/husr/${pad(s)}.mp3` },
  { id: 'abdulbasit', name: 'عبدالباسط', nameEn: 'Abdul Basit', url: (s) => `https://server7.mp3quran.net/basit/${pad(s)}.mp3` },
  { id: 'minshawi', name: 'المنشاوی', nameEn: 'Al-Minshawi', url: (s) => `https://server10.mp3quran.net/minsh/${pad(s)}.mp3` },
  { id: 'shuraim', name: 'سعود الشریم', nameEn: 'Saud Al-Shuraim', url: (s) => `https://server7.mp3quran.net/shur/${pad(s)}.mp3` },
  { id: 'ghamdi', name: 'سعد الغامدی', nameEn: 'Saad Al-Ghamdi', url: (s) => `https://server7.mp3quran.net/s_gmd/${pad(s)}.mp3` },
];

export function getReciter(id) {
  return RECITERS.find((r) => r.id === id) || RECITERS[0];
}

export function recitationUrl(reciterId, surahNumber) {
  return getReciter(reciterId).url(surahNumber);
}
