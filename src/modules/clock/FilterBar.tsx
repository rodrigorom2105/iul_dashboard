import { useSearchParams } from 'react-router-dom';
import type { Agent } from '../../types';
import { getRangePreset, PRESET_LABELS } from '../../utils/time';
import type { RangePresetKey } from './types';

const PRESETS: RangePresetKey[] = [
  'today', 'yesterday', 'this_week', 'last_week', 'this_month', 'last_month',
];

interface FilterBarProps {
  agents: Agent[];
}

export default function FilterBar({ agents }: FilterBarProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const preset = (searchParams.get('preset') ?? 'today') as RangePresetKey;
  const agentId = searchParams.get('agent') ?? '';
  const customFrom = searchParams.get('from') ?? '';
  const customTo = searchParams.get('to') ?? '';

  function applyPreset(key: RangePresetKey) {
    if (key === 'custom') {
      setSearchParams((p) => { p.set('preset', 'custom'); return p; });
      return;
    }
    const range = getRangePreset(key);
    setSearchParams({ preset: key, from: range.from, to: range.to, ...(agentId ? { agent: agentId } : {}) });
  }

  function applyCustomRange(from: string, to: string) {
    if (!from || !to) return;
    setSearchParams({
      preset: 'custom',
      from: new Date(from).toISOString(),
      to: new Date(to).toISOString(),
      ...(agentId ? { agent: agentId } : {}),
    });
  }

  function setAgent(id: string) {
    setSearchParams((p) => {
      if (id) p.set('agent', id);
      else p.delete('agent');
      return p;
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      <div className="flex flex-wrap gap-1.5">
        {PRESETS.map((key) => (
          <button
            key={key}
            onClick={() => applyPreset(key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              preset === key
                ? 'bg-blue-accent text-white'
                : 'bg-card border border-border text-[#94a3b8] hover:text-white hover:border-blue-accent'
            }`}
          >
            {PRESET_LABELS[key as Exclude<RangePresetKey, 'custom'>]}
          </button>
        ))}
        <button
          onClick={() => applyPreset('custom')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            preset === 'custom'
              ? 'bg-blue-accent text-white'
              : 'bg-card border border-border text-[#94a3b8] hover:text-white hover:border-blue-accent'
          }`}
        >
          Personalizado
        </button>
      </div>

      {preset === 'custom' && (
        <div className="flex items-center gap-2">
          <input
            type="datetime-local"
            defaultValue={customFrom ? new Date(customFrom).toISOString().slice(0, 16) : ''}
            onChange={(e) => applyCustomRange(e.target.value, customTo)}
            className="bg-card border border-border rounded-md px-2 py-1.5 text-xs text-white focus:outline-none focus:border-blue-accent"
          />
          <span className="text-[#94a3b8] text-xs">→</span>
          <input
            type="datetime-local"
            defaultValue={customTo ? new Date(customTo).toISOString().slice(0, 16) : ''}
            onChange={(e) => applyCustomRange(customFrom, e.target.value)}
            className="bg-card border border-border rounded-md px-2 py-1.5 text-xs text-white focus:outline-none focus:border-blue-accent"
          />
        </div>
      )}

      <div className="ml-auto">
        <select
          value={agentId}
          onChange={(e) => setAgent(e.target.value)}
          className="bg-card border border-border rounded-md px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-accent"
        >
          <option value="">Todos los agentes</option>
          {agents.map((a) => (
            <option key={a.discordUserId} value={a.discordUserId}>
              {a.displayName}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
