export type { Agent, Shift, SummaryResponse, ClockEvent, EventsResponse } from '../../types';

export type RangePresetKey =
  | 'today'
  | 'yesterday'
  | 'this_week'
  | 'last_week'
  | 'this_month'
  | 'last_month'
  | 'custom';

export type SortColumn = 'displayName' | 'totalMinutes' | 'shiftsCount' | 'lastActivity';
export type SortDir = 'asc' | 'desc';
