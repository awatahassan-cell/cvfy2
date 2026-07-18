import { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { DEFAULT_LOCATION } from './prayer';

// Resolves device coordinates + a readable place name, falling back to Erbil.
export function useLocation() {
  const [location, setLocation] = useState(DEFAULT_LOCATION);
  const [status, setStatus] = useState('loading'); // 'loading' | 'granted' | 'denied' | 'fallback'

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { status: perm } = await Location.requestForegroundPermissionsAsync();
        if (perm !== 'granted') {
          if (mounted) setStatus('denied');
          return;
        }
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        let name = '';
        try {
          const geo = await Location.reverseGeocodeAsync({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
          name = geo[0]?.city || geo[0]?.region || geo[0]?.country || '';
        } catch (e) {
          // reverse geocode is best-effort
        }
        if (mounted) {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude, name: name || 'شوێنی ئێستا' });
          setStatus('granted');
        }
      } catch (e) {
        if (mounted) setStatus('fallback');
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return { location, status };
}
