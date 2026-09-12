import { useState } from 'react';
import type { FormEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ROUTES } from '../config/api';
import './Login.css';

type RoleParam = 'customer' | 'worker' | 'cooperative';

const roleConfig: Record<RoleParam, { label: string; title: string; subtitle: string; emoji: string }> = {
  customer: {
    label: 'User',
    title: 'Welcome back',
    subtitle: 'Sign in to your user account',
    emoji: '👤',
  },
  worker: {
    label: 'Worker',
    title: 'Welcome back',
    subtitle: 'Sign in to your worker account',
    emoji: '🔧',
  },
  cooperative: {
    label: 'Union / Cooperative',
    title: 'Welcome back',
    subtitle: 'Sign in to your cooperative account',
    emoji: '🏛️',
  },
};

const roleLoginRoute: Record<RoleParam, string> = {
  customer: ROUTES.customer.login,
  worker: ROUTES.worker.login,
  cooperative: ROUTES.cooperative.login,
};

const roleDashboardPath: Record<RoleParam, string> = {
  customer: '/dashboard/customer',
  worker: '/dashboard/worker',
  cooperative: '/dashboard/cooperative',
};

export default function LoginPage() {
  const { role } = useParams<{ role: string }>();
  const navigate = useNavigate();

  const validRole = role as RoleParam;
  const config = roleConfig[validRole];

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ identifier?: string; password?: string }>({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!config) {
    return (
      <div className="login-page">
        <div className="login-content">
          <div className="login-card">
            <div className="login-error-state">
              <div className="login-error-icon">❌</div>
              <h2>Invalid Role</h2>
              <p>The login role "{role}" is not valid.</p>
              <Link to="/" className="btn btn-primary btn-lg">Back to Home</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const validate = (): boolean => {
    const newErrors: { identifier?: string; password?: string } = {};
    if (!identifier.trim()) {
      newErrors.identifier = 'Email or phone number is required';
    } else {
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier.trim());
      const isPhone = /^[6-9]\d{9}$/.test(identifier.trim());
      if (!isEmail && !isPhone) {
        newErrors.identifier = 'Enter a valid email address or 10-digit mobile number';
      }
    }
    if (!password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setApiError('');

    const isPhone = /^[6-9]\d{9}$/.test(identifier.trim());
    const payload = isPhone
      ? { mobileNumber: identifier.trim(), password }
      : { email: identifier.trim(), password };

    try {
      const res = await fetch(roleLoginRoute[validRole], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');

      if (data.user && data.user._id) {
        localStorage.setItem('userId', data.user._id);
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      navigate(roleDashboardPath[validRole], { replace: true });
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Navigation Bar */}
      <nav className="login-nav" aria-label="Login navigation">
        <Link to="/" className="login-nav-brand">
          <span className="login-nav-brand-dot" />
          GIG Platform
        </Link>
        <button
          className="login-nav-back"
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          ← Back
        </button>
      </nav>

      {/* Main Content */}
      <main className="login-content">
        <div className="login-card page-enter">
          {/* Card Header */}
          <div className="login-card-header">
            <div className="login-role-badge">
              <span>{config.emoji}</span>
              {config.label}
            </div>
            <h1>{config.title}</h1>
            <p>{config.subtitle}</p>
          </div>

          {/* Form */}
          <form className="login-form" onSubmit={handleSubmit} noValidate>
            {apiError && (
              <div className="alert alert-danger mb-md" role="alert">
                <span>⚠️</span> {apiError}
              </div>
            )}

            <div className="login-form-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="login-identifier">
                  Email or Phone Number <span className="required">*</span>
                </label>
                <input
                  id="login-identifier"
                  name="identifier"
                  type="text"
                  className={`form-input ${errors.identifier ? 'error' : ''}`}
                  placeholder="you@email.com or 10-digit mobile"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    if (errors.identifier) setErrors(prev => ({ ...prev, identifier: '' }));
                    setApiError('');
                  }}
                  autoComplete="username"
                  autoFocus
                />
                {errors.identifier && <span className="form-error">{errors.identifier}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="login-password">
                  Password <span className="required">*</span>
                </label>
                <input
                  id="login-password"
                  name="password"
                  type="password"
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
                    setApiError('');
                  }}
                  autoComplete="current-password"
                />
                {errors.password && <span className="form-error">{errors.password}</span>}
              </div>

              <button
                id="login-submit-btn"
                type="submit"
                className="btn btn-primary btn-lg btn-full login-submit-btn"
                disabled={loading}
              >
                {loading ? <><span className="spinner" /> Signing in...</> : 'Sign In'}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="login-footer">
            <p>
              Don't have an account?{' '}
              <Link to={`/register/${validRole}`}>Register here</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
