import React, { useMemo } from 'react';
import { Modal, View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';

import { AMIRI_QURAN_BASE64 } from '../lib/amiriQuranBase64';
import { TAJWEED_COLORS as T } from '../lib/tajweedColors';

// Tajweed rules guide — same colours the reader uses (quran.com scheme).
// Each row: colour dot, Kurdish name + explanation, and a real Quran example
// with the relevant letter shown in that rule's colour.
const RULES = [
  { color: T.madda_normal, name: 'مەدی سروشتی', sub: 'درێژکردنەوەی دەنگ بۆ ٢ حەرەکە', ex: `قَ<b>ا</b>لَ` },
  { color: T.madda_permissible, name: 'مەدی جیاکراوە', sub: 'مەد لە کۆتایی وشە، هەمزە لە سەرەتای وشەی داهاتوو (٢/٤/٦)', ex: `بِمَ<b>آ</b> أُنزِلَ` },
  { color: T.madda_obligatory, name: 'مەدی پەیوەست', sub: 'مەد و هەمزە لە یەک وشەدا (٤/٥)', ex: `جَ<b>آ</b>ءَ` },
  { color: T.madda_necessary, name: 'مەدی پێویست', sub: 'دوای مەد، شەدە یان سکونی جێگیر (٦)', ex: `ٱلضَّ<b>آ</b>لِّینَ` },
  { color: T.ghunnah, name: 'غوننە و ئیخفا', sub: 'دەنگ لە لووتەوە دەردەچێت (نْ، تەنوین، نّ، مّ)', ex: `مِ<b>ن</b> قَبْلِ` },
  { color: T.qalaqah, name: 'قەلقەلە', sub: 'دەنگی جوڵە لە پیتەکانی (ق ط ب ج د) بە سکون', ex: `لَمْ یَلِ<b>دۡ</b>` },
  { color: T.tafkhim, name: 'تەفخیم', sub: 'قورسکردنی دەنگی پیتە بەرزەکان', ex: `<b>خَ</b>لَقَ` },
  { color: T.ham_wasl, name: 'پیتی بێدەنگ', sub: 'پیت کە نالفظرێت (هەمزەی وەسڵ، لامی شەمسی)', ex: `<b>ٱ</b>لشَّمْس` },
];

function esc(s) {
  return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Turn "قَ<b>ا</b>لَ" into HTML with the <b> part coloured (not escaped).
function exampleHtml(ex, color) {
  return esc(ex)
    .replace('&lt;b&gt;', `<span style="color:${color}">`)
    .replace('&lt;/b&gt;', '</span>');
}

function buildDoc(c) {
  const rows = RULES.map(
    (r) => `<div class="row">
      <div class="rhead">
        <span class="dot" style="background:${r.color}"></span>
        <div class="name">${esc(r.name)}</div>
      </div>
      <div class="sub">${esc(r.sub)}</div>
      <div class="exwrap"><span class="ex">${exampleHtml(r.ex, r.color)}</span></div>
    </div>`
  ).join('');

  return `<!DOCTYPE html>
<html dir="rtl" lang="ku"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"/>
<style>
  @font-face { font-family:'AmiriQuran'; src:url(data:font/ttf;base64,${AMIRI_QURAN_BASE64}) format('truetype'); font-display:block; }
  * { box-sizing:border-box; -webkit-tap-highlight-color:transparent; }
  html,body { margin:0; padding:0; background:${c.bg}; overflow-x:hidden; }
  body { padding:14px 14px 30px; font-family:-apple-system, system-ui, 'Segoe UI', sans-serif; }
  .intro { color:${c.muted}; font-size:13px; text-align:right; margin:0 2px 12px; line-height:22px; }
  .row {
    background:${c.card}; border:1px solid ${c.line}; border-radius:14px;
    padding:14px 16px; margin-bottom:10px; overflow:hidden;
  }
  .rhead { display:flex; flex-direction:row-reverse; align-items:center; gap:10px; justify-content:flex-start; }
  .dot { width:15px; height:15px; border-radius:50%; flex:0 0 auto; }
  .name { color:${c.ink}; font-size:15px; font-weight:700; text-align:right; }
  .sub { color:${c.muted}; font-size:12.5px; line-height:19px; margin-top:5px; text-align:right; }
  .exwrap { margin-top:10px; padding-top:10px; border-top:1px dashed ${c.line}; text-align:center; }
  .ex { font-family:'AmiriQuran', serif; font-size:34px; color:${c.ink}; direction:rtl; }
</style></head>
<body>
  <div class="intro">ئەم ڕەنگانە هەمان ئەوانەن کە لە خوێندنەوەکەدا بەکاردێن. کاتێک تەجوید چالاک بێت، هەر پیتێک بەپێی حوکمەکەی ڕەنگ دەکرێت.</div>
  ${rows}
</body></html>`;
}

export default function TajweedGuide({ visible, onClose, c }) {
  const html = useMemo(() => buildDoc(c), [c]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.wrap}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={[styles.sheet, { backgroundColor: c.bg, borderColor: c.line }]}>
          <View style={[styles.head, { borderBottomColor: c.line }]}>
            <Text style={[styles.title, { color: c.ink }]}>ڕوونکردنەوەی حوکمی تەجوید</Text>
            <Pressable hitSlop={10} onPress={onClose}>
              <Ionicons name="close" size={22} color={c.muted} />
            </Pressable>
          </View>
          {Platform.OS === 'web' ? (
            <iframe title="tajweed-guide" srcDoc={html} style={{ border: 'none', width: '100%', flex: 1 }} />
          ) : (
            <WebView
              originWhitelist={['*']}
              source={{ html }}
              style={{ flex: 1, backgroundColor: c.bg }}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: { height: '82%', borderTopLeftRadius: 22, borderTopRightRadius: 22, borderWidth: 1, overflow: 'hidden' },
  head: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingVertical: 16, borderBottomWidth: 1 },
  title: { fontSize: 16, fontWeight: '800', textAlign: 'right' },
});
