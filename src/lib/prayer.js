// Prayer times + Qibla direction, computed dynamically with the `adhan` library.
import * as adhan from 'adhan';

// Default location: Erbil (هەولێر), used when GPS is unavailable.
export const DEFAULT_LOCATION = { lat: 36.191, lng: 44.009, name: 'هەولێر' };

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
