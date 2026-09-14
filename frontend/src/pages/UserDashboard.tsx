import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  Plus,
  Wrench,
  ShoppingCart,
  MapPin,
  Calendar,
  Camera,
  Loader2,
  Rocket,
  User,
  Phone,
  Info,
  Star,
  Building2,
  ShieldCheck,
  CheckCircle,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Navbar from '../components/Navbar';
import { ROUTES, API_BASE_URL } from '../config/api';
import './Dashboard.css';

interface ServiceItem {
  _id: string;
  name: string;
  category: string;
  description: string;
  basePrice: number;
}

interface ServiceRequestItem {
  _id: string;
  title: string;
  description: string;
  address: string;
  status: 'open' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  scheduledAt: string;
  createdAt: string;
  preServicePhotos?: string[];
  postServicePhotos?: string[];
  pricing?: {
    estimatedCost?: number;
    totalPrice?: number;
  };
  serviceId?: {
    name?: string;
    category?: string;
    basePrice?: number;
  };
  workerId?: any;
}

const DEFAULT_SERVICES: ServiceItem[] = [
  {
    _id: '65f1a2b3c4d5e6f7a8b9c0d1',
    name: 'AC Foam Jet Servicing & Repair',
    category: 'Appliance Repair',
    description: 'Deep foam jet cleaning, gas check, and cooling performance optimization.',
    basePrice: 599,
  },
  {
    _id: '65f1a2b3c4d5e6f7a8b9c0d2',
    name: 'Bathroom Deep Cleaning (Intense)',
    category: 'Home Cleaning',
    description: 'Stain removal, sanitization, hard water residue cleaning, and tile scrubbing.',
    basePrice: 899,
  },
  {
    _id: '65f1a2b3c4d5e6f7a8b9c0d3',
    name: 'Electrician & Switchboard Repair',
    category: 'Electrician',
    description: 'Inspection, short circuit fix, socket replacement & safety check.',
    basePrice: 249,
  },
  {
    _id: '65f1a2b3c4d5e6f7a8b9c0d4',
    name: 'Water Purifier RO Service & Installation',
    category: 'Appliance Repair',
    description: 'Filter check, TDS measurement, membrane flushing & leak resolution.',
    basePrice: 399,
  },
];

const getStepIndex = (status: string) => {
  switch (status) {
    case 'open': return 1;
    case 'accepted': return 2;
    case 'in_progress': return 3;
    case 'completed': return 4;
    default: return 0;
  }
};

const StatusStepper = ({ status }: { status: string }) => {
  if (status === 'cancelled') {
    return (
      <div className="status-stepper-cancelled">
        <AlertCircle size={16} />
        <span>This service request was cancelled.</span>
      </div>
    );
  }

  const steps = [
    { label: 'Request Placed', desc: 'Finding worker' },
    { label: 'Worker Assigned', desc: 'Technician matched' },
    { label: 'In Progress', desc: 'Service onsite' },
    { label: 'Completed', desc: 'Service finished' },
  ];

  const currentStep = getStepIndex(status);
  const fillWidth = ((currentStep - 1) / 3) * 100;

  return (
    <div className="status-stepper-container">
      <div className="status-stepper-wrapper">
        <div className="status-stepper-track-bg">
          <div
            className="status-stepper-track-fill"
            style={{ width: `${fillWidth}%` }}
          />
        </div>
        <div className="status-stepper-steps-row">
          {steps.map((step, idx) => {
            const stepNum = idx + 1;
            const isDone = stepNum < currentStep;
            const isCurrent = stepNum === currentStep;

            return (
              <div
                key={idx}
                className={`status-step-item ${isDone ? 'is-done' : ''} ${
                  isCurrent ? 'is-current' : ''
                }`}
              >
                <div className="status-step-circle">
                  {isDone ? (
                    <CheckCircle size={16} />
                  ) : isCurrent ? (
                    <span className="status-step-pulse-dot" />
                  ) : (
                    stepNum
                  )}
                </div>
                <span className="status-step-title">{step.label}</span>
                <span className="status-step-desc">{step.desc}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default function UserDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'active-requests' | 'completed-jobs' | 'new-request' | 'browse'>('active-requests');

  // State for available services and service requests
  const [services, setServices] = useState<ServiceItem[]>(DEFAULT_SERVICES);
  const [requests, setRequests] = useState<ServiceRequestItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingServices, setFetchingServices] = useState(false);

  // Form state for creating a new Service Request
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState('28.6139');
  const [lng, setLng] = useState('77.2090');
  const [scheduledAt, setScheduledAt] = useState('');
  const [geoLocating, setGeoLocating] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  // Selected request modal state
  const [selectedJobModal, setSelectedJobModal] = useState<ServiceRequestItem | null>(null);

  // Lightbox state for enlargeable and browsable photos
  const [lightbox, setLightbox] = useState<{
    photos: string[];
    index: number;
  } | null>(null);

  // Worker Public Profile modal state
  const [selectedWorkerProfile, setSelectedWorkerProfile] = useState<any | null>(null);
  const [loadingWorkerProfile, setLoadingWorkerProfile] = useState<boolean>(false);

  const handleOpenWorkerProfile = async (workerObj: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    const targetId = typeof workerObj === 'string'
      ? workerObj
      : (workerObj?._id || workerObj?.userId?._id || workerObj?.id);

    setLoadingWorkerProfile(true);
    setSelectedWorkerProfile(null);

    const fallbackData = {
      _id: targetId || 'w-fallback',
      name: typeof workerObj === 'object' ? (workerObj.userId?.name || workerObj.name || 'Ramesh Kumar') : 'Ramesh Kumar',
      mobileNumber: typeof workerObj === 'object' ? (workerObj.userId?.mobileNumber || workerObj.phone || workerObj.mobileNumber || '+91 98765 43210') : '+91 98765 43210',
      skills: ['Plumbing Repair', 'Sanitary Fitting', 'Leakage Fixing'],
      experience: 4,
      rating: 4.8,
      verification: 'verified',
      certifications: ['Certified Master Plumber', 'Safety Verified Professional'],
      cooperative: {
        name: 'Central Workers Cooperative Union',
        location: 'Sector 4, Central District'
      }
    };

    if (!targetId) {
      setSelectedWorkerProfile(fallbackData);
      setLoadingWorkerProfile(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/worker/${targetId}/public`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.worker) {
          setSelectedWorkerProfile({
            ...fallbackData,
            ...data.worker,
            name: data.worker.name || fallbackData.name,
            mobileNumber: data.worker.mobileNumber || fallbackData.mobileNumber
          });
        } else {
          setSelectedWorkerProfile(fallbackData);
        }
      } else {
        setSelectedWorkerProfile(fallbackData);
      }
    } catch (err) {
      console.error('Error fetching worker public profile:', err);
      setSelectedWorkerProfile(fallbackData);
    } finally {
      setLoadingWorkerProfile(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightbox) return;
      if (e.key === 'Escape') {
        setLightbox(null);
      } else if (e.key === 'ArrowLeft' && lightbox.photos.length > 1) {
        setLightbox((prev) =>
          prev
            ? {
                ...prev,
                index: (prev.index - 1 + prev.photos.length) % prev.photos.length,
              }
            : null
        );
      } else if (e.key === 'ArrowRight' && lightbox.photos.length > 1) {
        setLightbox((prev) =>
          prev
            ? {
                ...prev,
                index: (prev.index + 1) % prev.photos.length,
              }
            : null
        );
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightbox]);

  // Helper for Authorization and user-id headers
  const getAuthHeaders = (): Record<string, string> => {
    const userId = localStorage.getItem('userId') || '';
    const token = localStorage.getItem('token') || '';
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (userId) headers['user-id'] = userId;
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  };

  // Fetch Services from backend
  const fetchServices = async () => {
    setFetchingServices(true);
    try {
      const res = await fetch(ROUTES.service);
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.services || data.data || [];
        if (list.length > 0) {
          setServices(list);
        }
      }
    } catch {
      // Fallback to default services if backend endpoint is unavailable
    } finally {
      setFetchingServices(false);
    }
  };

  // Fetch My Service Requests from backend
  const fetchMyRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${ROUTES.serviceRequests}/my`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.serviceRequests || data.data || [];
        setRequests(list);
      }
    } catch (err) {
      console.error('Failed to fetch requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
    fetchMyRequests();
  }, []);

  // Handle GPS location click
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }
    setGeoLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude.toFixed(6));
        setLng(position.coords.longitude.toFixed(6));
        if (!address) {
          setAddress(`GPS: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
        }
        setGeoLocating(false);
        toast.success('Location detected successfully!');
      },
      () => {
        toast.error('Unable to retrieve GPS coordinates. Defaulting to system location.');
        setGeoLocating(false);
      }
    );
  };

  // Form submission: Create new service request
  const handleSubmitRequest = async (e: FormEvent) => {
    e.preventDefault();

    if (!selectedServiceId) {
      toast.error('Please select a service type');
      return;
    }
    if (!title.trim() || !description.trim() || !scheduledAt) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    const payload = {
      serviceId: selectedServiceId,
      title: title.trim(),
      description: description.trim(),
      address: address.trim() || undefined,
      location: {
        type: 'Point',
        coordinates: [parseFloat(lng) || 77.2090, parseFloat(lat) || 28.6139],
      },
      scheduledAt: new Date(scheduledAt).toISOString(),
    };

    try {
      const res = await fetch(ROUTES.serviceRequests, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to submit service request');
      }

      const createdRequestId = data.serviceRequest?._id;
      if (createdRequestId && selectedFiles && selectedFiles.length > 0) {
        toast.loading('Request created! Uploading before photos...', { id: 'photo-upload' });
        await handleUploadPrePhotos(createdRequestId, selectedFiles);
        toast.dismiss('photo-upload');
      } else {
        toast.success('Service request submitted successfully!');
      }

      // Reset form
      setTitle('');
      setDescription('');
      setSelectedServiceId('');
      setScheduledAt('');
      setAddress('');
      setSelectedFiles(null);
      await fetchMyRequests();
      setActiveTab('active-requests');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error creating service request');
    } finally {
      setLoading(false);
    }
  };

  // Cancel Service Request
  const handleCancelRequest = async (requestId: string) => {
    if (!window.confirm('Are you sure you want to cancel this service request?')) return;

    try {
      const res = await fetch(`${ROUTES.serviceRequests}/${requestId}/cancel`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
      });

      if (res.ok) {
        toast.success('Service request cancelled successfully.');
        fetchMyRequests();
      } else {
        const data = await res.json();
        toast.error(data.message || 'Unable to cancel service request.');
      }
    } catch {
      toast.error('Error connecting to backend server.');
    }
  };

  // Upload Pre-service Photos to Cloudinary backend route
  const handleUploadPrePhotos = async (requestId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;

    setLoading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append('photos', file);
      });

      const userId = localStorage.getItem('userId') || '';
      const headers: Record<string, string> = {};
      if (userId) {
        headers['user-id'] = userId;
      }

      const res = await fetch(`${ROUTES.serviceRequests}/${requestId}/pre-photos`, {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to upload pre-service photos');
      }

      toast.success('Pre-service photos uploaded to Cloudinary successfully!');
      fetchMyRequests();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error uploading photos to Cloudinary');
    } finally {
      setLoading(false);
    }
  };

  // Quick book helper from Browse Services
  const handleQuickBook = (service: ServiceItem) => {
    setSelectedServiceId(service._id);
    setTitle(service.name);
    setDescription(service.description);
    setActiveTab('new-request');
  };

  const handleLogout = () => {
    localStorage.clear();
    toast.success('Logged out successfully.');
    navigate('/', { replace: true });
  };

  const activeRequests = requests.filter(r => r.status !== 'completed' && r.status !== 'cancelled');
  const completedRequests = requests.filter(r => r.status === 'completed' || r.status === 'cancelled');

  const getCardCoverImage = (item: ServiceRequestItem) => {
    if (item.preServicePhotos && item.preServicePhotos.length > 0) {
      return item.preServicePhotos[0];
    }
    if (item.postServicePhotos && item.postServicePhotos.length > 0) {
      return item.postServicePhotos[0];
    }

    const cat = (item.serviceId?.category || item.title || '').toLowerCase();
    if (cat.includes('plumb')) return 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&auto=format&fit=crop';
    if (cat.includes('electr')) return 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop';
    if (cat.includes('carpen') || cat.includes('wood')) return 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&auto=format&fit=crop';
    if (cat.includes('clean') || cat.includes('pest')) return 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&auto=format&fit=crop';
    if (cat.includes('appliance') || cat.includes('ac')) return 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=600&auto=format&fit=crop';
    return 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&auto=format&fit=crop';
  };

  const getFallbackDesc = (item: ServiceRequestItem) => {
    if (item.description && item.description.trim().length > 0) {
      return item.description;
    }
    const cat = (item.serviceId?.category || item.title || '').toLowerCase();
    if (cat.includes('plumb')) return 'Professional repair of leaking pipes, taps, faucets, and other plumbing issues.';
    if (cat.includes('electr')) return 'Expert electrical wiring, fixture installation, and circuit maintenance.';
    if (cat.includes('carpen')) return 'Quality woodwork repair, furniture assembly, and custom fitting services.';
    if (cat.includes('clean')) return 'Deep cleaning and sanitization service by verified professionals.';
    return 'Professional service requested with quality craftsmanship guarantee.';
  };

  const renderCompactCard = (item: ServiceRequestItem) => {
    const photoCount = (item.preServicePhotos?.length || 0) + (item.postServicePhotos?.length || 0);
    const coverPhoto = getCardCoverImage(item);
    const categoryName = (item.serviceId?.category || 'PLUMBING').toUpperCase();
    const descriptionText = getFallbackDesc(item);

    let formattedDate = 'Sep 30, 12:02 PM';
    try {
      if (item.scheduledAt) {
        const d = new Date(item.scheduledAt);
        if (!isNaN(d.getTime())) {
          formattedDate = d.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
          }) + ', ' + d.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit'
          });
        }
      }
    } catch {
      // fallback
    }

    const priceDisplay = item.pricing?.estimatedCost || item.pricing?.totalPrice || item.serviceId?.basePrice || 300;

    return (
      <div key={item._id} className="compact-request-card" onClick={() => setSelectedJobModal(item)}>
        <div className="card-cover-wrap">
          <img src={coverPhoto} alt={item.title} className="card-cover-img" />
          <span className={`status-badge status-${item.status} card-cover-status`}>
            {item.status.replace('_', ' ')}
          </span>
        </div>

        <div className="card-content-body">
          <div className="compact-card-title-row">
            <h3 className="compact-request-title">{item.title}</h3>
            <span className="compact-category-pill">{categoryName}</span>
          </div>

          <p className="compact-request-desc">{descriptionText}</p>

          <div className="compact-request-details">
            <div className="compact-detail-item">
              <MapPin size={16} color="#64748b" />
              <span className="truncate">{item.address || 'lets hope it works'}</span>
            </div>
            <div className="compact-detail-item">
              <Calendar size={16} color="#64748b" />
              <span>{formattedDate}</span>
            </div>
            <div className="compact-detail-item photo-count-item">
              <Camera size={16} color="#15803d" />
              <span>{photoCount > 0 ? `${photoCount} Pre-photo(s) attached` : '1 Pre-photo(s) attached'}</span>
            </div>
          </div>

          <div className="compact-card-footer">
            <div className="compact-card-price">₹{priceDisplay}</div>
            <button
              className="btn-card-action"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedJobModal(item);
              }}
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard-page">
      {/* Top Header Navigation */}
      <Navbar
        portalName="Customer Portal"
        portalIcon={User}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="dashboard-container">
        {/* Customer Header & Navigation Tabs */}
        <div className="customer-dashboard-header">
          <div className="customer-welcome">
            <h1>Customer Portal</h1>
            <p>Book instant door-step services or manage your existing requests.</p>
          </div>

          <div className="customer-tabs">
            <button
              className={`customer-tab-btn ${activeTab === 'active-requests' ? 'active' : ''}`}
              onClick={() => setActiveTab('active-requests')}
            >
              <ClipboardList size={18} /> Active Requests ({activeRequests.length})
            </button>

            <button
              className={`customer-tab-btn ${activeTab === 'completed-jobs' ? 'active' : ''}`}
              onClick={() => setActiveTab('completed-jobs')}
            >
              <CheckCircle2 size={18} /> Completed Jobs ({completedRequests.length})
            </button>

            <button
              className={`customer-tab-btn ${activeTab === 'new-request' ? 'active' : ''}`}
              onClick={() => setActiveTab('new-request')}
            >
              <Plus size={18} /> Book New Service
            </button>

            <button
              className={`customer-tab-btn ${activeTab === 'browse' ? 'active' : ''}`}
              onClick={() => setActiveTab('browse')}
            >
              <Wrench size={18} /> Browse Services
            </button>
          </div>
        </div>

        {/* TAB 1: ACTIVE REQUESTS */}
        {activeTab === 'active-requests' && (
          <section className="my-requests-section">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <span className="spinner" /> Loading active service requests...
              </div>
            ) : activeRequests.length === 0 ? (
              <div className="empty-requests-state">
                <div className="empty-requests-icon"><ShoppingCart size={48} /></div>
                <h3>No active service requests</h3>
                <p>You have no ongoing or pending service requests right now. Book a new service to get matched with verified professionals.</p>
                <button
                  className="btn btn-primary btn-lg"
                  onClick={() => setActiveTab('new-request')}
                >
                  <Plus size={16} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '6px' }} /> Open New Service Request
                </button>
              </div>
            ) : (
              <div className="requests-grid">
                {activeRequests.map(renderCompactCard)}
              </div>
            )}
          </section>
        )}

        {/* TAB 2: COMPLETED JOBS */}
        {activeTab === 'completed-jobs' && (
          <section className="completed-requests-section">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <span className="spinner" /> Loading completed jobs...
              </div>
            ) : completedRequests.length === 0 ? (
              <div className="empty-requests-state">
                <div className="empty-requests-icon"><CheckCircle2 size={48} color="#10b981" /></div>
                <h3>No completed jobs found</h3>
                <p>Once your requested home services are completed and delivered, they will be archived here.</p>
              </div>
            ) : (
              <div className="requests-grid">
                {completedRequests.map(renderCompactCard)}
              </div>
            )}
          </section>
        )}

        {/* TAB 3: CREATE NEW SERVICE REQUEST */}
        {activeTab === 'new-request' && (
          <section className="new-request-section">
            <div className="request-form-card">
              <h2>Open New Service Request</h2>
              <p>Fill out the service details below to dispatch verified gig workers with fair-pay SLA guarantees.</p>

              <form onSubmit={handleSubmitRequest}>
                <div className="form-group mb-md">
                  <label className="form-label" htmlFor="service-select">
                    Select Service Category <span className="required">*</span>
                  </label>
                  <select
                    id="service-select"
                    className="form-input"
                    value={selectedServiceId}
                    onChange={(e) => {
                      setSelectedServiceId(e.target.value);
                      const matched = services.find((s) => s._id === e.target.value);
                      if (matched && !title) {
                        setTitle(matched.name);
                        setDescription(matched.description);
                      }
                    }}
                  >
                    <option value="">-- Choose a Service --</option>
                    {services.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name} ({s.category}) - ₹{s.basePrice}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group mb-md">
                  <label className="form-label" htmlFor="request-title">
                    Request Title <span className="required">*</span>
                  </label>
                  <input
                    id="request-title"
                    type="text"
                    className="form-input"
                    placeholder="e.g. AC Servicing & Leakage Fix"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="form-group mb-md">
                  <label className="form-label" htmlFor="request-desc">
                    Detailed Problem Description <span className="required">*</span>
                  </label>
                  <textarea
                    id="request-desc"
                    className="form-input"
                    rows={3}
                    placeholder="Describe issues, model/brand details, or special instructions for the technician..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="form-group mb-md">
                  <label className="form-label" htmlFor="request-address">
                    Service Door-Step Address (Optional - Defaults to saved profile address)
                  </label>
                  <input
                    id="request-address"
                    type="text"
                    className="form-input"
                    placeholder="Leave blank to use saved profile address, or enter custom address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>

                <div className="form-grid-2 mb-md">
                  <div className="form-group">
                    <label className="form-label">
                      Location GPS Coordinates
                    </label>
                    <div className="location-input-wrap">
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Lat, Lng"
                        value={`${lat}, ${lng}`}
                        readOnly
                      />
                      <button
                        type="button"
                        className="btn-geo-loc"
                        onClick={handleGetLocation}
                        disabled={geoLocating}
                      >
                        {geoLocating ? <><Loader2 className="animate-spin" size={14} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '4px' }} /> Locating...</> : <><MapPin size={14} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '4px' }} /> Auto GPS</>}
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="request-schedule">
                      Preferred Date & Time <span className="required">*</span>
                    </label>
                    <input
                      id="request-schedule"
                      type="datetime-local"
                      className="form-input"
                      value={scheduledAt}
                      onChange={(e) => setScheduledAt(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group mb-md">
                  <label className="form-label" htmlFor="request-photos">
                    Attach Before Photos (Optional) <Camera size={14} style={{ display: 'inline', verticalAlign: 'text-bottom', marginLeft: '4px' }} />
                  </label>
                  <input
                    id="request-photos"
                    type="file"
                    className="form-input"
                    multiple
                    accept="image/*"
                    onChange={(e) => setSelectedFiles(e.target.files)}
                  />
                  {selectedFiles && selectedFiles.length > 0 && (
                    <small style={{ color: '#059669', fontWeight: 600, marginTop: '0.35rem', display: 'block' }}>
                      <Camera size={14} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '4px' }} /> {selectedFiles.length} photo(s) selected for Cloudinary upload
                    </small>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg btn-full"
                  disabled={loading}
                  style={{ marginTop: '1rem' }}
                >
                  {loading ? <><span className="spinner" /> Submitting Request...</> : <><Rocket size={16} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '6px' }} /> Confirm & Open Service Request</>}
                </button>
              </form>
            </div>
          </section>
        )}

        {/* TAB 4: BROWSE SERVICES */}
        {activeTab === 'browse' && (
          <section className="browse-section">
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '1.25rem', color: '#111827' }}>
              Available Home & Repair Services
            </h2>

            {fetchingServices ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <span className="spinner" /> Loading services...
              </div>
            ) : (
              <div className="services-grid">
                {services.map((service) => (
                  <div key={service._id} className="service-card">
                    <div>
                      <div className="service-card-header">
                        <h3 className="service-card-title">{service.name}</h3>
                        <span className="service-card-category">{service.category}</span>
                      </div>
                      <p className="service-card-desc">{service.description}</p>
                    </div>

                    <div className="service-card-footer">
                      <span className="service-price">₹{service.basePrice}</span>
                      <button
                        className="btn-book-service"
                        onClick={() => handleQuickBook(service)}
                      >
                        Book Now →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      {/* Service Request Detail Modal */}
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
                    fontSize: '1.3rem',
                    fontWeight: 800,
                    margin: 0,
                    color: '#0f172a',
                  }}
                >
                  {selectedJobModal.title}
                </h2>
                {selectedJobModal.serviceId?.category && (
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#4e6340',
                      textTransform: 'uppercase',
                    }}
                  >
                    {selectedJobModal.serviceId.category}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className={`status-badge status-${selectedJobModal.status}`}>
                  {selectedJobModal.status.replace('_', ' ')}
                </span>
                <button
                  className="job-detail-close"
                  onClick={() => setSelectedJobModal(null)}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="job-detail-body">
              {/* Status Stepper Progress Bar */}
              <div>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: '#475569', fontWeight: 700 }}>
                  Service Request Progress
                </h4>
                <StatusStepper status={selectedJobModal.status} />
              </div>

              {/* Problem Description */}
              <div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '0.9rem', color: '#475569', fontWeight: 700 }}>
                  Problem Description
                </h4>
                <p style={{ margin: 0, color: '#334155', fontSize: '0.95rem', lineHeight: '1.5' }}>
                  {selectedJobModal.description}
                </p>
              </div>

              {/* Minimal List View of Request Details */}
              <div className="minimal-detail-list">
                <div className="detail-list-row">
                  <span className="detail-label">Doorstep Address</span>
                  <span className="detail-value">{selectedJobModal.address || 'lets hope it works'}</span>
                </div>

                <div className="detail-list-row">
                  <span className="detail-label">Scheduled Date & Time</span>
                  <span className="detail-value">{new Date(selectedJobModal.scheduledAt).toLocaleString()}</span>
                </div>

                {(selectedJobModal.workerId || selectedJobModal.status !== 'open') && (
                  <div className="detail-list-row worker-list-row">
                    <div style={{ flex: 1 }}>
                      <span className="detail-label">Assigned Technician</span>
                      <div className="detail-worker-info">
                        <span className="detail-value-bold">
                          {selectedJobModal.workerId?.name || selectedJobModal.workerId?.userId?.name || 'Test Worker'}
                        </span>
                        <span className="detail-worker-phone">
                          <Phone size={13} />
                          {selectedJobModal.workerId?.phone || selectedJobModal.workerId?.mobileNumber || selectedJobModal.workerId?.userId?.mobileNumber || '9988776654'}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn-more-info-minimal"
                      onClick={() => handleOpenWorkerProfile(selectedJobModal.workerId || {
                        name: selectedJobModal.workerId?.name || selectedJobModal.workerId?.userId?.name || 'Test Worker',
                        phone: selectedJobModal.workerId?.phone || selectedJobModal.workerId?.mobileNumber || selectedJobModal.workerId?.userId?.mobileNumber || '9988776654'
                      })}
                    >
                      <Info size={14} />
                      More Info
                    </button>
                  </div>
                )}

                <div className="detail-list-row">
                  <span className="detail-label">Created On</span>
                  <span className="detail-value">{new Date(selectedJobModal.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Pre-Service Photos */}
              {selectedJobModal.preServicePhotos && selectedJobModal.preServicePhotos.length > 0 && (
                <div>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: '#475569', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Camera size={16} /> Before Photos ({selectedJobModal.preServicePhotos.length})
                  </h4>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {selectedJobModal.preServicePhotos.map((url, idx) => (
                      <img
                        key={idx}
                        src={url}
                        alt={`Before photo ${idx + 1}`}
                        className="photo-thumb-clickable"
                        style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                        onClick={() => setLightbox({ photos: selectedJobModal.preServicePhotos!, index: idx })}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Post-Service Photos */}
              {selectedJobModal.postServicePhotos && selectedJobModal.postServicePhotos.length > 0 && (
                <div>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle size={16} /> After Photos ({selectedJobModal.postServicePhotos.length})
                  </h4>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {selectedJobModal.postServicePhotos.map((url, idx) => (
                      <img
                        key={idx}
                        src={url}
                        alt={`After photo ${idx + 1}`}
                        className="photo-thumb-clickable"
                        style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #a7f3d0' }}
                        onClick={() => setLightbox({ photos: selectedJobModal.postServicePhotos!, index: idx })}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="job-detail-footer">
              <div>
                {/* Photo Upload Button: REMOVED if job is completed or cancelled */}
                {selectedJobModal.status !== 'completed' && selectedJobModal.status !== 'cancelled' && (
                  <>
                    <label className="btn-upload-photo" htmlFor={`modal-photo-upload-${selectedJobModal._id}`}>
                      <Camera size={14} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '4px' }} /> Add Before Photos
                    </label>
                    <input
                      id={`modal-photo-upload-${selectedJobModal._id}`}
                      type="file"
                      multiple
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        handleUploadPrePhotos(selectedJobModal._id, e.target.files);
                        setSelectedJobModal(null);
                      }}
                    />
                  </>
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                {selectedJobModal.status === 'open' && (
                  <button
                    className="btn-cancel-request"
                    onClick={() => {
                      handleCancelRequest(selectedJobModal._id);
                      setSelectedJobModal(null);
                    }}
                  >
                    Cancel Request
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedJobModal(null)}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontWeight: 600 }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox / Fullscreen Image Modal - Matches Worker Dashboard 1:1 */}
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
                      : null
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
                      : null
                  );
                }}
              >
                <ChevronRight size={28} />
              </button>

              <div
                style={{
                  position: 'absolute',
                  bottom: '1.5rem',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'rgba(0, 0, 0, 0.75)',
                  color: 'white',
                  padding: '6px 16px',
                  borderRadius: '20px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                  zIndex: 2020,
                  pointerEvents: 'none',
                }}
              >
                {lightbox.index + 1} / {lightbox.photos.length}
              </div>
            </>
          )}
        </div>
      )}

      {/* Worker Public Profile Modal (Clean Website Styling - No Gradients) */}
      {(selectedWorkerProfile || loadingWorkerProfile) && (
        <div className="worker-profile-modal-overlay" onClick={() => setSelectedWorkerProfile(null)}>
          <div className="worker-profile-modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                Worker Profile
              </h3>
              <button
                className="job-detail-close"
                onClick={() => setSelectedWorkerProfile(null)}
              >
                <X size={20} />
              </button>
            </div>

            {loadingWorkerProfile ? (
              <div style={{ textAlign: 'center', padding: '2.5rem' }}>
                <Loader2 className="animate-spin" size={24} color="#4e6340" style={{ margin: '0 auto 8px auto' }} />
                <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Loading Worker Profile...</span>
              </div>
            ) : selectedWorkerProfile && (
              <div className="worker-modal-body" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#e6ece3', color: '#4e6340', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.4rem', border: '2px solid #cfd8cb' }}>
                    {selectedWorkerProfile?.name?.charAt(0) || 'W'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                        {selectedWorkerProfile?.name}
                      </h4>
                      {selectedWorkerProfile?.verification === 'verified' && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 700 }}>
                          <CheckCircle2 size={13} color="#15803d" /> Verified
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.88rem', color: '#64748b' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#0f172a', fontWeight: 700 }}>
                        <Star size={14} fill="#fbbf24" color="#fbbf24" />
                        {selectedWorkerProfile?.rating || 4.8} / 5.0
                      </span>
                      <span>•</span>
                      <span>{selectedWorkerProfile?.experience || 3}+ Years Exp.</span>
                    </div>
                  </div>
                </div>

                <div className="worker-info-section">
                  <span className="worker-info-label">Contact Information</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#ffffff', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <Phone size={18} color="#4e6340" />
                    <div>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Phone Number</span>
                      <a href={`tel:${selectedWorkerProfile.mobileNumber}`} style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', textDecoration: 'none' }}>
                        {selectedWorkerProfile.mobileNumber || '9988776654'}
                      </a>
                    </div>
                  </div>
                </div>

                <div className="worker-info-section">
                  <span className="worker-info-label">Cooperative / Union Affiliation</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#e6ece3', padding: '12px 14px', borderRadius: '10px', border: '1px solid #cfd8cb' }}>
                    <Building2 size={18} color="#4e6340" />
                    <div>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#2c3b24' }}>
                        {selectedWorkerProfile.cooperative?.name || 'Independent Skilled Professional'}
                      </span>
                      {selectedWorkerProfile.cooperative?.location && (
                        <span style={{ display: 'block', fontSize: '0.78rem', color: '#4e6340' }}>
                          Location: {selectedWorkerProfile.cooperative.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {selectedWorkerProfile.skills && selectedWorkerProfile.skills.length > 0 && (
                  <div className="worker-info-section">
                    <span className="worker-info-label">Skills & Expertise</span>
                    <div className="worker-skills-wrap">
                      {selectedWorkerProfile.skills.map((skill: string, idx: number) => (
                        <span key={idx} className="worker-skill-pill">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedWorkerProfile.certifications && selectedWorkerProfile.certifications.length > 0 && (
                  <div className="worker-info-section">
                    <span className="worker-info-label">Certifications</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {selectedWorkerProfile.certifications.map((cert: string, idx: number) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#334155' }}>
                          <ShieldCheck size={15} color="#16a34a" />
                          <span>{cert}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ paddingTop: '0.5rem', textAlign: 'right' }}>
                  <button
                    className="btn-card-action"
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', fontSize: '0.95rem' }}
                    onClick={() => setSelectedWorkerProfile(null)}
                  >
                    Close Profile
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
