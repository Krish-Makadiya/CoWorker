import { useParams, useNavigate, Link } from 'react-router-dom';
import { User, Wrench, Landmark, XCircle } from 'lucide-react';
import CustomerRegisterForm from '../components/forms/CustomerRegisterForm';
import WorkerRegisterForm from '../components/forms/WorkerRegisterForm';
import CoopRegisterForm from '../components/forms/CoopRegisterForm';
import './Register.css';

type RoleParam = 'customer' | 'worker' | 'cooperative';

const roleConfig: Record<RoleParam, { label: string; title: string; subtitle: string; icon: React.ReactNode }> = {
  customer: {
    label: 'User',
    title: 'Create User Account',
    subtitle: 'Find and hire skilled workers for your needs',
    icon: <User size={18} />,
  },
  worker: {
    label: 'Worker',
    title: 'Register as Worker',
    subtitle: 'Showcase your skills and start earning with gigs',
    icon: <Wrench size={18} />,
  },
  cooperative: {
    label: 'Union / Cooperative',
    title: 'Register a Cooperative',
    subtitle: 'Manage your workers and represent your cooperative',
    icon: <Landmark size={18} />,
  },
};

export default function RegisterPage() {
  const { role } = useParams<{ role: string }>();
  const navigate = useNavigate();

  const validRole = role as RoleParam;
  const config = roleConfig[validRole];

  if (!config) {
    return (
      <div className="register-page">
        <div className="register-content">
          <div className="register-card">
            <div className="register-success">
              <div className="register-success-icon"><XCircle size={48} color="var(--danger, #ef4444)" /></div>
              <h2>Invalid Role</h2>
              <p>The registration role "{role}" is not valid.</p>
              <Link to="/" className="btn btn-primary btn-lg">Back to Home</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="register-page">
      {/* Navigation Bar */}
      <nav className="register-nav" aria-label="Registration navigation">
        <Link to="/" className="register-nav-brand">
          <span className="register-nav-brand-dot" />
          GIG Platform
        </Link>
        <button
          className="register-nav-back"
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          ← Back
        </button>
      </nav>

      {/* Main Content */}
      <main className="register-content">
        <div className="register-card">
          {/* Card Header */}
          <div className="register-card-header">
            <div className="register-role-badge">
              <span>{config.icon}</span>
              {config.label}
            </div>
            <h1>{config.title}</h1>
            <p>{config.subtitle}</p>
          </div>

          {/* Form */}
          {validRole === 'customer' && <CustomerRegisterForm />}
          {validRole === 'worker' && <WorkerRegisterForm />}
          {validRole === 'cooperative' && <CoopRegisterForm />}

          {/* Footer */}
          <div className="register-footer">
            <p>
              Already have an account?{' '}
              <a href="#" onClick={(e) => { e.preventDefault(); navigate(`/login/${validRole}`); }}>
                Sign in
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
