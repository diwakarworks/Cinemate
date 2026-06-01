import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaTimes } from 'react-icons/fa';
import Image from "../image/letterboxd.png";

const API_URL = 'https://cinemate-6k9l.onrender.com';

const Navbar = () => {
  const [userId, setUserId] = useState(null);
  const [user, setUser] = useState(null);
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
      const token = localStorage.getItem('token');
      fetch(`${API_URL}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((data) => setUser(data))
        .catch(() => {});
    }
  }, []);


  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?query=${query}`);
      setQuery('');
      setSearchOpen(false);
    }
  };

  const navLinks = [
    { label: 'Films', to: '/' },
    { label: 'Reviews', to: '/reviews' },
    { label: 'Curated', to: '/movies' },
    { label: 'people', to: '/popular' },
    { label: 'Studios', to: '/studios' },
    {label: 'Search', to: '/advanced-search'},
    {label: 'lists' ,to: `/${userId}/userlists` },
    {label: 'sign in',to: '/login' },
    { label: 'Discover ', to: '/ai/search' },
  ];

  const dropdownLinks = [
    { label: 'Home', to: '/' },
    { label: 'Profile', to: '/profile' },
    { label: 'Diary', to: userId ? `/diary/${userId}` : '/diary' },
    { label: 'Watchlist', to: '/watchlist' },
    { label: 'Stats', to: '/stats' },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Playfair+Display:wght@700&display=swap');

        .cine-nav {
          font-family: 'DM Sans', sans-serif;
        }
        .cine-nav-link {
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #8a9ab5;
          text-decoration: none;
          padding: 4px 0;
          position: relative;
          transition: color 0.18s;
        }
        .cine-nav-link::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 1.5px;
          background: #40c9a2;
          transition: width 0.2s ease;
        }
        .cine-nav-link:hover {
          color: #e8eaf0;
        }
        .cine-nav-link:hover::after {
          width: 100%;
        }
        .cine-dropdown-item {
          display: block;
          padding: 9px 20px;
          font-size: 14px;
          font-weight: 400;
          color: #c5cad6;
          text-decoration: none;
          transition: background 0.15s, color 0.15s;
          letter-spacing: 0.01em;
        }
        .cine-dropdown-item:hover {
          background: rgba(64,201,162,0.08);
          color: #ffffff;
        }
        .cine-search-input {
          background: transparent;
          border: none;
          outline: none;
          color: #e8eaf0;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          width: 200px;
        }
        .cine-search-input::placeholder {
          color: #4b5563;
        }
        .cine-avatar {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: linear-gradient(135deg, #1d6a4f, #1a4a8a);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          color: #fff;
          flex-shrink: 0;
          border: 1.5px solid #2a3045;
        }
      `}</style>

      <nav
        className="cine-nav"
        style={{
          background: '#14161f',
          borderBottom: '1px solid #1e2235',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          padding: '0 32px',
          height: '52px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px',
        }}
      >
        {/* Logo */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flexShrink: 0 }}
          onClick={() => navigate('/')}
        >
          <img src={Image} alt="Cinemate" width="28" height="28" style={{ borderRadius: '4px' }} />
          <span
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '18px',
              fontWeight: 700,
              color: '#f1f3f8',
              letterSpacing: '-0.01em',
            }}
          >
            Cinemate
          </span>
        </div>

        {/* Center nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '28px', flex: 1, justifyContent: 'center' }}>
          {navLinks.map((link) => (
            <Link key={link.to} to={link.to} className="cine-nav-link">
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>

          {/* Search */}
          <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
            {searchOpen ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#1a1e2a',
                  border: '1px solid #2a3045',
                  borderRadius: '20px',
                  padding: '5px 14px',
                }}
              >
                <FaSearch size={12} color="#4b5563" />
                <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    autoFocus
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search films, people…"
                    className="cine-search-input"
                  />
                </form>
                <button
                  onClick={() => { setSearchOpen(false); setQuery(''); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0', lineHeight: 1 }}
                >
                  <FaTimes size={11} color="#4b5563" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#8a9ab5',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#e8eaf0'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#8a9ab5'}
              >
                <FaSearch size={15} />
              </button>
            )}
          </div>

          {/* Login link (when not logged in) */}
          {!userId && (
            <Link
              to="/login"
              style={{
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '0.07em',
                textTransform: 'uppercase',
                color: '#40c9a2',
                textDecoration: 'none',
                padding: '5px 14px',
                border: '1px solid rgba(64,201,162,0.35)',
                borderRadius: '20px',
                transition: 'all 0.18s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(64,201,162,0.12)';
                e.currentTarget.style.borderColor = '#40c9a2';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = 'rgba(64,201,162,0.35)';
              }}
            >
              Sign In
            </Link>
          )}

          {/* User dropdown */}
          {userId && (
            <div ref={dropdownRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '7px',
                  padding: '4px 6px',
                  borderRadius: '20px',
                  transition: 'background 0.15s',
                  background: dropdownOpen ? 'rgba(255,255,255,0.05)' : 'transparent',
                }}
              >
                <div className="cine-avatar">
                  {user?.profilePic
                    ? <img src={user.profilePic} alt="avatar" style={{ width: '100%', height: '100%', borderRadius: '100%', objectFit: 'cover' }} />
                    : (user?.username?.[0] || user?.name?.[0] || 'U').toUpperCase()}
                </div>
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  fill="none"
                  style={{
                    transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s',
                  }}
                >
                  <path d="M2 3.5L5 6.5L8 3.5" stroke="#8a9ab5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {dropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 10px)',
                    right: 0,
                    minWidth: '190px',
                    background: '#1a1e2a',
                    border: '1px solid #2a3045',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
                    animation: 'fadeDown 0.15s ease',
                  }}
                >
                  {/* User header */}
                  <div
                    style={{
                      padding: '12px 20px',
                      borderBottom: '1px solid #232737',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                    }}
                  >
                    <div className="cine-avatar" style={{ width: '34px', height: '34px', fontSize: '13px' }}>
                    {user?.profilePic
                      ? <img src={user.profilePic} alt="avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                      : (user?.username?.[0] || user?.name?.[0] || 'U').toUpperCase()}
                  </div>
                    <div>
                      <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#e8eaf0' }}>{user?.username || user?.name || 'My Account'}</p>
                      <p style={{ margin: 0, fontSize: '11px', color: '#4b5563' }}>{user?.email || `ID: ${userId.slice(0, 8)}…`}</p>
                    </div>
                  </div>

                  {/* Links */}
                  <div style={{ padding: '6px 0' }}>
                    {dropdownLinks.map((link) => (
                      <Link
                        key={link.label}
                        to={link.to}
                        className="cine-dropdown-item"
                        onClick={() => setDropdownOpen(false)}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>

                  {/* Divider + extra links */}
                  <div style={{ borderTop: '1px solid #1e2235', padding: '6px 0' }}>
                      <Link
                      to={`/user/${user.id}`}
                      className="cine-dropdown-item"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Lists
                    </Link>
                    <Link
                      to={`/people/${userId}`}
                      className="cine-dropdown-item"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Vault
                    </Link>
                    <Link
                      to={`/userreviews`}
                      className="cine-dropdown-item"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Reviews
                    </Link>

                  </div>

                  {/* Sign out */}
                  <div style={{ borderTop: '1px solid #1e2235', padding: '6px 0' }}>
                    <button
                      onClick={() => {
                        localStorage.clear();
                        navigate('/login');
                        setDropdownOpen(false);
                      }}
                      style={{
                        display: 'block',
                        width: '100%',
                        textAlign: 'left',
                        padding: '9px 20px',
                        fontSize: '14px',
                        color: '#e05252',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontFamily: "'DM Sans', sans-serif",
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(224,82,82,0.08)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      <style>{`
        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
};

export default Navbar;