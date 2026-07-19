import React, { createContext, useContext, useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Audio } from 'expo-av';
import { getSurah } from '../lib/quran';
import { recitationUrl, ayahUrl, getReciter, supportsAyahAudio } from '../lib/reciters';

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const soundRef = useRef(null);
  const pendingSeekRef = useRef(null); // fraction (0..1) to seek to once duration is known
  const advanceRef = useRef(null); // called on finish when playing ayah-by-ayah

  const [current, setCurrent] = useState(null); // { surah, reciterId }
  const [mode, setMode] = useState('surah'); // 'surah' | 'ayah'
  const [currentAyah, setCurrentAyah] = useState(null); // active ayah in 'ayah' mode
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    Audio.setAudioModeAsync({
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
    }).catch(() => {});
    return () => {
      if (soundRef.current) soundRef.current.unloadAsync().catch(() => {});
    };
  }, []);

  const onStatus = useCallback((status) => {
    if (!status.isLoaded) {
      if (status.error) setError(String(status.error));
      return;
    }
    if (pendingSeekRef.current != null && status.durationMillis) {
      const fraction = pendingSeekRef.current;
      pendingSeekRef.current = null;
      if (fraction > 0 && soundRef.current) {
        soundRef.current.setPositionAsync(Math.floor(fraction * status.durationMillis)).catch(() => {});
      }
    }
    setPosition(status.positionMillis || 0);
    setDuration(status.durationMillis || 0);
    setIsPlaying(status.isPlaying);
    if (status.didJustFinish) {
      // Auto-advance to the next ayah when reciting ayah-by-ayah.
      if (advanceRef.current) {
        const advance = advanceRef.current;
        advanceRef.current = null;
        advance();
      } else {
        setIsPlaying(false);
        setPosition(0);
      }
    }
  }, []);

  const loadAndPlay = useCallback(
    async (uri) => {
      setError(null);
      setIsLoading(true);
      try {
        if (soundRef.current) {
          await soundRef.current.unloadAsync().catch(() => {});
          soundRef.current = null;
        }
        const { sound } = await Audio.Sound.createAsync(
          { uri },
          { shouldPlay: true, progressUpdateIntervalMillis: 400 },
          onStatus
        );
        soundRef.current = sound;
        setIsPlaying(true);
      } catch (e) {
        setError('نەتوانرا دەنگ باربکرێت. پەیوەندی ئینتەرنێت بپشکنە.');
      } finally {
        setIsLoading(false);
      }
    },
    [onStatus]
  );

  const playSurah = useCallback(
    async (surahNumber, reciterId, startFraction = 0) => {
      advanceRef.current = null;
      pendingSeekRef.current = startFraction > 0 ? startFraction : null;
      setMode('surah');
      setCurrentAyah(null);
      setCurrent({ surah: surahNumber, reciterId });
      await loadAndPlay(recitationUrl(reciterId, surahNumber));
    },
    [loadAndPlay]
  );

  // True per-ayah playback: recite one ayah, then auto-advance to the next.
  const playAyah = useCallback(
    async (surahNumber, ayah, reciterId, total) => {
      const uri = ayahUrl(reciterId, surahNumber, ayah);
      if (!uri) {
        // Reciter has no per-ayah files → estimate position within the surah audio.
        const fraction = total > 1 ? (ayah - 1) / total : 0;
        return playSurah(surahNumber, reciterId, fraction);
      }
      pendingSeekRef.current = null;
      setMode('ayah');
      setCurrentAyah(ayah);
      setCurrent({ surah: surahNumber, reciterId });
      advanceRef.current = () => {
        if (ayah < total) {
          playAyah(surahNumber, ayah + 1, reciterId, total);
        } else {
          advanceRef.current = null;
          setIsPlaying(false);
        }
      };
      await loadAndPlay(uri);
    },
    [loadAndPlay, playSurah]
  );

  const toggle = useCallback(async () => {
    const s = soundRef.current;
    if (!s) return;
    const status = await s.getStatusAsync();
    if (!status.isLoaded) return;
    if (status.isPlaying) await s.pauseAsync();
    else await s.playAsync();
  }, []);

  const seek = useCallback(async (millis) => {
    const s = soundRef.current;
    if (s) await s.setPositionAsync(millis);
  }, []);

  const seekBy = useCallback(
    async (deltaMs) => {
      const next = Math.max(0, Math.min(duration, position + deltaMs));
      await seek(next);
    },
    [duration, position, seek]
  );

  const stop = useCallback(async () => {
    advanceRef.current = null;
    const s = soundRef.current;
    if (s) {
      await s.stopAsync().catch(() => {});
      setIsPlaying(false);
      setPosition(0);
    }
  }, []);

  const currentSurah = current ? getSurah(current.surah) : null;
  const currentReciter = current ? getReciter(current.reciterId) : null;

  const value = useMemo(
    () => ({
      current,
      currentSurah,
      currentReciter,
      mode,
      currentAyah,
      isPlaying,
      isLoading,
      position,
      duration,
      error,
      playSurah,
      playAyah,
      supportsAyahAudio,
      toggle,
      seek,
      seekBy,
      stop,
    }),
    [current, currentSurah, currentReciter, mode, currentAyah, isPlaying, isLoading, position, duration, error, playSurah, playAyah, toggle, seek, seekBy, stop]
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
}
