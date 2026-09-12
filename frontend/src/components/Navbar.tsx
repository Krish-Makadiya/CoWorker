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

interface NavbarProps {
  cooperatives: CooperativeItem[];
  selectedCoopId: string;
  onSelectCoop: (id: string) => void;
  onStartOnboarding: () => void;
  onRefresh: () => void;
  loading: boolean;
}

export default function Navbar({
  cooperatives,
  selectedCoopId,
  onSelectCoop,
  onStartOnboarding,
  onRefresh,
  loading
}: NavbarProps) {
  return (
    <nav className="glass-card" style={{ borderRadius: 0, borderTop: 0, borderLeft: 0, borderRight: 0, padding: "16px 32px", marginBottom: "32px", background: "#ffffff" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "40px",
            height: "40px",
            borderRadius: "10px",
            background: "var(--primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 3px 10px rgba(78, 99, 64, 0.2)"
          }}>
            <Building2 size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.2rem", letterSpacing: "-0.02em", color: "var(--text-main)" }}>
              Co-Worker
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--primary)", display: "flex", alignItems: "center", gap: "4px", fontWeight: 600 }}>
              <ShieldCheck size={13} /> Federation & Cooperative Portal
            </div>
          </div>
        </div>

        {/* Action Controls & DB Switcher */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          
          {/* Live DB Connection Badge */}
          <div className="badge badge-emerald" style={{ padding: "6px 14px", fontSize: "0.75rem" }}>
            <Server size={13} /> MongoDB Connected (sih_2026)
          </div>

          {/* Refresh button */}
          <button
            onClick={onRefresh}
            className="btn btn-secondary"
            style={{ padding: "8px 14px", fontSize: "0.85rem" }}
            title="Refresh database records"
          >
            <RefreshCw size={14} className={loading ? "spin" : ""} /> Refresh
          </button>

          {/* Federation Selector */}
          <div style={{ position: "relative" }}>
            <select
              value={selectedCoopId || ""}
              onChange={(e) => {
                if (e.target.value === "NEW_ONBOARDING") {
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
                borderColor: "var(--border-color)",
                minWidth: "240px",
                color: "var(--text-main)"
              }}
            >
              <optgroup label="MongoDB Federations">
                {cooperatives.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} ({c.address?.city || "Registered"})
                  </option>
                ))}
              </optgroup>
              <option value="NEW_ONBOARDING">
                + Onboard New Federation...
              </option>
            </select>
          </div>

          {/* New Onboarding Button */}
          <button
            onClick={onStartOnboarding}
            className="btn btn-primary"
            style={{ padding: "9px 18px", fontSize: "0.88rem" }}
          >
            <Plus size={16} /> Onboard Federation
          </button>

          {/* Logout Button */}
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = '/';
            }}
            className="btn btn-secondary"
            style={{ padding: "9px 16px", fontSize: "0.88rem", display: "flex", alignItems: "center", gap: "6px" }}
            title="Logout"
          >
            <LogOut size={16} /> Logout
          </button>

        </div>
      </div>
    </nav>
  );
}
