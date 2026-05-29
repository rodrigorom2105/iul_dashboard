import type { Agent } from '../../types';
import Card from '../../components/Card';
import Avatar from '../../components/Avatar';
import { fmtHoursDecimal, formatMinutes, minsToClock, getMinutesInTz } from '../../utils/time';

interface AgentAvg {
  discordUserId: string;
  displayName: string;
  avgInMins: number;
  avgOutMins: number;
}

function computeAvgs(agents: Agent[]): AgentAvg[] {
  return agents
    .map((a) => {
      const closed = a.shifts.filter((s) => s.clockOut != null);
      if (closed.length === 0) return null;
      const inSamples = closed.map((s) => getMinutesInTz(new Date(s.clockIn)));
      const outSamples = closed.map((s) => {
        const inM = getMinutesInTz(new Date(s.clockIn));
        const rawOut = getMinutesInTz(new Date(s.clockOut!));
        return rawOut < inM ? rawOut + 1440 : rawOut;
      });
      const avg = (arr: number[]) => Math.round(arr.reduce((s, v) => s + v, 0) / arr.length);
      return {
        discordUserId: a.discordUserId,
        displayName: a.displayName,
        avgInMins: avg(inSamples),
        avgOutMins: avg(outSamples),
      };
    })
    .filter((x): x is AgentAvg => x !== null)
    .sort((a, b) => a.avgInMins - b.avgInMins);
}

const DAY_START = 6 * 60;
const DAY_END = 22 * 60;
const DAY_RANGE = DAY_END - DAY_START;

function pct(m: number): number {
  return Math.max(0, Math.min(100, ((m - DAY_START) / DAY_RANGE) * 100));
}

const HOURS = [6, 8, 10, 12, 14, 16, 18, 20, 22];

interface InOutChartProps {
  agents: Agent[];
}

export default function InOutChart({ agents }: InOutChartProps) {
  const data = computeAvgs(agents);
  if (data.length === 0) return null;

  const teamAvgIn = Math.round(data.reduce((s, a) => s + a.avgInMins, 0) / data.length);
  const teamAvgOut = Math.round(data.reduce((s, a) => s + a.avgOutMins, 0) / data.length);

  return (
    <Card padding={0} style={{ overflow: 'hidden' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 20px',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
            Hora promedio · entrada → salida
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>
            Calculado sobre el periodo seleccionado
          </div>
        </div>
        <div style={{ display: 'flex', gap: 14, fontSize: 11 }}>
          <Legend dot="var(--accent)" label="Entrada" />
          <Legend dot="var(--info)" label="Salida" />
          <Legend dot="var(--border-strong)" label="Promedio equipo" dashed />
        </div>
      </div>

      <div style={{ padding: '18px 20px 22px' }}>
        {/* Hour axis header */}
        <div style={{ position: 'relative', marginLeft: 160, marginBottom: 8, height: 14 }}>
          {HOURS.map((h) => (
            <div
              key={h}
              style={{
                position: 'absolute',
                left: `${pct(h * 60)}%`,
                transform: 'translateX(-50%)',
                fontSize: 10,
                color: 'var(--text-3)',
                fontFamily: 'JetBrains Mono, monospace',
              }}
            >
              {h}h
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, position: 'relative' }}>
          {/* Team avg vertical guides */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: `calc(160px + ${pct(teamAvgIn)}%)`,
              width: 0,
              borderLeft: '1px dashed rgba(52,211,153,0.4)',
              pointerEvents: 'none',
              transform: 'translateX(-1px)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: `calc(160px + ${pct(teamAvgOut)}%)`,
              width: 0,
              borderLeft: '1px dashed rgba(129,140,248,0.4)',
              pointerEvents: 'none',
              transform: 'translateX(-1px)',
            }}
          />

          {data.map((a) => {
            const inPct = pct(a.avgInMins);
            const outPct = pct(a.avgOutMins);
            return (
              <div key={a.discordUserId} style={{ display: 'flex', alignItems: 'center', gap: 12, height: 22 }}>
                <div
                  style={{
                    width: 148,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 12,
                    color: 'var(--text-2)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Avatar name={a.displayName} id={a.discordUserId} size={18} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {a.displayName}
                  </span>
                </div>
                <div style={{ flex: 1, position: 'relative', height: '100%' }}>
                  {/* track */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: 0,
                      right: 0,
                      height: 1,
                      background: 'var(--border)',
                      transform: 'translateY(-50%)',
                    }}
                  />
                  {/* span */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: `${inPct}%`,
                      width: `${outPct - inPct}%`,
                      height: 5,
                      background: 'linear-gradient(90deg, rgba(52,211,153,0.35), rgba(129,140,248,0.35))',
                      transform: 'translateY(-50%)',
                      borderRadius: 99,
                    }}
                  />
                  <Marker pct={inPct} color="var(--accent)" />
                  <Marker pct={outPct} color="var(--info)" />
                </div>
                <div
                  className="font-mono tnum"
                  style={{ width: 56, textAlign: 'right', fontSize: 11, color: 'var(--text-3)' }}
                >
                  {fmtHoursDecimal(a.avgOutMins - a.avgInMins)}h
                </div>
              </div>
            );
          })}
        </div>

        <div
          style={{
            marginTop: 14,
            paddingTop: 12,
            borderTop: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            gap: 24,
            fontSize: 11,
            color: 'var(--text-2)',
            flexWrap: 'wrap',
          }}
        >
          <div>
            Equipo entra en promedio a las{' '}
            <span className="font-mono" style={{ color: 'var(--accent)', fontWeight: 600 }}>
              {minsToClock(teamAvgIn)}
            </span>
          </div>
          <div>
            Y sale a las{' '}
            <span className="font-mono" style={{ color: 'var(--info)', fontWeight: 600 }}>
              {minsToClock(teamAvgOut)}
            </span>
          </div>
          <div>
            Jornada promedio{' '}
            <span className="font-mono" style={{ color: 'var(--text)', fontWeight: 600 }}>
              {formatMinutes(teamAvgOut - teamAvgIn)}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}

function Marker({ pct: p, color }: { pct: number; color: string }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: `${p}%`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <span
        style={{
          width: 9,
          height: 9,
          borderRadius: 999,
          background: 'var(--bg-elev)',
          border: `2px solid ${color}`,
          display: 'block',
        }}
      />
    </div>
  );
}

function Legend({ dot, label, dashed }: { dot: string; label: string; dashed?: boolean }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-2)' }}>
      <span
        style={{
          width: 14,
          height: 0,
          borderTop: `2px ${dashed ? 'dashed' : 'solid'} ${dot}`,
          display: 'inline-block',
        }}
      />
      {label}
    </div>
  );
}
