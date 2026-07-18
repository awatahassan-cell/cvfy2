// App-wide UI font. Patches Text/TextInput to inject a *base* fontFamily so any
// explicit fontFamily on a component (Quran text, icon glyphs) still wins.
import React from 'react';
import { Text, TextInput } from 'react-native';

export const FONT_OPTIONS = [
  { id: 'system', label: 'بنەڕەت', family: null, preview: 'ئەلف با' },
  { id: 'naskh', label: 'ناسخ', family: 'NotoNaskhArabic', preview: 'ئەلف با' },
  { id: 'kufi', label: 'کوفی', family: 'NotoKufiArabic', preview: 'ئەلف با' },
  { id: 'vazir', label: 'مۆدێرن', family: 'Vazirmatn', preview: 'ئەلف با' },
  { id: 'cairo', label: 'نەرم', family: 'Cairo', preview: 'ئەلف با' },
  { id: 'lalezar', label: 'تەزیینی', family: 'Lalezar', preview: 'ئەلف با' },
];

export function familyForFont(id) {
  return (FONT_OPTIONS.find((f) => f.id === id) || FONT_OPTIONS[0]).family;
}

let currentFamily = null;
let patched = false;

export function setUIFontFamily(family) {
  currentFamily = family || null;
}

export function installUIFontPatch() {
  if (patched) return;
  patched = true;
  [Text, TextInput].forEach((Comp) => {
    const orig = Comp.render;
    if (typeof orig !== 'function') return;
    Comp.render = function render(...args) {
      const el = orig.apply(this, args);
      if (!currentFamily || !el) return el;
      return React.cloneElement(el, {
        style: [{ fontFamily: currentFamily }, el.props.style],
      });
    };
  });
}
