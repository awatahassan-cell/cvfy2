// Prayer times + Qibla direction, computed dynamically with the `adhan` library.
import * as adhan from 'adhan';

// Default location: Erbil (هەولێر), used when GPS is unavailable.
export const DEFAULT_LOCATION = { lat: 36.191, lng: 44.009, name: 'هەولێر' };

// Preset cities the user can pick manually (id used for storage).
export const CITIES = [
  { id: 'hewler', name: 'هەولێر', lat: 36.191, lng: 44.009 },
  { id: 'slemani', name: 'سلێمانی', lat: 35.561, lng: 45.435 },
  { id: 'duhok', name: 'دهۆک', lat: 36.867, lng: 42.988 },
  { id: 'kerkuk', name: 'کەرکووک', lat: 35.468, lng: 44.392 },
  { id: 'halabja', name: 'هەڵەبجە', lat: 35.177, lng: 45.986 },
  { id: 'ranya', name: 'ڕانیە', lat: 36.253, lng: 44.882 },
  { id: 'zakho', name: 'زاخۆ', lat: 37.143, lng: 42.681 },
  { id: 'baghdad', name: 'بەغدا', lat: 33.315, lng: 44.366 },
  { id: 'mosul', name: 'مووسڵ', lat: 36.335, lng: 43.119 },
  { id: 'basra', name: 'بەسرە', lat: 30.508, lng: 47.784 },
  { id: 'makkah', name: 'مەککە', lat: 21.389, lng: 39.857 },
  { id: 'madinah', name: 'مەدینە', lat: 24.524, lng: 39.569 },
  { id: 'istanbul', name: 'ئیستەنبووڵ', lat: 41.008, lng: 28.978 },
  { id: 'tehran', name: 'تاران', lat: 35.689, lng: 51.389 },
  { id: 'cairo', name: 'قاهیرە', lat: 30.044, lng: 31.236 },
  { id: 'london', name: 'لەندەن', lat: 51.507, lng: -0.128 },
  { id: 'berlin', name: 'بەرلین', lat: 52.520, lng: 13.405 },
  { id: 'stockholm', name: 'ستۆکهۆڵم', lat: 59.329, lng: 18.069 },
];

export function getCity(id) {
  return CITIES.find((ci) => ci.id === id) || null;
}

export const CALC_METHODS = [
  { id: 'MuslimWorldLeague', name: 'ڕابیتەی جیهانی ئیسلامی' },
  { id: 'UmmAlQura', name: 'ئوم القورا (مەککە)' },
  { id: 'Egyptian', name: 'دەستەی میسری' },
  { id: 'Karachi', name: 'کاراچی' },
  { id: 'Dubai', name: 'دووبەی' },
  { id: 'Turkey', name: 'تورکیا' },
];

export const PRAYERS = [
  { key: 'fajr', name: 'بەیانی', icon: 'weather-sunset-up' },
  { key: 'sunrise', name: 'خۆرهەڵاتن', icon: 'white-balance-sunny' },
  { key: 'dhuhr', name: 'نیوەڕۆ', icon: 'weather-sunny' },
  { key: 'asr', name: 'عەسر', icon: 'weather-partly-cloudy' },
  { key: 'maghrib', name: 'مەغریب', icon: 'weather-sunset-down' },
  { key: 'isha', name: 'عیشا', icon: 'weather-night' },
];

function buildParams(methodId, madhab) {
  const factory = adhan.CalculationMethod[methodId] || adhan.CalculationMethod.MuslimWorldLeague;
  const params = factory();
  params.madhab = madhab === 'hanafi' ? adhan.Madhab.Hanafi : adhan.Madhab.Shafi;
  return params;
}

export function getPrayerTimes(lat, lng, date, methodId, madhab) {
  const coordinates = new adhan.Coordinates(lat, lng);
  const params = buildParams(methodId || 'MuslimWorldLeague', madhab || 'shafi');
  const pt = new adhan.PrayerTimes(coordinates, date || new Date(), params);
  return {
    fajr: pt.fajr,
    sunrise: pt.sunrise,
    dhuhr: pt.dhuhr,
    asr: pt.asr,
    maghrib: pt.maghrib,
    isha: pt.isha,
    _pt: pt,
  };
}

// All days of a given month with their five prayer times (+ sunrise).
// `month` is 0-indexed (0 = January).
export function getMonthPrayerTimes(lat, lng, year, month, methodId, madhab) {
  const coordinates = new adhan.Coordinates(lat, lng);
  const params = buildParams(methodId || 'MuslimWorldLeague', madhab || 'shafi');
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const out = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const pt = new adhan.PrayerTimes(coordinates, date, params);
    out.push({
      day: d,
      date,
      fajr: pt.fajr,
      sunrise: pt.sunrise,
      dhuhr: pt.dhuhr,
      asr: pt.asr,
      maghrib: pt.maghrib,
      isha: pt.isha,
    });
  }
  return out;
}

// Returns { key, time } of the upcoming prayer (looks into tomorrow's fajr if needed).
export function getNextPrayer(times, now) {
  const ref = now || new Date();
  const order = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
  for (const key of order) {
    if (times[key] && times[key] > ref) return { key, time: times[key] };
  }
  return { key: 'fajr', time: times.fajr, tomorrow: true };
}

export function qiblaDirection(lat, lng) {
  return adhan.Qibla(new adhan.Coordinates(lat, lng));
}
