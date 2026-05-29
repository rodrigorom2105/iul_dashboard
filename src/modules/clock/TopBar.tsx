import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Agent } from '../../types';
import { getRangePreset, fmtTimeSec, PRESET_LABELS, DISPLAY_TZ, isoToLocalInput, localInputToIso } from '../../utils/time';
import type { RangePresetKey } from './types';
import Avatar from '../../components/Avatar';
import { Calendar, Search, X, ChevronDown } from '../../components/icons';

const PRESETS: Exclude<RangePresetKey, 'custom'>[] = [
  'today', 'yesterday', 'this_week', 'last_week', 'this_month', 'last_month',
];

interface TopBarProps {
  agents: Agent[];
}

export default function TopBar({ agents }: TopBarProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const preset = (searchParams.get('preset') ?? 'today') as RangePresetKey;
  const agentId = searchParams.get('agent') ?? '';
  const customFrom = searchParams.get('from') ?? '';
  const customTo = searchParams.get('to') ?? '';

  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  function applyPreset(key: RangePresetKey) {
    if (key === 'custom') {
      setSearchParams((p) => { p.set('preset', 'custom'); return p; });
      return;
    }
    const range = getRangePreset(key);
    setSearchParams({
      preset: key,
      from: range.from,
      to: range.to,
      ...(agentId ? { agent: agentId } : {}),
    });
  }

  function applyCustomRange(from: string, to: string) {
    if (!from || !to) return;
    setSearchParams({
      preset: 'custom',
      from: localInputToIso(from),
      to: localInputToIso(to + ':59'),
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

  const dateLabel = now.toLocaleDateString('es-MX', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    timeZone: DISPLAY_TZ,
  });

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(10,12,16,0.85)',
        backdropFilter: 'saturate(140%) blur(8px)',
        WebkitBackdropFilter: 'saturate(140%) blur(8px)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div
        style={{
          padding: '14px 28px',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          flexWrap: 'wrap',
        }}
      >
        {/* Title + live clock */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginRight: 8 }}>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 600, letterSpacing: '-0.01em', color: 'var(--text)' }}>
            Clock
          </h1>
          <span className="font-mono" style={{ color: 'var(--text-3)', fontSize: 12 }}>
            {dateLabel}
          </span>
          <span
            className="font-mono tnum"
            style={{
              color: 'var(--text-2)',
              fontSize: 12,
              padding: '2px 8px',
              borderRadius: 6,
              background: 'var(--bg-elev)',
              border: '1px solid var(--border)',
            }}
          >
            {fmtTimeSec(now)}
          </span>
        </div>

        {/* Preset segmented control */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            background: 'var(--bg-elev)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            padding: 3,
          }}
        >
          {PRESETS.map((key) => (
            <button
              key={key}
              onClick={() => applyPreset(key)}
              style={{
                padding: '5px 10px',
                fontSize: 12,
                fontWeight: 500,
                background: preset === key ? 'var(--bg-hover)' : 'transparent',
                color: preset === key ? 'var(--text)' : 'var(--text-2)',
                border: 'none',
                borderRadius: 7,
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all .15s',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => { if (preset !== key) (e.currentTarget as HTMLElement).style.color = 'var(--text)'; }}
              onMouseLeave={(e) => { if (preset !== key) (e.currentTarget as HTMLElement).style.color = 'var(--text-2)'; }}
            >
              {PRESET_LABELS[key]}
            </button>
          ))}
          <button
            onClick={() => applyPreset('custom')}
            style={{
              padding: '5px 10px',
              fontSize: 12,
              fontWeight: 500,
              background: preset === 'custom' ? 'var(--bg-hover)' : 'transparent',
              color: preset === 'custom' ? 'var(--text)' : 'var(--text-2)',
              border: 'none',
              borderRadius: 7,
              cursor: 'pointer',
              fontFamily: 'inherit',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Calendar size={12} /> Personalizado
          </button>
        </div>

        {/* Custom date inputs */}
        {preset === 'custom' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input
              type="datetime-local"
              defaultValue={customFrom ? isoToLocalInput(customFrom) : ''}
              onChange={(e) => applyCustomRange(e.target.value, customTo ? isoToLocalInput(customTo) : '')}
              style={inputStyle}
            />
            <span style={{ color: 'var(--text-3)', fontSize: 12 }}>→</span>
            <input
              type="datetime-local"
              defaultValue={customTo ? isoToLocalInput(customTo) : ''}
              onChange={(e) => applyCustomRange(customFrom ? isoToLocalInput(customFrom) : '', e.target.value)}
              style={inputStyle}
            />
          </div>
        )}

        {/* Agent select */}
        <div style={{ marginLeft: 'auto' }}>
          <AgentSelect value={agentId} onChange={setAgent} agents={agents} />
        </div>
      </div>
    </header>
  );
}

const inputStyle: React.CSSProperties = {
  background: 'var(--bg-elev)',
  border: '1px solid var(--border)',
  color: 'var(--text)',
  fontSize: 12,
  padding: '5px 8px',
  borderRadius: 8,
  fontFamily: 'JetBrains Mono, monospace',
  colorScheme: 'dark' as React.CSSProperties['colorScheme'],
};

interface AgentSelectProps {
  value: string;
  onChange: (id: string) => void;
  agents: Agent[];
}

function AgentSelect({ value, onChange, agents }: AgentSelectProps) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const selected = agents.find((a) => a.discordUserId === value);
  const filtered = agents.filter((a) => a.displayName.toLowerCase().includes(q.toLowerCase()));

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 10px 6px 8px',
          background: 'var(--bg-elev)',
          border: '1px solid var(--border)',
          color: 'var(--text)',
          fontSize: 12,
          fontWeight: 500,
          borderRadius: 8,
          minWidth: 200,
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        {selected ? (
          <>
            <Avatar name={selected.displayName} id={selected.discordUserId} size={20} />
            <span style={{ flex: 1, textAlign: 'left' }}>{selected.displayName}</span>
            <button
              onClick={(e) => { e.stopPropagation(); onChange(''); }}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-3)', padding: 0, display: 'inline-flex', cursor: 'pointer' }}
            >
              <X size={12} />
            </button>
          </>
        ) : (
          <>
            <Search size={12} style={{ color: 'var(--text-3)' }} />
            <span style={{ flex: 1, textAlign: 'left', color: 'var(--text-2)' }}>Todos los agentes</span>
            <ChevronDown size={12} style={{ color: 'var(--text-3)' }} />
          </>
        )}
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            zIndex: 100,
            width: 280,
            background: 'var(--bg-elev)',
            border: '1px solid var(--border-strong)',
            borderRadius: 10,
            boxShadow: '0 12px 32px rgba(0,0,0,0.45)',
            padding: 6,
            maxHeight: 360,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 8px',
              background: 'var(--bg)',
              borderRadius: 7,
              border: '1px solid var(--border)',
              margin: 2,
              marginBottom: 4,
            }}
          >
            <Search size={12} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar agente…"
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--text)',
                fontSize: 12,
                flex: 1,
                fontFamily: 'inherit',
              }}
            />
          </div>
          <div style={{ overflow: 'auto', flex: 1 }}>
            <button
              onClick={() => { onChange(''); setOpen(false); }}
              style={{ ...itemStyle, color: value === '' ? 'var(--accent)' : 'var(--text-2)' }}
            >
              <span style={{ width: 20, height: 20, display: 'inline-flex' }} />
              Todos los agentes
            </button>
            {filtered.map((a) => (
              <button
                key={a.discordUserId}
                onClick={() => { onChange(a.discordUserId); setOpen(false); }}
                style={{ ...itemStyle, color: 'var(--text)' }}
              >
                <Avatar name={a.displayName} id={a.discordUserId} size={20} />
                <span style={{ flex: 1, textAlign: 'left' }}>{a.displayName}</span>
                {a.currentlyClocked && <span className="live-dot" />}
              </button>
            ))}
            {filtered.length === 0 && (
              <div style={{ padding: '14px 10px', textAlign: 'center', color: 'var(--text-3)', fontSize: 12 }}>
                Sin resultados
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const itemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  width: '100%',
  padding: '7px 8px',
  background: 'transparent',
  border: 'none',
  borderRadius: 7,
  fontSize: 12,
  fontFamily: 'inherit',
  cursor: 'pointer',
  textAlign: 'left',
};
