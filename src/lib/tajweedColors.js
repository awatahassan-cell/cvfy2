// Tajweed colours matched to the iQuran Lite scheme (the reference the user
// uses). These are the standard six noon/meem-sakin + qalqala rules, each with
// its own vivid colour so the page reads as a proper colour-coded mushaf:
//
//   Ghunna (نّ / مّ) .................. Orange
//   Ikhfa'a ........................... Red
//   Idgham (with ghunna) .............. Purple
//   Idgham without ghunna ............. Gray
//   Iqlab ............................. Blue
//   Qalqala ........................... Green
//
// Natural madd, tafkhim and hamzat-wasl are left as ink (black) exactly like
// iQuran Lite — colouring the ever-present hamzat-wasl gray was what made the
// page look washed-out gray before.
export const TAJWEED_COLORS = {
  // Orange — ghunnah (nasalization of نّ / مّ)
  ghunnah: '#FF7A00',

  // Red — ikhfa'a (hiding)
  ikhafa: '#F5261F',
  ikhafa_shafawi: '#F5261F',

  // Purple — idgham with ghunna (merging)
  idgham_ghunnah: '#C93FE0',
  idgham_shafawi: '#C93FE0',

  // Blue — iqlab (flipping noon into meem)
  iqlab: '#1E90FF',

  // Green — qalqala (echoing: ق ط ب ج د with sukoon)
  qalaqah: '#12B000',

  // Gray — merged / silent (not pronounced distinctly)
  idgham_wo_ghunnah: '#9E9E9E',
  idgham_mutajanisayn: '#9E9E9E',
  idgham_mutaqaribayn: '#9E9E9E',
  slnt: '#9E9E9E',

  // Left as ink (black) to match iQuran Lite — not colour-coded there
  madda_normal: null,
  madda_permissible: null,
  madda_obligatory: null,
  madda_necessary: null,
  tafkhim: null,
  tarqiq: null,
  ham_wasl: null,
  laam_shamsiyah: null,
};
