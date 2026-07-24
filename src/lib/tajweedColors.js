// Tajweed colors matching the standard Dar Al-Maarifa color-coded Mushaf:
//   Red   → المدود (madd / elongation)
//   Green → الغنة (ghunnah / nasalization: ikhfa, idgham bi-ghunnah, iqlab)
//   Blue  → القلقلة (qalqalah)
//   Gray  → الحروف التي لا تُلفظ (silent letters)
//
// Natural madd (madda_normal) and tafkhim are left uncolored: the mushaf keeps
// the bulk of the text black and only marks the rules above. (The package's
// tafkhim rule fires on every heavy letter, which would flood the page with
// blue and not resemble the printed mushaf.)
export const TAJWEED_COLORS = {
  // Gray — silent / not pronounced
  ham_wasl: '#A0A0A0',
  laam_shamsiyah: '#A0A0A0',
  slnt: '#A0A0A0',
  idgham_wo_ghunnah: '#A0A0A0',
  idgham_mutajanisayn: '#A0A0A0',
  idgham_mutaqaribayn: '#A0A0A0',

  // Red — madd (elongation). Natural madd stays the ink color.
  madda_normal: null,
  madda_permissible: '#EA1A1A',
  madda_obligatory: '#EA1A1A',
  madda_necessary: '#D10000',

  // Green — ghunnah / nasalization
  ghunnah: '#1DA53F',
  ikhafa: '#1DA53F',
  ikhafa_shafawi: '#1DA53F',
  idgham_ghunnah: '#1DA53F',
  idgham_shafawi: '#1DA53F',
  iqlab: '#1DA53F',

  // Blue — qalqalah
  qalaqah: '#1F7AE0',

  // Uncolored — kept black to match the printed mushaf
  tafkhim: null,
  tarqiq: null,
};
