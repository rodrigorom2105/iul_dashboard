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
  formatDistanceToNow,
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

export function formatRelative(iso: string): string {
  return formatDistanceToNow(new Date(iso), { addSuffix: true });
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
  | 'last_month';

export interface DateRange {
  from: string;
  to: string;
}

function nowInTz(): Date {
  return toZonedTime(new Date(), DISPLAY_TZ);
}

export function getRangePreset(preset: RangePresetKey): DateRange {
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

export const PRESET_LABELS: Record<RangePresetKey, string> = {
  today: 'Hoy',
  yesterday: 'Ayer',
  this_week: 'Esta semana',
  last_week: 'Semana pasada',
  this_month: 'Este mes',
  last_month: 'Mes pasado',
};
