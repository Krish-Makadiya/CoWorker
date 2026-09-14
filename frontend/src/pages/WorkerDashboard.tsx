import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Wrench,
  Briefcase,
  Search,
  User,
  MapPin,
  Calendar,
  Camera,
  Loader2,
  Play,
  CheckCircle,
  RefreshCw,
  Clock,
  Mail,
  Phone,
  Shield,
  Star,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Images,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Navbar from "../components/Navbar";
import { ROUTES } from "../config/api";
import "./Dashboard.css";

interface ServiceRequest {
  _id: string;
  title: string;
  description: string;
  address: string;
  status: "open" | "accepted" | "in_progress" | "completed" | "cancelled";
  scheduledAt: string;
  createdAt: string;
  preServicePhotos?: string[];
  postServicePhotos?: string[];
  serviceId?: {
    _id?: string;
    name?: string;
    category?: string;
    basePrice?: number;
  };
  customerId?: {
    _id?: string;
    userId?: {
      name?: string;
      email?: string;
      mobileNumber?: string;
    };
  };
  workerId?:
    | string
    | {
        _id?: string;
        userId?: {
          name?: string;
        };
      };
}

function JobCardCarousel({
  photos,
  onClick,
}: {
  photos?: string[];
  onClick: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!photos || photos.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % photos.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [photos]);

  if (!photos || photos.length === 0) {
    return (
      <div
        className="card-photo-carousel"
        onClick={onClick}
        style={{ cursor: "pointer" }}
      >
        <div className="carousel-no-photos">
          <Camera size={32} opacity={0.4} />
          <span style={{ fontSize: "0.8rem", opacity: 0.6 }}>
            No Pre-photos Attached
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="card-photo-carousel"
      onClick={onClick}
      style={{ cursor: "pointer" }}
    >
      {photos.map((photo, index) => (
        <img
          key={index}
          src={photo}
          alt={`Pre-photo ${index + 1}`}
          className={index === currentIndex ? "active" : ""}
        />
      ))}

      {photos.length > 1 && (
        <>
          <div className="card-photo-count">
            <Camera size={12} />
            <span>
              {currentIndex + 1}/{photos.length}
            </span>
          </div>
          <div className="carousel-dots" onClick={(e) => e.stopPropagation()}>
            {photos.map((_, index) => (
              <button
                key={index}
                className={`carousel-dot ${index === currentIndex ? "active" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(index);
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function WorkerDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<
    "ongoing-jobs" | "previous-jobs" | "available-jobs" | "profile"
  >("ongoing-jobs");

  const [ongoingJobs, setOngoingJobs] = useState<ServiceRequest[]>([]);
  const [previousJobs, setPreviousJobs] = useState<ServiceRequest[]>([]);
  const [availableJobs, setAvailableJobs] = useState<ServiceRequest[]>([]);

  const [isLoadingOngoing, setIsLoadingOngoing] = useState(false);
  const [isLoadingPrevious, setIsLoadingPrevious] = useState(false);
  const [isLoadingAvailable, setIsLoadingAvailable] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const [userData, setUserData] = useState<any>(null);
  const [workerProfile, setWorkerProfile] = useState<any>(null);

  const [cooperatives, setCooperatives] = useState<{ _id: string; name: string }[]>([]);
  const [selectedCoopId, setSelectedCoopId] = useState<string>("");
  const [isJoiningCoop, setIsJoiningCoop] = useState<boolean>(false);

  const [selectedJobModal, setSelectedJobModal] =
    useState<ServiceRequest | null>(null);
  const [lightbox, setLightbox] = useState<{
    photos: string[];
    index: number;
  } | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightbox) return;
      if (e.key === "Escape") {
        setLightbox(null);
      } else if (e.key === "ArrowLeft" && lightbox.photos.length > 1) {
        setLightbox((prev) =>
          prev
            ? {
                ...prev,
                index:
                  (prev.index - 1 + prev.photos.length) % prev.photos.length,
              }
            : null,
        );
      } else if (e.key === "ArrowRight" && lightbox.photos.length > 1) {
        setLightbox((prev) =>
          prev
            ? {
                ...prev,
                index: (prev.index + 1) % prev.photos.length,
              }
            : null,
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightbox]);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const userStr = localStorage.getItem("user");

    if (!userId || !userStr) {
      toast.error("Please login first");
      navigate("/login/worker");
      return;
    }

    try {
      const parsedUser = JSON.parse(userStr);
      if (!parsedUser.roles?.includes("worker")) {
        toast.error("Unauthorized access. Worker role required.");
        navigate("/login/worker");
        return;
      }
      setUserData(parsedUser);
    } catch (e) {
      navigate("/login/worker");
      return;
    }

    const storedWorkerId = localStorage.getItem("userId");
    console.log(storedWorkerId);
    if (storedWorkerId) {
      fetchWorkerProfile(storedWorkerId);
      fetchOngoingServices(storedWorkerId);
      fetchPreviousServices(storedWorkerId);
    }

    fetchAvailableJobs();
    fetchCooperatives();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    toast.success("Logged out successfully.");
    navigate("/", { replace: true });
  };

  const getAuthHeaders = (): Record<string, string> => {
    const userId = localStorage.getItem("userId") || "";
    const headers: Record<string, string> = {};
    if (userId) headers["user-id"] = userId;
    return headers;
  };

  const fetchCooperatives = async () => {
    try {
      const response = await fetch(ROUTES.cooperative.names);
      const data = await response.json();
      if (data.success && Array.isArray(data.cooperatives)) {
        setCooperatives(data.cooperatives);
      }
    } catch (error) {
      console.error("Fetch cooperatives error:", error);
    }
  };

  const handleJoinCooperative = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCoopId) {
      toast.error("Please select a cooperative to join");
      return;
    }
    const workerId = workerProfile?._id || localStorage.getItem("userId");
    if (!workerId) {
      toast.error("Worker session invalid");
      return;
    }
    setIsJoiningCoop(true);
    try {
      const response = await fetch(ROUTES.worker.profile(workerId), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          cooperativeId: selectedCoopId,
        }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        toast.success("Successfully joined the cooperative!");
        fetchWorkerProfile(workerId);
      } else {
        toast.error(data.message || "Failed to join cooperative");
      }
    } catch (error) {
      console.error("Error joining cooperative:", error);
      toast.error("Network error while joining cooperative");
    } finally {
      setIsJoiningCoop(false);
    }
  };

  const fetchWorkerProfile = async (id: string) => {
    if (!id) return;
    try {
      const response = await fetch(ROUTES.worker.profile(id), {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (response.ok && data.success && data.worker) {
        setWorkerProfile(data.worker);
        if (data.worker._id) {
          localStorage.setItem("workerId", data.worker._id);
        }
      }
    } catch (error) {
      console.error("Fetch worker profile error:", error);
    }
  };

  const fetchOngoingServices = async (id?: string) => {
    const targetId = id || localStorage.getItem("userId");
    if (!targetId) return;
    setIsLoadingOngoing(true);
    try {
      const response = await fetch(ROUTES.worker.ongoingServices(targetId), {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setOngoingJobs(data.ongoingServices || data.serviceRequests || []);
      }
    } catch (error) {
      console.error("Fetch ongoing services error:", error);
    } finally {
      setIsLoadingOngoing(false);
    }
  };

  const fetchPreviousServices = async (id?: string) => {
    const targetId = id || localStorage.getItem("userId");
    if (!targetId) return;
    setIsLoadingPrevious(true);
    try {
      const response = await fetch(ROUTES.worker.previousServices(targetId), {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setPreviousJobs(data.previousServices || data.serviceRequests || []);
      }
    } catch (error) {
      console.error("Fetch previous services error:", error);
    } finally {
      setIsLoadingPrevious(false);
    }
  };

  const fetchAvailableJobs = async () => {
    setIsLoadingAvailable(true);
    try {
      const response = await fetch(`${ROUTES.serviceRequests}/available`, {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setAvailableJobs(data.serviceRequests || []);
      } else {
        toast.error(data.message || "Failed to fetch available jobs");
      }
    } catch (error) {
      console.error("Fetch available jobs error:", error);
      toast.error("Network error while fetching jobs");
    } finally {
      setIsLoadingAvailable(false);
    }
  };

  const handleAcceptJob = async (job: ServiceRequest) => {
    setActionLoadingId(job._id);
    try {
      const response = await fetch(
        `${ROUTES.serviceRequests}/${job._id}/accept`,
        {
          method: "PATCH",
          headers: {
            ...getAuthHeaders(),
            "Content-Type": "application/json",
          },
        },
      );
      const data = await response.json();

      if (response.ok && data.success) {
        toast.success("Job accepted successfully!");
        setAvailableJobs((prev) => prev.filter((j) => j._id !== job._id));
        fetchOngoingServices();
        if (selectedJobModal?._id === job._id) {
          setSelectedJobModal(null);
        }
        setActiveTab("ongoing-jobs");
      } else {
        toast.error(data.message || "Failed to accept job");
      }
    } catch (error) {
      toast.error("Network error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleStartJob = async (jobId: string) => {
    setActionLoadingId(jobId);
    try {
      const response = await fetch(`${ROUTES.serviceRequests}/${jobId}/start`, {
        method: "PATCH",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();

      if (response.ok && data.success) {
        toast.success("Job started!");
        setOngoingJobs((prev) =>
          prev.map((job) =>
            job._id === jobId
              ? data.serviceRequest || { ...job, status: "in_progress" }
              : job,
          ),
        );
        fetchOngoingServices();
      } else {
        toast.error(data.message || "Failed to start job");
      }
    } catch (error) {
      toast.error("Network error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCompleteJob = async (jobId: string) => {
    setActionLoadingId(jobId);
    try {
      const response = await fetch(
        `${ROUTES.serviceRequests}/${jobId}/complete`,
        {
          method: "PATCH",
          headers: {
            ...getAuthHeaders(),
            "Content-Type": "application/json",
          },
        },
      );
      const data = await response.json();

      if (response.ok && data.success) {
        toast.success("Job marked as completed!");
        fetchOngoingServices();
        fetchPreviousServices();
      } else {
        toast.error(data.message || "Failed to complete job");
      }
    } catch (error) {
      toast.error("Network error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handlePhotoUpload = async (jobId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;

    setActionLoadingId(jobId + "_upload");
    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append("photos", file);
    });

    try {
      const response = await fetch(
        `${ROUTES.serviceRequests}/${jobId}/post-photos`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: formData,
        },
      );
      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(`${files.length} photo(s) uploaded successfully!`);
        fetchOngoingServices();
      } else {
        toast.error(data.message || "Failed to upload photos");
      }
    } catch (error) {
      toast.error("Network error while uploading photos");
    } finally {
      setActionLoadingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Not scheduled";
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="dashboard-page">
      <Navbar
        portalName="Worker Portal"
        portalIcon={Wrench}
        onLogout={handleLogout}
      />
      <div className="dashboard-container">
        <header className="customer-dashboard-header">
          <div className="customer-welcome">
            <h1>Worker Portal</h1>
            <p>Find jobs, manage your tasks, and view your profile.</p>
          </div>

          <div className="customer-tabs">
            <button
              className={`customer-tab-btn ${activeTab === "ongoing-jobs" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("ongoing-jobs");
                fetchOngoingServices();
              }}
            >
              <Briefcase size={18} />
              Ongoing Jobs
              {ongoingJobs.length > 0 && (
                <span
                  className="tab-badge"
                  style={{
                    marginLeft: "8px",
                    background: "var(--primary)",
                    color: "white",
                    padding: "2px 8px",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                >
                  {ongoingJobs.length}
                </span>
              )}
            </button>
            <button
              className={`customer-tab-btn ${activeTab === "previous-jobs" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("previous-jobs");
                fetchPreviousServices();
              }}
            >
              <Clock size={18} />
              Previous Services
              {previousJobs.length > 0 && (
                <span
                  className="tab-badge"
                  style={{
                    marginLeft: "8px",
                    background: "#4b5563",
                    color: "white",
                    padding: "2px 8px",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                >
                  {previousJobs.length}
                </span>
              )}
            </button>
            <button
              className={`customer-tab-btn ${activeTab === "available-jobs" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("available-jobs");
                fetchAvailableJobs();
              }}
            >
              <Search size={18} />
              Available Jobs
            </button>
            <button
              className={`customer-tab-btn ${activeTab === "profile" ? "active" : ""}`}
              onClick={() => setActiveTab("profile")}
            >
              <User size={18} />
              Profile
            </button>
          </div>
        </header>

        {activeTab === "ongoing-jobs" && (
          <div className="tab-content fade-in">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.25rem",
              }}
            >
              <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#111827" }}>
                Currently Ongoing Services
              </h2>
              <button
                onClick={() => fetchOngoingServices()}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 12px",
                  background: "#f3f4f6",
                  border: "1px solid #e5e7eb",
                  borderRadius: "6px",
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  fontWeight: 500,
                }}
              >
                <RefreshCw size={14} className={isLoadingOngoing ? "spin" : ""} /> Refresh
              </button>
            </div>

            {isLoadingOngoing ? (
              <div style={{ textAlign: "center", padding: "3rem" }}>
                <Loader2 className="spin" size={32} color="var(--primary)" />
                <p style={{ marginTop: "0.5rem", color: "#6b7280" }}>
                  Loading active jobs...
                </p>
              </div>
            ) : ongoingJobs.length === 0 ? (
              <div className="empty-requests-state">
                <div className="empty-requests-icon">
                  <Briefcase size={48} color="var(--primary-light-text)" />
                </div>
                <h3>No active ongoing jobs</h3>
                <p>
                  Browse available service requests to get started and earn.
                </p>
                <button
                  className="worker-action-btn"
                  onClick={() => {
                    setActiveTab("available-jobs");
                    fetchAvailableJobs();
                  }}
                  style={{
                    marginTop: "1rem",
                    padding: "0.75rem 1.5rem",
                    background: "var(--primary)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                >
                  Browse Available Jobs
                </button>
              </div>
            ) : (
              <div className="requests-list">
                {ongoingJobs.map((job) => (
                  <div key={job._id} className="request-item-card">
                    <div className="request-main-info">
                      <div className="request-header-row">
                        <h3 className="request-title">
                          {job.title ||
                            job.serviceId?.name ||
                            "Service Request"}
                        </h3>
                        <span className={`status-badge status-${job.status}`}>
                          {job.status.replace("_", " ").toUpperCase()}
                        </span>
                      </div>

                      <p
                        style={{
                          color: "#4b5563",
                          fontSize: "0.9rem",
                          marginBottom: "0.5rem",
                        }}
                      >
                        {job.description}
                      </p>

                      <div className="request-meta">
                        <span className="meta-item">
                          <MapPin size={16} /> {job.address}
                        </span>
                        <span className="meta-item">
                          <Calendar size={16} /> {formatDate(job.scheduledAt)}
                        </span>
                        {job.serviceId?.category && (
                          <span className="meta-item">
                            <Wrench size={16} /> {job.serviceId.category}
                          </span>
                        )}
                        {job.customerId?.userId?.name && (
                          <span className="meta-item">
                            <User size={16} /> Customer:{" "}
                            {job.customerId.userId.name}
                          </span>
                        )}
                      </div>

                      {job.preServicePhotos &&
                        job.preServicePhotos.length > 0 && (
                          <div className="request-photos-grid">
                            <span className="photo-label">
                              Pre-service Photos:
                            </span>
                            <div className="photos-row">
                              {job.preServicePhotos.map((photo, idx) => (
                                <img
                                  key={`pre-${idx}`}
                                  src={photo}
                                  alt="Pre-service"
                                  className="photo-thumb"
                                  style={{ cursor: "pointer" }}
                                  onClick={() =>
                                    setLightbox({
                                      photos: job.preServicePhotos!,
                                      index: idx,
                                    })
                                  }
                                />
                              ))}
                            </div>
                          </div>
                        )}

                      {job.postServicePhotos &&
                        job.postServicePhotos.length > 0 && (
                          <div className="request-photos-grid">
                            <span className="photo-label">
                              Post-service Photos:
                            </span>
                            <div className="photos-row">
                              {job.postServicePhotos.map((photo, idx) => (
                                <img
                                  key={`post-${idx}`}
                                  src={photo}
                                  alt="Post-service"
                                  className="photo-thumb"
                                  style={{ cursor: "pointer" }}
                                  onClick={() =>
                                    setLightbox({
                                      photos: job.postServicePhotos!,
                                      index: idx,
                                    })
                                  }
                                />
                              ))}
                            </div>
                          </div>
                        )}

                      <div
                        style={{
                          marginTop: "1rem",
                          display: "flex",
                          gap: "0.75rem",
                          flexWrap: "wrap",
                          alignItems: "center",
                        }}
                      >
                        {job.status === "accepted" && (
                          <button
                            className="worker-action-btn btn-start"
                            onClick={() => handleStartJob(job._id)}
                            disabled={actionLoadingId === job._id}
                          >
                            {actionLoadingId === job._id ? (
                              <Loader2
                                className="spin"
                                size={16}
                                style={{
                                  display: "inline",
                                  verticalAlign: "text-bottom",
                                }}
                              />
                            ) : (
                              <Play
                                size={16}
                                style={{
                                  display: "inline",
                                  verticalAlign: "text-bottom",
                                }}
                              />
                            )}
                            Start Job
                          </button>
                        )}

                        {job.status === "in_progress" && (
                          <>
                            <label
                              className="btn-upload-photo"
                              htmlFor={`post-photo-${job._id}`}
                            >
                              {actionLoadingId === job._id + "_upload" ? (
                                <Loader2
                                  className="spin"
                                  size={14}
                                  style={{
                                    display: "inline",
                                    verticalAlign: "text-bottom",
                                    marginRight: "4px",
                                  }}
                                />
                              ) : (
                                <Camera
                                  size={14}
                                  style={{
                                    display: "inline",
                                    verticalAlign: "text-bottom",
                                    marginRight: "4px",
                                  }}
                                />
                              )}
                              Upload After Photos
                            </label>
                            <input
                              id={`post-photo-${job._id}`}
                              type="file"
                              multiple
                              accept="image/*"
                              style={{ display: "none" }}
                              onChange={(e) =>
                                handlePhotoUpload(job._id, e.target.files)
                              }
                              disabled={actionLoadingId === job._id + "_upload"}
                            />

                            <button
                              className="worker-action-btn btn-complete"
                              onClick={() => handleCompleteJob(job._id)}
                              disabled={actionLoadingId === job._id}
                            >
                              {actionLoadingId === job._id ? (
                                <Loader2
                                  className="spin"
                                  size={16}
                                  style={{
                                    display: "inline",
                                    verticalAlign: "text-bottom",
                                  }}
                                />
                              ) : (
                                <CheckCircle
                                  size={16}
                                  style={{
                                    display: "inline",
                                    verticalAlign: "text-bottom",
                                  }}
                                />
                              )}
                              Mark Complete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "previous-jobs" && (
          <div className="tab-content fade-in">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.25rem",
              }}
            >
              <div>
                <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#111827" }}>
                  Previous Services & History
                </h2>
                <p style={{ fontSize: "0.875rem", color: "#6b7280", marginTop: "2px" }}>
                  Track past completed and cancelled service records
                </p>
              </div>
              <button
                onClick={() => fetchPreviousServices()}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 12px",
                  background: "#f3f4f6",
                  border: "1px solid #e5e7eb",
                  borderRadius: "6px",
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  fontWeight: 500,
                }}
              >
                <RefreshCw size={14} className={isLoadingPrevious ? "spin" : ""} /> Refresh
              </button>
            </div>

            {isLoadingPrevious ? (
              <div style={{ textAlign: "center", padding: "3rem" }}>
                <Loader2 className="spin" size={32} color="var(--primary)" />
                <p style={{ marginTop: "0.5rem", color: "#6b7280" }}>
                  Loading work history...
                </p>
              </div>
            ) : previousJobs.length === 0 ? (
              <div className="empty-requests-state">
                <div className="empty-requests-icon">
                  <Clock size={48} color="var(--primary-light-text)" />
                </div>
                <h3>No service history</h3>
                <p>Your completed or past services will be recorded here.</p>
              </div>
            ) : (
              <div className="requests-list">
                {previousJobs.map((job) => (
                  <div key={job._id} className="request-item-card" style={{ opacity: job.status === "cancelled" ? 0.8 : 1 }}>
                    <div className="request-main-info">
                      <div className="request-header-row">
                        <h3 className="request-title">
                          {job.title || job.serviceId?.name || "Service Request"}
                        </h3>
                        <span className={`status-badge status-${job.status}`}>
                          {job.status === "completed" ? (
                            <>
                              <CheckCircle2 size={12} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} />
                              COMPLETED
                            </>
                          ) : (
                            job.status.toUpperCase()
                          )}
                        </span>
                      </div>

                      <p style={{ color: "#4b5563", fontSize: "0.9rem", marginBottom: "0.5rem" }}>
                        {job.description}
                      </p>

                      <div className="request-meta">
                        <span className="meta-item">
                          <MapPin size={16} /> {job.address}
                        </span>
                        <span className="meta-item">
                          <Calendar size={16} /> Scheduled: {formatDate(job.scheduledAt)}
                        </span>
                        {job.serviceId?.category && (
                          <span className="meta-item">
                            <Wrench size={16} /> {job.serviceId.category}
                          </span>
                        )}
                        {job.customerId?.userId?.name && (
                          <span className="meta-item">
                            <User size={16} /> Customer: {job.customerId.userId.name}
                          </span>
                        )}
                      </div>

                      {job.preServicePhotos && job.preServicePhotos.length > 0 && (
                        <div className="request-photos-grid">
                          <span className="photo-label">Pre-service Photos:</span>
                          <div className="photos-row">
                            {job.preServicePhotos.map((photo, idx) => (
                              <img
                                key={`pre-${idx}`}
                                src={photo}
                                alt="Pre-service"
                                className="photo-thumb"
                                style={{ cursor: "pointer" }}
                                onClick={() =>
                                  setLightbox({
                                    photos: job.preServicePhotos!,
                                    index: idx,
                                  })
                                }
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {job.postServicePhotos && job.postServicePhotos.length > 0 && (
                        <div className="request-photos-grid">
                          <span className="photo-label">Post-service Photos:</span>
                          <div className="photos-row">
                            {job.postServicePhotos.map((photo, idx) => (
                              <img
                                key={`post-${idx}`}
                                src={photo}
                                alt="Post-service"
                                className="photo-thumb"
                                style={{ cursor: "pointer" }}
                                onClick={() =>
                                  setLightbox({
                                    photos: job.postServicePhotos!,
                                    index: idx,
                                  })
                                }
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "available-jobs" && (
          <div className="tab-content fade-in">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.5rem",
              }}
            >
              <h2>Available Opportunities</h2>
              <button
                onClick={fetchAvailableJobs}
                className="customer-tab-btn"
                style={{ padding: "0.5rem" }}
                disabled={isLoadingAvailable}
              >
                <RefreshCw
                  size={18}
                  className={isLoadingAvailable ? "spin" : ""}
                />
              </button>
            </div>

            {isLoadingAvailable ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  padding: "3rem",
                }}
              >
                <Loader2 size={32} className="spin" color="var(--primary)" />
              </div>
            ) : availableJobs.length === 0 ? (
              <div className="empty-requests-state">
                <div className="empty-requests-icon">
                  <Search size={48} color="var(--primary-light-text)" />
                </div>
                <h3>No jobs available right now</h3>
                <p>Check back later for new service requests in your area.</p>
              </div>
            ) : (
              <div className="services-grid">
                {availableJobs.map((job) => (
                  <div
                    key={job._id}
                    className="service-card"
                    onClick={() => setSelectedJobModal(job)}
                    style={{ cursor: "pointer" }}
                  >
                    <JobCardCarousel
                      photos={job.preServicePhotos}
                      onClick={() => setSelectedJobModal(job)}
                    />

                    <div className="service-card-header">
                      <h3 className="service-card-title">
                        {job.title || job.serviceId?.name}
                      </h3>
                      {job.serviceId?.category && (
                        <span className="service-card-category">
                          {job.serviceId.category}
                        </span>
                      )}
                    </div>

                    <p className="service-card-desc" style={{ flex: 1 }}>
                      {job.description}
                    </p>

                    <div
                      className="request-meta"
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.5rem",
                        margin: "0.75rem 0",
                      }}
                    >
                      <span className="meta-item">
                        <MapPin size={16} /> {job.address}
                      </span>
                      <span className="meta-item">
                        <Calendar size={16} /> {formatDate(job.scheduledAt)}
                      </span>
                      {job.preServicePhotos &&
                        job.preServicePhotos.length > 0 && (
                          <span
                            className="meta-item"
                            style={{ color: "var(--primary)", fontWeight: 600 }}
                          >
                            <Images size={16} /> {job.preServicePhotos.length}{" "}
                            Pre-photo(s) attached
                          </span>
                        )}
                    </div>

                    <div className="service-card-footer">
                      <div className="service-price">
                        {job.serviceId?.basePrice
                          ? `₹${job.serviceId.basePrice}`
                          : "Price TBD"}
                      </div>
                      <button
                        className="btn-book-service"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAcceptJob(job);
                        }}
                        disabled={actionLoadingId === job._id}
                      >
                        {actionLoadingId === job._id ? (
                          <Loader2 className="spin" size={16} />
                        ) : (
                          "Accept Job"
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "profile" && userData && (
          <section>
            <div className="worker-stats-row">
              <div className="worker-stat-item">
                <div className="worker-stat-number">
                  {previousJobs.filter((j) => j.status === "completed").length}
                </div>
                <div className="worker-stat-label">Completed</div>
              </div>
              <div className="worker-stat-item">
                <div className="worker-stat-number">
                  {ongoingJobs.filter((j) => j.status === "in_progress").length}
                </div>
                <div className="worker-stat-label">In Progress</div>
              </div>
              <div className="worker-stat-item">
                <div className="worker-stat-number">
                  {ongoingJobs.filter((j) => j.status === "accepted").length}
                </div>
                <div className="worker-stat-label">Accepted</div>
              </div>
            </div>

            <div className="worker-profile-card">
              {(() => {
                const verificationStatus: "verified" | "pending" | "rejected" =
                  workerProfile?.verification ||
                  userData?.verification ||
                  userData?.workerProfile?.verification;

                return (
                  <>
                    <div className="worker-profile-header">
                      <div
                        className="worker-avatar"
                        style={{ position: "relative" }}
                      >
                        {userData.name
                          ? userData.name.charAt(0).toUpperCase()
                          : "W"}
                        {verificationStatus === "verified" && (
                          <div
                            title="Verified Worker"
                            style={{
                              position: "absolute",
                              bottom: "-2px",
                              right: "-2px",
                              background: "#10b981",
                              color: "white",
                              borderRadius: "50%",
                              width: "24px",
                              height: "24px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              border: "2px solid white",
                              boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
                            }}
                          >
                            <CheckCircle2 size={14} />
                          </div>
                        )}
                      </div>
                      <h2 className="worker-profile-name">{userData.name}</h2>

                      <div
                        style={{
                          display: "flex",
                          gap: "0.5rem",
                          flexWrap: "wrap",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <span className="worker-profile-role-badge">
                          <Shield
                            size={13}
                            style={{
                              display: "inline",
                              verticalAlign: "text-bottom",
                              marginRight: "4px",
                            }}
                          />{" "}
                          Worker
                        </span>

                        {verificationStatus === "verified" && (
                          <span
                            className="worker-verification-badge verified"
                            style={{ marginTop: 0 }}
                          >
                            <ShieldCheck
                              size={13}
                              style={{
                                display: "inline",
                                verticalAlign: "text-bottom",
                                marginRight: "4px",
                              }}
                            />{" "}
                            Verified
                          </span>
                        )}
                        {verificationStatus === "pending" && (
                          <span
                            className="worker-verification-badge pending"
                            style={{ marginTop: 0 }}
                          >
                            <Clock
                              size={13}
                              style={{
                                display: "inline",
                                verticalAlign: "text-bottom",
                                marginRight: "4px",
                              }}
                            />{" "}
                            Verification Pending
                          </span>
                        )}
                        {verificationStatus === "rejected" && (
                          <span
                            className="worker-verification-badge rejected"
                            style={{ marginTop: 0 }}
                          >
                            <AlertCircle
                              size={13}
                              style={{
                                display: "inline",
                                verticalAlign: "text-bottom",
                                marginRight: "4px",
                              }}
                            />{" "}
                            Verification Rejected
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="worker-profile-info">
                      <div className="worker-profile-field">
                        <ShieldCheck
                          size={18}
                          color={
                            verificationStatus === "verified"
                              ? "#10b981"
                              : verificationStatus === "pending"
                                ? "#f59e0b"
                                : "#ef4444"
                          }
                        />
                        <div className="worker-profile-field-content">
                          <span className="worker-profile-label">
                            Verification Status
                          </span>
                          <span className="worker-profile-value">
                            <span
                              className={`status-badge ${
                                verificationStatus === "verified"
                                  ? "status-completed"
                                  : verificationStatus === "pending"
                                    ? "status-accepted"
                                    : "status-cancelled"
                              }`}
                              style={{
                                fontSize: "0.78rem",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                            >
                              {verificationStatus === "verified" && (
                                <CheckCircle2 size={12} />
                              )}
                              {verificationStatus === "pending" && (
                                <Clock size={12} />
                              )}
                              {verificationStatus === "rejected" && (
                                <AlertCircle size={12} />
                              )}
                              {verificationStatus.toUpperCase()}
                            </span>
                          </span>
                        </div>
                      </div>

                      <div className="worker-profile-field">
                        <Mail size={18} />
                        <div className="worker-profile-field-content">
                          <span className="worker-profile-label">
                            Email Address
                          </span>
                          <span className="worker-profile-value">
                            {userData.email}
                          </span>
                        </div>
                      </div>

                      <div className="worker-profile-field">
                        <Phone size={18} />
                        <div className="worker-profile-field-content">
                          <span className="worker-profile-label">
                            Mobile Number
                          </span>
                          <span className="worker-profile-value">
                            {userData.mobileNumber || "Not provided"}
                          </span>
                        </div>
                      </div>

                      {workerProfile?.cooperativeId?.name ? (
                        <div className="worker-profile-field">
                          <Shield size={18} />
                          <div className="worker-profile-field-content">
                            <span className="worker-profile-label">
                              Cooperative
                            </span>
                            <span className="worker-profile-value">
                              {workerProfile.cooperativeId.name}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="worker-profile-field">
                          <Shield size={18} />
                          <div className="worker-profile-field-content">
                            <span className="worker-profile-label">
                              Cooperative
                            </span>
                            <span
                              className="worker-profile-value"
                              style={{ color: "#d97706", fontWeight: 600 }}
                            >
                              Independent Worker (No Cooperative)
                            </span>
                          </div>
                        </div>
                      )}

                      {workerProfile?.skills &&
                        workerProfile.skills.length > 0 && (
                          <div className="worker-profile-field">
                            <Wrench size={18} />
                            <div className="worker-profile-field-content">
                              <span className="worker-profile-label">
                                Skills & Trades
                              </span>
                              <span className="worker-profile-value">
                                {workerProfile.skills.join(", ")}
                              </span>
                            </div>
                          </div>
                        )}

                      {workerProfile?.rating !== undefined && (
                        <div className="worker-profile-field">
                          <Star size={18} color="#f59e0b" />
                          <div className="worker-profile-field-content">
                            <span className="worker-profile-label">Rating</span>
                            <span className="worker-profile-value">
                              ⭐ {workerProfile.rating} / 5.0
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="worker-profile-field">
                        <Star size={18} />
                        <div className="worker-profile-field-content">
                          <span className="worker-profile-label">Role</span>
                          <span className="worker-profile-value">
                            {(userData.roles || []).join(", ") || "Worker"}
                          </span>
                        </div>
                      </div>

                      {userData.createdAt && (
                        <div className="worker-profile-field">
                          <Clock size={18} />
                          <div className="worker-profile-field-content">
                            <span className="worker-profile-label">
                              Member Since
                            </span>
                            <span className="worker-profile-value">
                              {new Date(userData.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                },
                              )}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>

            {(!workerProfile?.cooperativeId ||
              !workerProfile?.cooperativeId?.name) && (
              <div
                className="join-cooperative-card"
                style={{
                  marginTop: "24px",
                  padding: "24px",
                  background: "#ffffff",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.04)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "16px",
                    marginBottom: "16px",
                  }}
                >
                  <div
                    style={{
                      padding: "12px",
                      borderRadius: "10px",
                      background: "rgba(37, 99, 235, 0.1)",
                      color: "#2563eb",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Shield size={26} />
                  </div>
                  <div>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: "1.15rem",
                        fontWeight: 700,
                        color: "#0f172a",
                      }}
                    >
                      Join a Cooperative / Union
                    </h3>
                    <p
                      style={{
                        margin: "6px 0 0 0",
                        fontSize: "0.9rem",
                        color: "#64748b",
                        lineHeight: "1.5",
                      }}
                    >
                      You are currently registered as an independent worker.
                      Select a registered cooperative below to join and gain
                      access to group benefits, verified service badges, and
                      federation representation.
                    </p>
                  </div>
                </div>

                <form
                  onSubmit={handleJoinCooperative}
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "12px",
                    alignItems: "flex-end",
                    marginTop: "16px",
                    paddingTop: "16px",
                    borderTop: "1px dashed #e2e8f0",
                  }}
                >
                  <div style={{ flex: "1", minWidth: "250px" }}>
                    <label
                      htmlFor="cooperative-select"
                      style={{
                        display: "block",
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        color: "#475569",
                        marginBottom: "6px",
                      }}
                    >
                      Select Cooperative / Union
                    </label>
                    <select
                      id="cooperative-select"
                      value={selectedCoopId}
                      onChange={(e) => setSelectedCoopId(e.target.value)}
                      required
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        fontSize: "0.95rem",
                        background: "#ffffff",
                        color: "#1e293b",
                        outline: "none",
                      }}
                    >
                      <option value="">-- Choose a Cooperative / Union --</option>
                      {cooperatives.map((coop) => (
                        <option key={coop._id} value={coop._id}>
                          {coop.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={isJoiningCoop || !selectedCoopId}
                    style={{
                      padding: "10px 22px",
                      borderRadius: "8px",
                      background:
                        isJoiningCoop || !selectedCoopId
                          ? "#cbd5e1"
                          : "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                      color: "#ffffff",
                      fontWeight: 600,
                      border: "none",
                      cursor:
                        isJoiningCoop || !selectedCoopId
                          ? "not-allowed"
                          : "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {isJoiningCoop ? (
                      <>
                        <Loader2 size={16} className="animate-spin" /> Joining...
                      </>
                    ) : (
                      "Join Cooperative"
                    )}
                  </button>
                </form>
              </div>
            )}
          </section>
        )}
      </div>

      {/* Job Details Modal */}
      {selectedJobModal && (
        <div
          className="job-detail-overlay"
          onClick={() => setSelectedJobModal(null)}
        >
          <div
            className="job-detail-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="job-detail-header">
              <div>
                <h2
                  style={{
                    fontSize: "1.3rem",
                    fontWeight: 800,
                    margin: 0,
                    color: "var(--text-main)",
                  }}
                >
                  {selectedJobModal.title ||
                    selectedJobModal.serviceId?.name ||
                    "Service Details"}
                </h2>
                {selectedJobModal.serviceId?.category && (
                  <span
                    className="service-card-category"
                    style={{ marginTop: "4px", display: "inline-block" }}
                  >
                    {selectedJobModal.serviceId.category}
                  </span>
                )}
              </div>
              <button
                className="job-detail-close"
                onClick={() => setSelectedJobModal(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="job-detail-body">
              {/* Pre-Service Photos Gallery */}
              <div>
                <h3
                  style={{
                    fontSize: "1rem",
                    fontWeight: 700,
                    marginBottom: "0.75rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    color: "var(--text-main)",
                  }}
                >
                  <Camera size={18} color="var(--primary)" /> Pre-Service Photos
                  Gallery
                </h3>
                {selectedJobModal.preServicePhotos &&
                selectedJobModal.preServicePhotos.length > 0 ? (
                  <div className="job-detail-gallery">
                    {selectedJobModal.preServicePhotos.map((photo, idx) => (
                      <div
                        key={idx}
                        style={{
                          position: "relative",
                          borderRadius: "8px",
                          overflow: "hidden",
                        }}
                      >
                        <img
                          src={photo}
                          alt={`Pre photo ${idx + 1}`}
                          onClick={() =>
                            setLightbox({
                              photos: selectedJobModal.preServicePhotos!,
                              index: idx,
                            })
                          }
                        />
                        <div
                          style={{
                            position: "absolute",
                            bottom: "6px",
                            right: "6px",
                            background: "rgba(0,0,0,0.65)",
                            color: "white",
                            padding: "3px 8px",
                            borderRadius: "4px",
                            fontSize: "0.72rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            pointerEvents: "none",
                            backdropFilter: "blur(2px)",
                          }}
                        >
                          <Maximize2 size={12} /> Click to enlarge
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    style={{
                      padding: "2rem",
                      textAlign: "center",
                      background: "var(--bg-input)",
                      border: "1px dashed var(--border-color)",
                      borderRadius: "10px",
                      color: "var(--text-muted)",
                    }}
                  >
                    No pre-service photos uploaded for this job request.
                  </div>
                )}
              </div>

              {/* Job Details Section */}
              <div className="job-detail-info">
                <h3
                  style={{
                    fontSize: "1rem",
                    fontWeight: 700,
                    marginBottom: "0.5rem",
                    color: "var(--text-main)",
                  }}
                >
                  Job Description & Requirements
                </h3>
                <p
                  style={{
                    color: "var(--text-main)",
                    lineHeight: "1.5",
                    whiteSpace: "pre-line",
                  }}
                >
                  {selectedJobModal.description}
                </p>

                <div
                  className="job-detail-meta"
                  style={{
                    marginTop: "1rem",
                    padding: "1.25rem",
                    background: "var(--bg-input)",
                    borderRadius: "10px",
                    gap: "0.75rem",
                    border: "1px solid var(--border-color)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderBottom: "1px solid var(--border-color)",
                      paddingBottom: "0.75rem",
                    }}
                  >
                    <span
                      style={{ fontWeight: 600, color: "var(--text-muted)" }}
                    >
                      Offered Price:
                    </span>
                    <span
                      className="service-price"
                      style={{ fontSize: "1.25rem" }}
                    >
                      {selectedJobModal.serviceId?.basePrice
                        ? `₹${selectedJobModal.serviceId.basePrice}`
                        : "Price TBD"}
                    </span>
                  </div>

                  <div className="meta-item">
                    <MapPin size={16} /> <strong>Location:</strong>{" "}
                    {selectedJobModal.address}
                  </div>
                  <div className="meta-item">
                    <Calendar size={16} /> <strong>Scheduled Date:</strong>{" "}
                    {formatDate(selectedJobModal.scheduledAt)}
                  </div>
                  {selectedJobModal.customerId?.userId?.name && (
                    <div className="meta-item">
                      <User size={16} /> <strong>Customer Name:</strong>{" "}
                      {selectedJobModal.customerId.userId.name}
                    </div>
                  )}
                  {selectedJobModal.customerId?.userId?.mobileNumber && (
                    <div className="meta-item">
                      <Phone size={16} /> <strong>Customer Contact:</strong>{" "}
                      {selectedJobModal.customerId.userId.mobileNumber}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="job-detail-actions">
              <button
                className="customer-tab-btn"
                onClick={() => setSelectedJobModal(null)}
                style={{ marginRight: "0.75rem" }}
              >
                Close
              </button>
              <button
                className="worker-action-btn btn-accept"
                onClick={() => handleAcceptJob(selectedJobModal)}
                disabled={actionLoadingId === selectedJobModal._id}
              >
                {actionLoadingId === selectedJobModal._id ? (
                  <Loader2 className="spin" size={16} />
                ) : (
                  "Accept Job"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox / Fullscreen Image Modal */}
      {lightbox && (
        <div
          className="photo-lightbox-overlay"
          onClick={() => setLightbox(null)}
        >
          <img
            src={lightbox.photos[lightbox.index]}
            alt={`Full view ${lightbox.index + 1}`}
            onClick={(e) => e.stopPropagation()}
          />

          <button
            className="photo-lightbox-close"
            onClick={() => setLightbox(null)}
          >
            <X size={24} />
          </button>

          {lightbox.photos.length > 1 && (
            <>
              <button
                className="photo-lightbox-nav prev"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightbox((prev) =>
                    prev
                      ? {
                          ...prev,
                          index:
                            (prev.index - 1 + prev.photos.length) %
                            prev.photos.length,
                        }
                      : null,
                  );
                }}
              >
                <ChevronLeft size={28} />
              </button>

              <button
                className="photo-lightbox-nav next"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightbox((prev) =>
                    prev
                      ? {
                          ...prev,
                          index: (prev.index + 1) % prev.photos.length,
                        }
                      : null,
                  );
                }}
              >
                <ChevronRight size={28} />
              </button>

              <div
                style={{
                  position: "absolute",
                  bottom: "1.5rem",
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "rgba(0, 0, 0, 0.75)",
                  color: "white",
                  padding: "6px 16px",
                  borderRadius: "20px",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                  zIndex: 2020,
                  pointerEvents: "none",
                }}
              >
                {lightbox.index + 1} / {lightbox.photos.length}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
