import moment from 'moment-jalaali';

moment.loadPersian({ dialect: 'persian-modern', usePersianDigits: false });

/**
 * Get today's date in Jalali format (YYYY/MM/DD) — consistent for DB and persianToGregorian
 */
export function getTodayJalali(): string {
  const m = moment();
  const y = m.jYear();
  const mo = String(m.jMonth() + 1).padStart(2, '0');
  const d = String(m.jDate()).padStart(2, '0');
  return `${y}/${mo}/${d}`;
}

const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';

function normalizeDigits(str: string): string {
  return str
    .replace(/[۰-۹]/g, (d) => String(PERSIAN_DIGITS.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String(ARABIC_DIGITS.indexOf(d)));
}

/**
 * Convert Persian date string to Gregorian (YYYY-MM-DD).
 * Accepts Y/M/D (1403/11/21) or D/M/Y (21/11/1403) and ۱۴۰۳/۰۱/۱۵
 */
export function persianToGregorian(persianDate: string): string {
  if (!persianDate) return '';
  const normalized = normalizeDigits(persianDate);
  const parts = normalized.split(/[/\-\.]/).map(Number);
  if (parts.length < 3) return '';
  let year: number;
  let month: number;
  let day: number;
  if (parts[0] > 31) {
    year = parts[0];
    month = parts[1];
    day = parts[2];
  } else if (parts[2] > 31) {
    day = parts[0];
    month = parts[1];
    year = parts[2];
  } else {
    if (parts[1] <= 12) {
      year = parts[0];
      month = parts[1];
      day = parts[2];
    } else {
      day = parts[0];
      month = parts[1];
      year = parts[2];
    }
  }
  const m = moment(`${year}/${month}/${day}`, 'jYYYY/jM/jD');
  if (!m.isValid()) return '';
  const d = m.toDate();
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const dy = String(d.getDate()).padStart(2, '0');
  return `${y}-${mo}-${dy}`;
}

/**
 * Convert Gregorian date (YYYY-MM-DD) to Persian format (YYYY/MM/DD)
 */
export function gregorianToPersian(gregorianDate: string): string {
  if (!gregorianDate) return '';
  const m = moment(gregorianDate);
  if (!m.isValid()) return '';
  const y = m.jYear();
  const mo = String(m.jMonth() + 1).padStart(2, '0');
  const d = String(m.jDate()).padStart(2, '0');
  return `${y}/${mo}/${d}`;
}

/**
 * Format a JS Date as Gregorian YYYY-MM-DD (local time)
 */
function toGregorianDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Get date range for preset: today, this_week, this_month
 * Returns { from: YYYY-MM-DD, to: YYYY-MM-DD } in Gregorian for DB comparison
 */
export function getDateRangeForPreset(
  preset: 'today' | 'this_week' | 'this_month'
): { from: string; to: string } {
  const now = new Date();
  const toStr = toGregorianDateStr(now);

  if (preset === 'today') {
    return { from: toStr, to: toStr };
  }

  if (preset === 'this_week') {
    // Week start: Saturday (Iran). getDay(): 0=Sun, 1=Mon, ..., 6=Sat
    const day = now.getDay();
    const daysToSaturday = day === 6 ? 0 : day + 1;
    const from = new Date(now);
    from.setDate(from.getDate() - daysToSaturday);
    from.setHours(0, 0, 0, 0);
    return { from: toGregorianDateStr(from), to: toStr };
  }

  // this_month: first day of current month (Gregorian)
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  return { from: toGregorianDateStr(from), to: toStr };
}

function toAsciiDigits(str: string): string {
  return str
    .replace(/[۰-۹]/g, (d) => String(PERSIAN_DIGITS.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String(ARABIC_DIGITS.indexOf(d)));
}

/**
 * Format a date for display in UI. Always shows Jalali (Shamsi).
 * Converts Gregorian (YYYY-MM-DD or YYYY/MM/DD) to Persian; passes through if already Persian.
 */
export function formatDateForDisplay(date: string): string {
  if (!date) return '';
  const trimmed = date.trim();
  if (!trimmed) return '';
  const ascii = toAsciiDigits(trimmed);
  const normalized = ascii.replace(/[/.]/g, '-');
  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    const year = parseInt(normalized.slice(0, 4), 10);
    if (year >= 1900 && year <= 2100) {
      return gregorianToPersian(normalized);
    }
  }
  return trimmed;
}

/**
 * Check if a session date falls within a date range (both in Gregorian YYYY-MM-DD)
 */
export function isDateInRange(
  sessionPersianDate: string,
  fromGregorian: string | null,
  toGregorian: string | null
): boolean {
  if (!fromGregorian && !toGregorian) return true;
  const sessionGregorian = persianToGregorian(sessionPersianDate);
  if (!sessionGregorian) return false;
  if (fromGregorian && sessionGregorian < fromGregorian) return false;
  if (toGregorian && sessionGregorian > toGregorian) return false;
  return true;
}
