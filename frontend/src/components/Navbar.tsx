import React from "react";
import type { ComponentType } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Building2, Plus, Server, ShieldCheck, RefreshCw, LogOut } from "lucide-react";

export interface CooperativeItem {
  _id: string;
  name: string;
  registrationNumber?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    pinCode?: string;
  };
}

export interface NavbarProps {
  portalName?: string;
  portalSubtitle?: string;
  portalIcon?: ComponentType<{ size?: number | string; color?: string; className?: string }>;
  showDbBadge?: boolean;

  // Optional Federation-specific controls
  cooperatives?: CooperativeItem[];
  selectedCoopId?: string;
  onSelectCoop?: (id: string) => void;
  onStartOnboarding?: () => void;
  onRefresh?: () => void;
  loading?: boolean;

  // Custom action elements
  actions?: React.ReactNode;

  // Custom logout handler
  onLogout?: () => void;
}

export default function Navbar({
  portalName = "Dashboard",
  portalSubtitle,
  portalIcon: PortalIcon = Building2,
  showDbBadge = true,
  cooperatives,
  selectedCoopId,
  onSelectCoop,
  onStartOnboarding,
  onRefresh,
  loading = false,
  actions,
  onLogout,
}: NavbarProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.clear();
      navigate("/", { replace: true });
    }
  };

  return (
    <nav className="glass-card dashboard-navbar" style={{ borderRadius: 0, borderTop: 0, borderLeft: 0, borderRight: 0, padding: "14px 28px", marginBottom: "24px", background: "#ffffff", borderBottom: "1px solid var(--border-color, #e2e7e0)" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        
        {/* Brand Identity */}
        <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "40px",
            height: "40px",
            borderRadius: "10px",
            background: "var(--primary, #4e6340)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 3px 10px rgba(78, 99, 64, 0.2)",
            flexShrink: 0
          }}>
            <PortalIcon size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-heading, sans-serif)", fontWeight: 800, fontSize: "1.2rem", letterSpacing: "-0.02em", color: "var(--text-main, #1b2418)" }}>
              GIG Platform
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--primary, #4e6340)", display: "flex", alignItems: "center", gap: "4px", fontWeight: 600 }}>
              <ShieldCheck size={13} /> {portalSubtitle || portalName}
            </div>
          </div>
        </Link>

        {/* Action Controls & Badges */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          
          {/* Refresh button */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="btn btn-secondary"
              style={{ padding: "8px 14px", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px" }}
              title="Refresh database records"
            >
              <RefreshCw size={14} className={loading ? "spin" : ""} /> Refresh
            </button>
          )}

          {/* Federation Selector */}
          {cooperatives && cooperatives.length > 0 && onSelectCoop && (
            <div style={{ position: "relative" }}>
              <select
                value={selectedCoopId || ""}
                onChange={(e) => {
                  if (e.target.value === "NEW_ONBOARDING" && onStartOnboarding) {
                    onStartOnboarding();
                  } else {
                    onSelectCoop(e.target.value);
                  }
                }}
                className="custom-select"
                style={{
                  fontSize: "0.88rem",
                  fontWeight: 600,
                  background: "#f9faf8",
                  borderColor: "var(--border-color, #e2e7e0)",
                  minWidth: "240px",
                  color: "var(--text-main, #1b2418)"
                }}
              >
                <optgroup label="Federations">
                  {cooperatives.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} ({c.address?.city || "Registered"})
                    </option>
                  ))}
                </optgroup>
                {onStartOnboarding && (
                  <option value="NEW_ONBOARDING">
                    + Onboard New Federation...
                  </option>
                )}
              </select>
            </div>
          )}

          {/* New Onboarding Button */}
          {onStartOnboarding && (
            <button
              onClick={onStartOnboarding}
              className="btn btn-primary"
              style={{ padding: "9px 18px", fontSize: "0.88rem", display: "flex", alignItems: "center", gap: "6px" }}
            >
              <Plus size={16} /> Onboard Federation
            </button>
          )}

          {/* Additional Action Elements */}
          {actions}

          {/* Standardized Logout Button */}
          <button
            onClick={handleLogout}
            className="btn btn-secondary"
            style={{
              padding: "8px 16px",
              fontSize: "0.88rem",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontWeight: 600
            }}
            title="Logout"
          >
            <LogOut size={16} /> Logout
          </button>

        </div>
      </div>
    </nav>
  );
}
