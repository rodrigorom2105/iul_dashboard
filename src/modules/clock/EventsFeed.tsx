import { useMemo, useState } from 'react';
import { useEvents } from './hooks';
import type { ClockEvent } from '../../types';
import Card from '../../components/Card';
import Avatar from '../../components/Avatar';
import { ArrowRight, LogOut, AlertTriangle } from '../../components/icons';
import { fmtTime, formatDateInTz, DISPLAY_TZ } from '../../utils/time';

const PER_PAGE = 18;

interface EventsFeedProps {
  from: string;
  to: string;
  discordUserId?: string;
}

export default function EventsFeed({ from, to, discordUserId }: EventsFeedProps) {
  const [offset, setOffset] = useState(0);

  const { data, isLoading } = useEvents({
    from,
    to,
    discordUserId,
    limit: PER_PAGE,
    offset,
  });

  const total = data?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));

  const grouped = useMemo(() => {
    const events = data?.events ?? [];
    const out: ({ kind: 'day'; date: Date } | { kind: 'event'; e: ClockEvent })[] = [];
    let lastDay: string | null = null;
    events.forEach((e) => {
      const d = new Date(e.eventAt);
      const dayKey = formatDateInTz(d);
      if (dayKey !== lastDay) {
        out.push({ kind: 'day', date: d });
        lastDay = dayKey;
      }
      out.push({ kind: 'event', e });
    });
    return out;
  }, [data?.events]);

  return (
    <Card padding={0} style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
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
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Feed de eventos</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>
            Cronología de clock-ins y clock-outs
          </div>
        </div>
        <div className="font-mono" style={{ fontSize: 11, color: 'var(--text-3)' }}>
          {total} evento{total === 1 ? '' : 's'}
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', maxHeight: 720 }}>
        {isLoading ? (
          <div style={{ padding: 24 }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 44, marginBottom: 6 }} />
            ))}
          </div>
        ) : grouped.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-3)', fontSize: 12 }}>
            Sin eventos en este rango.
          </div>
        ) : grouped.map((item, idx) => {
          if (item.kind === 'day') {
            return (
              <div
                key={`d${idx}`}
                style={{
                  padding: '10px 20px 6px',
                  position: 'sticky',
                  top: 0,
                  zIndex: 1,
                  background: 'var(--bg-elev)',
                  borderTop: idx > 0 ? '1px solid var(--border)' : 'none',
                }}
              >
                <div
                  style={{
                    fontSize: 10.5,
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    color: 'var(--text-3)',
                    fontWeight: 600,
                  }}
                >
                  {item.date.toLocaleDateString('es-MX', { weekday: 'long', day: '2-digit', month: 'long', timeZone: DISPLAY_TZ })}
                </div>
              </div>
            );
          }
          return <EventRow key={item.e.id} ev={item.e} />;
        })}
      </div>

      {pages > 1 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 20px',
            borderTop: '1px solid var(--border)',
            fontSize: 11,
          }}
        >
          <button
            onClick={() => setOffset((o) => Math.max(0, o - PER_PAGE))}
            disabled={offset === 0}
            style={pagerBtnStyle(offset === 0)}
          >
            ← Anterior
          </button>
          <span className="font-mono" style={{ color: 'var(--text-3)' }}>
            {offset + 1}–{Math.min(total, offset + PER_PAGE)} de {total}
          </span>
          <button
            onClick={() => setOffset((o) => o + PER_PAGE)}
            disabled={offset + PER_PAGE >= total}
            style={pagerBtnStyle(offset + PER_PAGE >= total)}
          >
            Siguiente →
          </button>
        </div>
      )}
    </Card>
  );
}

function pagerBtnStyle(disabled: boolean): React.CSSProperties {
  return {
    background: 'var(--bg-elev-2)',
    border: '1px solid var(--border)',
    color: disabled ? 'var(--text-3)' : 'var(--text)',
    padding: '5px 10px',
    borderRadius: 7,
    fontSize: 11,
    fontWeight: 500,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    fontFamily: 'inherit',
  };
}

function EventRow({ ev }: { ev: ClockEvent }) {
  const isIn = ev.action === 'CLOCKIN';
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 20px',
        borderTop: '1px solid var(--border)',
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          background: isIn ? 'var(--accent-soft)' : 'var(--neg-soft)',
          border: `1px solid ${isIn ? 'rgba(52,211,153,0.25)' : 'rgba(248,113,113,0.25)'}`,
          color: isIn ? 'var(--accent)' : 'var(--neg)',
          display: 'grid',
          placeItems: 'center',
          flexShrink: 0,
        }}
      >
        {isIn ? <ArrowRight size={13} /> : <LogOut size={13} />}
      </div>
      <Avatar name={ev.displayName} id={ev.discordUserId} size={22} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 12.5,
            fontWeight: 500,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            color: 'var(--text)',
          }}
        >
          {ev.displayName}
        </div>
        <div style={{ fontSize: 10.5, color: 'var(--text-3)' }}>
          {isIn ? 'Inició turno' : 'Cerró turno'}
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div className="font-mono tnum" style={{ fontSize: 12, color: 'var(--text)' }}>
          {fmtTime(new Date(ev.eventAt))}
        </div>
        {!ev.sheetsSynced && (
          <div
            className="font-mono"
            style={{
              fontSize: 9,
              color: 'var(--warn)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 3,
              marginTop: 2,
            }}
          >
            <AlertTriangle size={9} /> sin sync
          </div>
        )}
      </div>
    </div>
  );
}
