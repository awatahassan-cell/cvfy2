import React, { useMemo, useRef } from 'react';
import { WebView } from 'react-native-webview';
import { getAyahSegments, resolveColor } from 'react-native-quran-tajweed';

import { UTHMANIC_FONT_BASE64 } from '../lib/uthmanicFontBase64';
import { getQuranFont } from '../lib/quranFonts';
import { TAJWEED_COLORS } from '../lib/tajweedColors';
import { toArabicDigits } from '../lib/format';

// The whole reader (both plain and tajweed) is rendered inside one WebView on
// native. React Native's Android text engine breaks Arabic shaping across the
// colored runs tajweed needs, and it can't draw the font's ornate end-of-ayah
// rosette; the browser engine does both correctly.
//
// The ayah TEXT font is user-selectable (src/lib/quranFonts.js); the ayah
// NUMBER always uses UthmanicHafs for its ornate rosette digit.
const NUM_FONT = "'UthmanicHafs', serif";

function esc(s) {
  return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Colored HTML for one ayah (tajweed on) or plain escaped text (tajweed off).
// The browser shapes Arabic across adjacent <span> boundaries on its own, so we
// add no joiner (a ZWJ would make the font draw a spurious kashida).
function ayahHtml(surah, ayahNumber, fallbackText, colored) {
  let segments = null;
  try {
    segments = getAyahSegments(surah, ayahNumber);
  } catch (e) {
    segments = null;
  }
  if (!segments || segments.length === 0) return esc(fallbackText || '');
  if (!colored) return esc(segments.map((s) => s.text).join(''));

  return segments
    .map((seg) => {
      const col = resolveColor(seg.rules, TAJWEED_COLORS);
      const body = esc(seg.text);
      return col ? `<span style="color:${col}">${body}</span>` : body;
    })
    .join('');
}

const ICON_PLAY = (col) =>
  `<svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="${col}" stroke-width="1.5"><circle cx="12" cy="12" r="9.2"/><path d="M10 8.3l6 3.7-6 3.7z" fill="${col}" stroke="none"/></svg>`;
const ICON_BM = (col, on) =>
  `<svg viewBox="0 0 24 24" width="20" height="20" fill="${on ? col : 'none'}" stroke="${col}" stroke-width="1.6"><path d="M6 3.5h12a0 0 0 0 1 0 0v17l-6-4.2-6 4.2v-17a0 0 0 0 1 0 0z"/></svg>`;

function buildDocument({
  surah, ayahs, colors, scale, tajweed, font, bannerText, basmala,
  showTafsir, tafsirMap, tafsirName, tafsirLtr, bookmarks, initialAyah,
}) {
  const c = colors;
  const fontSize = Math.round(26 * scale);
  const TEXT_FONT = `'${font.family}', 'Noto Naskh Arabic', serif`;
  // The chosen text font plus UthmanicHafs (for the rosette number). Skip the
  // duplicate @font-face when the chosen font already is UthmanicHafs.
  const textFace =
    font.family === 'UthmanicHafs'
      ? ''
      : `@font-face { font-family: '${font.family}'; src: url(data:font/ttf;base64,${font.b64}) format('${font.fmt}'); font-display: block; }`;
  const bmSet = new Set(bookmarks || []);
  const cards = ayahs
    .map((a) => {
      const html = ayahHtml(surah, a.ayah, a.text, tajweed);
      const num = toArabicDigits(a.ayah);
      const on = bmSet.has(a.ayah);
      const taf =
        showTafsir && tafsirMap && tafsirMap[a.ayah]
          ? `<div class="taf ${tafsirLtr ? 'ltr' : ''}"><div class="tafname">${esc(tafsirName)}</div>${esc(tafsirMap[a.ayah])}</div>`
          : '';
      return `<div class="card" data-n="${a.ayah}">
        <div class="top">
          <span class="ic" onclick="pick(${a.ayah})">${ICON_PLAY(c.muted)}</span>
          <span class="ic bm" onclick="bm(${a.ayah})">${ICON_BM(on ? c.accent : c.muted, on)}</span>
        </div>
        <div class="ayah" onclick="pick(${a.ayah})">${html}<span class="end">${num}</span></div>
        ${taf}
      </div>`;
    })
    .join('');

  const banner = bannerText ? `<div class="banner">${esc(bannerText)}</div>` : '';
  const bas = basmala ? `<div class="basmala">${esc(basmala)}</div>` : '';

  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"/>
<style>
  @font-face {
    font-family: 'UthmanicHafs';
    src: url(data:font/ttf;base64,${UTHMANIC_FONT_BASE64}) format('truetype');
    font-display: block;
  }
  ${textFace}
  * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: ${c.bg}; }
  body { padding: 16px 16px 200px; }
  .banner {
    border: 1.5px solid ${c.accent}; border-radius: 10px; padding: 12px;
    text-align: center; color: ${c.accent}; font-family: ${TEXT_FONT};
    font-size: 26px; margin-bottom: 10px; background: ${c.card};
  }
  .basmala {
    text-align: center; color: ${c.ink}; font-family: ${TEXT_FONT};
    font-size: ${Math.round(22 * scale)}px; margin-bottom: 14px;
  }
  .card {
    border: 1px solid ${c.line}; border-radius: 16px; padding: 16px;
    margin-bottom: 12px; background: ${c.card}; position: relative;
    transition: background .2s, border-color .2s;
  }
  .card.active { background: ${c.accentSoft}; border-color: ${c.accent}; }
  .top { display: flex; justify-content: flex-start; align-items: center; gap: 16px; margin-bottom: 8px; }
  .ic { display: inline-flex; cursor: pointer; }
  .ayah {
    font-family: ${TEXT_FONT}; font-size: ${fontSize}px; line-height: ${Math.round(fontSize * 2.15)}px;
    color: ${c.ink}; text-align: right; direction: rtl; word-spacing: 2px;
  }
  /* Ayah number: the Uthmani font draws the bare numeral inside its rosette. */
  .end {
    font-family: ${NUM_FONT}; color: ${c.accent};
    font-size: ${fontSize}px; margin: 0 6px; white-space: nowrap;
  }
  .taf {
    margin-top: 12px; padding-top: 10px; border-top: 1px solid ${c.line};
    color: ${c.muted}; font-size: ${Math.round(14 * scale)}px; line-height: ${Math.round(26 * scale)}px;
    text-align: right; direction: rtl; font-family: -apple-system, system-ui, 'Segoe UI', sans-serif;
  }
  .taf.ltr { text-align: left; direction: ltr; }
  .tafname { color: ${c.accent}; font-weight: 700; font-size: 11px; margin-bottom: 4px; }
</style>
</head>
<body>
  ${banner}
  ${bas}
  ${cards}
<script>
  function post(o){ try { window.ReactNativeWebView.postMessage(JSON.stringify(o)); } catch(e){} }
  function pick(n){ post({ type:'play', ayah:n }); }
  function bm(n){ post({ type:'bookmark', ayah:n }); }
  function highlight(n){
    document.querySelectorAll('.card.active').forEach(function(e){ e.classList.remove('active'); });
    if(n==null) return;
    var el = document.querySelector('.card[data-n="'+n+'"]');
    if(el){ el.classList.add('active'); }
  }
  function scrollToAyah(n){
    var el = document.querySelector('.card[data-n="'+n+'"]');
    if(el){ el.scrollIntoView({ behavior:'smooth', block:'center' }); }
  }
  // Report the top-most visible ayah so RN can restore position after a rebuild
  // (toggling tajweed/tafsir or switching theme rebuilds this document).
  function topAyah(){
    var cards = document.querySelectorAll('.card');
    for (var i=0;i<cards.length;i++){ if (cards[i].getBoundingClientRect().bottom > 90) return +cards[i].getAttribute('data-n'); }
    return null;
  }
  var lastTop = 0;
  window.addEventListener('scroll', function(){ var n=topAyah(); if(n && n!==lastTop){ lastTop=n; post({ type:'top', ayah:n }); } }, { passive:true });
  var INITIAL_AYAH = ${initialAyah || 0};
  if (INITIAL_AYAH){
    var t = document.querySelector('.card[data-n="'+INITIAL_AYAH+'"]');
    if (t){ t.scrollIntoView({ block:'start' }); window.scrollBy(0, -14); }
  }
  document.fonts && document.fonts.ready.then(function(){ post({ type:'ready' }); });
</script>
</body>
</html>`;
}

export default function TajweedWebView({
  surah,
  ayahs,
  colors,
  scale = 1,
  tajweed = true,
  fontId,
  bannerText,
  basmala,
  showTafsir,
  tafsirMap,
  tafsirName,
  tafsirLtr,
  bookmarks,
  activeAyah,
  playing,
  onPlayAyah,
  onToggleBookmark,
}) {
  const ref = useRef(null);
  const topAyahRef = useRef(0);

  const font = getQuranFont(fontId);
  const bookmarksKey = (bookmarks || []).join(',');
  const html = useMemo(
    () =>
      buildDocument({
        surah, ayahs, colors, scale, tajweed, font, bannerText, basmala,
        showTafsir, tafsirMap, tafsirName, tafsirLtr,
        bookmarks, initialAyah: topAyahRef.current,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [surah, ayahs, colors, scale, tajweed, font.id, bannerText, basmala, showTafsir, tafsirMap, tafsirName, tafsirLtr, bookmarksKey]
  );

  // Push active-ayah highlight + auto-scroll into the page.
  React.useEffect(() => {
    if (!ref.current) return;
    const n = activeAyah == null ? 'null' : activeAyah;
    ref.current.injectJavaScript(
      `highlight(${n}); ${activeAyah != null && playing ? `scrollToAyah(${n});` : ''} true;`
    );
  }, [activeAyah, playing]);

  const onMessage = (e) => {
    try {
      const msg = JSON.parse(e.nativeEvent.data);
      if (msg.type === 'play' && onPlayAyah) onPlayAyah(msg.ayah);
      else if (msg.type === 'bookmark' && onToggleBookmark) onToggleBookmark(msg.ayah);
      else if (msg.type === 'top' && msg.ayah) topAyahRef.current = msg.ayah;
    } catch (err) {}
  };

  return (
    <WebView
      ref={ref}
      originWhitelist={['*']}
      source={{ html }}
      onMessage={onMessage}
      style={{ flex: 1, backgroundColor: colors.bg }}
      showsVerticalScrollIndicator={false}
      androidLayerType="hardware"
    />
  );
}
