import { useNavigate } from 'react-router-dom';
import { Wrench, Construction } from 'lucide-react';
import Navbar from '../components/Navbar';
import './Dashboard.css';

export default function WorkerDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/', { replace: true });
  };

  return (
    <div className="dashboard-page">
      <Navbar
        portalName="Worker Portal"
        portalIcon={Wrench}
        onLogout={handleLogout}
      />

      <main className="dashboard-content">
        <div className="dashboard-placeholder">
          <div className="dashboard-placeholder-icon"><Wrench size={48} /></div>
          <h1>Worker Dashboard</h1>
          <p>Welcome! Your dashboard is coming soon.</p>
          <span className="dashboard-placeholder-badge"><Construction size={14} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '4px' }} /> Under Construction</span>
        </div>
      </main>
    </div>
  );
}
