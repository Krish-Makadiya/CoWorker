import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ROUTES } from '../../config/api';
import TagInput from '../TagInput';

interface WorkerFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  mobileNumber: string;
  address: string;
  skills: string[];
  experience: string;
  certifications: string[];
}

interface FormErrors {
  [key: string]: string;
}

interface CooperativeOption {
  _id: string;
  name: string;
}

export default function WorkerRegisterForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<WorkerFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    mobileNumber: '',
    address: '',
    skills: [],
    experience: '',
    certifications: [],
  });
  const [cooperatives, setCooperatives] = useState<CooperativeOption[]>([]);
  const [selectedCooperativeId, setSelectedCooperativeId] = useState<string>('');
  const [loadingCooperatives, setLoadingCooperatives] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCooperatives = async () => {
      setLoadingCooperatives(true);
      try {
        const res = await fetch(ROUTES.cooperative.names);
        const data = await res.json();
        if (res.ok && data.success && Array.isArray(data.cooperatives)) {
          setCooperatives(data.cooperatives);
        }
      } catch (err) {
        console.error('Failed to fetch cooperatives:', err);
      } finally {
        setLoadingCooperatives(false);
      }
    };

    fetchCooperatives();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
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
    if (formData.experience !== '' && Number(formData.experience) < 0) newErrors.experience = 'Experience cannot be negative';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password,
      mobileNumber: formData.mobileNumber.trim(),
      address: formData.address.trim() || undefined,
      skills: formData.skills,
      experience: formData.experience !== '' ? Number(formData.experience) : undefined,
      certifications: formData.certifications,
      cooperativeId: selectedCooperativeId ? selectedCooperativeId : null,
    };

    try {
      const res = await fetch(ROUTES.worker.register, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      toast.success('Worker registration successful! Please sign in.');
      navigate('/login/worker', { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="register-form" onSubmit={handleSubmit} noValidate>

      <div className="register-form-grid">
        {/* Personal Info */}
        <div className="register-section-divider">
          <span>Personal Information</span>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="wkr-name">
            Full Name <span className="required">*</span>
          </label>
          <input
            id="wkr-name"
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
            <label className="form-label" htmlFor="wkr-email">
              Email <span className="required">*</span>
            </label>
            <input
              id="wkr-email"
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
            <label className="form-label" htmlFor="wkr-mobile">
              Mobile Number <span className="required">*</span>
            </label>
            <input
              id="wkr-mobile"
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
            <label className="form-label" htmlFor="wkr-password">
              Password <span className="required">*</span>
            </label>
            <input
              id="wkr-password"
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
            <label className="form-label" htmlFor="wkr-confirm-password">
              Confirm Password <span className="required">*</span>
            </label>
            <input
              id="wkr-confirm-password"
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

        {/* Professional Info */}
        <div className="register-section-divider">
          <span>Professional Details</span>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="wkr-skills">
            Skills
          </label>
          <TagInput
            id="wkr-skills"
            value={formData.skills}
            onChange={(tags) => setFormData(prev => ({ ...prev, skills: tags }))}
            placeholder="e.g. Plumbing, Carpentry — press Enter to add"
          />
          <span className="form-hint">Press Enter or comma to add a skill</span>
        </div>

        <div className="register-form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="wkr-experience">
              Years of Experience
            </label>
            <input
              id="wkr-experience"
              name="experience"
              type="number"
              min={0}
              className={`form-input ${errors.experience ? 'error' : ''}`}
              placeholder="e.g. 3"
              value={formData.experience}
              onChange={handleChange}
            />
            {errors.experience && <span className="form-error">{errors.experience}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="wkr-address">
              Address
            </label>
            <input
              id="wkr-address"
              name="address"
              type="text"
              className="form-input"
              placeholder="Your current address"
              value={formData.address}
              onChange={handleChange}
              autoComplete="street-address"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="wkr-certifications">
            Certifications
          </label>
          <TagInput
            id="wkr-certifications"
            value={formData.certifications}
            onChange={(tags) => setFormData(prev => ({ ...prev, certifications: tags }))}
            placeholder="e.g. NSDC, ITI — press Enter to add"
          />
          <span className="form-hint">Press Enter or comma to add a certification</span>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="wkr-cooperative">
            Cooperative / Union Affiliation (Optional)
          </label>
          <select
            id="wkr-cooperative"
            name="cooperativeId"
            className="form-input"
            value={selectedCooperativeId}
            onChange={(e) => setSelectedCooperativeId(e.target.value)}
            disabled={loadingCooperatives}
          >
            <option value="">
              {loadingCooperatives ? 'Loading cooperatives...' : '-- None (Independent Worker) --'}
            </option>
            {cooperatives.map((coop) => (
              <option key={coop._id} value={coop._id}>
                {coop.name}
              </option>
            ))}
          </select>
          <span className="form-hint">
            Select a cooperative to register under their union, or leave blank to register independently.
          </span>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="btn btn-primary btn-lg btn-full register-submit-btn"
          disabled={loading}
        >
          {loading ? <><span className="spinner" /> Registering...</> : 'Register as Worker'}
        </button>
      </div>
    </form>
  );
}
