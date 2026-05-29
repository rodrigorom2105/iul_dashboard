import { useEffect, useMemo } from 'react';
import { useSearchParams, Navigate } from 'react-router-dom';
import { useSummary, useLiveAgents } from './hooks';
import { getRangePreset, fmtDate } from '../../utils/time';
import { useLiveCount } from '../../layout/LiveCountContext';
import type { RangePresetKey } from './types';
import TopBar from './TopBar';
import LiveNow from './LiveNow';
import PeriodMetrics from './PeriodMetrics';
import Ranking from './Ranking';
import EventsFeed from './EventsFeed';
import InOutChart from './InOutChart';

export default function ClockPage() {
  const [searchParams] = useSearchParams();
  const preset = (searchParams.get('preset') ?? 'today') as RangePresetKey;
  const hasRange = searchParams.has('from') && searchParams.has('to');

  if (!hasRange && preset !== 'custom') {
    const range = getRangePreset(preset as Exclude<RangePresetKey, 'custom'>);
    const params = new URLSearchParams({ preset, from: range.from, to: range.to });
    return <Navigate to={`?${params}`} replace />;
  }

  return <ClockPageContent />;
}

function ClockPageContent() {
  const [searchParams] = useSearchParams();
  const { setLiveCount } = useLiveCount();

  const from = searchParams.get('from') ?? '';
  const to = searchParams.get('to') ?? '';
  const agentId = searchParams.get('agent') ?? undefined;
  const preset = (searchParams.get('preset') ?? 'today') as RangePresetKey;
  const liveEnd = ['today', 'this_week', 'this_month'].includes(preset);

  const { data, isLoading, isError, refetch } = useSummary(from, to, liveEnd);
  const { data: liveAgents = [] } = useLiveAgents();

  const allAgents = data?.agents ?? [];
  const filteredAgents = agentId
    ? allAgents.filter((a) => a.discordUserId === agentId)
    : allAgents;

  const totalMaxMinutes = useMemo(
    () => allAgents.reduce((m, a) => Math.max(m, a.totalMinutes), 0),
    [allAgents]
  );

  const liveCount = liveAgents.filter((a) => a.currentlyClocked).length;
  useEffect(() => {
    setLiveCount(liveCount);
  }, [liveCount, setLiveCount]);

  const rangeLabel = useMemo(() => {
    if (!from || !to) return '';
    const opts: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short' };
    return `${new Date(from).toLocaleDateString('es-MX', opts)} – ${new Date(to).toLocaleDateString('es-MX', opts)}`;
  }, [from, to]);

  return (
    <>
      <TopBar agents={allAgents} />
      <main
        style={{
          padding: '24px 28px 56px',
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
          maxWidth: 1480,
          width: '100%',
          margin: '0 auto',
        }}
      >
        {isError ? (
          <div
            style={{
              background: 'var(--bg-elev)',
              border: '1px solid var(--border)',
              borderRadius: 14,
              padding: 32,
              textAlign: 'center',
            }}
          >
            <p style={{ color: 'var(--text-3)', marginBottom: 12 }}>Error al cargar los datos.</p>
            <button
              onClick={() => void refetch()}
              style={{
                padding: '8px 16px',
                background: 'var(--accent)',
                color: '#0a0c10',
                border: 'none',
                borderRadius: 8,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: 13,
              }}
            >
              Reintentar
            </button>
          </div>
        ) : (
          <>
            <div className="fade-in">
              <LiveNow />
            </div>

            <div className="fade-in" style={{ animationDelay: '60ms' }}>
              {isLoading ? (
                <PeriodMetricsSkeleton />
              ) : (
                <PeriodMetrics agents={filteredAgents} rangeLabel={rangeLabel} />
              )}
            </div>

            <div
              className="fade-in"
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1.55fr) minmax(320px, 1fr)',
                gap: 20,
                animationDelay: '120ms',
              }}
            >
              {isLoading ? (
                <>
                  <div className="skeleton" style={{ height: 400, borderRadius: 14 }} />
                  <div className="skeleton" style={{ height: 400, borderRadius: 14 }} />
                </>
              ) : (
                <>
                  <Ranking agents={filteredAgents} totalMaxMinutes={totalMaxMinutes} />
                  <EventsFeed key={`${from}|${to}|${agentId ?? ''}`} from={from} to={to} discordUserId={agentId} liveEnd={liveEnd} />
                </>
              )}
            </div>

            <div className="fade-in" style={{ animationDelay: '180ms' }}>
              {!isLoading && <InOutChart agents={allAgents} />}
            </div>
          </>
        )}

        <footer style={{ paddingTop: 12, color: 'var(--text-3)', fontSize: 11, textAlign: 'center' }}>
          IUL Dashboard · {fmtDate(new Date())}
        </footer>
      </main>
    </>
  );
}

function PeriodMetricsSkeleton() {
  return (
    <div>
      <div style={{ height: 16, marginBottom: 12, width: 140 }} className="skeleton" />
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
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{ background: 'var(--bg-elev)', padding: '16px 20px' }}>
            <div className="skeleton" style={{ height: 10, width: 80, marginBottom: 10 }} />
            <div className="skeleton" style={{ height: 32, width: 64 }} />
          </div>
        ))}
      </div>
    </div>
  );
}
