import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from 'react';
import * as dl from '../lib/downloads';

const DownloadsContext = createContext(null);

export function DownloadsProvider({ children }) {
  const [downloaded, setDownloaded] = useState(() => new Set()); // Set of keys
  const [progress, setProgress] = useState({}); // key -> 0..1
  const activeRef = useRef(new Set());

  const refresh = useCallback(async () => {
    const list = await dl.listDownloaded();
    setDownloaded(new Set(list.map((x) => x.key)));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const isDownloaded = useCallback((reciterId, surah) => downloaded.has(dl.keyFor(reciterId, surah)), [downloaded]);

  const download = useCallback(async (reciterId, surah) => {
    const key = dl.keyFor(reciterId, surah);
    if (activeRef.current.has(key)) return;
    activeRef.current.add(key);
    setProgress((p) => ({ ...p, [key]: 0 }));
    try {
      await dl.downloadSurah(reciterId, surah, (frac) => {
        setProgress((p) => ({ ...p, [key]: frac }));
      });
      setDownloaded((s) => new Set(s).add(key));
    } catch (e) {
      // ignore; leave undownloaded
    } finally {
      activeRef.current.delete(key);
      setProgress((p) => {
        const n = { ...p };
        delete n[key];
        return n;
      });
    }
  }, []);

  const remove = useCallback(async (reciterId, surah) => {
    await dl.deleteSurah(reciterId, surah);
    setDownloaded((s) => {
      const n = new Set(s);
      n.delete(dl.keyFor(reciterId, surah));
      return n;
    });
  }, []);

  const progressFor = useCallback((reciterId, surah) => progress[dl.keyFor(reciterId, surah)], [progress]);

  const value = useMemo(
    () => ({ downloaded, isDownloaded, download, remove, refresh, progressFor, progress }),
    [downloaded, isDownloaded, download, remove, refresh, progressFor, progress]
  );

  return <DownloadsContext.Provider value={value}>{children}</DownloadsContext.Provider>;
}

export function useDownloads() {
  const ctx = useContext(DownloadsContext);
  if (!ctx) throw new Error('useDownloads must be used within DownloadsProvider');
  return ctx;
}
