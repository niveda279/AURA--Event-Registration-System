import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar, User, LogOut, Sun, Moon, LayoutDashboard, Ticket } from 'lucide-react';

export default function Navbar({ onOpenLogin, currentTab, setCurrentTab }) {
  const { currentUser, logout, isAuthenticated, isOrganizer } = useAuth();
  const [theme, setTheme] = useState(localStorage.getItem('aura_theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('aura_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <nav className="glass-panel" style={{
      borderRadius: '0 0 var(--border-radius-md) var(--border-radius-md)',
      borderTop: 'none',
      marginBottom: '40px',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div className="container" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '80px'
      }}>
        {/* Brand Logo */}
        <div 
          onClick={() => setCurrentTab('home')} 
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
        >
          <div style={{
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
            padding: '10px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px var(--primary-glow)'
          }}>
            <Calendar size={20} color="white" />
          </div>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: '24px',
            fontWeight: 800,
            letterSpacing: '0.05em',
            textTransform: 'uppercase'
          }} className="gradient-text-primary">
            Aura
          </span>
        </div>

        {/* Navigation Items */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
          <button 
            onClick={() => setCurrentTab('home')}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '14px',
              fontWeight: 600,
              color: currentTab === 'home' ? 'var(--text-primary)' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontFamily: 'var(--font-display)',
              transition: 'var(--transition-fast)',
              borderBottom: currentTab === 'home' ? '2px solid var(--accent)' : '2px solid transparent',
              paddingBottom: '4px'
            }}
          >
            Explore Events
          </button>

          {isAuthenticated && !isOrganizer && (
            <button 
              onClick={() => setCurrentTab('my-registrations')}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '14px',
                fontWeight: 600,
                color: currentTab === 'my-registrations' ? 'var(--text-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontFamily: 'var(--font-display)',
                transition: 'var(--transition-fast)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                borderBottom: currentTab === 'my-registrations' ? '2px solid var(--accent)' : '2px solid transparent',
                paddingBottom: '4px'
              }}
            >
              <Ticket size={16} />
              My Tickets
            </button>
          )}

          {isAuthenticated && isOrganizer && (
            <button 
              onClick={() => setCurrentTab('admin')}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '14px',
                fontWeight: 600,
                color: currentTab === 'admin' ? 'var(--text-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontFamily: 'var(--font-display)',
                transition: 'var(--transition-fast)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                borderBottom: currentTab === 'admin' ? '2px solid var(--accent)' : '2px solid transparent',
                paddingBottom: '4px'
              }}
            >
              <LayoutDashboard size={16} />
              Organizer Panel
            </button>
          )}
        </div>

        {/* User profile controls & Theme toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              transition: 'var(--transition-fast)'
            }}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <span style={{ fontSize: '14px', fontWeight: 600 }}>{currentUser.name}</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                  {currentUser.role}
                </span>
              </div>
              
              <button
                onClick={() => {
                  logout();
                  setCurrentTab('home');
                }}
                className="btn btn-secondary"
                style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                title="Log Out"
              >
                <LogOut size={16} />
                <span style={{ fontSize: '13px' }}>Logout</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <User size={16} />
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
