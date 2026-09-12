import React, { useState } from "react";
import {
  Building2,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  FileText,
  MapPin,
  ShieldCheck,
  UserCheck,
  Zap,
  Info,
  Mail,
  Phone
} from "lucide-react";
import { toast } from "react-hot-toast";
import type { CooperativeItem } from "./Navbar";

interface FederationOnboardingProps {
  onComplete?: (cooperative: CooperativeItem) => void;
  onCancel?: () => void;
}

export default function FederationOnboarding({ onComplete, onCancel }: FederationOnboardingProps) {
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    mobileNumber: "",
    registrationNumber: "",
    city: "",
    state: "",
    pinCode: "",
    streetAddress: "",
    primarySector: "Agriculture & Allied",
    memberCapacity: "100-500 Members",
    description: "Registered Cooperative Federation dedicated to organizing and empowering skilled gig workers.",
    statutoryDeclaration: true
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.name || !formData.email || !formData.password || !formData.registrationNumber) {
        toast.error("Please fill in all mandatory identity and admin fields.");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match. Please verify.");
        return;
      }
    } else if (step === 2) {
      if (!formData.city || !formData.state || !formData.pinCode) {
        toast.error("Please fill in city, state, and pin code.");
        return;
      }
    }
    setStep((prev) => Math.min(prev + 1, 4));
  };

  const handlePrev = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        mobileNumber: formData.mobileNumber || "9876543210",
        registrationNumber: formData.registrationNumber,
        address: {
          city: formData.city,
          state: formData.state,
          pinCode: formData.pinCode
        }
      };

      const response = await fetch("http://localhost:8000/cooperative/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(data.message || "Failed to register federation");
      }

      toast.success("Federation registered successfully!");
      if (onComplete) {
        onComplete(data.cooperative);
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong during registration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: "840px", margin: "0 auto", padding: "0 16px 48px 16px" }}>
      
      {/* Header Banner */}
      <div className="glass-card" style={{ padding: "28px 36px", marginBottom: "28px", background: "#ffffff" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <span className="badge badge-primary" style={{ marginBottom: "8px" }}>
              <Zap size={13} /> Onboarding Protocol
            </span>
            <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "1.65rem", fontWeight: 700, color: "var(--text-main)" }}>
              Establish Federation & Cooperative
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "4px" }}>
              Register mandatory identity, location, and statutory details required to establish the Federation and present it to workers.
            </p>
          </div>
          {onCancel && (
            <button onClick={onCancel} className="btn btn-secondary" style={{ fontSize: "0.85rem", padding: "8px 16px" }}>
              Cancel
            </button>
          )}
        </div>

        {/* Step Indicator */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "28px", gap: "12px", flexWrap: "wrap" }}>
          {[
            { num: 1, label: "Identity & Admin", icon: Building2 },
            { num: 2, label: "Location & Address", icon: MapPin },
            { num: 3, label: "Trade & Scope", icon: FileText },
            { num: 4, label: "Review & Establish", icon: ShieldCheck }
          ].map((item) => {
            const IconComponent = item.icon;
            const isActive = step === item.num;
            const isDone = step > item.num;

            return (
              <div
                key={item.num}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  opacity: isActive || isDone ? 1 : 0.5,
                  transition: "all 0.3s ease"
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: isActive ? "var(--primary)" : isDone ? "var(--emerald-bg)" : "var(--bg-tertiary)",
                    color: isActive ? "#ffffff" : isDone ? "var(--emerald-text)" : "var(--text-muted)",
                    fontWeight: 700,
                    fontSize: "0.88rem"
                  }}
                >
                  {isDone ? <CheckCircle2 size={18} /> : <IconComponent size={17} />}
                </div>
                <div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 600 }}>STEP {item.num}</div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 700, color: isActive ? "var(--text-main)" : "var(--text-muted)" }}>
                    {item.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Form Body */}
      <div className="glass-card" style={{ padding: "36px", background: "#ffffff" }}>
        
        {/* Step 1 */}
        {step === 1 && (
          <div className="animate-fade-in">
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px", color: "var(--text-main)" }}>
              <Building2 size={20} color="var(--primary)" /> Step 1: Federation Identity & Admin Account
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "24px" }}>
              Enter the official name, statutory registration number, and central administrative login details.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
              <div className="input-group" style={{ gridColumn: "1 / -1" }}>
                <label className="input-label">Official Cooperative / Federation Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Maharashtra Artisans & Agro Gig Cooperative"
                  className="custom-input"
                />
              </div>

              <div className="input-group">
                <label className="input-label">Statutory Registration Number *</label>
                <input
                  type="text"
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  className="custom-input"
                />
              </div>

              <div className="input-group">
                <label className="input-label">Official Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="admin@cooperative.org"
                  className="custom-input"
                />
              </div>

              <div className="input-group">
                <label className="input-label">Admin Password *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="custom-input"
                />
              </div>

              <div className="input-group">
                <label className="input-label">Official Contact Mobile Number *</label>
                <input
                  type="text"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  placeholder="+91 9876543210"
                  className="custom-input"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="animate-fade-in">
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px", color: "var(--text-main)" }}>
              <MapPin size={20} color="var(--primary)" /> Step 2: Registered Headquarters & Jurisdiction
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "24px" }}>
              Provide official physical address and regional office jurisdiction details.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
              <div className="input-group" style={{ gridColumn: "1 / -1" }}>
                <label className="input-label">Street / Office Building Address</label>
                <input
                  type="text"
                  name="streetAddress"
                  value={formData.streetAddress}
                  onChange={handleChange}
                  placeholder="Plot 42, Cooperative Bhavan, Sector 12"
                  className="custom-input"
                />
              </div>

              <div className="input-group">
                <label className="input-label">City / Headquarters *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="e.g. Pune"
                  className="custom-input"
                />
              </div>

              <div className="input-group">
                <label className="input-label">State / Union Territory *</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="custom-input"
                />
              </div>

              <div className="input-group">
                <label className="input-label">PIN Code *</label>
                <input
                  type="text"
                  name="pinCode"
                  value={formData.pinCode}
                  onChange={handleChange}
                  placeholder="411001"
                  className="custom-input"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="animate-fade-in">
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px", color: "var(--text-main)" }}>
              <FileText size={20} color="var(--primary)" /> Step 3: Trade Focus & Member Capacity
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <div className="input-group">
                <label className="input-label">Primary Skilled Trade / Sector Focus</label>
                <select
                  name="primarySector"
                  value={formData.primarySector}
                  onChange={handleChange}
                  className="custom-select"
                >
                  <option value="Agriculture & Farming Gig Workers">Agriculture & Farming Gig Workers</option>
                  <option value="Plumbing, Electrical & Sanitation">Plumbing, Electrical & Sanitation</option>
                  <option value="Construction & Carpentry Skilled Workers">Construction & Carpentry Skilled Workers</option>
                  <option value="Home Maintenance & Technical Repair">Home Maintenance & Technical Repair</option>
                  <option value="Multi-sector Artisanal Cooperative">Multi-sector Artisanal Cooperative</option>
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Target Member Worker Capacity</label>
                <select
                  name="memberCapacity"
                  value={formData.memberCapacity}
                  onChange={handleChange}
                  className="custom-select"
                >
                  <option value="50-100 Workers">50 - 100 Workers</option>
                  <option value="100-500 Workers">100 - 500 Workers</option>
                  <option value="500-2000 Workers">500 - 2,000 Workers</option>
                  <option value="2000+ Workers">2,000+ Workers</option>
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Federation Objective / Bio</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="custom-textarea"
                />
              </div>

              <div
                style={{
                  background: "var(--emerald-bg)",
                  border: "1px solid var(--emerald-border)",
                  borderRadius: "var(--radius-md)",
                  padding: "16px",
                  marginTop: "10px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "14px"
                }}
              >
                <input
                  type="checkbox"
                  id="statutoryDeclaration"
                  name="statutoryDeclaration"
                  checked={formData.statutoryDeclaration}
                  onChange={handleChange}
                  style={{ width: "20px", height: "20px", marginTop: "2px", accentColor: "var(--primary)" }}
                />
                <label htmlFor="statutoryDeclaration" style={{ fontSize: "0.88rem", color: "var(--text-muted)", cursor: "pointer", lineHeight: 1.5 }}>
                  <strong style={{ color: "var(--text-main)" }}>Mandatory Legal Declaration:</strong> I hereby certify that all information provided (Name, Registration #, Address) is accurate and legally binding under the Cooperative Societies Act.
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Step 4 */}
        {step === 4 && (
          <div className="animate-fade-in">
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px", color: "var(--primary)" }}>
              <ShieldCheck size={24} /> Step 4: Mandate & Registration Preview
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "24px" }}>
              Review the mandatory details below. Once confirmed, this federation will be registered live into MongoDB.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
                background: "var(--bg-input)",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-md)",
                padding: "24px",
                marginBottom: "28px"
              }}
            >
              <div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: 700 }}>Federation Name</span>
                <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-main)", marginTop: "2px" }}>{formData.name}</div>
              </div>

              <div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: 700 }}>Registration Number</span>
                <div style={{ marginTop: "2px" }}>
                  <span className="badge badge-primary">{formData.registrationNumber}</span>
                </div>
              </div>

              <div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: 700 }}>Location & Jurisdiction</span>
                <div style={{ fontSize: "0.92rem", color: "var(--text-muted)", marginTop: "2px" }}>
                  <MapPin size={14} style={{ display: "inline", verticalAlign: "text-bottom", marginRight: "4px" }} /> {formData.city}, {formData.state} - {formData.pinCode}
                </div>
              </div>

              <div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: 700 }}>Contact Info</span>
                <div style={{ fontSize: "0.92rem", color: "var(--text-muted)", marginTop: "2px" }}>
                  <Mail size={14} style={{ display: "inline", verticalAlign: "text-bottom", marginRight: "4px" }} /> {formData.email} | <Phone size={14} style={{ display: "inline", verticalAlign: "text-bottom", marginLeft: "8px", marginRight: "4px" }} /> {formData.mobileNumber}
                </div>
              </div>

              <div style={{ gridColumn: "1 / -1", borderTop: "1px dashed var(--border-color)", paddingTop: "14px" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: 700 }}>Primary Trade Sector & Capacity</span>
                <div style={{ fontSize: "0.92rem", color: "var(--primary)", fontWeight: 600, marginTop: "2px" }}>
                  {formData.primarySector} ({formData.memberCapacity})
                </div>
              </div>
            </div>

            <div
              style={{
                background: "var(--primary-light)",
                border: "1px solid var(--border-color-hover)",
                borderRadius: "var(--radius-md)",
                padding: "14px 18px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                color: "var(--primary)",
                fontSize: "0.85rem",
                marginBottom: "24px"
              }}
            >
              <Info size={18} style={{ flexShrink: 0 }} />
              <div>
                Upon establishing, your Federation dashboard will immediately generate a live Worker Verification Inbox and public transparency profile.
              </div>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "32px", borderTop: "1px solid var(--border-color)", paddingTop: "24px" }}>
          {step > 1 ? (
            <button onClick={handlePrev} className="btn btn-secondary" type="button">
              <ChevronLeft size={18} /> Back
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button onClick={handleNext} className="btn btn-primary" type="button">
              Continue <ChevronRight size={18} />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={loading} className="btn btn-primary" type="button">
              {loading ? "Registering..." : "Confirm & Establish Federation"} <UserCheck size={18} />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
