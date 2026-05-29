interface SectionLabelProps {
  children: React.ReactNode;
  hint?: string;
}

export default function SectionLabel({ children, hint }: SectionLabelProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        marginBottom: 12,
      }}
    >
      <div
        style={{
          textTransform: 'uppercase',
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.12em',
          color: 'var(--text-3)',
        }}
      >
        {children}
      </div>
      {hint ? (
        <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{hint}</div>
      ) : null}
    </div>
  );
}
