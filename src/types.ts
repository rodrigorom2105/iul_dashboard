export interface Agent {
  discordUserId: string;
  displayName: string;
  totalMinutes: number;
  shiftsCount: number;
  currentlyClocked: boolean;
  shifts: Shift[];
}

export interface Shift {
  clockIn: string;
  clockOut: string | null;
  durationMinutes: number | null;
}

export interface SummaryResponse {
  range: { from: string; to: string };
  agents: Agent[];
}

export interface ClockEvent {
  id: number;
  discordUserId: string;
  displayName: string;
  action: 'CLOCKIN' | 'CLOCKOUT';
  eventAt: string;
  sheetsSynced: boolean;
}

export interface EventsResponse {
  events: ClockEvent[];
  total: number;
  limit: number;
  offset: number;
}

export interface DashboardUser {
  id: number;
  username: string;
}

export interface AuthState {
  token: string;
  user: DashboardUser;
  expiresAt: string;
}
