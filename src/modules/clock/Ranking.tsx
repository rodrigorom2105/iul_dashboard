import React, { useState, useMemo } from 'react';
import type { Agent, Shift } from '../../types';
import Card from '../../components/Card';
import Avatar from '../../components/Avatar';
import Pill from '../../components/Pill';
import { ChevronRight, ArrowDown, ArrowUp } from '../../components/icons';
import { formatMinutes, relativeTime, fmtTime, getMinutesInTz, formatDateInTz, DISPLAY_TZ } from '../../utils/time';

type SortCol = 'name' | 'hours' | 'shifts' | 'status';
type SortDir = 'asc' | 'desc';

interface RankingProps {
  agents: Agent[];
  totalMaxMinutes: number;
}

export default function Ranking({ agents, totalMaxMinutes }: RankingProps) {
  const [sortBy, setSortBy] = useState<SortCol>('hours');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [expanded, setExpanded] = useState<string | null>(null);

  const sorted = useMemo(() => {
    const arr = [...agents];
    arr.sort((a, b) => {
      let av: string | number;
      let bv: string | number;
      if (sortBy === 'name') { av = a.displayName; bv = b.displayName; }
      else if (sortBy === 'shifts') { av = a.shiftsCount; bv = b.shiftsCount; }
      else if (sortBy === 'status') { av = a.currentlyClocked ? 1 : 0; bv = b.currentlyClocked ? 1 : 0; }
      else { av = a.totalMinutes; bv = b.totalMinutes; }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return arr;
  }, [agents, sortBy, sortDir]);

  function toggleSort(col: SortCol) {
    if (sortBy === col) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortBy(col); setSortDir(col === 'name' ? 'asc' : 'desc'); }
  }

  return (
    <Card padding={0} style={{ overflow: 'hidden' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 20px',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Ranking de agentes</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>
            Horas trabajadas en el periodo seleccionado
          </div>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
          {sorted.length} agente{sorted.length === 1 ? '' : 's'}
        </div>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr style={{ background: 'var(--bg)' }}>
            <th style={thStyle} />
            <Th sortable onClick={() => toggleSort('name')}>
              Agente <SortArrow col="name" sortBy={sortBy} sortDir={sortDir} />
            </Th>
            <Th sortable onClick={() => toggleSort('status')} align="center" width={90}>
              Estado <SortArrow col="status" sortBy={sortBy} sortDir={sortDir} />
            </Th>
            <Th sortable onClick={() => toggleSort('hours')} align="right" width={260}>
              Horas <SortArrow col="hours" sortBy={sortBy} sortDir={sortDir} />
            </Th>
            <Th sortable onClick={() => toggleSort('shifts')} align="right" width={90}>
              Turnos <SortArrow col="shifts" sortBy={sortBy} sortDir={sortDir} />
            </Th>
            <Th align="right" width={130}>Última actividad</Th>
            <th style={thStyle} />
          </tr>
        </thead>
        <tbody>
          {sorted.map((a, i) => (
            <RankRow
              key={a.discordUserId}
              agent={a}
              rank={i + 1}
              max={totalMaxMinutes || 1}
              expanded={expanded === a.discordUserId}
              onToggle={() => setExpanded((e) => (e === a.discordUserId ? null : a.discordUserId))}
            />
          ))}
          {sorted.length === 0 && (
            <tr>
              <td colSpan={7} style={{ padding: 32, textAlign: 'center', color: 'var(--text-3)' }}>
                Sin datos para el periodo.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </Card>
  );
}

const thStyle: React.CSSProperties = {
  padding: '10px 16px',
  fontSize: 10.5,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  color: 'var(--text-3)',
  textAlign: 'left',
  borderBottom: '1px solid var(--border)',
  whiteSpace: 'nowrap',
  userSelect: 'none',
};

function Th({ children, align = 'left', width, sortable, onClick }: {
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right';
  width?: number;
  sortable?: boolean;
  onClick?: () => void;
}) {
  return (
    <th
      style={{ ...thStyle, textAlign: align, width, cursor: sortable ? 'pointer' : 'default' }}
      onClick={onClick}
    >
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          justifyContent: align === 'right' ? 'flex-end' : align === 'center' ? 'center' : 'flex-start',
          width: '100%',
        }}
      >
        {children}
      </span>
    </th>
  );
}

function SortArrow({ col, sortBy, sortDir }: { col: SortCol; sortBy: SortCol; sortDir: SortDir }) {
  if (sortBy !== col) return <span style={{ opacity: 0.3 }}><ArrowDown size={10} /></span>;
  return sortDir === 'asc' ? <ArrowUp size={10} /> : <ArrowDown size={10} />;
}

const tdStyle: React.CSSProperties = {
  padding: '12px 16px',
  borderBottom: '1px solid var(--border)',
  verticalAlign: 'middle',
};

function lastActivityTime(agent: Agent): string | null {
  if (agent.shifts.length === 0) return null;
  const sorted = [...agent.shifts].sort(
    (a, b) => new Date(b.clockIn).getTime() - new Date(a.clockIn).getTime()
  );
  const last = sorted[0];
  return last.clockOut ?? last.clockIn;
}

function RankRow({ agent, rank, max, expanded, onToggle }: {
  agent: Agent;
  rank: number;
  max: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  const pct = max > 0 ? (agent.totalMinutes / max) * 100 : 0;
  const lastTime = lastActivityTime(agent);

  return (
    <>
      <tr
        onClick={onToggle}
        style={{
          cursor: 'pointer',
          background: expanded ? 'var(--bg-elev-2)' : 'transparent',
          transition: 'background .12s',
        }}
        onMouseEnter={(e) => { if (!expanded) (e.currentTarget as HTMLElement).style.background = 'var(--bg-elev-2)'; }}
        onMouseLeave={(e) => { if (!expanded) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
      >
        <td style={{ ...tdStyle, width: 36, color: 'var(--text-3)', paddingRight: 0 }}>
          <span
            style={{
              display: 'inline-flex',
              transition: 'transform .15s',
              transform: expanded ? 'rotate(90deg)' : 'none',
            }}
          >
            <ChevronRight size={12} />
          </span>
        </td>
        <td style={tdStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="font-mono tnum" style={{ minWidth: 18, color: 'var(--text-3)', fontSize: 11, textAlign: 'right' }}>
              {String(rank).padStart(2, '0')}
            </span>
            <Avatar name={agent.displayName} id={agent.discordUserId} size={26} />
            <span style={{ fontWeight: 500, color: 'var(--text)' }}>{agent.displayName}</span>
          </div>
        </td>
        <td style={{ ...tdStyle, textAlign: 'center' }}>
          {agent.currentlyClocked ? (
            <Pill tone="accent">
              <span className="live-dot" style={{ width: 6, height: 6 }} /> Activo
            </Pill>
          ) : (
            <Pill tone="neutral">Inactivo</Pill>
          )}
        </td>
        <td style={{ ...tdStyle, textAlign: 'right' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'flex-end' }}>
            <div
              style={{
                flex: 1,
                height: 6,
                background: 'var(--bg-elev-2)',
                borderRadius: 99,
                overflow: 'hidden',
                maxWidth: 160,
              }}
            >
              <div
                style={{
                  width: `${pct}%`,
                  height: '100%',
                  background: agent.currentlyClocked
                    ? 'linear-gradient(90deg, var(--accent), var(--accent-strong))'
                    : 'linear-gradient(90deg, var(--info), #6366f1)',
                  borderRadius: 99,
                  transition: 'width .4s',
                }}
              />
            </div>
            <span
              className="font-mono tnum"
              style={{ fontWeight: 600, color: 'var(--text)', minWidth: 56, textAlign: 'right' }}
            >
              {formatMinutes(agent.totalMinutes)}
            </span>
          </div>
        </td>
        <td className="font-mono tnum" style={{ ...tdStyle, textAlign: 'right', color: 'var(--text)' }}>
          {agent.shiftsCount}
        </td>
        <td className="font-mono" style={{ ...tdStyle, textAlign: 'right', color: 'var(--text-2)' }}>
          {lastTime ? relativeTime(lastTime) : '—'}
        </td>
        <td style={{ ...tdStyle, width: 16 }} />
      </tr>
      {expanded && (
        <tr>
          <td
            colSpan={7}
            style={{ padding: 0, background: 'var(--bg-elev-2)', borderTop: '1px solid var(--border)' }}
          >
            <ShiftTimelineExpanded shifts={agent.shifts} />
          </td>
        </tr>
      )}
    </>
  );
}

function ShiftTimelineExpanded({ shifts }: { shifts: Shift[] }) {
  if (shifts.length === 0) {
    return (
      <div style={{ padding: 20, color: 'var(--text-3)', fontSize: 12 }}>
        Sin turnos en el periodo.
      </div>
    );
  }

  // Group by day (up to 10 most recent)
  const sorted = [...shifts].sort((a, b) => new Date(b.clockIn).getTime() - new Date(a.clockIn).getTime());
  const byDay: Record<string, Shift[]> = {};
  sorted.forEach((s) => {
    const key = formatDateInTz(new Date(s.clockIn));
    if (!byDay[key]) byDay[key] = [];
    byDay[key].push(s);
  });
  const days = Object.keys(byDay).slice(0, 10);

  return (
    <div style={{ padding: '14px 20px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      {days.map((day) => {
        const items = byDay[day];
        const totalDayMins = items.reduce((s, sh) => {
          const inMins = getMinutesInTz(new Date(sh.clockIn));
          const rawOut = sh.clockOut
            ? getMinutesInTz(new Date(sh.clockOut))
            : getMinutesInTz(new Date());
          const outMins = rawOut < inMins ? 1440 : rawOut;
          return s + Math.max(0, Math.min(1440, outMins) - inMins);
        }, 0);
        return (
          <div key={day} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 80, fontSize: 11, color: 'var(--text-3)', flexShrink: 0 }}>
              {new Date(day + 'T12:00:00Z').toLocaleDateString('es-MX', { weekday: 'short', day: '2-digit', month: 'short', timeZone: DISPLAY_TZ })}
            </div>
            <div style={{ position: 'relative', flex: 1, height: 22 }}>
              <DayTrack shifts={items} />
            </div>
            <div
              className="font-mono tnum"
              style={{ fontSize: 11, color: 'var(--text-2)', minWidth: 60, textAlign: 'right' }}
            >
              {formatMinutes(totalDayMins)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DayTrack({ shifts }: { shifts: Shift[] }) {
  const DAY_MINS = 24 * 60;

  return (
    <div
      style={{
        position: 'relative',
        height: '100%',
        background: 'var(--bg)',
        borderRadius: 6,
        border: '1px solid var(--border)',
      }}
    >
      {[6, 12, 18].map((h) => {
        const pct = (h * 60 / DAY_MINS) * 100;
        return (
          <div
            key={h}
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: `${pct}%`,
              width: 1,
              background: 'var(--border)',
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: -13,
                left: -8,
                fontSize: 9,
                color: 'var(--text-3)',
                fontFamily: 'JetBrains Mono, monospace',
              }}
            >
              {h}h
            </span>
          </div>
        );
      })}
      {shifts.map((s, i) => {
        const isOpen = s.clockOut === null;
        const inMins = getMinutesInTz(new Date(s.clockIn));
        const rawOutMins = s.clockOut
          ? getMinutesInTz(new Date(s.clockOut))
          : getMinutesInTz(new Date());
        // Wrap closed shifts that cross midnight
        const outMins = (!isOpen && rawOutMins < inMins) ? rawOutMins + DAY_MINS : rawOutMins;
        const clampedOut = Math.min(outMins, DAY_MINS);
        const startPct = (inMins / DAY_MINS) * 100;
        const widthPct = Math.max(0.5, (clampedOut - inMins) / DAY_MINS * 100);
        return (
          <div
            key={i}
            title={`${fmtTime(new Date(s.clockIn))} → ${s.clockOut ? fmtTime(new Date(s.clockOut)) : 'abierto'}`}
            style={{
              position: 'absolute',
              top: 3,
              bottom: 3,
              left: `${startPct}%`,
              width: `${widthPct}%`,
              background: isOpen ? 'var(--warn-soft)' : 'var(--accent-soft)',
              border: `1px solid ${isOpen ? 'var(--warn)' : 'var(--accent)'}`,
              borderRadius: 4,
              cursor: 'pointer',
            }}
          />
        );
      })}
    </div>
  );
}
