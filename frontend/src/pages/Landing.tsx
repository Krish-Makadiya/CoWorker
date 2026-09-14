import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
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
  Trophy,
  LogOut,
  X,
  Building2,
  CheckCircle2,
  Navigation,
} from "lucide-react";
import { ROUTES } from "../config/api";
import "./Landing.css";

interface BackendService {
  _id: string;
  name: string;
  category: string;
  description: string;
  basePrice: number;
  image?: string;
}

const SERVICE_IMAGES: Record<string, string> = {
  'Masonry Work': 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=600&q=80',
  'AC Repair': 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
  'Welding Work': 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=600&q=80',
  'Garden Maintenance': 'https://images.unsplash.com/photo-1558904541-efa843a96f01?auto=format&fit=crop&w=600&q=80',
  'Floor Tiling': 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?auto=format&fit=crop&w=600&q=80',
  'Bathroom Fitting': 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
  'Plumbing Repair': 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=600&q=80',
  'Electrical Wiring': 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80',
  'Furniture Repair': 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&w=600&q=80',
  'Wall Painting': 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&q=80',
};

const BACKEND_SEED_SERVICES: BackendService[] = [
  {
    _id: "6aa6b59a6bbb7420349a29e5",
    name: "Masonry Work",
    category: "Masonry",
    description: "Brickwork, cement work, wall repairs, and other general masonry services.",
    basePrice: 600,
    image: SERVICE_IMAGES['Masonry Work'],
  },
  {
    _id: "6aa6b59a6bbb7420349a29e6",
    name: "AC Repair",
    category: "Appliance Repair",
    description: "Inspection, servicing, and repair of residential air conditioning systems.",
    basePrice: 500,
    image: SERVICE_IMAGES['AC Repair'],
  },
  {
    _id: "6aa6b59a6bbb7420349a29e7",
    name: "Welding Work",
    category: "Welding",
    description: "Metal welding and fabrication services for gates, grills, frames, and other structures.",
    basePrice: 700,
    image: SERVICE_IMAGES['Welding Work'],
  },
  {
    _id: "6aa6b59a6bbb7420349a29e8",
    name: "Garden Maintenance",
    category: "Gardening",
    description: "Routine garden maintenance including trimming, cleaning, pruning, and plant care.",
    basePrice: 400,
    image: SERVICE_IMAGES['Garden Maintenance'],
  },
  {
    _id: "6aa6b59a6bbb7420349a29e9",
    name: "Floor Tiling",
    category: "Tiling",
    description: "Installation and replacement of floor and wall tiles with proper leveling and finishing.",
    basePrice: 1000,
    image: SERVICE_IMAGES['Floor Tiling'],
  },
  {
    _id: "6aa6b59a6bbb7420349a29ea",
    name: "Bathroom Fitting",
    category: "Plumbing",
    description: "Installation and replacement of bathroom fixtures including taps, showers, and fittings.",
    basePrice: 600,
    image: SERVICE_IMAGES['Bathroom Fitting'],
  },
  {
    _id: "6aa6b59a6bbb7420349a29eb",
    name: "Plumbing Repair",
    category: "Plumbing",
    description: "Professional repair of leaking pipes, taps, faucets, and other plumbing issues.",
    basePrice: 300,
    image: SERVICE_IMAGES['Plumbing Repair'],
  },
  {
    _id: "6aa6b59a6bbb7420349a29ec",
    name: "Electrical Wiring",
    category: "Electrical",
    description: "Electrical wiring, switch installation, socket replacement, and basic electrical repairs.",
    basePrice: 500,
    image: SERVICE_IMAGES['Electrical Wiring'],
  },
  {
    _id: "6aa6b59a6bbb7420349a29ed",
    name: "Furniture Repair",
    category: "Carpentry",
    description: "Repair and maintenance of wooden furniture including chairs, tables, doors, and cabinets.",
    basePrice: 400,
    image: SERVICE_IMAGES['Furniture Repair'],
  },
  {
    _id: "6aa6b59a6bbb7420349a29ee",
    name: "Wall Painting",
    category: "Painting",
    description: "Professional interior and exterior wall painting with surface preparation and finishing.",
    basePrice: 800,
    image: SERVICE_IMAGES['Wall Painting'],
  },
];

const getImageForService = (service: any) => {
  if (service?.name && SERVICE_IMAGES[service.name]) {
    return SERVICE_IMAGES[service.name];
  }

  const name = (service?.name || '').toLowerCase();
  const cat = (service?.category || '').toLowerCase();

  if (name.includes('mason') || cat.includes('mason')) return SERVICE_IMAGES['Masonry Work'];
  if (name.includes('ac') || cat.includes('appliance')) return SERVICE_IMAGES['AC Repair'];
  if (name.includes('weld') || cat.includes('weld')) return SERVICE_IMAGES['Welding Work'];
  if (name.includes('garden') || cat.includes('garden')) return SERVICE_IMAGES['Garden Maintenance'];
  if (name.includes('tile') || cat.includes('til')) return SERVICE_IMAGES['Floor Tiling'];
  if (name.includes('bath') || cat.includes('bath')) return SERVICE_IMAGES['Bathroom Fitting'];
  if (name.includes('plumb') || cat.includes('plumb')) return SERVICE_IMAGES['Plumbing Repair'];
  if (name.includes('electr') || cat.includes('electr')) return SERVICE_IMAGES['Electrical Wiring'];
  if (name.includes('furnit') || cat.includes('carpen')) return SERVICE_IMAGES['Furniture Repair'];
  if (name.includes('paint') || cat.includes('paint')) return SERVICE_IMAGES['Wall Painting'];

  return service?.image || SERVICE_IMAGES['Masonry Work'];
};

const popularCities = [
  "Delhi NCR",
  "Mumbai",
  "Bengaluru",
  "Hyderabad",
  "Pune",
  "Kolkata",
  "Chennai",
];

export default function Landing() {
  const navigate = useNavigate();
  const [services, setServices] = useState<BackendService[]>(
    BACKEND_SEED_SERVICES,
  );

  const [activeTab, setActiveTab] = useState<
    "Popular" | "Appliances" | "Masonry" | "Federation"
  >("Popular");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  // Location selector state
  const [selectedLocation, setSelectedLocation] = useState<string>(() => {
    return localStorage.getItem("user_location") || "Delhi NCR";
  });
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // Login menu & Cart drawer state
  const [showLoginMenu, setShowLoginMenu] = useState(false);
  const [showCartDrawer, setShowCartDrawer] = useState(false);

  // Dropdown container refs for clicking outside
  const locationRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const loginRef = useRef<HTMLDivElement>(null);

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return Boolean(
      localStorage.getItem("userId") || localStorage.getItem("user"),
    );
  });

  const [userRole] = useState<string>(() => {
    const userJson = localStorage.getItem("user");
    if (userJson) {
      try {
        const u = JSON.parse(userJson);
        if (u.roles && u.roles.length > 0) return u.roles[0];
        if (u.role) return u.role;
      } catch {}
    }
    return "customer";
  });

  const [isRolesInView, setIsRolesInView] = useState(false);
  const rolesRef = useRef<HTMLDivElement>(null);

  // Fetch backend services on mount
  useEffect(() => {
    const fetchBackendServices = async () => {
      try {
        const res = await fetch(ROUTES.service);
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data)
            ? data
            : data.services || data.data || [];
          if (list.length > 0) {
            const formatted = list.map((s: any) => ({
              ...s,
              image: getImageForService(s),
            }));
            setServices(formatted);
          }
        }
      } catch (err) {
        console.error("Error fetching backend services:", err);
      }
    };
    fetchBackendServices();
  }, []);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        locationRef.current &&
        !locationRef.current.contains(e.target as Node)
      ) {
        setShowLocationDropdown(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
      if (loginRef.current && !loginRef.current.contains(e.target as Node)) {
        setShowLoginMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // IntersectionObserver for scroll-triggered blur reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsRolesInView(true);
          }
        });
      },
      { threshold: 0.15 },
    );

    if (rolesRef.current) {
      observer.observe(rolesRef.current);
    }

    return () => {
      if (rolesRef.current) {
        observer.unobserve(rolesRef.current);
      }
    };
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    toast.success("Logged out successfully");
    navigate("/", { replace: true });
  };

  const handleScroll = (
    direction: "left" | "right",
    containerId: string = "most-booked-slider",
  ) => {
    const container = document.getElementById(containerId);
    if (container) {
      const scrollAmount = direction === "left" ? -350 : 350;
      container.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // Tab click handler with smooth section scrolling
  const handleTabClick = (
    tab: "Popular" | "Appliances" | "Masonry" | "Federation",
    targetId: string,
  ) => {
    setActiveTab(tab);
    const elem = document.getElementById(targetId);
    if (elem) {
      elem.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // GPS Auto location detection
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const locName = `GPS: ${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)}`;
        setSelectedLocation(locName);
        localStorage.setItem("user_location", locName);
        setIsLocating(false);
        setShowLocationDropdown(false);
        toast.success(`Location updated: ${locName}`);
      },
      () => {
        toast.error(
          "Could not retrieve GPS coordinates. Selected default location.",
        );
        setIsLocating(false);
      },
    );
  };

  const handleSelectCity = (city: string) => {
    setSelectedLocation(city);
    localStorage.setItem("user_location", city);
    setShowLocationDropdown(false);
    toast.success(`City set to ${city}`);
  };

  // Centralized click handler for services:
  // - If no user -> redirect to /register/customer
  // - If user logged in but NOT customer -> do nothing
  // - If user logged in AND IS customer -> route to customer dashboard's "Book New Service" tab
  const handleServiceClick = (service?: BackendService | any) => {
    const userId = localStorage.getItem("userId");
    const userJson = localStorage.getItem("user");
    const userIsLoggedIn = Boolean(userId || userJson);

    if (!userIsLoggedIn) {
      navigate("/register/customer");
      return;
    }

    let roleStr = "customer";
    if (userJson) {
      try {
        const u = JSON.parse(userJson);
        if (Array.isArray(u.roles) && u.roles.length > 0) {
          roleStr = u.roles[0];
        } else if (u.role) {
          roleStr = u.role;
        }
      } catch {}
    }

    if (roleStr !== "customer") {
      return;
    }

    navigate("/dashboard/customer", {
      state: {
        tab: "new-request",
        serviceId: service?._id,
        serviceName: service?.name || service?.title,
        serviceDescription: service?.description,
      },
    });
  };

  // Hero Quick Categories Card items (6 items)
  const heroCategories = services.slice(0, 6).map((s, idx) => ({
    id: s._id || `cat-${idx}`,
    name: s.name,
    category: s.category,
    eta: idx % 2 === 0 ? "44 mins" : "New",
    image: getImageForService(s),
    service: s,
  }));

  // Most Booked Services Slider items
  const mostBookedServices = services.map((s, idx) => ({
    id: s._id || idx,
    title: s.name,
    category: s.category,
    rating: Number((4.8 + (idx % 4) * 0.03).toFixed(2)),
    instant: idx % 2 === 0,
    price: s.basePrice,
    originalPrice: Math.round(s.basePrice * 1.25),
    image: getImageForService(s),
    service: s,
  }));

  // Section 1: Appliance & Essential Home Repairs
  const applianceRepairServices = services.filter((s) =>
    [
      "Appliance Repair",
      "Plumbing",
      "Electrical",
      "Carpentry",
      "Gardening",
    ].includes(s.category),
  );
  const section1Services =
    applianceRepairServices.length >= 4
      ? applianceRepairServices
      : services.slice(0, 5);

  // Section 2: Masonry, Tiling & Structural Work
  const structuralServices = services.filter((s) =>
    ["Masonry", "Tiling", "Welding", "Painting"].includes(s.category),
  );
  const section2Services =
    structuralServices.length >= 4 ? structuralServices : services.slice(5, 10);

  // Search filter
  const searchResults = searchQuery.trim()
    ? services.filter(
        (s) =>
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : [];

  const handleSelectSearchResult = (service: BackendService) => {
    setShowSearchDropdown(false);
    setSearchQuery("");
    handleServiceClick(service);
  };

  return (
    <div className="uc-landing-page">
      {/* 1. Header Navigation Bar */}
      <header className="uc-navbar">
        <div className="uc-navbar-container">
          {/* Logo & Category Tabs */}
          <div className="uc-nav-left">
            <div
              className="uc-brand-logo"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              <span className="uc-brand-badge">CO</span>
              <div className="uc-brand-text">
                <span className="uc-brand-name">CoWorker</span>
                <span className="uc-brand-tag">GIG PLATFORM</span>
              </div>
            </div>

            <nav className="uc-category-tabs">
              <button
                className={`uc-tab-btn ${activeTab === "Popular" ? "active" : ""}`}
                onClick={() => handleTabClick("Popular", "most-booked-section")}
              >
                Popular
              </button>
              <button
                className={`uc-tab-btn ${activeTab === "Appliances" ? "active" : ""}`}
                onClick={() =>
                  handleTabClick("Appliances", "appliance-repair-section")
                }
              >
                Appliances
              </button>
              <button
                className={`uc-tab-btn ${activeTab === "Masonry" ? "active" : ""}`}
                onClick={() => handleTabClick("Masonry", "cleaning-section")}
              >
                Masonry
              </button>
              <button
                className={`uc-tab-btn ${activeTab === "Federation" ? "active" : ""}`}
                onClick={() =>
                  handleTabClick("Federation", "gig-roles-section")
                }
              >
                Federation
              </button>
            </nav>
          </div>

          {/* Location Selector & Search Input */}
          <div className="uc-nav-center">
            {/* Location Picker Dropdown */}
            <div className="uc-dropdown-wrapper" ref={locationRef}>
              <div
                className="uc-location-selector"
                onClick={() => setShowLocationDropdown(!showLocationDropdown)}
              >
                <MapPin className="uc-loc-icon" size={16} />
                <span className="uc-loc-text">{selectedLocation}</span>
                <span className="uc-loc-arrow">▾</span>
              </div>

              {showLocationDropdown && (
                <div className="uc-location-dropdown">
                  <div className="uc-location-header">Select Service Area</div>
                  <button
                    className="uc-gps-btn"
                    onClick={handleDetectLocation}
                    disabled={isLocating}
                  >
                    <Navigation
                      size={14}
                      className={isLocating ? "spin" : ""}
                    />
                    {isLocating
                      ? "Detecting GPS..."
                      : "Use Current GPS Location"}
                  </button>
                  <div className="uc-city-list">
                    {popularCities.map((city) => (
                      <div
                        key={city}
                        className={`uc-city-item ${selectedLocation === city ? "active" : ""}`}
                        onClick={() => handleSelectCity(city)}
                      >
                        <span>{city}</span>
                        {selectedLocation === city && (
                          <CheckCircle2 size={14} color="var(--uc-primary)" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Interactive Search Bar */}
            <div className="uc-search-wrapper" ref={searchRef}>
              <div className="uc-search-bar">
                <Search className="uc-search-icon" size={18} />
                <input
                  type="text"
                  placeholder="Search for 'AC repair', 'Plumbing', 'Masonry'..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearchDropdown(true);
                  }}
                  onFocus={() => setShowSearchDropdown(true)}
                />
                {searchQuery && (
                  <X
                    size={16}
                    style={{
                      cursor: "pointer",
                      color: "var(--uc-medium-gray)",
                    }}
                    onClick={() => setSearchQuery("")}
                  />
                )}
              </div>

              {/* Search Suggestions Dropdown */}
              {showSearchDropdown && searchQuery.trim() !== "" && (
                <div className="uc-search-dropdown">
                  {searchResults.length > 0 ? (
                    searchResults.map((item) => (
                      <div
                        key={item._id}
                        className="uc-search-item"
                        onClick={() => handleSelectSearchResult(item)}
                      >
                        <img
                          src={getImageForService(item)}
                          alt={item.name}
                          className="uc-search-item-img"
                        />
                        <div className="uc-search-item-info">
                          <div className="uc-search-item-title">
                            {item.name}
                          </div>
                          <div className="uc-search-item-meta">
                            {item.category} · ₹{item.basePrice}
                          </div>
                        </div>
                        <ChevronRight size={16} color="var(--uc-medium-gray)" />
                      </div>
                    ))
                  ) : (
                    <div
                      style={{
                        padding: "16px",
                        textTransform: "none",
                        fontSize: "0.88rem",
                        color: "var(--uc-medium-gray)",
                        textAlign: "center",
                      }}
                    >
                      No matching services found for "{searchQuery}"
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Utility Action Buttons */}
          <div className="uc-nav-right">
            <button
              className="uc-icon-btn"
              title="View Cart"
              onClick={() => setShowCartDrawer(true)}
            >
              <ShoppingCart size={20} />
            </button>

            {isLoggedIn ? (
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <button
                  className="uc-user-btn"
                  onClick={() => navigate(`/dashboard/${userRole}`)}
                >
                  <User size={18} />
                  <span>Dashboard</span>
                </button>
                <button
                  className="btn btn-logout"
                  onClick={handleLogout}
                  style={{
                    padding: "0.6rem 1.1rem",
                    fontSize: "0.88rem",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                  }}
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="uc-login-menu-wrapper" ref={loginRef}>
                <button
                  className="uc-user-btn"
                  onClick={() => setShowLoginMenu(!showLoginMenu)}
                >
                  <User size={18} />
                  <span>Login ▾</span>
                </button>

                {showLoginMenu && (
                  <div className="uc-login-menu">
                    <button
                      className="uc-login-role-btn"
                      onClick={() => {
                        setShowLoginMenu(false);
                        navigate("/login/customer");
                      }}
                    >
                      <User size={16} color="var(--uc-primary)" />
                      <span>Customer Login</span>
                    </button>
                    <button
                      className="uc-login-role-btn"
                      onClick={() => {
                        setShowLoginMenu(false);
                        navigate("/login/worker");
                      }}
                    >
                      <Wrench size={16} color="var(--uc-primary)" />
                      <span>Gig Worker Login</span>
                    </button>
                    <button
                      className="uc-login-role-btn"
                      onClick={() => {
                        setShowLoginMenu(false);
                        navigate("/login/cooperative");
                      }}
                    >
                      <Building2 size={16} color="var(--uc-primary)" />
                      <span>Union / Federation Login</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Cart Drawer */}
      {showCartDrawer && (
        <div
          className="uc-cart-modal-backdrop"
          onClick={() => setShowCartDrawer(false)}
        >
          <div className="uc-cart-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="uc-cart-drawer-header">
              <h3>Your Service Cart</h3>
              <button
                className="uc-close-btn"
                onClick={() => setShowCartDrawer(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
                color: "var(--uc-medium-gray)",
              }}
            >
              <ShoppingCart
                size={48}
                style={{ opacity: 0.4, marginBottom: "12px" }}
              />
              <h4
                style={{
                  fontWeight: 700,
                  color: "var(--uc-black)",
                  marginBottom: "6px",
                }}
              >
                Your cart is empty
              </h4>
              <p style={{ fontSize: "0.88rem", marginBottom: "20px" }}>
                Browse our instant doorstep services to add bookings.
              </p>
              <button
                className="uc-banner-btn"
                onClick={() => {
                  setShowCartDrawer(false);
                  handleServiceClick();
                }}
              >
                Book Instant Service
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="uc-main-content">
        {/* 2. Hero Section */}
        <section className="uc-hero-section">
          <div className="uc-hero-container">
            {/* Left Hero Card Widget */}
            <div className="uc-hero-left">
              <h1 className="uc-hero-title">
                Home services at your <br />
                doorstep
              </h1>

              <div className="uc-category-card">
                <h2 className="uc-card-subtitle">What are you looking for?</h2>

                <div className="uc-category-grid">
                  {heroCategories.map((item) => (
                    <button
                      key={item.id}
                      className="uc-category-item"
                      onClick={() => handleServiceClick(item.service)}
                    >
                      <div className="uc-cat-icon-wrap">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="uc-cat-img"
                        />
                        {item.eta && (
                          <span className="uc-eta-badge">{item.eta}</span>
                        )}
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
                    <Star
                      className="uc-star-gold"
                      size={18}
                      fill="#F59E0B"
                      color="#F59E0B"
                    />
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
                  <button
                    className="uc-banner-btn"
                    onClick={() =>
                      handleServiceClick(
                        services.find(
                          (s) => s.category === "Appliance Repair",
                        ) || services[0],
                      )
                    }
                  >
                    Book now
                  </button>
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
                  <button
                    className="uc-banner-btn"
                    onClick={() =>
                      handleServiceClick(
                        services.find((s) => s.category === "Painting") ||
                          services[0],
                      )
                    }
                  >
                    Book now
                  </button>
                </div>
                <img
                  src="https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=400&q=80"
                  alt="Home Painting Promo"
                />
              </div>

              <div className="uc-promo-banner banner-black">
                <div className="uc-banner-content">
                  <span className="uc-banner-tag live">Sale live</span>
                  <h3>Masonry & Floor Tiling</h3>
                  <p>Expert home restoration</p>
                  <button
                    className="uc-banner-btn light"
                    onClick={() =>
                      handleServiceClick(
                        services.find((s) => s.category === "Masonry") ||
                          services[0],
                      )
                    }
                  >
                    Book now
                  </button>
                </div>
                <img
                  src="https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=400&q=80"
                  alt="Masonry Promo"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 4. Most Booked Services Slider */}
        <section className="uc-section" id="most-booked-section">
          <div className="uc-container">
            <div className="uc-section-header">
              <h2 className="uc-section-title">Most booked services</h2>
              <div className="uc-slider-nav">
                <button
                  className="uc-arrow-btn"
                  onClick={() => handleScroll("left")}
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  className="uc-arrow-btn"
                  onClick={() => handleScroll("right")}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            <div className="uc-cards-slider" id="most-booked-slider">
              {mostBookedServices.map((item) => (
                <div
                  key={item.id}
                  className="uc-service-card"
                  onClick={() => handleServiceClick(item.service)}
                >
                  <div className="uc-card-img-wrap">
                    <img src={item.image} alt={item.title} />
                  </div>
                  <div className="uc-card-body">
                    <h4 className="uc-service-name">{item.title}</h4>
                    <div className="uc-service-meta">
                      <span className="uc-rating">
                        <Star
                          size={12}
                          fill="currentColor"
                          style={{
                            display: "inline",
                            verticalAlign: "text-bottom",
                            marginRight: "2px",
                          }}
                        />{" "}
                        {item.rating.toFixed(2)}
                      </span>
                      {item.instant && (
                        <span className="uc-instant-tag">
                          <Zap
                            size={12}
                            style={{
                              display: "inline",
                              verticalAlign: "text-bottom",
                              marginRight: "2px",
                            }}
                          />{" "}
                          Instant
                        </span>
                      )}
                    </div>
                    <div className="uc-service-pricing">
                      <span className="uc-price">₹{item.price}</span>
                      {item.originalPrice && (
                        <span className="uc-original-price">
                          ₹{item.originalPrice}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. Appliance & Essential Home Repair Section */}
        <section className="uc-section gray-bg" id="appliance-repair-section">
          <div className="uc-container">
            <div className="uc-section-header">
              <h2 className="uc-section-title">
                Appliance & essential home repairs
              </h2>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                }}
              >
                <div className="uc-slider-nav">
                  <button
                    className="uc-arrow-btn"
                    onClick={() =>
                      handleScroll("left", "appliance-repair-slider")
                    }
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    className="uc-arrow-btn"
                    onClick={() =>
                      handleScroll("right", "appliance-repair-slider")
                    }
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
                <button
                  className="uc-see-all-btn"
                  onClick={() => handleServiceClick()}
                >
                  See all
                </button>
              </div>
            </div>

            <div className="uc-grid-5" id="appliance-repair-slider">
              {section1Services.map((item) => (
                <div
                  key={item._id}
                  className="uc-appliance-card"
                  onClick={() => handleServiceClick(item)}
                >
                  <h4 className="uc-appliance-title">{item.name}</h4>
                  <div className="uc-appliance-img">
                    <img src={getImageForService(item)} alt={item.name} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. Masonry, Tiling & Structural Services Section */}
        <section className="uc-section" id="cleaning-section">
          <div className="uc-container">
            <div className="uc-section-header">
              <h2 className="uc-section-title">
                Masonry, tiling & structural services
              </h2>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                }}
              >
                <div className="uc-slider-nav">
                  <button
                    className="uc-arrow-btn"
                    onClick={() => handleScroll("left", "cleaning-slider")}
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    className="uc-arrow-btn"
                    onClick={() => handleScroll("right", "cleaning-slider")}
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
                <button
                  className="uc-see-all-btn"
                  onClick={() => handleServiceClick()}
                >
                  See all
                </button>
              </div>
            </div>

            <div className="uc-grid-5" id="cleaning-slider">
              {section2Services.map((item) => (
                <div
                  key={item._id}
                  className="uc-cleaning-card"
                  onClick={() => handleServiceClick(item)}
                >
                  <h4 className="uc-cleaning-title">{item.name}</h4>
                  <div className="uc-cleaning-img">
                    <img src={getImageForService(item)} alt={item.name} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 7. SIH 2026 Unified Gig Network Roles Portal */}
        <section
          className="uc-section gig-roles-section"
          id="gig-roles-section"
          ref={rolesRef}
        >
          <div className="uc-container">
            <div className={`uc-gig-banner ${isRolesInView ? "in-view" : ""}`}>
              <div className="uc-gig-banner-content">
                <span className="uc-gig-badge">
                  SIH 2026 · Unified Gig Ecosystem
                </span>
                <h2>Empowering Workers, Customers & Cooperatives</h2>
                <p>
                  Pick your portal to participate in India's next-generation
                  fair-pay gig economy platform.
                </p>
              </div>

              <div
                className={`uc-gig-roles-grid ${isRolesInView ? "in-view" : ""}`}
              >
                <div
                  className="uc-gig-role-card role-card-1"
                  onClick={() => handleServiceClick()}
                >
                  <div className="uc-role-icon customer">
                    <User size={24} />
                  </div>
                  <h3>Customer</h3>
                  <p>
                    Book verified door-step home services with guaranteed SLA &
                    instant matching.
                  </p>
                  <span className="uc-role-link">Book Services →</span>
                </div>

                <div
                  className="uc-gig-role-card highlight role-card-2"
                  onClick={() => navigate("/register/worker")}
                >
                  <div className="uc-role-badge">High Demand</div>
                  <div className="uc-role-icon worker">
                    <Wrench size={24} />
                  </div>
                  <h3>Gig Worker</h3>
                  <p>
                    Showcase skills, own portable reputation ratings, and secure
                    fair payout guarantees.
                  </p>
                  <span className="uc-role-link">Join as Worker →</span>
                </div>

                <div
                  className="uc-gig-role-card role-card-3"
                  onClick={() => navigate("/register/cooperative")}
                >
                  <div className="uc-role-icon union">
                    <Landmark size={24} />
                  </div>
                  <h3>Union / Federation</h3>
                  <p>
                    Manage worker cooperatives, enforce wage standards, and
                    arbitrate disputes.
                  </p>
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
              <span className="uc-brand-badge">CO</span>
              <span className="uc-brand-name">CoWorker</span>
            </div>
            <span className="uc-footer-tagline">
              India's Leading Home Services & Gig Platform
            </span>
          </div>

          <div className="uc-footer-grid">
            <div className="uc-footer-col">
              <h4>Company</h4>
              <ul>
                <li>
                  <a href="#about">About us</a>
                </li>
                <li>
                  <a href="#terms">Terms & conditions</a>
                </li>
                <li>
                  <a href="#privacy">Privacy policy</a>
                </li>
                <li>
                  <a href="#careers">Careers</a>
                </li>
              </ul>
            </div>

            <div className="uc-footer-col">
              <h4>For customers</h4>
              <ul>
                <li>
                  <a href="#reviews">CO reviews</a>
                </li>
                <li>
                  <a href="#categories">Categories near you</a>
                </li>
                <li>
                  <a href="#safety">Safety policy</a>
                </li>
                <li>
                  <a href="#contact">Customer support</a>
                </li>
              </ul>
            </div>

            <div className="uc-footer-col">
              <h4>For professionals</h4>
              <ul>
                <li>
                  <a
                    href="#register"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/register/worker");
                    }}
                  >
                    Register as a professional
                  </a>
                </li>
                <li>
                  <a
                    href="#federation"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/register/cooperative");
                    }}
                  >
                    Union & Federation portal
                  </a>
                </li>
                <li>
                  <a href="#insurance">Worker insurance program</a>
                </li>
                <li>
                  <a href="#community">Partner community</a>
                </li>
              </ul>
            </div>

            <div className="uc-footer-col">
              <h4>Smart India Hackathon 2026</h4>
              <p className="uc-footer-desc">
                Building a fair, transparent, and decentralized gig platform for
                the future of work.
              </p>
              <div className="uc-sih-badge">
                <span>
                  <Trophy
                    size={14}
                    style={{
                      display: "inline",
                      verticalAlign: "text-bottom",
                      marginRight: "4px",
                    }}
                  />{" "}
                  SIH 2026 Prototype
                </span>
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
