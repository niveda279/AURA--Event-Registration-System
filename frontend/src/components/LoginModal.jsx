import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, Mail, User, Shield, AlertCircle } from 'lucide-react';

export default function LoginModal({ onClose }) {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user'); // user or organizer
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        if (!name.trim()) throw new Error('Name is required.');
        await register(name.trim(), email.trim().toLowerCase(), password, role);
      } else {
        await login(email.trim().toLowerCase(), password);
      }
      onClose(); // Close modal upon success
    } catch (err) {
      setError(err.message || 'An authentication error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content glass-panel" 
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '420px',
          border: '1px solid var(--border-color)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
          background: 'var(--bg-secondary)'
        }}
      >
        {/* Close Button */}
        <button className="modal-close" onClick={onClose}>
          <X size={18} />
        </button>

        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h2 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '6px' }} className="gradient-text-primary">
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            {isRegister ? 'Join AURA to start exploring events' : 'Sign in to access your tickets and dashboard'}
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid var(--danger)',
            padding: '10px 14px',
            borderRadius: 'var(--border-radius-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--danger)',
            fontSize: '13px',
            marginBottom: '20px'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {isRegister && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Name</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '16px', top: '15px', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  required
                  placeholder="Alex Mercer"
                  className="form-input"
                  style={{ paddingLeft: '44px' }}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '16px', top: '15px', color: 'var(--text-muted)' }} />
              <input
                type="email"
                required
                placeholder="alex@domain.com"
                className="form-input"
                style={{ paddingLeft: '44px' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '16px', top: '15px', color: 'var(--text-muted)' }} />
              <input
                type="password"
                required
                placeholder="••••••••"
                className="form-input"
                style={{ paddingLeft: '44px' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {isRegister && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Account Role</label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                background: 'rgba(13, 16, 23, 0.4)',
                padding: '6px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)'
              }}>
                <button
                  type="button"
                  onClick={() => setRole('user')}
                  style={{
                    background: role === 'user' ? 'var(--primary)' : 'none',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    color: 'white',
                    transition: 'var(--transition-fast)'
                  }}
                >
                  Attendee
                </button>
                <button
                  type="button"
                  onClick={() => setRole('organizer')}
                  style={{
                    background: role === 'organizer' ? 'var(--primary)' : 'none',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    color: 'white',
                    transition: 'var(--transition-fast)'
                  }}
                >
                  Event Host
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '14px', marginTop: '10px' }}
          >
            {loading ? 'Authenticating...' : isRegister ? 'Register Account' : 'Sign In'}
          </button>
        </form>

        {/* Toggle Switch */}
        <div style={{
          textAlign: 'center',
          marginTop: '24px',
          borderTop: '1px solid var(--border-color)',
          paddingTop: '16px',
          fontSize: '13px',
          color: 'var(--text-secondary)'
        }}>
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => {
              setIsRegister(prev => !prev);
              setError('');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent)',
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {isRegister ? 'Sign In' : 'Sign Up Free'}
          </button>
        </div>
      </div>
    </div>
  );
}
