import type { Agent } from '../../types';
import SectionLabel from '../../components/SectionLabel';
import { fmtHoursDecimal, formatMinutes } from '../../utils/time';

interface PeriodMetricsProps {
  agents: Agent[];
  rangeLabel: string;
}

export default function PeriodMetrics({ agents, rangeLabel }: PeriodMetricsProps) {
  const totalMin = agents.reduce((s, a) => s + a.totalMinutes, 0);
  const totalShifts = agents.reduce((s, a) => s + a.shiftsCount, 0);
  const withShifts = agents.filter((a) => a.shiftsCount > 0).length;
  const avgPerAgent = withShifts ? totalMin / withShifts : 0;
  const top = [...agents].sort((a, b) => b.totalMinutes - a.totalMinutes)[0];

  return (
    <div>
      <SectionLabel hint={rangeLabel}>Resumen del periodo</SectionLabel>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 1,
          background: 'var(--border)',
          border: '1px solid var(--border)',
          borderRadius: 14,
          overflow: 'hidden',
        }}
      >
        <Tile
          label="Horas totales"
          value={fmtHoursDecimal(totalMin)}
          unit="h"
          sub={formatMinutes(totalMin)}
        />
        <Tile
          label="Promedio por agente"
          value={fmtHoursDecimal(avgPerAgent)}
          unit="h"
          sub={`${withShifts} con actividad`}
        />
        <Tile
          label="Turnos registrados"
          value={String(totalShifts)}
          sub={`${(totalShifts / Math.max(1, withShifts)).toFixed(1)} por agente`}
        />
        <Tile
          label="Top agente"
          value={top?.displayName.split(' ')[0] ?? '—'}
          valueClass="text"
          sub={top ? formatMinutes(top.totalMinutes) : ''}
          highlight
        />
      </div>
    </div>
  );
}

interface TileProps {
  label: string;
  value: string;
  unit?: string;
  sub?: string;
  valueClass?: 'mono' | 'text';
  highlight?: boolean;
}

function Tile({ label, value, unit, sub, valueClass = 'mono', highlight }: TileProps) {
  return (
    <div style={{ background: 'var(--bg-elev)', padding: '16px 20px', position: 'relative' }}>
      <div
        style={{
          textTransform: 'uppercase',
          fontSize: 10.5,
          fontWeight: 600,
          letterSpacing: '0.12em',
          color: 'var(--text-3)',
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <div
          className={`tnum ${valueClass === 'mono' ? 'font-mono' : ''}`}
          style={{
            fontSize: valueClass === 'mono' ? 30 : 22,
            fontWeight: 600,
            letterSpacing: '-0.02em',
            color: highlight ? 'var(--accent)' : 'var(--text)',
            lineHeight: 1,
          }}
        >
          {value}
        </div>
        {unit && (
          <div style={{ fontSize: 13, color: 'var(--text-3)', fontWeight: 400 }}>{unit}</div>
        )}
      </div>
      {sub && (
        <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 8 }}>{sub}</div>
      )}
    </div>
  );
}
