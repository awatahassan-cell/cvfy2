// Offline audio downloads — whole-surah recitations saved to device storage.
import * as FileSystem from 'expo-file-system';
import { recitationUrl } from './reciters';

const DIR = (FileSystem.documentDirectory || '') + 'audio/';
const pad = (n) => String(n).padStart(3, '0');

export function keyFor(reciterId, surah) {
  return `${reciterId}_${pad(surah)}`;
}

export function fileFor(reciterId, surah) {
  return `${DIR}${keyFor(reciterId, surah)}.mp3`;
}

async function ensureDir() {
  try {
    const info = await FileSystem.getInfoAsync(DIR);
    if (!info.exists) await FileSystem.makeDirectoryAsync(DIR, { intermediates: true });
  } catch (e) {
    // best-effort
  }
}

export async function isDownloaded(reciterId, surah) {
  try {
    const info = await FileSystem.getInfoAsync(fileFor(reciterId, surah));
    return !!info.exists;
  } catch (e) {
    return false;
  }
}

// Returns the local file URI if the surah is downloaded, otherwise null.
export async function localUri(reciterId, surah) {
  return (await isDownloaded(reciterId, surah)) ? fileFor(reciterId, surah) : null;
}

// Download a whole-surah recitation. onProgress receives 0..1.
export async function downloadSurah(reciterId, surah, onProgress) {
  await ensureDir();
  const dest = fileFor(reciterId, surah);
  const url = recitationUrl(reciterId, surah);
  const task = FileSystem.createDownloadResumable(url, dest, {}, (p) => {
    if (onProgress && p.totalBytesExpectedToWrite > 0) {
      onProgress(p.totalBytesWritten / p.totalBytesExpectedToWrite);
    }
  });
  const res = await task.downloadAsync();
  return res?.uri || dest;
}

export async function deleteSurah(reciterId, surah) {
  try {
    await FileSystem.deleteAsync(fileFor(reciterId, surah), { idempotent: true });
  } catch (e) {
    // ignore
  }
}

// List all downloaded { reciterId, surah, key } entries.
export async function listDownloaded() {
  try {
    const info = await FileSystem.getInfoAsync(DIR);
    if (!info.exists) return [];
    const files = await FileSystem.readDirectoryAsync(DIR);
    return files
      .filter((f) => f.endsWith('.mp3'))
      .map((f) => {
        const base = f.replace(/\.mp3$/, '');
        const i = base.lastIndexOf('_');
        return { key: base, reciterId: base.slice(0, i), surah: parseInt(base.slice(i + 1), 10) };
      });
  } catch (e) {
    return [];
  }
}

export async function totalSizeBytes() {
  try {
    const info = await FileSystem.getInfoAsync(DIR);
    if (!info.exists) return 0;
    const files = await FileSystem.readDirectoryAsync(DIR);
    let sum = 0;
    for (const f of files) {
      const fi = await FileSystem.getInfoAsync(DIR + f);
      sum += fi.size || 0;
    }
    return sum;
  } catch (e) {
    return 0;
  }
}
