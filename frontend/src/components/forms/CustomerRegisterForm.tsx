import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Loader2, MapPin } from 'lucide-react';
import { ROUTES } from '../../config/api';

interface CustomerFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  mobileNumber: string;
  address: string;
  latitude: string;
  longitude: string;
}

interface FormErrors {
  [key: string]: string;
}

interface CustomerRegisterFormProps {
  onSuccess?: () => void;
}

export default function CustomerRegisterForm({ onSuccess }: CustomerRegisterFormProps) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CustomerFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    mobileNumber: '',
    address: '',
    latitude: '',
    longitude: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [detecting, setDetecting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    setApiError('');
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Enter a valid email';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!formData.mobileNumber.trim()) newErrors.mobileNumber = 'Mobile number is required';
    else if (!/^[6-9]\d{9}$/.test(formData.mobileNumber)) newErrors.mobileNumber = 'Enter a valid 10-digit Indian mobile number';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.latitude || !formData.longitude) newErrors.location = 'Location is required. Use "Detect Location" or enter manually.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setApiError('Geolocation is not supported by your browser.');
      return;
    }
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData(prev => ({
          ...prev,
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6),
        }));
        setErrors(prev => ({ ...prev, location: '' }));
        setDetecting(false);
      },
      () => {
        setApiError('Could not detect location. Please enter manually.');
        setDetecting(false);
      }
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setApiError('');

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password,
      mobileNumber: formData.mobileNumber.trim(),
      address: formData.address.trim(),
      location: {
        type: 'Point',
        coordinates: [parseFloat(formData.longitude), parseFloat(formData.latitude)],
      },
    };

    try {
      const res = await fetch(ROUTES.customer.register, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      onSuccess?.();
      navigate('/login/customer', { replace: true });
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="register-form" onSubmit={handleSubmit} noValidate>
      {apiError && (
        <div className="alert alert-danger mb-md" role="alert">
          <AlertTriangle size={16} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '6px' }} /> {apiError}
        </div>
      )}

      <div className="register-form-grid">
        {/* Personal Info */}
        <div className="register-section-divider">
          <span>Personal Information</span>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="cust-name">
            Full Name <span className="required">*</span>
          </label>
          <input
            id="cust-name"
            name="name"
            type="text"
            className={`form-input ${errors.name ? 'error' : ''}`}
            placeholder="Enter your full name"
            value={formData.name}
            onChange={handleChange}
            autoComplete="name"
          />
          {errors.name && <span className="form-error">{errors.name}</span>}
        </div>

        <div className="register-form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="cust-email">
              Email <span className="required">*</span>
            </label>
            <input
              id="cust-email"
              name="email"
              type="email"
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="you@email.com"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
            />
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="cust-mobile">
              Mobile Number <span className="required">*</span>
            </label>
            <input
              id="cust-mobile"
              name="mobileNumber"
              type="tel"
              className={`form-input ${errors.mobileNumber ? 'error' : ''}`}
              placeholder="10-digit mobile number"
              value={formData.mobileNumber}
              onChange={handleChange}
              maxLength={10}
              autoComplete="tel"
            />
            {errors.mobileNumber && <span className="form-error">{errors.mobileNumber}</span>}
          </div>
        </div>

        <div className="register-form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="cust-password">
              Password <span className="required">*</span>
            </label>
            <input
              id="cust-password"
              name="password"
              type="password"
              className={`form-input ${errors.password ? 'error' : ''}`}
              placeholder="Min. 6 characters"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
            />
            {errors.password && <span className="form-error">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="cust-confirm-password">
              Confirm Password <span className="required">*</span>
            </label>
            <input
              id="cust-confirm-password"
              name="confirmPassword"
              type="password"
              className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
              placeholder="Re-enter password"
              value={formData.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
            />
            {errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}
          </div>
        </div>

        {/* Location */}
        <div className="register-section-divider">
          <span>Address &amp; Location</span>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="cust-address">
            Address <span className="required">*</span>
          </label>
          <textarea
            id="cust-address"
            name="address"
            className={`form-textarea ${errors.address ? 'error' : ''}`}
            placeholder="Enter your full address"
            value={formData.address}
            onChange={handleChange}
            rows={2}
          />
          {errors.address && <span className="form-error">{errors.address}</span>}
        </div>

        <div className="form-group">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <label className="form-label" style={{ margin: 0 }}>
              Location (Coordinates) <span className="required">*</span>
            </label>
            <button
              type="button"
              className="location-detect-btn"
              onClick={detectLocation}
              disabled={detecting}
            >
              {detecting ? <><Loader2 className="animate-spin" size={14} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '4px' }} /> Detecting...</> : <><MapPin size={14} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '4px' }} /> Detect Location</>}
            </button>
          </div>
          <div className="location-coords">
            <input
              id="cust-latitude"
              name="latitude"
              type="number"
              step="any"
              className={`form-input ${errors.location ? 'error' : ''}`}
              placeholder="Latitude"
              value={formData.latitude}
              onChange={handleChange}
            />
            <input
              id="cust-longitude"
              name="longitude"
              type="number"
              step="any"
              className={`form-input ${errors.location ? 'error' : ''}`}
              placeholder="Longitude"
              value={formData.longitude}
              onChange={handleChange}
            />
          </div>
          {errors.location && <span className="form-error">{errors.location}</span>}
          <span className="form-hint">Used to find nearby workers. Click "Detect Location" or enter manually.</span>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="btn btn-primary btn-lg btn-full register-submit-btn"
          disabled={loading}
        >
          {loading ? <><span className="spinner" /> Creating Account...</> : 'Create Account'}
        </button>
      </div>
    </form>
  );
}
