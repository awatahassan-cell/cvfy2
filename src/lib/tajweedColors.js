// Full color-coded tajweed scheme (Dar Al-Maarifa family), tuned so the page
// reads as a proper coloured mushaf rather than mostly black + gray:
//   Red family   → المدود (madd / elongation), graduated by strength
//   Green family → الغنة (ghunnah / nasalization: ikhfa, idgham bi-ghunnah, iqlab)
//   Blue         → القلقلة (qalqalah)
//   Gray         → الحروف التي لا تُلفظ (silent / merged letters)
//
// Natural madd (madda_normal) is now coloured a soft red — it appears in almost
// every ayah, so leaving it black made short surahs look under-coloured. Only
// tafkhim/tarqiq stay uncoloured: the package's tafkhim rule fires on every
// heavy letter and would flood the whole page.
export const TAJWEED_COLORS = {
  // Red — madd (elongation), graduated: natural (soft) → necessary (deep)
  madda_normal: '#E8746B', // مد طبيعي (2) — soft red
  madda_permissible: '#EA1A1A', // مد جائز (4/5)
  madda_obligatory: '#EA1A1A', // مد واجب (4/5)
  madda_necessary: '#C40000', // مد لازم (6) — deepest

  // Green — ghunnah / nasalization
  ghunnah: '#1DA53F',
  ikhafa: '#1DA53F',
  ikhafa_shafawi: '#2FB94F',
  idgham_ghunnah: '#1DA53F',
  idgham_shafawi: '#2FB94F',
  iqlab: '#0F9E7A',

  // Blue — qalqalah
  qalaqah: '#1F7AE0',

  // Gray — silent / merged (not pronounced distinctly)
  ham_wasl: '#A0A0A0',
  laam_shamsiyah: '#A0A0A0',
  slnt: '#A0A0A0',
  idgham_wo_ghunnah: '#A0A0A0',
  idgham_mutajanisayn: '#A0A0A0',
  idgham_mutaqaribayn: '#A0A0A0',

  // Uncolored — kept black (heavy/light articulation, not a color-coded rule)
  tafkhim: null,
  tarqiq: null,
};
