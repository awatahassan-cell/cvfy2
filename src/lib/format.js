// Arabic-Indic numeral + time formatting helpers.
const AR_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

export function toArabicDigits(input) {
  return String(input).replace(/[0-9]/g, (d) => AR_DIGITS[+d]);
}

export function formatTime(ms) {
  const total = Math.max(0, Math.floor((ms || 0) / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${toArabicDigits(m)}:${toArabicDigits(s < 10 ? '0' + s : s)}`;
}
