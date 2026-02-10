const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';

/** Converts Persian/Arabic digits to English digits for parsing. */
export function toEnglishNumber(value: string): string {
  const persian = '۰۱۲۳۴۵۶۷۸۹';
  const arabic = '٠١٢٣٤٥٦٧٨٩';
  let result = value;
  for (let i = 0; i < 10; i++) {
    result = result.replace(new RegExp(persian[i], 'g'), String(i));
    result = result.replace(new RegExp(arabic[i], 'g'), String(i));
  }
  return result;
}

export function toPersianNumber(value: number | string): string {
  const str = String(value);
  return str.replace(/\d/g, (d) => PERSIAN_DIGITS[parseInt(d, 10)]);
}

export function toPersianWithSeparator(value: number): string {
  return toPersianNumber(value.toLocaleString('fa-IR'));
}
