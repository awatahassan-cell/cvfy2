# قورئان — Kurdish Quran App

ئەپێکی قورئانی مۆدێرن بە React Native (Expo)، بە دەنگی چەند قورئان‌خوێن، دەقی مەسحەف، و تەفسیری کوردی.

A modern Quran app built with React Native (Expo) — multi-reciter audio, Uthmani Mushaf text, and Kurdish tafsir.

## تایبەتمەندییەکان / Features

- 📖 **دەقی مەسحەف** — هەموو ١١٤ سوورەت بە فۆنتی ڕەسەنی KFGQPC Uthmanic Hafs
- 🎧 **٩ قورئان‌خوێن** — بەدەنگی پێشەوا قادر (کورد)، عەفاسی، سودەیس و زیاتر (streaming)
- 📝 **١٥ تەفسیر** — ١٣ تەفسیری کوردی (ئاسان، هەژار، ڕێبار، موختەسەر، پوختە، ڕامان، مویەسەر، ڕۆشن، تەوحیدی، کوردی، و ٣ بادینی)، عەرەبی (الميسّر)، ئینگلیزی (Al-Mukhtasar)
- 🎨 **٥ ڕەنگی ڕووکار** — کرێمی، زمردی، شەوی، کاغەزی، ڕەشی
- 📚 **دوو شێوازی خوێندنەوە** — بەردەوام (Uthmanic) و پەڕە‌بەپەڕە (QCF)
- ▶️ **پلەیەری بچووک** — لەکاتی خوێندنەوە خەتێکی بچووک لەخوارەوە، بەبێ گواستنەوە بۆ لاپەڕەی تر
- ✨ **دیاریکردنی ئایەت** — ئایەتەکان بەخۆکارانە ڕەنگین دەبن لەکاتی گوێگرتن
- 🔖 **نیشانە و گەڕان** — پاشەکەوتی ئایەتەکان و گەڕان بەناو/دەق

## پێکهاتە / Tech Stack

- **Expo** + **expo-router** (file-based navigation)
- **expo-av** — audio playback with background support
- **@expo/vector-icons** — Ionicons / MaterialCommunityIcons
- **AsyncStorage** — persisted settings & bookmarks
- **imanikurd-quran** — offline Quran text + 13 Kurdish tafsirs

## دەستپێکردن / Getting Started

```bash
npm install
npm start          # then scan the QR with Expo Go
# or
npm run android    # / npm run ios / npm run web
```

## پێکهاتەی پرۆژە / Project Structure

```
app/
  _layout.js            # root: fonts, providers, stack
  (tabs)/               # bottom tabs: home, search, bookmarks, settings
  reader/[id].js        # surah reader (2 modes + tafsir + mini-player + ayah highlight)
  player.js             # full audio player (modal)
src/
  lib/                  # quran, tafsir, reciters, format
  store/                # SettingsContext, PlayerContext
  theme/                # 5 palettes
  components/           # MiniPlayer
  data/                 # bundled JSON (quran + tafsirs)
assets/fonts/           # UthmanicHafs.otf
```

## تێبینی / Notes

- دەنگی سوورەتەکان لە سێرڤەرەوە دەهێنرێت (پێویستی بە ئینتەرنێت هەیە بۆ گوێگرتن).
- دەقی قورئان و تەفسیر offline ـن (لەناو ئەپەکە).
- دیاریکردنی ئایەت لەسەر بنەمای درێژی دەقی ئایەت مەزەندە دەکرێت؛ بۆ وردی تەواو، داتای کاتی هەر ئایەت (timing) دەکرێت زیاد بکرێت.
