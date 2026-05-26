import React, { useState } from 'react';
import type { Agent } from '../../types';
import { formatMinutes, formatRelative } from '../../utils/time';
import ShiftTimeline from './ShiftTimeline';
import type { SortColumn, SortDir } from './types';

function lastActivity(agent: Agent): string | null {
  if (agent.shifts.length === 0) return null;
  const last = agent.shifts[agent.shifts.length - 1];
  return last.clockOut ?? last.clockIn;
}

function SortArrow({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <span className="ml-1 text-[#2d3148]">↕</span>;
  return <span className="ml-1">{dir === 'asc' ? '↑' : '↓'}</span>;
}

interface AgentTableProps {
  agents: Agent[];
}

export default function AgentTable({ agents }: AgentTableProps) {
  const [sortCol, setSortCol] = useState<SortColumn>('totalMinutes');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function toggleSort(col: SortColumn) {
    if (sortCol === col) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortCol(col);
      setSortDir('desc');
    }
  }

  const sorted = [...agents].sort((a, b) => {
    let va: string | number = 0;
    let vb: string | number = 0;
    switch (sortCol) {
      case 'displayName':
        va = a.displayName.toLowerCase();
        vb = b.displayName.toLowerCase();
        break;
      case 'totalMinutes':
        va = a.totalMinutes;
        vb = b.totalMinutes;
        break;
      case 'shiftsCount':
        va = a.shiftsCount;
        vb = b.shiftsCount;
        break;
      case 'lastActivity': {
        const la = lastActivity(a);
        const lb = lastActivity(b);
        va = la ? new Date(la).getTime() : 0;
        vb = lb ? new Date(lb).getTime() : 0;
        break;
      }
    }
    if (va < vb) return sortDir === 'asc' ? -1 : 1;
    if (va > vb) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  if (agents.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-12 text-center">
        <p className="text-[#94a3b8]">No hay registros en el período seleccionado.</p>
      </div>
    );
  }

  const th = (col: SortColumn, label: string) => (
    <th
      className="px-4 py-3 text-left text-xs font-medium text-[#94a3b8] uppercase tracking-wide cursor-pointer hover:text-white select-none"
      onClick={() => toggleSort(col)}
    >
      {label}
      <SortArrow active={sortCol === col} dir={sortDir} />
    </th>
  );

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="border-b border-border">
          <tr>
            {th('displayName', 'Agente')}
            <th className="px-4 py-3 text-left text-xs font-medium text-[#94a3b8] uppercase tracking-wide">
              Estado
            </th>
            {th('shiftsCount', 'Jornadas')}
            {th('totalMinutes', 'Horas totales')}
            {th('lastActivity', 'Última actividad')}
          </tr>
        </thead>
        <tbody>
          {sorted.map((agent) => {
            const expanded = expandedId === agent.discordUserId;
            const last = lastActivity(agent);
            return (
              <React.Fragment key={agent.discordUserId}>
                <tr
                  onClick={() => setExpandedId(expanded ? null : agent.discordUserId)}
                  className="border-b border-border hover:bg-[#1f2335] cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-white">{agent.displayName}</span>
                      {agent.currentlyClocked && (
                        <span className="px-1.5 py-0.5 rounded-full bg-green-active/20 text-green-active text-xs font-medium">
                          En línea
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-medium ${
                        agent.currentlyClocked ? 'text-green-active' : 'text-[#94a3b8]'
                      }`}
                    >
                      {agent.currentlyClocked ? 'En línea' : 'Fuera de línea'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-white font-mono">{agent.shiftsCount}</td>
                  <td className="px-4 py-3 text-sm text-white font-mono">
                    {formatMinutes(agent.totalMinutes)}
                  </td>
                  <td className="px-4 py-3 text-sm text-[#94a3b8]">
                    {last ? formatRelative(last) : '—'}
                  </td>
                </tr>
                {expanded && (
                  <tr className="border-b border-border bg-[#0f1117]">
                    <td colSpan={5}>
                      <ShiftTimeline shifts={agent.shifts} />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
