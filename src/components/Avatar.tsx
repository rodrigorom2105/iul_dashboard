function colorFromId(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  const hue = Math.abs(h) % 360;
  return `oklch(0.65 0.12 ${hue})`;
}

function initials(name: string): string {
  const parts = name.split(' ').filter(Boolean);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase();
}

interface AvatarProps {
  name: string;
  id?: string;
  size?: number;
}

export default function Avatar({ name, id, size = 28 }: AvatarProps) {
  const bg = colorFromId(id ?? name);
  return (
    <div
      className="tnum inline-flex items-center justify-center rounded-full shrink-0"
      style={{
        width: size,
        height: size,
        background: bg,
        color: '#0a0c10',
        fontSize: size * 0.4,
        fontWeight: 700,
        letterSpacing: '-0.02em',
      }}
    >
      {initials(name)}
    </div>
  );
}
