import React, { createContext, useContext, useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Audio } from 'expo-av';
import { getSurah } from '../lib/quran';
import { recitationUrl, getReciter } from '../lib/reciters';

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const soundRef = useRef(null);
  const [current, setCurrent] = useState(null); // { surah, reciterId }
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
    setPosition(status.positionMillis || 0);
    setDuration(status.durationMillis || 0);
    setIsPlaying(status.isPlaying);
    if (status.didJustFinish) {
      setIsPlaying(false);
      setPosition(0);
    }
  }, []);

  const playSurah = useCallback(
    async (surahNumber, reciterId) => {
      try {
        setError(null);
        setIsLoading(true);
        if (soundRef.current) {
          await soundRef.current.unloadAsync().catch(() => {});
          soundRef.current = null;
        }
        const uri = recitationUrl(reciterId, surahNumber);
        const { sound } = await Audio.Sound.createAsync(
          { uri },
          { shouldPlay: true, progressUpdateIntervalMillis: 400 },
          onStatus
        );
        soundRef.current = sound;
        setCurrent({ surah: surahNumber, reciterId });
        setIsPlaying(true);
      } catch (e) {
        setError('نەتوانرا دەنگ باربکرێت. پەیوەندی ئینتەرنێت بپشکنە.');
      } finally {
        setIsLoading(false);
      }
    },
    [onStatus]
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
      isPlaying,
      isLoading,
      position,
      duration,
      error,
      playSurah,
      toggle,
      seek,
      seekBy,
      stop,
    }),
    [current, currentSurah, currentReciter, isPlaying, isLoading, position, duration, error, playSurah, toggle, seek, seekBy, stop]
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
}
