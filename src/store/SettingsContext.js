import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { THEMES, DEFAULT_THEME } from '../theme/themes';

const STORAGE_KEY = '@quran/settings/v1';

const defaults = {
  themeId: DEFAULT_THEME,
  readMode: 'continuous', // 'continuous' | 'page'
  tafsirId: 'asan',
  showTafsir: true,
  tajweed: false,
  fontScale: 1,
  reciterId: 'peshawa',
  language: 'ku', // 'ku' | 'ar' | 'en'
  fontId: 'system',
  calcMethod: 'MuslimWorldLeague',
  madhab: 'shafi', // 'shafi' | 'hanafi'
  notifyPrayer: false,
  muezzin: 'makkah',
  adhanOn: { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true },
  numberStyle: 'ar', // 'ar' (١٢٣) | 'en' (123)
  bookmarks: [], // [{ surah, ayah }]
  lastRead: { surah: 1, ayah: 1 },
};

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [state, setState] = useState(defaults);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setState({ ...defaults, ...JSON.parse(raw) });
      } catch (e) {
        // ignore corrupt storage
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const persist = useCallback((next) => {
    setState(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const update = useCallback((patch) => {
    setState((prev) => {
      const next = { ...prev, ...patch };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const toggleBookmark = useCallback((surah, ayah) => {
    setState((prev) => {
      const exists = prev.bookmarks.some((b) => b.surah === surah && b.ayah === ayah);
      const bookmarks = exists
        ? prev.bookmarks.filter((b) => !(b.surah === surah && b.ayah === ayah))
        : [...prev.bookmarks, { surah, ayah }];
      const next = { ...prev, bookmarks };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const isBookmarked = useCallback(
    (surah, ayah) => state.bookmarks.some((b) => b.surah === surah && b.ayah === ayah),
    [state.bookmarks]
  );

  const setLastRead = useCallback((surah, ayah) => update({ lastRead: { surah, ayah } }), [update]);

  const theme = useMemo(() => THEMES[state.themeId] || THEMES[DEFAULT_THEME], [state.themeId]);

  const value = useMemo(
    () => ({ ...state, ready, theme, update, persist, toggleBookmark, isBookmarked, setLastRead }),
    [state, ready, theme, update, persist, toggleBookmark, isBookmarked, setLastRead]
  );

  // Don't mount screens until persisted settings are loaded, otherwise an
  // early write (e.g. reader saving "last read") would clobber saved settings.
  return <SettingsContext.Provider value={value}>{ready ? children : null}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}

export function useTheme() {
  return useSettings().theme;
}
