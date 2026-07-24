// Tajweed colours matched to quran.com's scheme (quran.com/al-ikhlas). Unlike
// the sparse noon-rule schemes, quran.com colours every madd type and tafkhim,
// so the page reads as densely colour-coded:
//
//   Silent letter ............ Gray
//   Normal madd (2) .......... Gold
//   Separated madd (2/4/6) ... Orange   (madd munfasil)
//   Connected madd (4/5) ..... Red      (madd muttasil)
//   Necessary madd (6) ....... Dark red (madd lazim)
//   Ghunna / ikhfa' .......... Green
//   Qalqala .................. Light blue
//   Tafkhim (heavy) .......... Blue
export const TAJWEED_COLORS = {
  // Madd — gold → orange → red → dark red, by strength
  madda_normal: '#C9A100', // Normal madd (2) — gold
  madda_permissible: '#FF8000', // Separated madd (2/4/6) — orange
  madda_obligatory: '#EE0000', // Connected madd (4/5) — red
  madda_necessary: '#8E0000', // Necessary madd (6) — dark red

  // Green — ghunna / ikhfa (nasalization, incl. iqlab & idgham with ghunna)
  ghunnah: '#009E00',
  ikhafa: '#009E00',
  ikhafa_shafawi: '#009E00',
  idgham_ghunnah: '#009E00',
  idgham_shafawi: '#009E00',
  iqlab: '#009E00',

  // Light blue — qalqala (echo)
  qalaqah: '#4FA8E8',

  // Blue — tafkhim (heavy pronunciation)
  tafkhim: '#2B2FD1',
  tarqiq: null,

  // Gray — silent / merged (not pronounced distinctly)
  ham_wasl: '#9E9E9E',
  laam_shamsiyah: '#9E9E9E',
  slnt: '#9E9E9E',
  idgham_wo_ghunnah: '#9E9E9E',
  idgham_mutajanisayn: '#9E9E9E',
  idgham_mutaqaribayn: '#9E9E9E',
};
