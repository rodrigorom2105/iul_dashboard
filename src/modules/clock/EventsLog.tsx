import { useState } from 'react';
import { useEvents } from './hooks';
import { formatInTz } from '../../utils/time';

const LIMIT = 100;

interface EventsLogProps {
  from: string;
  to: string;
  discordUserId?: string;
}

export default function EventsLog({ from, to, discordUserId }: EventsLogProps) {
  const [offset, setOffset] = useState(0);

  const { data, isLoading, isError, refetch } = useEvents({
    from,
    to,
    discordUserId,
    limit: LIMIT,
    offset,
  });

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-lg p-6 space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-10 bg-[#2d3148] rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-card border border-border rounded-lg p-8 text-center">
        <p className="text-[#94a3b8] mb-3">Error al cargar los eventos.</p>
        <button
          onClick={() => void refetch()}
          className="px-4 py-2 bg-blue-accent hover:bg-blue-500 text-white text-sm rounded-md transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!data || data.events.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-8 text-center">
        <p className="text-[#94a3b8]">No hay eventos para este período.</p>
      </div>
    );
  }

  const { events, total } = data;
  const start = offset + 1;
  const end = Math.min(offset + LIMIT, total);

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-border">
            <tr>
              {['ID', 'Agente', 'Acción', 'Fecha y hora', 'Google Sheets'].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-medium text-[#94a3b8] uppercase tracking-wide"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {events.map((ev) => (
              <tr key={ev.id} className="border-b border-border hover:bg-[#1f2335] transition-colors">
                <td className="px-4 py-3 text-xs text-[#94a3b8] font-mono">{ev.id}</td>
                <td className="px-4 py-3 text-sm text-white">{ev.displayName}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      ev.action === 'CLOCKIN'
                        ? 'bg-green-active/20 text-green-active'
                        : 'bg-red-clockout/20 text-red-clockout'
                    }`}
                  >
                    {ev.action}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-white font-mono">
                  {formatInTz(ev.eventAt, 'd MMM yyyy, HH:mm:ss')}
                </td>
                <td className="px-4 py-3 text-sm">
                  {ev.sheetsSynced ? (
                    <span className="text-green-active">✓ Sincronizado</span>
                  ) : (
                    <span className="text-red-clockout">✗ Error</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-3 border-t border-border flex items-center justify-between text-sm text-[#94a3b8]">
        <span>
          Mostrando {start}–{end} de {total}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setOffset((o) => Math.max(0, o - LIMIT))}
            disabled={offset === 0}
            className="px-3 py-1.5 bg-app border border-border rounded-md text-xs disabled:opacity-40 hover:border-blue-accent hover:text-white transition-colors"
          >
            Anterior
          </button>
          <button
            onClick={() => setOffset((o) => o + LIMIT)}
            disabled={end >= total}
            className="px-3 py-1.5 bg-app border border-border rounded-md text-xs disabled:opacity-40 hover:border-blue-accent hover:text-white transition-colors"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}
