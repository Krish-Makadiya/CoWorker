import React, { useState, useEffect } from "react";
import {
  Building2,
  Users,
  ShieldCheck,
  Eye,
  MapPin,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Edit3,
  Phone,
  Mail,
  Star,
  Search,
  Plus,
  UserPlus
} from "lucide-react";
import { toast } from "react-hot-toast";
import Navbar, { type CooperativeItem } from "../components/Navbar";
import FederationOnboarding from "../components/FederationOnboarding";

export default function FederationDashboard() {
  const [cooperatives, setCooperatives] = useState<CooperativeItem[]>([]);
  const [selectedCoopId, setSelectedCoopId] = useState<string>("");
  const [cooperative, setCooperative] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAddingNewOnboarding, setIsAddingNewOnboarding] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<"overview" | "workers" | "verification" | "workerView">("overview");
  const [workers, setWorkers] = useState<any[]>([]);
  const [loadingWorkers, setLoadingWorkers] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Edit profile state
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
    registrationNumber: "",
    city: "",
    state: "",
    pinCode: ""
  });

  // Add Worker State
  const [isAddingWorker, setIsAddingWorker] = useState<boolean>(false);
  const [submittingWorker, setSubmittingWorker] = useState<boolean>(false);
  const [workerFormData, setWorkerFormData] = useState({
    name: "",
    email: "",
    mobileNumber: "",
    password: "",
    confirmPassword: "",
    skills: "Plumbing, Electrical",
    experience: 3,
    certifications: "ITI Plumbing",
    address: "",
    verification: "verified"
  });

  // Edit Worker Directory State
  const [editingWorker, setEditingWorker] = useState<any | null>(null);
  const [submittingEditWorker, setSubmittingEditWorker] = useState<boolean>(false);
  const [editWorkerFormData, setEditWorkerFormData] = useState({
    skills: "",
    experience: 0,
    certifications: "",
    address: ""
  });

  const handleStartEditWorker = (worker: any) => {
    setEditingWorker(worker);
    setEditWorkerFormData({
      skills: worker.skills?.join(", ") || "",
      experience: worker.experience || 0,
      certifications: worker.certifications?.join(", ") || "",
      address: worker.address || ""
    });
  };

  const handleSaveEditWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWorker) return;
    setSubmittingEditWorker(true);

    try {
      const skillsArray = editWorkerFormData.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const certsArray = editWorkerFormData.certifications
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);

      const payload = {
        skills: skillsArray,
        experience: Number(editWorkerFormData.experience) || 0,
        certifications: certsArray,
        address: editWorkerFormData.address.trim()
      };

      const workerId = editingWorker._id;
      const response = await fetch(`http://localhost:8000/worker/${workerId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "user-id": typeof userId === "object" ? userId._id : userId
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(data.message || "Failed to update worker details");
      }

      toast.success(`Worker '${editingWorker.userId?.name || ""}' details updated!`);
      setEditingWorker(null);
      fetchWorkers();
    } catch (err: any) {
      toast.error(err.message || "Failed to update worker details.");
    } finally {
      setSubmittingEditWorker(false);
    }
  };

  const fetchCooperatives = async () => {
    setLoading(true);
    try {
      const loggedUserId = localStorage.getItem("userId") || "";
      const response = await fetch("http://localhost:8000/cooperative");
      const data = await response.json();
      if (response.ok && data.success && data.cooperatives?.length > 0) {
        setCooperatives(data.cooperatives);
        const userCoop = loggedUserId
          ? data.cooperatives.find((c: any) => {
              const cUserId = typeof c.userId === "object" ? c.userId?._id : c.userId;
              return cUserId === loggedUserId;
            })
          : null;
        const activeId = selectedCoopId || (userCoop ? userCoop._id : data.cooperatives[0]._id);
        setSelectedCoopId(activeId);
        const current = data.cooperatives.find((c: any) => c._id === activeId) || data.cooperatives[0];
        setCooperative(current);
      } else {
        setCooperatives([]);
        setCooperative(null);
      }
    } catch (err) {
      console.error("Error fetching cooperatives:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCooperatives();
  }, []);

  const handleSelectCoop = (coopId: string) => {
    setSelectedCoopId(coopId);
    setIsAddingNewOnboarding(false);
    const found = cooperatives.find((c) => c._id === coopId);
    if (found) {
      setCooperative(found);
    }
  };

  const userId = cooperative?.userId?._id || cooperative?.userId;

  const fetchWorkers = async () => {
    if (!userId) return;
    setLoadingWorkers(true);

    try {
      const response = await fetch("http://localhost:8000/worker", {
        headers: {
          "user-id": typeof userId === "object" ? userId._id : userId
        }
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setWorkers(data.workers || []);
      } else {
        setWorkers([]);
      }
    } catch (err) {
      console.error("Error fetching workers:", err);
    } finally {
      setLoadingWorkers(false);
    }
  };

  useEffect(() => {
    if (cooperative) {
      fetchWorkers();
      setEditFormData({
        name: cooperative.name || "",
        registrationNumber: cooperative.registrationNumber || "",
        city: cooperative.address?.city || "",
        state: cooperative.address?.state || "",
        pinCode: cooperative.address?.pinCode || ""
      });
      setWorkerFormData((prev) => ({
        ...prev,
        address: `${cooperative.address?.city || ""}, ${cooperative.address?.state || ""}`
      }));
    }
  }, [cooperative]);

  const handleUpdateStatus = async (workerId: string, newStatus: string) => {
    try {
      const response = await fetch(`http://localhost:8000/worker/${workerId}/verify`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "user-id": typeof userId === "object" ? userId._id : userId
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(data.message || "Failed to update worker verification status");
      }

      toast.success(data.message || `Worker verification status updated to '${newStatus}'`);
      fetchWorkers();
    } catch (err: any) {
      toast.error(err.message || "Failed to update worker verification status.");
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        name: editFormData.name,
        registrationNumber: editFormData.registrationNumber,
        address: {
          city: editFormData.city,
          state: editFormData.state,
          pinCode: editFormData.pinCode
        }
      };

      const response = await fetch("http://localhost:8000/cooperative/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "user-id": typeof userId === "object" ? userId._id : userId
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(data.message || "Failed to update profile");
      }

      toast.success("Federation profile updated successfully!");
      setIsEditing(false);
      fetchCooperatives();
    } catch (err: any) {
      toast.error(err.message || "Error updating federation profile.");
    }
  };

  const handleAddWorkerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (workerFormData.password !== workerFormData.confirmPassword) {
      toast.error("Passwords do not match. Please verify and try again.");
      return;
    }

    setSubmittingWorker(true);

    try {
      const skillsArray = workerFormData.skills.split(",").map((s) => s.trim()).filter(Boolean);
      const certsArray = workerFormData.certifications.split(",").map((c) => c.trim()).filter(Boolean);

      const payload = {
        name: workerFormData.name,
        email: workerFormData.email,
        mobileNumber: workerFormData.mobileNumber,
        password: workerFormData.password,
        cooperativeId: cooperative._id,
        skills: skillsArray,
        experience: Number(workerFormData.experience) || 0,
        certifications: certsArray,
        address: workerFormData.address,
        verification: "verified"
      };

      const response = await fetch("http://localhost:8000/worker/register-by-cooperative", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "user-id": typeof userId === "object" ? userId._id : userId
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(data.message || "Failed to register worker");
      }

      toast.success(`Worker '${workerFormData.name}' registered & added directly as verified member!`);
      setIsAddingWorker(false);
      setWorkerFormData({
        name: "",
        email: "",
        mobileNumber: "",
        password: "",
        confirmPassword: "",
        skills: "Plumbing, Electrical",
        experience: 3,
        certifications: "ITI Plumbing",
        address: `${cooperative.address?.city || ""}, ${cooperative.address?.state || ""}`,
        verification: "verified"
      });
      fetchWorkers();
    } catch (err: any) {
      toast.error(err.message || "Failed to add worker directly.");
    } finally {
      setSubmittingWorker(false);
    }
  };

  const totalWorkers = workers.length;
  const verifiedWorkers = workers.filter((w) => w.verification === "verified").length;
  const pendingWorkers = workers.filter((w) => w.verification === "pending").length;

  const filteredWorkers = workers.filter((w) => {
    const name = w.userId?.name?.toLowerCase() || "";
    const email = w.userId?.email?.toLowerCase() || "";
    const skills = w.skills?.join(" ")?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();
    return name.includes(query) || email.includes(query) || skills.includes(query);
  });

  return (
    <div style={{ minHeight: "100vh", background: "#f8faf7" }}>
      <Navbar
        portalName="Federation & Cooperative Portal"
        portalIcon={Building2}
        cooperatives={cooperatives}
        selectedCoopId={selectedCoopId}
        onSelectCoop={handleSelectCoop}
        onStartOnboarding={() => setIsAddingNewOnboarding(true)}
        onRefresh={() => {
          fetchCooperatives();
          fetchWorkers();
          toast.success("Database records refreshed");
        }}
        loading={loading || loadingWorkers}
      />

      {isAddingNewOnboarding ? (
        <FederationOnboarding
          onCancel={() => setIsAddingNewOnboarding(false)}
          onComplete={() => {
            setIsAddingNewOnboarding(false);
            fetchCooperatives();
            toast.success("New Federation onboarded successfully!");
          }}
        />
      ) : (
        <div className="animate-fade-in" style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 16px 64px 16px" }}>
          
          {/* Minimal Header Card */}
          <div className="glass-card" style={{ padding: "28px 32px", marginBottom: "24px", background: "#ffffff", borderRadius: "12px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "20px" }}>
              
              <div style={{ display: "flex", gap: "18px", alignItems: "center" }}>
                <div
                  style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "16px",
                    background: "var(--primary-light, #eaf1e7)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid #d4e3d0",
                    flexShrink: 0
                  }}
                >
                  <Building2 size={28} color="var(--primary, #385e38)" />
                </div>

                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                    <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "1.75rem", fontWeight: 700, color: "var(--text-main, #1a2e1a)" }}>
                      {cooperative?.name || "Federation Management"}
                    </h1>
                    <span className="badge badge-primary" style={{ background: "#eaf1e7", color: "#385e38", padding: "4px 10px", borderRadius: "6px", fontSize: "0.8rem", fontWeight: 600 }}>
                      {cooperative?.registrationNumber || "COOP-REG"}
                    </span>
                    <span className="badge badge-emerald" style={{ background: "#e6f4ea", color: "#137333", padding: "4px 10px", borderRadius: "6px", fontSize: "0.8rem", fontWeight: 600 }}>
                      <ShieldCheck size={13} /> Verified Federation
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "6px", flexWrap: "wrap", color: "var(--text-muted, #5f6368)", fontSize: "0.88rem" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <MapPin size={14} color="var(--primary, #385e38)" /> {cooperative?.address?.city || "MH"}, {cooperative?.address?.state || "India"} - {cooperative?.address?.pinCode || ""}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <Mail size={14} color="var(--primary, #385e38)" /> {cooperative?.userId?.email || "coop@federation.org"}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <Phone size={14} color="var(--primary, #385e38)" /> {cooperative?.userId?.mobileNumber || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <button
                  onClick={() => {
                    setIsAddingWorker(!isAddingWorker);
                    setIsEditing(false);
                  }}
                  className="btn btn-primary"
                  style={{ fontSize: "0.85rem", padding: "8px 14px", background: "#385e38", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}
                >
                  <UserPlus size={15} /> {isAddingWorker ? "Close Add Worker" : "+ Add Worker Directly"}
                </button>

                <button
                  onClick={() => {
                    setIsEditing(!isEditing);
                    setIsAddingWorker(false);
                  }}
                  className="btn btn-secondary"
                  style={{ fontSize: "0.85rem", padding: "8px 14px", background: "#f1f3f4", border: "1px solid #dadce0", borderRadius: "6px", cursor: "pointer" }}
                >
                  <Edit3 size={14} /> {isEditing ? "Close Edit" : "Edit Details"}
                </button>

                <button
                  onClick={() => setIsAddingNewOnboarding(true)}
                  className="btn btn-secondary"
                  style={{ fontSize: "0.85rem", padding: "8px 14px", background: "#f1f3f4", border: "1px solid #dadce0", borderRadius: "6px", cursor: "pointer" }}
                >
                  <Plus size={14} /> Onboard Another
                </button>
              </div>
            </div>

            {/* Minimal Top Statistics Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "16px", marginTop: "24px" }}>
              
              <div className="glass-card" style={{ padding: "16px 20px", background: "#ffffff", border: "1px solid #e8ebe7", borderRadius: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#5f6368" }}>Total Workers</span>
                  <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#eaf1e7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Users size={16} color="#385e38" />
                  </div>
                </div>
                <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "#1a2e1a" }}>
                  {totalWorkers}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#5f6368", marginTop: "2px" }}>Affiliated Members</div>
              </div>

              <div className="glass-card" style={{ padding: "16px 20px", background: "#ffffff", border: "1px solid #e8ebe7", borderRadius: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#5f6368" }}>Active Verified</span>
                  <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#e6f4ea", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <CheckCircle2 size={16} color="#137333" />
                  </div>
                </div>
                <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "#1a2e1a" }}>
                  {verifiedWorkers}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#137333", marginTop: "2px" }}>Verified Credentials</div>
              </div>

              <div className="glass-card" style={{ padding: "16px 20px", background: "#ffffff", border: "1px solid #e8ebe7", borderRadius: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#5f6368" }}>Pending Approvals</span>
                  <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#fef7e0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Clock size={16} color="#b06000" />
                  </div>
                </div>
                <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "#1a2e1a" }}>
                  {pendingWorkers}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#b06000", marginTop: "2px" }}>Requires Review</div>
              </div>

              <div className="glass-card" style={{ padding: "16px 20px", background: "#ffffff", border: "1px solid #e8ebe7", borderRadius: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#5f6368" }}>Trust Score</span>
                  <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#f3e8fd", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Star size={16} color="#8e24aa" />
                  </div>
                </div>
                <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "#1a2e1a" }}>
                  4.9 / 5
                </div>
                <div style={{ fontSize: "0.75rem", color: "#5f6368", marginTop: "2px" }}>High Satisfaction</div>
              </div>

            </div>
          </div>

          {/* Edit Profile Form */}
          {isEditing && (
            <div className="glass-card animate-fade-in" style={{ padding: "28px", marginBottom: "24px", background: "#ffffff", borderRadius: "12px" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "16px", color: "#1a2e1a" }}>
                Edit Federation Statutory Profile
              </h3>
              <form onSubmit={handleSaveProfile} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#5f6368", display: "block", marginBottom: "4px" }}>Federation Name</label>
                  <input
                    type="text"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #dadce0" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#5f6368", display: "block", marginBottom: "4px" }}>Registration Number</label>
                  <input
                    type="text"
                    value={editFormData.registrationNumber}
                    onChange={(e) => setEditFormData({ ...editFormData, registrationNumber: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #dadce0" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#5f6368", display: "block", marginBottom: "4px" }}>City / HQ</label>
                  <input
                    type="text"
                    value={editFormData.city}
                    onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #dadce0" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#5f6368", display: "block", marginBottom: "4px" }}>State</label>
                  <input
                    type="text"
                    value={editFormData.state}
                    onChange={(e) => setEditFormData({ ...editFormData, state: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #dadce0" }}
                  />
                </div>
                <div style={{ gridColumn: "1 / -1", display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "12px" }}>
                  <button type="button" onClick={() => setIsEditing(false)} style={{ padding: "8px 16px", borderRadius: "6px", border: "1px solid #dadce0", background: "#fff", cursor: "pointer" }}>Cancel</button>
                  <button type="submit" style={{ padding: "8px 16px", borderRadius: "6px", border: "none", background: "#385e38", color: "#fff", cursor: "pointer" }}>Save Changes</button>
                </div>
              </form>
            </div>
          )}

          {/* Add Worker Directly Form */}
          {isAddingWorker && (
            <div className="glass-card animate-fade-in" style={{ padding: "28px", marginBottom: "24px", background: "#ffffff", borderRadius: "12px" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "16px", color: "#1a2e1a" }}>
                Add New Skilled Worker Directly to {cooperative?.name}
              </h3>
              <form onSubmit={handleAddWorkerSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#5f6368", display: "block", marginBottom: "4px" }}>Full Name</label>
                  <input
                    type="text"
                    required
                    value={workerFormData.name}
                    onChange={(e) => setWorkerFormData({ ...workerFormData, name: e.target.value })}
                    placeholder="Ramesh Kumar"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #dadce0" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#5f6368", display: "block", marginBottom: "4px" }}>Email</label>
                  <input
                    type="email"
                    required
                    value={workerFormData.email}
                    onChange={(e) => setWorkerFormData({ ...workerFormData, email: e.target.value })}
                    placeholder="ramesh@worker.org"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #dadce0" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#5f6368", display: "block", marginBottom: "4px" }}>Mobile Number</label>
                  <input
                    type="text"
                    required
                    value={workerFormData.mobileNumber}
                    onChange={(e) => setWorkerFormData({ ...workerFormData, mobileNumber: e.target.value })}
                    placeholder="+91 9876543210"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #dadce0" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#5f6368", display: "block", marginBottom: "4px" }}>Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={workerFormData.password}
                    onChange={(e) => setWorkerFormData({ ...workerFormData, password: e.target.value })}
                    placeholder="Set worker password (min 6 chars)"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #dadce0" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#5f6368", display: "block", marginBottom: "4px" }}>Confirm Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={workerFormData.confirmPassword}
                    onChange={(e) => setWorkerFormData({ ...workerFormData, confirmPassword: e.target.value })}
                    placeholder="Confirm worker password"
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      border: workerFormData.confirmPassword && workerFormData.password !== workerFormData.confirmPassword
                        ? "1px solid #c5221f"
                        : "1px solid #dadce0"
                    }}
                  />
                  {workerFormData.confirmPassword && workerFormData.password !== workerFormData.confirmPassword && (
                    <span style={{ fontSize: "0.75rem", color: "#c5221f", marginTop: "2px", display: "block" }}>
                      Passwords do not match
                    </span>
                  )}
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#5f6368", display: "block", marginBottom: "4px" }}>Skills (comma separated)</label>
                  <input
                    type="text"
                    value={workerFormData.skills}
                    onChange={(e) => setWorkerFormData({ ...workerFormData, skills: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #dadce0" }}
                  />
                </div>
                <div style={{ gridColumn: "1 / -1", display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "12px" }}>
                  <button type="button" onClick={() => setIsAddingWorker(false)} style={{ padding: "8px 16px", borderRadius: "6px", border: "1px solid #dadce0", background: "#fff", cursor: "pointer" }}>Cancel</button>
                  <button type="submit" disabled={submittingWorker} style={{ padding: "8px 16px", borderRadius: "6px", border: "none", background: "#385e38", color: "#fff", cursor: "pointer" }}>
                    {submittingWorker ? "Adding..." : "Add & Verify Worker"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Navigation Tabs */}
          <div style={{ display: "flex", gap: "12px", borderBottom: "1px solid #dadce0", paddingBottom: "12px", marginBottom: "24px" }}>
            {[
              { key: "overview", label: "Overview & Specifications", icon: FileText },
              { key: "workers", label: `Worker Directory (${workers.length})`, icon: Users },
              { key: "verification", label: `Verification Inbox (${pendingWorkers})`, icon: Clock },
              { key: "workerView", label: "Worker View Preview", icon: Eye }
            ].map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 18px",
                    borderRadius: "8px",
                    fontWeight: 600,
                    fontSize: "0.88rem",
                    border: "none",
                    background: isActive ? "#385e38" : "transparent",
                    color: isActive ? "#ffffff" : "#5f6368",
                    cursor: "pointer",
                    transition: "all 0.2s ease"
                  }}
                >
                  <TabIcon size={16} /> {tab.label}
                </button>
              );
            })}
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div className="glass-card" style={{ padding: "28px", background: "#ffffff", borderRadius: "12px" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#1a2e1a", marginBottom: "16px" }}>
                  Official Federation Mandate & Governance
                </h3>
                <p style={{ color: "#5f6368", lineHeight: 1.6, fontSize: "0.92rem" }}>
                  This Federation serves as an autonomous cooperative entity representing registered gig workers across trades in {cooperative?.address?.city || "Maharashtra"}. All worker members undergo verification by the federation administration before being assigned certified client requests.
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px", marginTop: "24px" }}>
                  <div style={{ background: "#f8faf7", padding: "16px", borderRadius: "8px", border: "1px solid #e8ebe7" }}>
                    <div style={{ fontSize: "0.75rem", color: "#5f6368", fontWeight: 600 }}>COOPERATIVE ID</div>
                    <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1a2e1a", marginTop: "4px" }}>{cooperative?._id}</div>
                  </div>
                  <div style={{ background: "#f8faf7", padding: "16px", borderRadius: "8px", border: "1px solid #e8ebe7" }}>
                    <div style={{ fontSize: "0.75rem", color: "#5f6368", fontWeight: 600 }}>REGISTRATION NUMBER</div>
                    <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#385e38", marginTop: "4px" }}>{cooperative?.registrationNumber}</div>
                  </div>
                  <div style={{ background: "#f8faf7", padding: "16px", borderRadius: "8px", border: "1px solid #e8ebe7" }}>
                    <div style={{ fontSize: "0.75rem", color: "#5f6368", fontWeight: 600 }}>HEADQUARTERS</div>
                    <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1a2e1a", marginTop: "4px" }}>{cooperative?.address?.city}, {cooperative?.address?.state}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: WORKERS DIRECTORY */}
          {activeTab === "workers" && (
            <div className="animate-fade-in">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
                <div style={{ position: "relative", minWidth: "300px" }}>
                  <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#5f6368" }} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by worker name, email or skill..."
                    style={{ width: "100%", padding: "10px 12px 10px 36px", borderRadius: "8px", border: "1px solid #dadce0" }}
                  />
                </div>

                <button onClick={fetchWorkers} style={{ padding: "8px 16px", borderRadius: "6px", border: "1px solid #dadce0", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                  Refresh List
                </button>
              </div>

              {loadingWorkers ? (
                <div style={{ padding: "40px", textAlign: "center", color: "#5f6368" }}>Loading worker directory...</div>
              ) : filteredWorkers.length === 0 ? (
                <div style={{ padding: "40px", textAlign: "center", background: "#fff", borderRadius: "12px", border: "1px solid #e8ebe7" }}>
                  No workers found matching your query.
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
                  {filteredWorkers.map((worker) => (
                    <div key={worker._id} style={{ background: "#ffffff", padding: "20px", borderRadius: "12px", border: "1px solid #e8ebe7", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                        <div>
                          <h4 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#1a2e1a" }}>
                            {worker.userId?.name || "Worker Name"}
                          </h4>
                          <div style={{ fontSize: "0.8rem", color: "#5f6368" }}>
                            <Mail size={13} style={{ display: "inline", verticalAlign: "text-bottom", marginRight: "3px" }} /> {worker.userId?.email} | <Phone size={13} style={{ display: "inline", verticalAlign: "text-bottom", marginLeft: "6px", marginRight: "3px" }} /> {worker.userId?.mobileNumber}
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span
                            style={{
                              padding: "4px 10px",
                              borderRadius: "6px",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              background: worker.verification === "verified" ? "#e6f4ea" : worker.verification === "pending" ? "#fef7e0" : "#fce8e6",
                              color: worker.verification === "verified" ? "#137333" : worker.verification === "pending" ? "#b06000" : "#c5221f"
                            }}
                          >
                            {worker.verification}
                          </span>
                          <select
                            value={worker.verification}
                            onChange={(e) => handleUpdateStatus(worker._id, e.target.value)}
                            title="Change verification status"
                            style={{
                              padding: "2px 6px",
                              borderRadius: "4px",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              border: "1px solid #dadce0",
                              background: "#ffffff",
                              color: "#3c4043",
                              cursor: "pointer"
                            }}
                          >
                            <option value="verified">verified</option>
                            <option value="pending">pending</option>
                            <option value="rejected">rejected</option>
                          </select>
                        </div>
                      </div>

                      <div style={{ margin: "14px 0", fontSize: "0.85rem", display: "flex", flexDirection: "column", gap: "4px", color: "#3c4043" }}>
                        <div><strong>Skills:</strong> {worker.skills?.join(", ") || "General"}</div>
                        <div><strong>Experience:</strong> {worker.experience || 0} Years</div>
                        <div><strong>Certifications:</strong> {worker.certifications?.join(", ") || "None"}</div>
                        <div><strong>Address:</strong> {worker.address || "N/A"}</div>
                      </div>

                      <div style={{ marginTop: "12px", paddingTop: "10px", borderTop: "1px solid #f1f3f4", display: "flex", justifyContent: "flex-end" }}>
                        <button
                          onClick={() => handleStartEditWorker(worker)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "6px 12px",
                            fontSize: "0.8rem",
                            fontWeight: 600,
                            borderRadius: "6px",
                            border: "1px solid #dadce0",
                            background: "#f8faf7",
                            color: "#385e38",
                            cursor: "pointer"
                          }}
                        >
                          <Edit3 size={13} /> Edit Worker Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: VERIFICATION INBOX */}
          {activeTab === "verification" && (
            <div className="animate-fade-in">
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#1a2e1a", marginBottom: "16px" }}>
                Worker Verification Queue ({pendingWorkers})
              </h3>
              {pendingWorkers === 0 ? (
                <div style={{ padding: "40px", textAlign: "center", background: "#fff", borderRadius: "12px", border: "1px solid #e8ebe7" }}>
                  <CheckCircle2 size={32} color="#137333" style={{ marginBottom: "8px" }} />
                  <p style={{ color: "#5f6368" }}>No pending verification requests in the queue.</p>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "16px" }}>
                  {workers
                    .filter((w) => w.verification === "pending")
                    .map((worker) => (
                      <div key={worker._id} style={{ padding: "20px", background: "#ffffff", borderRadius: "12px", border: "1px solid #e8ebe7" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                          <div>
                            <h4 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#1a2e1a" }}>{worker.userId?.name}</h4>
                            <div style={{ fontSize: "0.8rem", color: "#5f6368" }}><Mail size={13} style={{ display: "inline", verticalAlign: "text-bottom", marginRight: "3px" }} /> {worker.userId?.email} | <Phone size={13} style={{ display: "inline", verticalAlign: "text-bottom", marginLeft: "6px", marginRight: "3px" }} /> {worker.userId?.mobileNumber}</div>
                          </div>
                          <span style={{ background: "#fef7e0", color: "#b06000", padding: "4px 8px", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 600 }}>Pending</span>
                        </div>

                        <div style={{ margin: "14px 0", fontSize: "0.84rem", display: "flex", flexDirection: "column", gap: "4px" }}>
                          <div><strong>Skills:</strong> {worker.skills?.join(", ")}</div>
                          <div><strong>Experience:</strong> {worker.experience} Years</div>
                          <div><strong>Certifications:</strong> {worker.certifications?.join(", ") || "None"}</div>
                          <div><strong>Address:</strong> {worker.address}</div>
                        </div>

                        <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
                          <button
                            onClick={() => handleUpdateStatus(worker._id, "verified")}
                            style={{ flex: 1, padding: "8px", background: "#385e38", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}
                          >
                            <CheckCircle2 size={15} /> Approve Member
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(worker._id, "rejected")}
                            style={{ flex: 1, padding: "8px", background: "#fce8e6", color: "#c5221f", border: "1px solid #fad2cf", borderRadius: "6px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}
                          >
                            <XCircle size={15} /> Reject
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: WORKER VIEW PREVIEW */}
          {activeTab === "workerView" && (
            <div className="animate-fade-in">
              <div style={{ background: "#eaf1e7", border: "1px solid #d4e3d0", borderRadius: "8px", padding: "14px 18px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px", color: "#385e38", fontSize: "0.86rem" }}>
                <Eye size={18} />
                <div><strong>Worker View Mode:</strong> Preview showing how gig workers view this Federation's details when choosing a cooperative.</div>
              </div>

              <div style={{ padding: "32px", background: "#ffffff", borderRadius: "12px", border: "1px solid #e8ebe7" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e8ebe7", paddingBottom: "18px", marginBottom: "20px", flexWrap: "wrap", gap: "14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div style={{ width: "50px", height: "50px", borderRadius: "14px", background: "#385e38", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Building2 size={24} color="#ffffff" />
                    </div>
                    <div>
                      <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#1a2e1a" }}>{cooperative?.name}</h2>
                      <div style={{ fontSize: "0.82rem", color: "#137333", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
                        <ShieldCheck size={14} /> Official Verified Guild Federation
                      </div>
                    </div>
                  </div>

                  <button style={{ padding: "8px 16px", borderRadius: "6px", border: "none", background: "#385e38", color: "#fff", cursor: "pointer" }}>
                    Apply to Join Federation
                  </button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px", marginBottom: "24px" }}>
                  <div style={{ background: "#f8faf7", padding: "14px", borderRadius: "8px", border: "1px solid #e8ebe7" }}>
                    <div style={{ fontSize: "0.72rem", color: "#5f6368" }}>Registration Number</div>
                    <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1a2e1a", marginTop: "2px" }}>{cooperative?.registrationNumber}</div>
                  </div>
                  <div style={{ background: "#f8faf7", padding: "14px", borderRadius: "8px", border: "1px solid #e8ebe7" }}>
                    <div style={{ fontSize: "0.72rem", color: "#5f6368" }}>Regional Office / City</div>
                    <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1a2e1a", marginTop: "2px" }}>{cooperative?.address?.city}, {cooperative?.address?.state}</div>
                  </div>
                  <div style={{ background: "#f8faf7", padding: "14px", borderRadius: "8px", border: "1px solid #e8ebe7" }}>
                    <div style={{ fontSize: "0.72rem", color: "#5f6368" }}>Active Registered Members</div>
                    <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#137333", marginTop: "2px" }}>{totalWorkers} Skilled Workers</div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Edit Worker Details Modal */}
      {editingWorker && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "16px",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "12px",
              maxWidth: "520px",
              width: "100%",
              padding: "24px",
              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
                borderBottom: "1px solid #e8ebe7",
                paddingBottom: "12px",
              }}
            >
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#1a2e1a" }}>
                Edit Worker Details ({editingWorker.userId?.name || "Worker"})
              </h3>
              <button
                onClick={() => setEditingWorker(null)}
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  fontSize: "1.2rem",
                  color: "#5f6368",
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditWorker} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#5f6368", display: "block", marginBottom: "4px" }}>
                  Worker Name
                </label>
                <input
                  type="text"
                  disabled
                  value={editingWorker.userId?.name || ""}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #dadce0", background: "#f8faf7" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#5f6368", display: "block", marginBottom: "4px" }}>
                  Skills (comma-separated)
                </label>
                <input
                  type="text"
                  value={editWorkerFormData.skills}
                  onChange={(e) => setEditWorkerFormData({ ...editWorkerFormData, skills: e.target.value })}
                  placeholder="e.g. Plumbing, Electrical, Carpentry"
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #dadce0" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#5f6368", display: "block", marginBottom: "4px" }}>
                    Experience (Years)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editWorkerFormData.experience}
                    onChange={(e) => setEditWorkerFormData({ ...editWorkerFormData, experience: Number(e.target.value) || 0 })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #dadce0" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#5f6368", display: "block", marginBottom: "4px" }}>
                    Certifications (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={editWorkerFormData.certifications}
                    onChange={(e) => setEditWorkerFormData({ ...editWorkerFormData, certifications: e.target.value })}
                    placeholder="e.g. ITI, NSDC"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #dadce0" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#5f6368", display: "block", marginBottom: "4px" }}>
                  Address
                </label>
                <input
                  type="text"
                  value={editWorkerFormData.address}
                  onChange={(e) => setEditWorkerFormData({ ...editWorkerFormData, address: e.target.value })}
                  placeholder="Worker address"
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #dadce0" }}
                />
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "12px", borderTop: "1px solid #e8ebe7", paddingTop: "12px" }}>
                <button
                  type="button"
                  onClick={() => setEditingWorker(null)}
                  style={{ padding: "8px 16px", borderRadius: "6px", border: "1px solid #dadce0", background: "#fff", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingEditWorker}
                  style={{ padding: "8px 16px", borderRadius: "6px", border: "none", background: "#385e38", color: "#fff", cursor: "pointer", fontWeight: 600 }}
                >
                  {submittingEditWorker ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
