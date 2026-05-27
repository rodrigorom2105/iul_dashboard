import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSummary } from './hooks';
import { getRangePreset } from '../../utils/time';
import type { RangePresetKey } from './types';
import FilterBar from './FilterBar';
import SummaryCards from './SummaryCards';
import AgentTable from './AgentTable';
import HoursChart from './HoursChart';
import EventsLog from './EventsLog';

const TABS = [
  { key: 'chart', label: 'Gráfica' },
  { key: 'table', label: 'Tabla' },
  { key: 'events', label: 'Eventos' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

export default function ClockPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const preset = (searchParams.get('preset') ?? 'today') as RangePresetKey;
  const hasRange = searchParams.has('from') && searchParams.has('to');
  const activeTab = (searchParams.get('tab') ?? 'chart') as TabKey;

  useEffect(() => {
    if (!hasRange && preset !== 'custom') {
      const range = getRangePreset(preset as Exclude<RangePresetKey, 'custom'>);
      setSearchParams({ preset, from: range.from, to: range.to, tab: activeTab }, { replace: true });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const from = searchParams.get('from') ?? '';
  const to = searchParams.get('to') ?? '';
  const agentId = searchParams.get('agent') ?? undefined;

  const { data, isLoading, isError, isFetching, refetch } = useSummary(from, to);

  const agents = data?.agents ?? [];
  const filteredAgents = agentId
    ? agents.filter((a) => a.discordUserId === agentId)
    : agents;

  function setTab(tab: TabKey) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('tab', tab);
      return next;
    });
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-white">Clock-In / Clock-Out</h1>
        {isFetching && !isLoading && (
          <div className="w-4 h-4 border-2 border-blue-accent border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      <FilterBar agents={agents} />

      <SummaryCards agents={filteredAgents} loading={isLoading} />

      <div className="flex gap-1 mb-4 border-b border-border">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.key
                ? 'border-blue-accent text-white'
                : 'border-transparent text-[#94a3b8] hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isError ? (
        <div className="bg-card border border-border rounded-lg p-8 text-center mb-6">
          <p className="text-[#94a3b8] mb-3">Error al cargar los datos.</p>
          <button
            onClick={() => void refetch()}
            className="px-4 py-2 bg-blue-accent hover:bg-blue-500 text-white text-sm rounded-md transition-colors"
          >
            Reintentar
          </button>
        </div>
      ) : isLoading ? (
        <div className="space-y-3 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-14 bg-card border border-border rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {activeTab === 'chart' && <HoursChart agents={filteredAgents} />}
          {activeTab === 'table' && (
            <div className="mb-6">
              <AgentTable agents={filteredAgents} />
            </div>
          )}
          {activeTab === 'events' && from && to && (
            <EventsLog from={from} to={to} discordUserId={agentId} />
          )}
        </>
      )}
    </div>
  );
}
