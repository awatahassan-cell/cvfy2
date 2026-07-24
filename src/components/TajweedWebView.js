import React, { useMemo, useRef } from 'react';
import { WebView } from 'react-native-webview';
import { getAyahSegments, resolveColor } from 'react-native-quran-tajweed';

import { UTHMANIC_FONT_BASE64 } from '../lib/uthmanicFontBase64';
import { TAJWEED_COLORS } from '../lib/tajweedColors';
import { toArabicDigits } from '../lib/format';

// Render a whole surah's tajweed text inside a single WebView.
//
// React Native's Android text engine does not shape Arabic across the color
// runs that tajweed coloring needs, so letters break apart. The browser engine
// (used by react-native-webview) shapes Arabic correctly across colored spans,
// so the text stays connected AND colored. We use one WebView for the whole
// surah (a per-ayah WebView would mean hundreds of instances).

function esc(s) {
  return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Build the colored HTML for one ayah. The browser engine shapes Arabic across
// adjacent <span> boundaries on its own (color does not break shaping), so we
// must NOT insert any joiner — a Zero-Width Joiner here makes this font draw a
// spurious kashida (ـ) at each colored boundary.
function ayahHtml(surah, ayahNumber, fallbackText) {
  let segments = null;
  try {
    segments = getAyahSegments(surah, ayahNumber);
  } catch (e) {
    segments = null;
  }
  if (!segments || segments.length === 0) return esc(fallbackText || '');

  return segments
    .map((seg) => {
      const col = resolveColor(seg.rules, TAJWEED_COLORS);
      const body = esc(seg.text);
      return col ? `<span style="color:${col}">${body}</span>` : body;
    })
    .join('');
}

function buildDocument({ surah, ayahs, colors, scale, bannerText, basmala, showTafsir, tafsirMap, tafsirName, tafsirLtr }) {
  const c = colors;
  const fontSize = Math.round(26 * scale);
  const cards = ayahs
    .map((a) => {
      const html = ayahHtml(surah, a.ayah, a.text);
      const num = toArabicDigits(a.ayah);
      const taf =
        showTafsir && tafsirMap && tafsirMap[a.ayah]
          ? `<div class="taf ${tafsirLtr ? 'ltr' : ''}"><div class="tafname">${esc(tafsirName)}</div>${esc(tafsirMap[a.ayah])}</div>`
          : '';
      return `<div class="card" data-n="${a.ayah}" onclick="pick(${a.ayah})">
        <div class="ayah">${html}<span class="end"><span class="endn">${num}</span></span></div>
        ${taf}
      </div>`;
    })
    .join('');

  const banner = bannerText
    ? `<div class="banner">${esc(bannerText)}</div>`
    : '';
  const bas = basmala ? `<div class="basmala">${esc(basmala)}</div>` : '';

  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"/>
<style>
  @font-face {
    font-family: 'UthmanicHafs';
    /* The file is TrueType-flavoured (sfnt 0x00010000) despite the .otf name;
       Android WebView rejects a mismatched format() hint and falls back to the
       system font, so declare 'truetype' with a ttf mime. */
    src: url(data:font/ttf;base64,${UTHMANIC_FONT_BASE64}) format('truetype');
    font-display: block;
  }
  * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: ${c.bg}; }
  body { padding: 16px 16px 200px; }
  .banner {
    border: 1.5px solid ${c.accent}; border-radius: 10px; padding: 12px;
    text-align: center; color: ${c.accent}; font-family: 'UthmanicHafs';
    font-size: 26px; margin-bottom: 10px; background: ${c.card};
  }
  .basmala {
    text-align: center; color: ${c.ink}; font-family: 'UthmanicHafs';
    font-size: ${Math.round(22 * scale)}px; margin-bottom: 14px;
  }
  .card {
    border: 1px solid ${c.line}; border-radius: 16px; padding: 16px;
    margin-bottom: 12px; background: ${c.card}; position: relative;
    transition: background .2s, border-color .2s;
  }
  .card.active { background: ${c.accentSoft}; border-color: ${c.accent}; }
  .ayah {
    font-family: 'UthmanicHafs'; font-size: ${fontSize}px; line-height: ${Math.round(fontSize * 2.1)}px;
    color: ${c.ink}; text-align: right; direction: rtl; word-spacing: 2px;
  }
  /* Ornamental end-of-ayah marker (mushaf-style rosette) with the number inside. */
  .end {
    display: inline-flex; align-items: center; justify-content: center;
    width: ${Math.round(fontSize * 1.25)}px; height: ${Math.round(fontSize * 1.25)}px;
    margin: 0 6px; vertical-align: middle; position: relative;
    color: ${c.accent};
  }
  .end::before, .end::after {
    content: ''; position: absolute; inset: 0; border-radius: 50%;
    border: 1.5px solid ${c.accent};
  }
  .end::after { inset: ${Math.round(fontSize * 0.16)}px; border-width: 1px; opacity: .55; transform: rotate(45deg); border-radius: 40%; }
  .endn {
    font-family: -apple-system, system-ui, sans-serif; font-weight: 700;
    font-size: ${Math.round(fontSize * 0.42)}px; line-height: 1; z-index: 1;
  }
  .card.active .end { color: ${c.accent}; }
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
  bannerText,
  basmala,
  showTafsir,
  tafsirMap,
  tafsirName,
  tafsirLtr,
  activeAyah,
  playing,
  onPlayAyah,
}) {
  const ref = useRef(null);

  // Rebuild the document only when content-affecting inputs change (not on every
  // active-ayah tick — highlighting is done by injecting JS instead).
  const html = useMemo(
    () =>
      buildDocument({
        surah,
        ayahs,
        colors,
        scale,
        bannerText,
        basmala,
        showTafsir,
        tafsirMap,
        tafsirName,
        tafsirLtr,
      }),
    [surah, ayahs, colors, scale, bannerText, basmala, showTafsir, tafsirMap, tafsirName, tafsirLtr]
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
      // Keep the whole surah rendered so highlight/scroll always find the node.
      androidLayerType="hardware"
    />
  );
}
