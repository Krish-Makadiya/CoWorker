import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  Plus,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  ShoppingCart,
  MapPin,
  Calendar,
  HardHat,
  Camera,
  Loader2,
  Rocket
} from 'lucide-react';
import { ROUTES } from '../config/api';
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
  serviceId?: {
    name?: string;
    category?: string;
  };
  workerId?: {
    name?: string;
    phone?: string;
  };
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

export default function UserDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'my-requests' | 'new-request' | 'browse'>('my-requests');

  // State for available services and service requests
  const [services, setServices] = useState<ServiceItem[]>(DEFAULT_SERVICES);
  const [requests, setRequests] = useState<ServiceRequestItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingServices, setFetchingServices] = useState(false);
  const [apiError, setApiError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

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
      setApiError('Geolocation is not supported by your browser.');
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
      },
      () => {
        setApiError('Unable to retrieve GPS coordinates. Defaulting to system location.');
        setGeoLocating(false);
      }
    );
  };

  // Form submission: Create new service request
  const handleSubmitRequest = async (e: FormEvent) => {
    e.preventDefault();
    setApiError('');
    setSuccessMsg('');

    if (!selectedServiceId) {
      setApiError('Please select a service type');
      return;
    }
    if (!title.trim() || !description.trim() || !address.trim() || !scheduledAt) {
      setApiError('Please fill in all required fields');
      return;
    }

    setLoading(true);

    const payload = {
      serviceId: selectedServiceId,
      title: title.trim(),
      description: description.trim(),
      address: address.trim(),
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
        setSuccessMsg('Request created! Uploading before photos to Cloudinary...');
        await handleUploadPrePhotos(createdRequestId, selectedFiles);
      } else {
        setSuccessMsg('Service request submitted successfully! Workers near your area will be notified.');
      }

      // Reset form
      setTitle('');
      setDescription('');
      setSelectedServiceId('');
      setScheduledAt('');
      setAddress('');
      setSelectedFiles(null);
      fetchMyRequests();

      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Error creating service request');
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
        fetchMyRequests();
      } else {
        const data = await res.json();
        alert(data.message || 'Unable to cancel service request.');
      }
    } catch {
      alert('Error connecting to backend server.');
    }
  };

  // Upload Pre-service Photos to Cloudinary backend route
  const handleUploadPrePhotos = async (requestId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;

    setLoading(true);
    setApiError('');
    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append('preServicePhotos', file);
      });

      const res = await fetch(ROUTES.customer.uploadPrePhotos(requestId), {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to upload pre-service photos');
      }

      setSuccessMsg('Pre-service photos uploaded to Cloudinary successfully!');
      fetchMyRequests();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Error uploading photos to Cloudinary');
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

  return (
    <div className="dashboard-page">
      {/* Top Header Navigation */}
      <nav className="dashboard-nav" aria-label="User dashboard navigation">
        <Link to="/" className="dashboard-nav-brand">
          <span className="dashboard-nav-brand-dot" />
          GIG Platform · Customer Portal
        </Link>
        <button
          className="dashboard-nav-logout"
          onClick={() => navigate('/')}
          aria-label="Logout"
        >
          ← Logout
        </button>
      </nav>

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
              className={`customer-tab-btn ${activeTab === 'my-requests' ? 'active' : ''}`}
              onClick={() => setActiveTab('my-requests')}
            >
              <ClipboardList size={16} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '6px' }} /> My Requests ({requests.length})
            </button>

            <button
              className={`customer-tab-btn ${activeTab === 'new-request' ? 'active' : ''}`}
              onClick={() => setActiveTab('new-request')}
            >
              <Plus size={16} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '6px' }} /> Book New Service
            </button>

            <button
              className={`customer-tab-btn ${activeTab === 'browse' ? 'active' : ''}`}
              onClick={() => setActiveTab('browse')}
            >
              <Wrench size={16} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '6px' }} /> Browse Services
            </button>
          </div>
        </div>

        {/* Global Messages */}
        {apiError && (
          <div className="alert alert-danger mb-md" style={{ margin: '0 auto 1.5rem', maxWidth: '720px' }}>
            <AlertTriangle size={16} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '6px' }} /> {apiError}
          </div>
        )}

        {successMsg && (
          <div className="alert alert-success mb-md" style={{ margin: '0 auto 1.5rem', maxWidth: '720px' }}>
            <CheckCircle2 size={16} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '6px' }} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* TAB 1: MY REQUESTS */}
        {activeTab === 'my-requests' && (
          <section className="my-requests-section">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <span className="spinner" /> Loading service requests...
              </div>
            ) : requests.length === 0 ? (
              <div className="empty-requests-state">
                <div className="empty-requests-icon"><ShoppingCart size={48} /></div>
                <h3>No service requests found</h3>
                <p>You haven't requested any home services yet. Open a new request to get matched with verified gig professionals.</p>
                <button
                  className="btn btn-primary btn-lg"
                  onClick={() => setActiveTab('new-request')}
                >
                  <Plus size={16} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '6px' }} /> Open New Service Request
                </button>
              </div>
            ) : (
              <div className="requests-list">
                {requests.map((item) => (
                  <div key={item._id} className="request-item-card">
                    <div className="request-main-info">
                      <div className="request-header-row">
                        <h3 className="request-title">{item.title}</h3>
                        <span className={`status-badge status-${item.status}`}>
                          {item.status.replace('_', ' ')}
                        </span>
                      </div>

                      <p style={{ color: '#4b5563', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                        {item.description}
                      </p>

                      <div className="request-meta">
                        <span><MapPin size={14} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '4px' }} /> Address: {item.address}</span>
                        <span><Calendar size={14} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '4px' }} /> Scheduled: {new Date(item.scheduledAt).toLocaleString()}</span>
                        {item.workerId && (
                          <span><HardHat size={14} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '4px' }} /> Assigned Worker: {item.workerId.name || 'Verified Professional'}</span>
                        )}
                      </div>

                      {/* Uploaded Pre-Service Photos */}
                      {item.preServicePhotos && item.preServicePhotos.length > 0 && (
                        <div className="request-photos-grid">
                          <span className="photo-label"><Camera size={14} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '4px' }} /> Before Photos ({item.preServicePhotos.length}):</span>
                          <div className="photos-row">
                            {item.preServicePhotos.map((url, idx) => (
                              <img key={idx} src={url} alt={`Pre-service ${idx}`} className="photo-thumb" />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                      {/* Photo Upload Button */}
                      <label className="btn-upload-photo" htmlFor={`photo-upload-${item._id}`}>
                        <Camera size={14} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '4px' }} /> Add Before Photos
                      </label>
                      <input
                        id={`photo-upload-${item._id}`}
                        type="file"
                        multiple
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => handleUploadPrePhotos(item._id, e.target.files)}
                      />

                      {item.status === 'open' && (
                        <button
                          className="btn-cancel-request"
                          onClick={() => handleCancelRequest(item._id)}
                        >
                          Cancel Request
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* TAB 2: CREATE NEW SERVICE REQUEST */}
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
                    Service Door-Step Address <span className="required">*</span>
                  </label>
                  <input
                    id="request-address"
                    type="text"
                    className="form-input"
                    placeholder="House/Flat No., Street, Area, City & Pincode"
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

        {/* TAB 3: BROWSE SERVICES */}
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
    </div>
  );
}
