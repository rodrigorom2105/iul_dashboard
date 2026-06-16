import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { getRangePreset } from "../utils/time";
import { useLiveCount } from "./LiveCountContext";
import Avatar from "../components/Avatar";
import { Activity, Calendar, CheckCircle, LogOut } from "../components/icons";

function clockTodayPath(): string {
  const { from, to } = getRangePreset("today");
  return `/clock?preset=today&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
}

function salesThisMonthPath(): string {
  const { from, to } = getRangePreset("this_month");
  return `/sales?preset=this_month&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  disabled?: boolean;
  count?: number;
  onClick?: () => void;
}

function NavItem({
  icon,
  label,
  active,
  disabled,
  count,
  onClick,
}: NavItemProps) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 10px",
        borderRadius: 8,
        color: active
          ? "var(--text)"
          : disabled
            ? "var(--text-3)"
            : "var(--text-2)",
        background: active ? "var(--bg-elev)" : "transparent",
        border: `1px solid ${active ? "var(--border)" : "transparent"}`,
        fontSize: 13,
        fontWeight: 500,
        cursor: disabled ? "not-allowed" : "pointer",
        width: "100%",
        textAlign: "left",
        fontFamily: "inherit",
        transition: "background 0.12s, color 0.12s",
      }}
      onMouseEnter={(e) => {
        if (!active && !disabled)
          (e.currentTarget as HTMLElement).style.background = "var(--bg-elev)";
      }}
      onMouseLeave={(e) => {
        if (!active)
          (e.currentTarget as HTMLElement).style.background = "transparent";
      }}>
      <span
        style={{
          display: "inline-flex",
          color: active ? "var(--accent)" : "inherit",
        }}>
        {icon}
      </span>
      <span style={{ flex: 1 }}>{label}</span>
      {count != null ? (
        <span
          className="font-mono tnum"
          style={{
            fontSize: 10.5,
            padding: "1px 6px",
            borderRadius: 4,
            background: "var(--accent-soft)",
            color: "var(--accent)",
            border: "1px solid rgba(52,211,153,0.25)",
            fontWeight: 600,
          }}>
          {count}
        </span>
      ) : null}
    </button>
  );
}

export default function Sidebar() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { liveCount } = useLiveCount();

  const isClockActive = location.pathname.startsWith("/clock");
  const isSalesActive = location.pathname.startsWith("/sales");

  return (
    <aside
      style={{
        width: 224,
        flexShrink: 0,
        height: "100vh",
        position: "sticky",
        top: 0,
        borderRight: "1px solid var(--border)",
        background: "var(--bg)",
        display: "flex",
        flexDirection: "column",
        padding: "22px 16px",
      }}>
      {/* Logo + title */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "0 4px 24px",
          marginBottom: 4,
        }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: "linear-gradient(135deg, var(--accent), var(--info))",
            display: "grid",
            placeItems: "center",
            fontWeight: 700,
            fontSize: 13,
            color: "#0a0c10",
            boxShadow:
              "0 0 0 1px var(--border-strong), inset 0 1px 0 rgba(255,255,255,0.15)",
            flexShrink: 0,
          }}>
          IUL
        </div>
        <div>
          <div
            style={{
              fontWeight: 600,
              fontSize: 13,
              lineHeight: 1.1,
              color: "var(--text)",
            }}>
            Grupo Financiero Tridente
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <NavItem
          icon={<Activity size={15} />}
          label="Clock"
          active={isClockActive}
          count={liveCount > 0 ? liveCount : undefined}
          onClick={() => navigate(clockTodayPath())}
        />
        <NavItem
          icon={<CheckCircle size={15} />}
          label="Ventas"
          active={isSalesActive}
          onClick={() => navigate(salesThisMonthPath())}
        />
        <NavItem
          icon={<Calendar size={15} />}
          label="Turnos"
          disabled
        />
        <NavItem
          icon={<CheckCircle size={15} />}
          label="Reportes"
          disabled
        />
      </nav>

      {/* User footer */}
      <div
        style={{
          marginTop: "auto",
          borderTop: "1px solid var(--border)",
          paddingTop: 14,
        }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "6px 4px",
          }}>
          <Avatar
            name={auth?.user.username ?? "Admin"}
            id={String(auth?.user.id ?? "admin")}
            size={26}
          />
          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 500,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                color: "var(--text)",
              }}>
              {auth?.user.username ?? "admin"}
            </div>
            <div style={{ fontSize: 10.5, color: "var(--text-3)" }}>
              Manager
            </div>
          </div>
          <button
            title="Salir"
            onClick={logout}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-3)",
              padding: 4,
              borderRadius: 6,
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
              transition: "color 0.12s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = "var(--neg)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = "var(--text-3)";
            }}>
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
