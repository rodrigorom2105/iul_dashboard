import React from 'react';

type Tone = 'neutral' | 'accent' | 'warn' | 'neg' | 'info';

const tones: Record<Tone, { bg: string; border: string; color: string }> = {
  neutral: { bg: 'var(--bg-elev-2)', border: 'var(--border)', color: 'var(--text-2)' },
  accent:  { bg: 'var(--accent-soft)', border: 'rgba(52,211,153,0.3)', color: 'var(--accent)' },
  warn:    { bg: 'var(--warn-soft)', border: 'rgba(251,191,36,0.3)', color: 'var(--warn)' },
  neg:     { bg: 'var(--neg-soft)', border: 'rgba(248,113,113,0.3)', color: 'var(--neg)' },
  info:    { bg: 'var(--info-soft)', border: 'rgba(129,140,248,0.3)', color: 'var(--info)' },
};

interface PillProps {
  children: React.ReactNode;
  tone?: Tone;
  strong?: boolean;
  mono?: boolean;
  style?: React.CSSProperties;
}

export default function Pill({ children, tone = 'neutral', strong = false, mono = false, style }: PillProps) {
  const t = tones[tone];
  return (
    <span
      className={`tnum inline-flex items-center gap-1 rounded-full ${mono ? 'font-mono' : ''}`}
      style={{
        padding: strong ? '3px 9px' : '2px 8px',
        background: t.bg,
        border: `1px solid ${t.border}`,
        color: t.color,
        fontSize: 11,
        fontWeight: 500,
        lineHeight: 1.4,
        letterSpacing: '0.01em',
        ...style,
      }}
    >
      {children}
    </span>
  );
}
