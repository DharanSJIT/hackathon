import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GraduationCap, Menu, X, ChevronDown, LogOut, User, LayoutDashboard, BookOpen, GitCompare, FileText } from 'lucide-react';
import { UserContext } from '../App';

const NAV_LINKS = [
  { to: '/scholarships', label: 'Scholarships', icon: BookOpen },
  { to: '/eligible',     label: 'Eligible',      icon: LayoutDashboard },
  { to: '/tracker',      label: 'Applications',  icon: FileText },
  { to: '/compare',      label: 'Compare',       icon: GitCompare },
];

const Header = () => {
  const location  = useLocation();
  const { user, setUser } = useContext(UserContext);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled]  = useState(false);
  const userMenuRef = useRef(null);

  /* Scroll shadow */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Close menus on route change */
  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  /* Close user dropdown on outside click */
  useEffect(() => {
    if (!userMenuOpen) return;
    const close = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [userMenuOpen]);

  const handleLogout = () => {
    // Clear all persisted auth data
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('eligible_schemes');
    // Reset React context
    setUser(null);
    // Hard redirect to fully reset app state
    window.location.href = '/';
  };

  const isActive = (to) => location.pathname === to;

  return (
    <>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backgroundColor: '#ffffff',
          transition: 'box-shadow 0.2s ease',
          boxShadow: scrolled
            ? '0 1px 12px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)'
            : '0 1px 0 #f1f5f9',
        }}
      >
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', height: 64, gap: 8 }}>

            {/* ── Logo ── */}
            <Link
              to="/"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                textDecoration: 'none',
                flexShrink: 0,
                marginRight: 8,
              }}
            >
              <span style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                backgroundColor: '#0B3C91',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <GraduationCap size={18} color="#ffffff" />
              </span>
              <span style={{
                fontSize: 17,
                fontWeight: 800,
                color: '#0B3C91',
                letterSpacing: '-0.3px',
                whiteSpace: 'nowrap',
              }}>
                Sakhi<span style={{ color: '#1E5BB8' }}>Scholar</span>
              </span>
            </Link>

            {/* ── Divider ── */}
            {user && (
              <span style={{ width: 1, height: 20, backgroundColor: '#E2E8F0', margin: '0 8px', flexShrink: 0 }} />
            )}

            {/* ── Desktop Nav ── */}
            {user && (
              <nav
                style={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}
                className="hidden-mobile"
              >
                {NAV_LINKS.map(({ to, label }) => {
                  const active = isActive(to);
                  return (
                    <Link
                      key={to}
                      to={to}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '6px 12px',
                        borderRadius: 8,
                        fontSize: 14,
                        fontWeight: 600,
                        textDecoration: 'none',
                        transition: 'all 0.15s ease',
                        color: active ? '#0B3C91' : '#4B5563',
                        backgroundColor: active ? '#EEF2FF' : 'transparent',
                        position: 'relative',
                      }}
                      onMouseEnter={e => {
                        if (!active) {
                          e.currentTarget.style.backgroundColor = '#F8FAFC';
                          e.currentTarget.style.color = '#0B3C91';
                        }
                      }}
                      onMouseLeave={e => {
                        if (!active) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = '#4B5563';
                        }
                      }}
                    >
                      {label}
                    </Link>
                  );
                })}
              </nav>
            )}

            {/* ── Right Side ── */}
            <div
              style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto' }}
              className="hidden-mobile"
            >
              {!user ? (
                <>
                  <Link
                    to="/login"
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: '#374151',
                      textDecoration: 'none',
                      padding: '7px 14px',
                      borderRadius: 8,
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#F3F4F6'; e.currentTarget.style.color = '#0B3C91'; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#374151'; }}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: '#ffffff',
                      textDecoration: 'none',
                      padding: '8px 18px',
                      borderRadius: 8,
                      backgroundColor: '#0B3C91',
                      transition: 'background-color 0.15s ease',
                      boxShadow: '0 1px 2px rgba(11,60,145,0.2)',
                      whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#092a66'; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#0B3C91'; }}
                  >
                    Get Started
                  </Link>
                </>
              ) : (
                /* User Menu */
                <div ref={userMenuRef} style={{ position: 'relative' }}>
                  <button
                    id="user-menu-btn"
                    onClick={() => setUserMenuOpen(o => !o)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '6px 10px 6px 6px',
                      borderRadius: 10,
                      border: '1px solid #E5E7EB',
                      backgroundColor: userMenuOpen ? '#F8FAFC' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.backgroundColor = '#F8FAFC'; }}
                    onMouseLeave={e => { if (!userMenuOpen) { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.backgroundColor = '#ffffff'; } }}
                  >
                    {/* Avatar */}
                    <span style={{
                      width: 30,
                      height: 30,
                      borderRadius: 8,
                      backgroundColor: '#EEF2FF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <User size={14} color="#0B3C91" />
                    </span>
                    <span style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: '#111827',
                      maxWidth: 120,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {user.fullName?.split(' ')[0] || user.email?.split('@')[0]}
                    </span>
                    <ChevronDown
                      size={14}
                      color="#6B7280"
                      style={{ transition: 'transform 0.2s ease', transform: userMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    />
                  </button>

                  {/* Dropdown */}
                  {userMenuOpen && (
                    <div style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      right: 0,
                      minWidth: 200,
                      backgroundColor: '#ffffff',
                      border: '1px solid #E5E7EB',
                      borderRadius: 12,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06)',
                      padding: '6px',
                      zIndex: 100,
                      animation: 'scale-in 0.15s ease both',
                    }}>
                      {/* User info row */}
                      <div style={{ padding: '8px 10px 10px', borderBottom: '1px solid #F1F5F9', marginBottom: 4 }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: 0 }}>
                          {user.fullName || 'User'}
                        </p>
                        <p style={{ fontSize: 11, color: '#9CA3AF', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {user.email}
                        </p>
                      </div>

                      <Link
                        to="/profile"
                        style={dropdownItem}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <User size={14} color="#6B7280" />
                        Edit Profile
                      </Link>
                      <Link
                        to="/eligible"
                        style={dropdownItem}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <LayoutDashboard size={14} color="#6B7280" />
                        My Matches
                      </Link>

                      <div style={{ height: 1, backgroundColor: '#F1F5F9', margin: '4px 0' }} />

                      <button
                        onClick={handleLogout}
                        style={{
                          ...dropdownItem,
                          width: '100%',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#DC2626',
                          textAlign: 'left',
                          backgroundColor: 'transparent',
                        }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#FEF2F2'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <LogOut size={14} color="#DC2626" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── Mobile Hamburger ── */}
            <button
              aria-label="Toggle navigation"
              onClick={() => setMobileOpen(o => !o)}
              className="show-mobile"
              style={{
                marginLeft: 'auto',
                width: 36,
                height: 36,
                borderRadius: 8,
                border: '1px solid #E5E7EB',
                backgroundColor: 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#374151',
                transition: 'all 0.15s ease',
              }}
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* ── Mobile Menu ── */}
        {mobileOpen && (
          <div style={{
            borderTop: '1px solid #F1F5F9',
            backgroundColor: '#ffffff',
            padding: '8px 16px 16px',
            animation: 'fade-in-up 0.2s ease both',
          }}>
            {user ? (
              <>
                {/* User chip */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  borderRadius: 10,
                  backgroundColor: '#F8FAFC',
                  marginBottom: 8,
                }}>
                  <span style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={14} color="#0B3C91" />
                  </span>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: 0 }}>{user.fullName || 'User'}</p>
                    <p style={{ fontSize: 11, color: '#9CA3AF', margin: 0 }}>{user.email}</p>
                  </div>
                </div>

                {NAV_LINKS.map(({ to, label, icon: Icon }) => (
                  <Link
                    key={to}
                    to={to}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '10px 12px',
                      borderRadius: 8,
                      fontSize: 14,
                      fontWeight: 600,
                      color: isActive(to) ? '#0B3C91' : '#374151',
                      backgroundColor: isActive(to) ? '#EEF2FF' : 'transparent',
                      textDecoration: 'none',
                      marginBottom: 2,
                    }}
                  >
                    <Icon size={15} />
                    {label}
                  </Link>
                ))}

                <div style={{ height: 1, backgroundColor: '#F1F5F9', margin: '8px 0' }} />

                <button
                  onClick={handleLogout}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    width: '100%', padding: '10px 12px', borderRadius: 8,
                    fontSize: 14, fontWeight: 600, color: '#DC2626',
                    backgroundColor: 'transparent', border: 'none', cursor: 'pointer',
                  }}
                >
                  <LogOut size={15} /> Sign Out
                </button>
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 8 }}>
                <Link to="/login"    style={{ display: 'block', padding: '10px 12px', borderRadius: 8, fontSize: 14, fontWeight: 600, color: '#374151', textDecoration: 'none', textAlign: 'center', border: '1px solid #E5E7EB' }}>Sign In</Link>
                <Link to="/register" style={{ display: 'block', padding: '10px 12px', borderRadius: 8, fontSize: 14, fontWeight: 700, color: '#fff', textDecoration: 'none', textAlign: 'center', backgroundColor: '#0B3C91' }}>Get Started Free</Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Responsive helper styles */}
      <style>{`
        .hidden-mobile { display: flex !important; }
        .show-mobile   { display: none  !important; }
        @media (max-width: 767px) {
          .hidden-mobile { display: none  !important; }
          .show-mobile   { display: flex  !important; }
        }
      `}</style>
    </>
  );
};

/* Shared dropdown item style object */
const dropdownItem = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  width: '100%',
  padding: '8px 10px',
  borderRadius: 8,
  fontSize: 13,
  fontWeight: 600,
  color: '#374151',
  textDecoration: 'none',
  transition: 'background-color 0.12s ease',
  backgroundColor: 'transparent',
};

export default Header;
