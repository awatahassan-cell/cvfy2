// Full, vivid color-coded tajweed scheme. This library tags only a fraction of
// each ayah with rules, and the two most frequent tags are tafkhim (heavy
// letters) and hamzat-wasl. Leaving tafkhim black made the page read as mostly
// black + gray, so tafkhim now gets its own colour — that is the single biggest
// lever for making the reader look colour-coded.
//
//   Red family    → المدود (madd / elongation), graduated by strength
//   Green family  → الغنة (ghunnah / nasalization: ikhfa, idgham bi-ghunnah, iqlab)
//   Blue          → القلقلة (qalqalah)
//   Purple        → التفخيم (heavy pronunciation) — the most frequent rule
//   Indigo        → الإدغام (assimilation without ghunnah)
//   Gray          → الحروف التي لا تُلفظ (silent / not pronounced)
export const TAJWEED_COLORS = {
  // Red — madd (elongation), graduated: natural (soft) → necessary (deep)
  madda_normal: '#E24A3B', // مد طبيعي (2)
  madda_permissible: '#F57C00', // مد جائز (4/5) — orange
  madda_obligatory: '#E01010', // مد واجب (4/5)
  madda_necessary: '#B00000', // مد لازم (6) — deepest

  // Green — ghunnah / nasalization
  ghunnah: '#16A34A',
  ikhafa: '#16A34A',
  ikhafa_shafawi: '#22C55E',
  idgham_ghunnah: '#15803D',
  idgham_shafawi: '#22C55E',
  iqlab: '#0D9488',

  // Blue — qalqalah
  qalaqah: '#1E88E5',

  // Purple — tafkhim (heavy). Most frequent rule; colouring it is what makes
  // the page look properly colour-coded rather than mostly black.
  tafkhim: '#8E44AD',
  tarqiq: null, // light articulation — left as ink

  // Indigo — assimilation without ghunnah (the merged letter)
  idgham_mutajanisayn: '#5C6BC0',
  idgham_mutaqaribayn: '#5C6BC0',

  // Gray — silent / not pronounced
  ham_wasl: '#A6A6A6',
  laam_shamsiyah: '#A6A6A6',
  slnt: '#A6A6A6',
  idgham_wo_ghunnah: '#A6A6A6',
};
