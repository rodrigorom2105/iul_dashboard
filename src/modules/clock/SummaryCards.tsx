import type { Agent } from '../../types';
import { formatMinutes } from '../../utils/time';

function Skeleton() {
  return <div className="h-8 w-24 bg-[#2d3148] rounded animate-pulse" />;
}

function Card({
  label,
  value,
  loading,
  accent,
}: {
  label: string;
  value: React.ReactNode;
  loading: boolean;
  accent?: React.ReactNode;
}) {
  return (
    <div className="bg-card border border-border rounded-lg p-5 flex flex-col gap-2">
      <span className="text-xs text-[#94a3b8] uppercase tracking-wide">{label}</span>
      {loading ? (
        <Skeleton />
      ) : (
        <div className="flex items-center gap-2">
          {accent}
          <span className="text-2xl font-semibold text-white font-mono">{value}</span>
        </div>
      )}
    </div>
  );
}

interface SummaryCardsProps {
  agents: Agent[];
  loading: boolean;
}

export default function SummaryCards({ agents, loading }: SummaryCardsProps) {
  const activeNow = agents.filter((a) => a.currentlyClocked).length;
  const totalMinutes = agents.reduce((s, a) => s + a.totalMinutes, 0);
  const agentsWithRecords = agents.filter((a) => a.totalMinutes > 0).length;
  const avgMinutes = agentsWithRecords > 0 ? Math.round(totalMinutes / agentsWithRecords) : 0;
  const totalShifts = agents.reduce((s, a) => s + a.shiftsCount, 0);

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
      <Card
        label="Agentes activos ahora"
        loading={loading}
        value={activeNow}
        accent={
          activeNow > 0 ? (
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-active opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-active" />
            </span>
          ) : undefined
        }
      />
      <Card
        label="Total horas en el período"
        loading={loading}
        value={formatMinutes(totalMinutes)}
      />
      <Card
        label="Promedio por agente"
        loading={loading}
        value={formatMinutes(avgMinutes)}
      />
      <Card
        label="Total jornadas"
        loading={loading}
        value={totalShifts}
      />
    </div>
  );
}
