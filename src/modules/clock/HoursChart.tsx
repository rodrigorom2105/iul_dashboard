import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { Agent } from '../../types';
import { formatMinutes } from '../../utils/time';

interface HoursChartProps {
  agents: Agent[];
}

interface TooltipPayload {
  payload?: Agent & { hours: number };
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
  if (!active || !payload?.[0]?.payload) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-card border border-border rounded-md px-3 py-2 text-sm">
      <p className="text-white font-medium">{d.displayName}</p>
      <p className="text-[#94a3b8]">
        {formatMinutes(d.totalMinutes)} · {d.shiftsCount} jornada{d.shiftsCount !== 1 ? 's' : ''}
      </p>
    </div>
  );
}

export default function HoursChart({ agents }: HoursChartProps) {
  if (agents.length < 2) return null;

  const data = [...agents]
    .sort((a, b) => b.totalMinutes - a.totalMinutes)
    .map((a) => ({ ...a, hours: Math.round((a.totalMinutes / 60) * 10) / 10 }));

  const barHeight = 36;
  const chartHeight = data.length * barHeight + 40;

  return (
    <div className="bg-card border border-border rounded-lg p-5 mb-6">
      <h2 className="text-sm font-medium text-[#94a3b8] uppercase tracking-wide mb-4">
        Horas por agente
      </h2>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24, top: 0, bottom: 0 }}>
          <XAxis
            type="number"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            axisLine={{ stroke: '#2d3148' }}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="displayName"
            width={120}
            tick={{ fill: '#f1f5f9', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
          <Bar dataKey="hours" radius={[0, 4, 4, 0]}>
            {data.map((entry) => (
              <Cell
                key={entry.discordUserId}
                fill={entry.currentlyClocked ? '#22c55e' : '#3b82f6'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
