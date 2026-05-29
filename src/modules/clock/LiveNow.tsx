import { useEffect, useState } from 'react';
import type { Agent } from '../../types';
import Card from '../../components/Card';
import Avatar from '../../components/Avatar';
import Pill from '../../components/Pill';
import { AlertTriangle } from '../../components/icons';
import { fmtTime, formatMinutes } from '../../utils/time';
import { useLiveAgents } from './hooks';

export default function LiveNow() {
  const { data: agents = [] } = useLiveAgents();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  const live = agents.filter((a) => a.currentlyClocked);
  const longShifts = live.filter((a) => {
    const since = getOpenShiftStart(a);
    return since != null && now - since.getTime() > 12 * 3600 * 1000;
  });

  return (
    <Card padding={0} style={{ overflow: 'hidden' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 20px',
          borderBottom: '1px solid var(--border)',
          background: 'linear-gradient(180deg, rgba(52,211,153,0.04), transparent)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="live-dot" />
          <div>
            <div
              style={{
                textTransform: 'uppercase',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.14em',
                color: 'var(--accent)',
              }}
            >
              Live · Ahora mismo
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>
              Estado en tiempo real · no se filtra por fechas
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {longShifts.length > 0 && (
            <Pill tone="warn">
              <AlertTriangle size={11} />
              {longShifts.length} turno{longShifts.length === 1 ? '' : 's'} &gt;12h
            </Pill>
          )}
          <div
            className="font-mono tnum"
            style={{
              fontSize: 28,
              fontWeight: 600,
              letterSpacing: '-0.02em',
              lineHeight: 1,
              color: 'var(--text)',
            }}
          >
            {String(live.length).padStart(2, '0')}
            <span style={{ fontSize: 14, color: 'var(--text-3)', fontWeight: 400 }}>
              {' '}/ {agents.length}
            </span>
          </div>
        </div>
      </div>

      {live.length === 0 ? (
        <div style={{ padding: '24px 20px', textAlign: 'center', color: 'var(--text-3)', fontSize: 12 }}>
          Sin agentes clockeados en este momento.
        </div>
      ) : (
        <div
          style={{
            padding: 12,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 8,
          }}
        >
          {live.map((a) => <LiveCard key={a.discordUserId} agent={a} />)}
        </div>
      )}
    </Card>
  );
}

function getOpenShiftStart(agent: Agent): Date | null {
  const openShift = agent.shifts.find((s) => s.clockOut === null);
  return openShift ? new Date(openShift.clockIn) : null;
}

function LiveCard({ agent }: { agent: Agent }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const since = getOpenShiftStart(agent);
  const mins = since ? Math.floor((now - since.getTime()) / 60000) : 0;
  const seconds = since ? Math.floor((now - since.getTime()) / 1000) % 60 : 0;
  const isLong = mins > 12 * 60;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 12px',
        background: 'var(--bg-elev-2)',
        border: `1px solid ${isLong ? 'rgba(251,191,36,0.3)' : 'var(--border)'}`,
        borderRadius: 10,
        position: 'relative',
      }}
    >
      <div style={{ position: 'relative' }}>
        <Avatar name={agent.displayName} id={agent.discordUserId} size={36} />
        <span
          style={{
            position: 'absolute',
            bottom: -1,
            right: -1,
            width: 10,
            height: 10,
            borderRadius: 999,
            background: isLong ? 'var(--warn)' : 'var(--accent)',
            border: '2px solid var(--bg-elev-2)',
          }}
        />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 500,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            color: 'var(--text)',
          }}
        >
          {agent.displayName}
        </div>
        <div className="font-mono" style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>
          {since ? `desde ${fmtTime(since)}` : 'turno previo al rango'}
        </div>
      </div>
      {since ? (
        <div
          className="font-mono tnum"
          style={{
            textAlign: 'right',
            fontSize: 14,
            fontWeight: 600,
            color: isLong ? 'var(--warn)' : 'var(--text)',
            letterSpacing: '-0.01em',
            minWidth: 72,
          }}
        >
          {formatMinutes(mins)}
          <div style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 400, letterSpacing: 0 }}>
            {String(seconds).padStart(2, '0')}s
          </div>
        </div>
      ) : (
        <div
          className="font-mono"
          style={{ textAlign: 'right', fontSize: 14, color: 'var(--text-3)', minWidth: 72 }}
        >
          —
        </div>
      )}
    </div>
  );
}
