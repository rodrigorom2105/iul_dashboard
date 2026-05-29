import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subDays,
  subMonths,
  subWeeks,
} from 'date-fns';
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';

export const DISPLAY_TZ = 'America/Los_Angeles';

export function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function fmtHoursDecimal(minutes: number): string {
  return (minutes / 60).toFixed(1);
}

export function minsToClock(mins: number): string {
  if (mins == null) return '—';
  const wrapped = Math.round(mins) % 1440;
  const h = Math.floor(wrapped / 60);
  const m = wrapped % 60;
  return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
}

export function fmtTime(date: Date | string): string {
  return new Date(date).toLocaleTimeString('es-MX', {
    hour: '2-digit', minute: '2-digit', hour12: false, timeZone: DISPLAY_TZ,
  });
}

export function fmtTimeSec(date: Date | string): string {
  return new Date(date).toLocaleTimeString('es-MX', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: DISPLAY_TZ,
  });
}

export function fmtDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('es-MX', {
    day: '2-digit', month: 'short', timeZone: DISPLAY_TZ,
  });
}

export function relativeTime(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return `hace ${Math.floor(diff)}s`;
  if (diff < 3600) return `hace ${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`;
  return `hace ${Math.floor(diff / 86400)}d`;
}

/** @deprecated use relativeTime for Spanish copy */
export function formatRelative(iso: string): string {
  return relativeTime(iso);
}

export function formatInTz(iso: string, fmt: string): string {
  return formatInTimeZone(new Date(iso), DISPLAY_TZ, fmt);
}

export type RangePresetKey =
  | 'today'
  | 'yesterday'
  | 'this_week'
  | 'last_week'
  | 'this_month'
  | 'last_month'
  | 'custom';

export interface DateRange {
  from: string;
  to: string;
}

function nowInTz(): Date {
  return toZonedTime(new Date(), DISPLAY_TZ);
}

export function getRangePreset(preset: Exclude<RangePresetKey, 'custom'>): DateRange {
  const nowLocal = nowInTz();
  const now = new Date();

  switch (preset) {
    case 'today': {
      const start = startOfDay(nowLocal);
      return { from: toUtcIso(start), to: now.toISOString() };
    }
    case 'yesterday': {
      const yesterday = subDays(nowLocal, 1);
      return {
        from: toUtcIso(startOfDay(yesterday)),
        to: toUtcIso(endOfDay(yesterday)),
      };
    }
    case 'this_week': {
      const start = startOfWeek(nowLocal, { weekStartsOn: 1 });
      return { from: toUtcIso(start), to: now.toISOString() };
    }
    case 'last_week': {
      const lastWeek = subWeeks(nowLocal, 1);
      return {
        from: toUtcIso(startOfWeek(lastWeek, { weekStartsOn: 1 })),
        to: toUtcIso(endOfWeek(lastWeek, { weekStartsOn: 1 })),
      };
    }
    case 'this_month': {
      const start = startOfMonth(nowLocal);
      return { from: toUtcIso(start), to: now.toISOString() };
    }
    case 'last_month': {
      const lastMonth = subMonths(nowLocal, 1);
      return {
        from: toUtcIso(startOfMonth(lastMonth)),
        to: toUtcIso(endOfMonth(lastMonth)),
      };
    }
  }
}

function toUtcIso(zonedDate: Date): string {
  return zonedDate.toISOString();
}

/** Returns the minutes of day (0–1439) for a date in LA timezone. */
export function getMinutesInTz(date: Date): number {
  const str = formatInTimeZone(date, DISPLAY_TZ, 'H:m');
  const [h, m] = str.split(':').map(Number);
  return h * 60 + m;
}

/** Returns a "YYYY-MM-DD" string for a date in LA timezone. */
export function formatDateInTz(date: Date): string {
  return formatInTimeZone(date, DISPLAY_TZ, 'yyyy-MM-dd');
}

/** Returns the UTC Date corresponding to 00:00:00 LA time on the same day as `date`. */
export function startOfDayInTz(date: Date): Date {
  const laDate = formatInTimeZone(date, DISPLAY_TZ, 'yyyy-MM-dd');
  const offset = formatInTimeZone(date, DISPLAY_TZ, 'xxx');
  return new Date(`${laDate}T00:00:00${offset}`);
}

/** Converts an ISO UTC string to a datetime-local input value in LA timezone. */
export function isoToLocalInput(iso: string): string {
  return formatInTimeZone(new Date(iso), DISPLAY_TZ, "yyyy-MM-dd'T'HH:mm");
}

/**
 * Converts a datetime-local input value (treated as LA timezone) to a UTC ISO string.
 * localStr format: "YYYY-MM-DDTHH:mm"
 */
export function localInputToIso(localStr: string): string {
  const approxUtc = new Date(localStr + ':00Z');
  const offset = formatInTimeZone(approxUtc, DISPLAY_TZ, 'xxx');
  return new Date(`${localStr}:00${offset}`).toISOString();
}

export const PRESET_LABELS: Record<Exclude<RangePresetKey, 'custom'>, string> = {
  today: 'Hoy',
  yesterday: 'Ayer',
  this_week: 'Esta semana',
  last_week: 'Semana pasada',
  this_month: 'Este mes',
  last_month: 'Mes pasado',
};
