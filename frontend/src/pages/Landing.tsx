import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Search,
  ShoppingCart,
  User,
  Star,
  Users,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  Zap,
  Wrench,
  Landmark,
  Trophy
} from 'lucide-react';
import './Landing.css';

// Quick categories in Hero Card with high quality unique service pictures
const heroCategories = [
  {
    id: 'appliance',
    name: 'Appliance Repair & Service',
    eta: '44 mins',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=300&q=80',
    path: '/register/customer'
  },
  {
    id: 'furniture',
    name: 'Furniture Assembly',
    eta: null,
    image: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=300&q=80',
    path: '/register/customer'
  },
  {
    id: 'bathroom',
    name: 'Bathroom & Kitchen Cleaning',
    eta: '44 mins',
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=300&q=80',
    path: '/register/customer'
  },
  {
    id: 'cleaning',
    name: 'Full Home Cleaning',
    eta: null,
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=300&q=80',
    path: '/register/customer'
  },
  {
    id: 'purifier',
    name: 'Water Purifier & RO',
    eta: 'New',
    image: 'https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=300&q=80',
    path: '/register/customer'
  },
  {
    id: 'locks',
    name: 'Smart Locks & Security',
    eta: null,
    image: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=300&q=80',
    path: '/register/customer'
  },
];

// Most booked services horizontal scroll items
const mostBookedServices = [
  {
    id: 1,
    title: 'Intense cleaning (2 bathroom)',
    rating: 4.80,
    instant: true,
    price: 918,
    originalPrice: 998,
    image: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: 2,
    title: 'Water Purifier Service & Installation',
    rating: 4.80,
    instant: false,
    price: 299,
    originalPrice: null,
    image: 'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: 3,
    title: 'Intense cleaning (3 bathroom)',
    rating: 4.80,
    instant: true,
    price: 1197,
    originalPrice: 1497,
    image: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: 4,
    title: 'Geyser check-up & repair',
    rating: 4.72,
    instant: false,
    price: 249,
    originalPrice: null,
    image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: 5,
    title: 'Fridge deep cleaning',
    rating: 4.84,
    instant: false,
    price: 399,
    originalPrice: null,
    image: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: 6,
    title: 'AC Foam Jet Servicing',
    rating: 4.89,
    instant: true,
    price: 599,
    originalPrice: 799,
    image: 'https://images.unsplash.com/photo-1590756254933-2873d72a83b6?auto=format&fit=crop&w=500&q=80',
  }
];

// Appliance repair grid
const applianceServices = [
  { title: 'AC Repair & Service', image: 'https://images.unsplash.com/photo-1616788494707-ec28f08d05a1?auto=format&fit=crop&w=500&q=80' },
  { title: 'Washing Machine Repair', image: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&w=500&q=80' },
  { title: 'Chimney Repair', image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=500&q=80' },
  { title: 'Refrigerator Repair', image: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=500&q=80' },
  { title: 'Geyser Service & Repair', image: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=500&q=80' },
];

// Cleaning & pest control grid
const cleaningServices = [
  { title: 'Full Home / By Room Cleaning', image: 'https://images.unsplash.com/photo-1527515545081-5db817172677?auto=format&fit=crop&w=500&q=80' },
  { title: 'Cockroach & Pest Control', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=500&q=80' },
  { title: 'Sofa & Carpet Cleaning', image: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=500&q=80' },
  { title: 'Disinfection & Sanitization', image: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=500&q=80' },
];

export default function Landing() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'Homes' | 'Native' | 'Beauty' | 'Gig Portal'>('Homes');
  const [searchQuery, setSearchQuery] = useState('');

  const handleScroll = (direction: 'left' | 'right') => {
    const container = document.getElementById('most-booked-slider');
    if (container) {
      const scrollAmount = direction === 'left' ? -350 : 350;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="uc-landing-page">
      {/* 1. Header Navigation Bar */}
      <header className="uc-navbar">
        <div className="uc-navbar-container">
          {/* Logo & Category Tabs */}
          <div className="uc-nav-left">
            <div className="uc-brand-logo" onClick={() => navigate('/')}>
              <span className="uc-brand-badge">UC</span>
              <div className="uc-brand-text">
                <span className="uc-brand-name">CoWorker</span>
                <span className="uc-brand-tag">GIG PLATFORM</span>
              </div>
            </div>

            <nav className="uc-category-tabs">
              <button
                className={`uc-tab-btn ${activeTab === 'Homes' ? 'active' : ''}`}
                onClick={() => setActiveTab('Homes')}
              >
                Homes
              </button>
              <button
                className={`uc-tab-btn ${activeTab === 'Native' ? 'active' : ''}`}
                onClick={() => setActiveTab('Native')}
              >
                Native
              </button>
              <button
                className={`uc-tab-btn ${activeTab === 'Beauty' ? 'active' : ''}`}
                onClick={() => setActiveTab('Beauty')}
              >
                Beauty
              </button>
              <button
                className={`uc-tab-btn ${activeTab === 'Gig Portal' ? 'active' : ''}`}
                onClick={() => setActiveTab('Gig Portal')}
              >
                Federation & Gigs
              </button>
            </nav>
          </div>

          {/* Location Selector & Search Input */}
          <div className="uc-nav-center">
            <div className="uc-location-selector">
              <MapPin className="uc-loc-icon" size={16} />
              <span className="uc-loc-text">Choose Location</span>
              <span className="uc-loc-arrow">▾</span>
            </div>

            <div className="uc-search-bar">
              <Search className="uc-search-icon" size={18} />
              <input
                type="text"
                placeholder="Search for 'AC repair', 'Electrician', 'Cleaning'..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Utility Action Buttons */}
          <div className="uc-nav-right">
            <button className="uc-icon-btn" title="Cart">
              <ShoppingCart size={20} />
            </button>
            <button
              className="uc-user-btn"
              onClick={() => navigate('/login/customer')}
            >
              <User size={18} />
              <span>Login</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="uc-main-content">
        {/* 2. Hero Section */}
        <section className="uc-hero-section">
          <div className="uc-hero-container">
            {/* Left Hero Card Widget */}
            <div className="uc-hero-left">
              <h1 className="uc-hero-title">
                Home services at your <br />doorstep
              </h1>

              <div className="uc-category-card">
                <h2 className="uc-card-subtitle">What are you looking for?</h2>

                <div className="uc-category-grid">
                  {heroCategories.map((item) => (
                    <button
                      key={item.id}
                      className="uc-category-item"
                      onClick={() => navigate(item.path)}
                    >
                      <div className="uc-cat-icon-wrap">
                        <img src={item.image} alt={item.name} className="uc-cat-img" />
                        {item.eta && <span className="uc-eta-badge">{item.eta}</span>}
                      </div>
                      <span className="uc-cat-name">{item.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Trust & Federation Guarantee Bar */}
              <div className="uc-trust-bar">
                <div className="uc-trust-stat hover-card">
                  <div className="uc-stat-icon-wrap gold">
                    <Star className="uc-star-gold" size={18} fill="#F59E0B" color="#F59E0B" />
                  </div>
                  <div>
                    <span className="uc-stat-val">4.89 / 5</span>
                    <span className="uc-stat-lbl">250K+ Reviews</span>
                  </div>
                </div>

                <div className="uc-trust-stat hover-card">
                  <div className="uc-stat-icon-wrap green">
                    <span className="uc-live-pulse" />
                    <Users className="uc-user-icon" size={18} />
                  </div>
                  <div>
                    <span className="uc-stat-val">50,000+</span>
                    <span className="uc-stat-lbl">Active Workers</span>
                  </div>
                </div>

                <div className="uc-trust-stat hover-card">
                  <div className="uc-stat-icon-wrap sage">
                    <ShieldCheck className="uc-shield-icon" size={18} />
                  </div>
                  <div>
                    <span className="uc-stat-val">SIH Escrow</span>
                    <span className="uc-stat-lbl">Fair Pay Guarantee</span>
                  </div>
                </div>

                <div className="uc-trust-stat hover-card">
                  <div className="uc-stat-icon-wrap amber">
                    <Zap size={18} color="#B86E24" />
                  </div>
                  <div>
                    <span className="uc-stat-val">&lt; 15 Mins SLA</span>
                    <span className="uc-stat-lbl">Gig Dispatch</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Hero Image Collage */}
            <div className="uc-hero-right">
              <div className="uc-collage-grid">
                <div className="uc-collage-card card-ac">
                  <img
                    src="https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=700&q=80"
                    alt="Man on White Ladder Professional"
                  />
                </div>

                <div className="uc-collage-card card-bathroom">
                  <img
                    src="https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=700&q=80"
                    alt="Industrial Worker Professional"
                  />
                </div>

                <div className="uc-collage-card card-electrician">
                  <img
                    src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=700&q=80"
                    alt="Electrician Professional"
                  />
                </div>

                <div className="uc-collage-card card-painter">
                  <img
                    src="https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=700&q=80"
                    alt="Painting Professional"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Promotional Banners Carousel */}
        <section className="uc-section promo-banners-section">
          <div className="uc-container">
            <div className="uc-banners-row">
              <div className="uc-promo-banner banner-blue">
                <div className="uc-banner-content">
                  <span className="uc-banner-tag">2X COOLING</span>
                  <h3>Deep clean, zero hassle</h3>
                  <p>Foam jet AC service</p>
                  <button className="uc-banner-btn" onClick={() => navigate('/register/customer')}>Book now</button>
                </div>
                <img
                  src="https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=400&q=80"
                  alt="AC Service Promo"
                />
              </div>

              <div className="uc-promo-banner banner-brown">
                <div className="uc-banner-content">
                  <span className="uc-banner-tag">SEASON SPECIAL</span>
                  <h3>Elevate your home this festive season</h3>
                  <p>Home painting</p>
                  <button className="uc-banner-btn" onClick={() => navigate('/register/customer')}>Book now</button>
                </div>
                <img
                  src="https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=400&q=80"
                  alt="Home Painting Promo"
                />
              </div>

              <div className="uc-promo-banner banner-black">
                <div className="uc-banner-content">
                  <span className="uc-banner-tag live">Sale live</span>
                  <h3>NATIVE RO Water Purifiers</h3>
                  <p>Smart filtration technology</p>
                  <button className="uc-banner-btn light" onClick={() => navigate('/register/customer')}>Buy now</button>
                </div>
                <img
                  src="https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=400&q=80"
                  alt="Purifier Promo"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 4. Most Booked Services Slider */}
        <section className="uc-section">
          <div className="uc-container">
            <div className="uc-section-header">
              <h2 className="uc-section-title">Most booked services</h2>
              <div className="uc-slider-nav">
                <button className="uc-arrow-btn" onClick={() => handleScroll('left')}>
                  <ChevronLeft size={20} />
                </button>
                <button className="uc-arrow-btn" onClick={() => handleScroll('right')}>
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            <div className="uc-cards-slider" id="most-booked-slider">
              {mostBookedServices.map((service) => (
                <div key={service.id} className="uc-service-card">
                  <div className="uc-card-img-wrap">
                    <img src={service.image} alt={service.title} />
                  </div>
                  <div className="uc-card-body">
                    <h4 className="uc-service-name">{service.title}</h4>
                    <div className="uc-service-meta">
                      <span className="uc-rating"><Star size={12} fill="currentColor" style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '2px' }} /> {service.rating.toFixed(2)}</span>
                      {service.instant && (
                        <span className="uc-instant-tag"><Zap size={12} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '2px' }} /> Instant</span>
                      )}
                    </div>
                    <div className="uc-service-pricing">
                      <span className="uc-price">₹{service.price}</span>
                      {service.originalPrice && (
                        <span className="uc-original-price">₹{service.originalPrice}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. Appliance Repair & Service Section */}
        <section className="uc-section gray-bg">
          <div className="uc-container">
            <div className="uc-section-header">
              <h2 className="uc-section-title">Appliance repair & service</h2>
              <button className="uc-see-all-btn" onClick={() => navigate('/register/customer')}>See all</button>
            </div>

            <div className="uc-grid-5">
              {applianceServices.map((item, idx) => (
                <div key={idx} className="uc-appliance-card" onClick={() => navigate('/register/customer')}>
                  <h4 className="uc-appliance-title">{item.title}</h4>
                  <div className="uc-appliance-img">
                    <img src={item.image} alt={item.title} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. Cleaning & Pest Control Section */}
        <section className="uc-section">
          <div className="uc-container">
            <div className="uc-section-header">
              <h2 className="uc-section-title">Cleaning & pest control</h2>
              <button className="uc-see-all-btn" onClick={() => navigate('/register/customer')}>See all</button>
            </div>

            <div className="uc-grid-4">
              {cleaningServices.map((item, idx) => (
                <div key={idx} className="uc-cleaning-card" onClick={() => navigate('/register/customer')}>
                  <h4 className="uc-cleaning-title">{item.title}</h4>
                  <div className="uc-cleaning-img">
                    <img src={item.image} alt={item.title} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 7. SIH 2026 Unified Gig Network Roles Portal */}
        <section className="uc-section gig-roles-section">
          <div className="uc-container">
            <div className="uc-gig-banner">
              <div className="uc-gig-banner-content">
                <span className="uc-gig-badge">SIH 2026 · Unified Gig Ecosystem</span>
                <h2>Empowering Workers, Customers & Cooperatives</h2>
                <p>Pick your portal to participate in India's next-generation fair-pay gig economy platform.</p>
              </div>

              <div className="uc-gig-roles-grid">
                <div className="uc-gig-role-card" onClick={() => navigate('/register/customer')}>
                  <div className="uc-role-icon customer"><User size={24} /></div>
                  <h3>Customer</h3>
                  <p>Book verified door-step home services with guaranteed SLA & instant matching.</p>
                  <span className="uc-role-link">Book Services →</span>
                </div>

                <div className="uc-gig-role-card highlight" onClick={() => navigate('/register/worker')}>
                  <div className="uc-role-badge">High Demand</div>
                  <div className="uc-role-icon worker"><Wrench size={24} /></div>
                  <h3>Gig Worker</h3>
                  <p>Showcase skills, own portable reputation ratings, and secure fair payout guarantees.</p>
                  <span className="uc-role-link">Join as Worker →</span>
                </div>

                <div className="uc-gig-role-card" onClick={() => navigate('/register/cooperative')}>
                  <div className="uc-role-icon union"><Landmark size={24} /></div>
                  <h3>Union / Federation</h3>
                  <p>Manage worker cooperatives, enforce wage standards, and arbitrate disputes.</p>
                  <span className="uc-role-link">Federation Portal →</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 8. Footer */}
      <footer className="uc-footer">
        <div className="uc-container">
          <div className="uc-footer-brand-row">
            <div className="uc-brand-logo dark">
              <span className="uc-brand-badge">UC</span>
              <span className="uc-brand-name">Urban Company</span>
            </div>
            <span className="uc-footer-tagline">India's Leading Home Services & Gig Platform</span>
          </div>

          <div className="uc-footer-grid">
            <div className="uc-footer-col">
              <h4>Company</h4>
              <ul>
                <li><a href="#about">About us</a></li>
                <li><a href="#terms">Terms & conditions</a></li>
                <li><a href="#privacy">Privacy policy</a></li>
                <li><a href="#careers">Careers</a></li>
              </ul>
            </div>

            <div className="uc-footer-col">
              <h4>For customers</h4>
              <ul>
                <li><a href="#reviews">UC reviews</a></li>
                <li><a href="#categories">Categories near you</a></li>
                <li><a href="#safety">Safety policy</a></li>
                <li><a href="#contact">Customer support</a></li>
              </ul>
            </div>

            <div className="uc-footer-col">
              <h4>For professionals</h4>
              <ul>
                <li><a href="#register" onClick={(e) => { e.preventDefault(); navigate('/register/worker'); }}>Register as a professional</a></li>
                <li><a href="#federation" onClick={(e) => { e.preventDefault(); navigate('/register/cooperative'); }}>Union & Federation portal</a></li>
                <li><a href="#insurance">Worker insurance program</a></li>
                <li><a href="#community">Partner community</a></li>
              </ul>
            </div>

            <div className="uc-footer-col">
              <h4>Smart India Hackathon 2026</h4>
              <p className="uc-footer-desc">
                Building a fair, transparent, and decentralized gig platform for the future of work.
              </p>
              <div className="uc-sih-badge">
                <span><Trophy size={14} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '4px' }} /> SIH 2026 Prototype</span>
              </div>
            </div>
          </div>

          <div className="uc-footer-bottom">
            <p>© 2026 CoWorker · GIG Platform · Smart India Hackathon 2026</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
