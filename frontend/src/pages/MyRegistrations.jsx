import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Ticket, Calendar, MapPin, Clock, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';

export default function MyRegistrations({ onOpenDetails, refreshTrigger, onCancelSuccess }) {
  const { currentUser, getAuthHeader } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRegistrations();
  }, [refreshTrigger]);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      setError('');
      
      const res = await fetch('/api/registrations/my', {
        headers: getAuthHeader()
      });

      if (!res.ok) {
        throw new Error('Failed to retrieve ticket registrations.');
      }
      const data = await res.json();
      setRegistrations(data);
    } catch (err) {
      setError(err.message || 'Could not load registrations.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRegistration = async (regId, eventTitle, e) => {
    e.stopPropagation(); // Avoid triggering card details click

    if (!window.confirm(`Are you sure you want to cancel your ticket for "${eventTitle}"? This cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/registrations/${regId}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to cancel ticket.');
      }

      onCancelSuccess(); // Notify parent to refresh app-wide capacities
      fetchRegistrations(); // Refresh local ticket list
    } catch (err) {
      alert(err.message);
    }
  };

  // Convert Date
  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="container" style={{ paddingBottom: '80px' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '8px' }}>
          My <span className="gradient-text-primary">Tickets</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Manage your active event reservations and entry passes below. Click a ticket card to view full details.
        </p>
      </div>

      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid var(--danger)',
          padding: '16px',
          borderRadius: 'var(--border-radius-md)',
          color: 'var(--danger)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '30px'
        }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <RefreshCw size={32} className="animate-spin" style={{ color: 'var(--primary)', animation: 'spin 2s linear infinite' }} />
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      ) : registrations.length === 0 ? (
        <div className="glass-panel" style={{
          padding: '60px 24px',
          textAlign: 'center',
          border: '1px solid var(--border-color)',
          background: 'var(--bg-secondary)'
        }}>
          <Ticket size={48} style={{ stroke: 'var(--text-muted)', marginBottom: '16px' }} />
          <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '6px' }}>No Active Tickets</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px' }}>
            You haven't registered for any events yet. Check out upcoming events and secure your seats today!
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '30px'
        }}>
          {registrations.map((reg) => (
            <div
              key={reg.registration_id}
              className="glass-panel animate-card"
              style={{
                padding: '0',
                overflow: 'hidden',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                transition: 'var(--transition-smooth)',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)'
              }}
              onClick={() => onOpenDetails({
                id: reg.event_id,
                title: reg.title,
                description: reg.description,
                date: reg.date,
                time: reg.time,
                location: reg.location,
                category: reg.category,
                capacity: reg.capacity,
                registered_count: reg.registered_count,
                image_url: reg.image_url
              })}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = 'var(--primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'var(--border-color)';
              }}
            >
              {/* Event Cover Image Mini */}
              <div style={{ height: '120px', overflow: 'hidden', position: 'relative' }}>
                <img
                  src={reg.image_url || '/assets/events/default_event.png'}
                  alt={reg.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(to top, rgba(13,16,23,0.9), transparent)'
                }} />
                <div style={{ position: 'absolute', bottom: '12px', left: '16px' }}>
                  <span className={`tag tag-${reg.category.toLowerCase()}`} style={{ fontSize: '10px' }}>
                    {reg.category}
                  </span>
                </div>
              </div>

              {/* Ticket Details Panel */}
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', flexGrow: 1, justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '10px' }}>{reg.title}</h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={14} style={{ color: 'var(--accent)' }} />
                      <span>{formatDate(reg.date)}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={14} style={{ color: 'var(--accent)' }} />
                      <span>{reg.time}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{reg.location}</span>
                    </div>
                  </div>
                </div>

                {/* Ticket code and Cancellation action */}
                <div style={{
                  borderTop: '1px dashed var(--border-color)',
                  paddingTop: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '10px'
                }}>
                  <div>
                    <span style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Ticket Code</span>
                    <span style={{ fontSize: '12px', fontFamily: 'monospace', fontWeight: 600 }}>AURA-E{reg.event_id}-R{reg.registration_id}</span>
                  </div>

                  <button
                    onClick={(e) => handleCancelRegistration(reg.registration_id, reg.title, e)}
                    className="btn btn-secondary"
                    style={{
                      padding: '6px 12px',
                      fontSize: '11px',
                      color: 'var(--danger)',
                      borderColor: 'rgba(239, 68, 68, 0.15)',
                      borderRadius: '4px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.08)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    Cancel Ticket
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
