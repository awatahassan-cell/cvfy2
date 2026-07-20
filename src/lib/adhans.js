// Adhan (call to prayer) voices. Streamed on demand; works on-device.
export const ADHANS = [
  { id: 'makkah', name: 'بانگی مەککە', url: 'https://www.islamcan.com/audio/adhan/azan2.mp3' },
  { id: 'madinah', name: 'بانگی مەدینە', url: 'https://www.islamcan.com/audio/adhan/azan1.mp3' },
  { id: 'alafasy', name: 'مشاری العفاسی', url: 'https://www.islamcan.com/audio/adhan/azan5.mp3' },
  { id: 'egypt', name: 'بانگی میسری', url: 'https://www.islamcan.com/audio/adhan/azan3.mp3' },
  { id: 'turkey', name: 'بانگی تورکی', url: 'https://www.islamcan.com/audio/adhan/azan4.mp3' },
  { id: 'nasser', name: 'ناصر القطامی', url: 'https://www.islamcan.com/audio/adhan/azan8.mp3' },
];

export function getAdhan(id) {
  return ADHANS.find((a) => a.id === id) || ADHANS[0];
}

export function adhanUrl(id) {
  return getAdhan(id).url;
}
