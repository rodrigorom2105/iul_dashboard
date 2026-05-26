import { NavLink } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { getRangePreset } from '../utils/time';

function clockTodayPath(): string {
  const { from, to } = getRangePreset('today');
  return `/clock?preset=today&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
}

interface NavItem {
  label: string;
  icon: React.FC<{ className?: string }>;
  to: string;
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" d="M12 7v5l3 3" />
    </svg>
  );
}

const navItems: NavItem[] = [
  { label: 'Clock-In/Out', icon: ClockIcon, to: '/clock' },
  // { label: 'Sesiones', icon: ..., to: '/sessions' },
];


export default function Sidebar() {
  const { auth, logout } = useAuth();

  return (
    <aside
      className="w-60 shrink-0 bg-card border-r border-border flex flex-col"
      style={{ minHeight: '100vh' }}
    >
      <div className="px-5 py-5 border-b border-border">
        <span className="text-lg font-semibold tracking-tight text-white">IUL Dashboard</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to === '/clock' ? clockTodayPath() : item.to}
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[#2d3148] text-white'
                  : 'text-[#94a3b8] hover:text-white hover:bg-[#2d3148]/60'
              }`
            }
          >
            <item.icon className="w-4 h-4 shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-5 py-4 border-t border-border flex items-center justify-between gap-2">
        <span className="text-sm text-[#94a3b8] truncate">{auth?.user.username}</span>
        <button
          onClick={logout}
          className="text-xs text-[#94a3b8] hover:text-red-400 transition-colors whitespace-nowrap"
        >
          Salir
        </button>
      </div>
    </aside>
  );
}
