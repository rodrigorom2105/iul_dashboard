import { useState, useEffect } from 'react';
import type { Shift } from '../../types';
import { formatMinutes, formatInTz } from '../../utils/time';

function calcDuration(clockIn: string): number {
  return Math.floor((Date.now() - new Date(clockIn).getTime()) / 60000);
}

function ShiftRow({ shift }: { shift: Shift }) {
  const [liveMinutes, setLiveMinutes] = useState<number | null>(
    shift.clockOut === null ? calcDuration(shift.clockIn) : null,
  );

  useEffect(() => {
    if (shift.clockOut !== null) return;
    const id = setInterval(() => {
      setLiveMinutes(calcDuration(shift.clockIn));
    }, 60_000);
    return () => clearInterval(id);
  }, [shift.clockIn, shift.clockOut]);

  const isOpen = shift.clockOut === null;
  const duration = isOpen ? (liveMinutes ?? 0) : (shift.durationMinutes ?? 0);

  const clockInFmt = formatInTz(shift.clockIn, 'HH:mm:ss');
  const clockOutFmt = shift.clockOut ? formatInTz(shift.clockOut, 'HH:mm:ss') : 'en curso';

  return (
    <div
      className={`flex items-center gap-4 px-4 py-2.5 rounded-md font-mono text-sm ${
        isOpen
          ? 'bg-[#422006] text-yellow-open'
          : 'bg-app text-[#94a3b8]'
      }`}
    >
      <span className="w-28 shrink-0">{clockInFmt}</span>
      <span className="text-[#94a3b8]">→</span>
      <span className="w-28 shrink-0">
        {clockOutFmt}
        {isOpen && ' ⏱'}
      </span>
      <span className="ml-auto">{formatMinutes(duration)}</span>
    </div>
  );
}

interface ShiftTimelineProps {
  shifts: Shift[];
}

export default function ShiftTimeline({ shifts }: ShiftTimelineProps) {
  if (shifts.length === 0) {
    return <p className="px-4 py-3 text-sm text-[#94a3b8]">Sin jornadas registradas.</p>;
  }

  return (
    <div className="px-4 py-3 space-y-1.5">
      {shifts.map((shift, i) => (
        <ShiftRow key={i} shift={shift} />
      ))}
    </div>
  );
}
