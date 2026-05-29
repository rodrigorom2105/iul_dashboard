import React from 'react';

interface CardProps {
  children: React.ReactNode;
  padding?: number | string;
  style?: React.CSSProperties;
  className?: string;
}

export default function Card({ children, padding = 20, style, className = '' }: CardProps) {
  return (
    <div
      className={className}
      style={{
        background: 'var(--bg-elev)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        padding,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
