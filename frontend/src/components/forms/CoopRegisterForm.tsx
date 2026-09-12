import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { ROUTES } from '../../config/api';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];

interface CoopFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  mobileNumber: string;
  registrationNumber: string;
  city: string;
  state: string;
  pinCode: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function CoopRegisterForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CoopFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    mobileNumber: '',
    registrationNumber: '',
    city: '',
    state: '',
    pinCode: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    setApiError('');
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Cooperative name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Enter a valid email';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!formData.mobileNumber.trim()) newErrors.mobileNumber = 'Mobile number is required';
    else if (!/^[6-9]\d{9}$/.test(formData.mobileNumber)) newErrors.mobileNumber = 'Enter a valid 10-digit Indian mobile number';
    if (!formData.registrationNumber.trim()) newErrors.registrationNumber = 'Registration number is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.pinCode.trim()) newErrors.pinCode = 'PIN code is required';
    else if (!/^\d{6}$/.test(formData.pinCode)) newErrors.pinCode = 'Enter a valid 6-digit PIN code';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
      registrationNumber: formData.registrationNumber.trim(),
      address: {
        city: formData.city.trim(),
        state: formData.state.trim(),
        pinCode: formData.pinCode.trim(),
      },
    };

    try {
      const res = await fetch(ROUTES.cooperative.register, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      navigate('/login/cooperative', { replace: true });
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
        {/* Cooperative Info */}
        <div className="register-section-divider">
          <span>Cooperative Information</span>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="coop-name">
            Cooperative / Union Name <span className="required">*</span>
          </label>
          <input
            id="coop-name"
            name="name"
            type="text"
            className={`form-input ${errors.name ? 'error' : ''}`}
            placeholder="e.g. ABC Workers' Cooperative"
            value={formData.name}
            onChange={handleChange}
            autoComplete="organization"
          />
          {errors.name && <span className="form-error">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="coop-reg-number">
            Registration Number <span className="required">*</span>
          </label>
          <input
            id="coop-reg-number"
            name="registrationNumber"
            type="text"
            className={`form-input ${errors.registrationNumber ? 'error' : ''}`}
            placeholder="Official registration number"
            value={formData.registrationNumber}
            onChange={handleChange}
          />
          {errors.registrationNumber && <span className="form-error">{errors.registrationNumber}</span>}
        </div>

        {/* Contact */}
        <div className="register-section-divider">
          <span>Contact Details</span>
        </div>

        <div className="register-form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="coop-email">
              Email <span className="required">*</span>
            </label>
            <input
              id="coop-email"
              name="email"
              type="email"
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="coop@email.com"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
            />
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="coop-mobile">
              Mobile Number <span className="required">*</span>
            </label>
            <input
              id="coop-mobile"
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
            <label className="form-label" htmlFor="coop-password">
              Password <span className="required">*</span>
            </label>
            <input
              id="coop-password"
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
            <label className="form-label" htmlFor="coop-confirm-password">
              Confirm Password <span className="required">*</span>
            </label>
            <input
              id="coop-confirm-password"
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

        {/* Address */}
        <div className="register-section-divider">
          <span>Registered Address</span>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="coop-city">
            City <span className="required">*</span>
          </label>
          <input
            id="coop-city"
            name="city"
            type="text"
            className={`form-input ${errors.city ? 'error' : ''}`}
            placeholder="Enter city name"
            value={formData.city}
            onChange={handleChange}
          />
          {errors.city && <span className="form-error">{errors.city}</span>}
        </div>

        <div className="register-form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="coop-state">
              State <span className="required">*</span>
            </label>
            <select
              id="coop-state"
              name="state"
              className={`form-select ${errors.state ? 'error' : ''}`}
              value={formData.state}
              onChange={handleChange}
            >
              <option value="">Select state</option>
              {INDIAN_STATES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {errors.state && <span className="form-error">{errors.state}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="coop-pincode">
              PIN Code <span className="required">*</span>
            </label>
            <input
              id="coop-pincode"
              name="pinCode"
              type="text"
              className={`form-input ${errors.pinCode ? 'error' : ''}`}
              placeholder="6-digit PIN"
              value={formData.pinCode}
              onChange={handleChange}
              maxLength={6}
            />
            {errors.pinCode && <span className="form-error">{errors.pinCode}</span>}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="btn btn-primary btn-lg btn-full register-submit-btn"
          disabled={loading}
        >
          {loading ? <><span className="spinner" /> Registering...</> : 'Register Cooperative'}
        </button>
      </div>
    </form>
  );
}
