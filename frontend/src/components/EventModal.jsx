import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Calendar, Clock, MapPin, Users, Ticket, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';

export default function EventModal({ 
  event, 
  onClose, 
  onRegisterSuccess, 
  onCancelSuccess, 
  onOpenLogin 
}) {
  const { currentUser, isAuthenticated, isOrganizer, getAuthHeader } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [ticketId, setTicketId] = useState(null);
  const [myRegistration, setMyRegistration] = useState(null);

  // Check if current user is registered for this event
  useEffect(() => {
    if (isAuthenticated && !isOrganizer && event) {
      checkRegistration();
    }
  }, [event, isAuthenticated, isOrganizer]);

  const checkRegistration = async () => {
    try {
      const res = await fetch('/api/registrations/my', {
        headers: getAuthHeader()
      });
      if (res.ok) {
        const registrations = await res.json();
        const found = registrations.find(r => r.event_id === event.id);
        if (found) {
          setMyRegistration(found);
          setTicketId(found.registration_id);
        } else {
          setMyRegistration(null);
          setTicketId(null);
        }
      }
    } catch (err) {
      console.error('Error fetching registrations:', err);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      onOpenLogin();
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/registrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({ event_id: event.id })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to register.');
      }

      setSuccess(true);
      setTicketId(data.registrationId);
      onRegisterSuccess();
      checkRegistration();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!ticketId) return;
    if (!window.confirm('Are you sure you want to cancel your registration for this event? This will free up your seat.')) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/registrations/${ticketId}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to cancel registration.');
      }

      setMyRegistration(null);
      setTicketId(null);
      setSuccess(false);
      onCancelSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!event) return null;

  const seatsFilled = event.registered_count || 0;
  const seatsLeft = Math.max(0, event.capacity - seatsFilled);
  const isFull = seatsLeft === 0;

  // Format Date (e.g. "Wednesday, July 15, 2026")
  const formatFullDate = (dateStr) => {
    try {
      const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
      return new Date(dateStr).toLocaleDateString('en-US', options);
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content glass-panel" 
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '650px',
          border: '1px solid var(--border-color)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
          background: 'var(--bg-secondary)',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}
      >
        {/* Close Button */}
        <button className="modal-close" onClick={onClose}>
          <X size={20} />
        </button>

        {/* Modal Hero Banner */}
        <div style={{
          width: 'calc(100% + 64px)',
          margin: '-32px -32px 0 -32px',
          height: '240px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <img 
            src={event.image_url || '/assets/events/default_event.png'} 
            alt={event.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '120px',
            background: 'linear-gradient(to top, var(--bg-secondary) 15%, transparent 100%)'
          }} />
          <div style={{ position: 'absolute', top: '24px', left: '24px' }}>
            <span className={`tag tag-${event.category.toLowerCase()}`}>{event.category}</span>
          </div>
        </div>

        {/* Event Meta Info */}
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '16px', lineHeight: '1.2' }}>
            {event.title}
          </h2>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            color: 'var(--text-secondary)',
            fontSize: '14px',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={16} className="gradient-text-primary" style={{ stroke: 'var(--accent)' }} />
              <span>{formatFullDate(event.date)}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={16} style={{ stroke: 'var(--accent)' }} />
              <span>{event.time}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={16} style={{ stroke: 'var(--accent)' }} />
              <span>{event.location}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={16} style={{ stroke: 'var(--accent)' }} />
              <span>{seatsFilled} of {event.capacity} seats filled ({seatsLeft} remaining)</span>
            </div>
          </div>

          <h4 style={{ fontSize: '15px', color: 'var(--text-primary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            About The Event
          </h4>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '14px',
            lineHeight: '1.6',
            marginBottom: '24px',
            whiteSpace: 'pre-wrap'
          }}>
            {event.description}
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid var(--danger)',
            padding: '12px 16px',
            borderRadius: 'var(--border-radius-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--danger)',
            fontSize: '13px'
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Action Registration Section */}
        <div className="glass-panel" style={{ padding: '24px', background: 'var(--bg-card)' }}>
          {myRegistration ? (
            /* User is already registered -> Ticket view */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--success)' }}>
                <CheckCircle size={20} />
                <span style={{ fontWeight: 600, fontSize: '15px' }}>Your Registration is Confirmed!</span>
              </div>
              
              {/* Ticket UI Design */}
              <div className="ticket-wrapper">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Attendee</span>
                    <h5 style={{ fontSize: '14px', fontWeight: 600 }}>{currentUser.name}</h5>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Ticket ID</span>
                    <h5 style={{ fontSize: '14px', fontWeight: 600, fontFamily: 'monospace' }}>AURA-E{event.id}-R{ticketId}</h5>
                  </div>
                </div>
                
                <div style={{ borderTop: '1px dashed var(--border-color)', margin: '12px 0', padding: '12px 0 0 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Event</span>
                      <h4 style={{ fontSize: '13px', fontWeight: 600 }}>{event.title}</h4>
                    </div>
                    <div style={{
                      background: 'rgba(255,255,255,0.05)',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontFamily: 'monospace',
                      fontSize: '11px'
                    }}>
                      ADMIT ONE
                    </div>
                  </div>
                </div>

                {/* Aesthetic Barcode Mock */}
                <div style={{
                  height: '35px',
                  background: 'repeating-linear-gradient(90deg, var(--text-primary), var(--text-primary) 2px, transparent 2px, transparent 6px, var(--text-primary) 6px, var(--text-primary) 7px, transparent 7px, transparent 10px)',
                  opacity: 0.25,
                  marginTop: '16px',
                  width: '100%'
                }} />
              </div>

              {/* Cancel registration */}
              <button
                onClick={handleCancel}
                disabled={loading}
                className="btn btn-secondary"
                style={{
                  color: 'var(--danger)',
                  borderColor: 'rgba(239, 68, 68, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  width: '100%',
                  marginTop: '10px'
                }}
              >
                <Trash2 size={16} />
                <span>Cancel Registration</span>
              </button>
            </div>
          ) : isOrganizer ? (
            /* Logged in as Organizer */
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)' }}>
              <AlertCircle size={20} />
              <span>You are logged in as an Organizer. Registrations are restricted to participant accounts.</span>
            </div>
          ) : !isAuthenticated ? (
            /* Unauthenticated -> prompt login */
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
              textAlign: 'center'
            }}>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                Sign in to secure your entry pass for this event.
              </p>
              <button 
                onClick={onOpenLogin} 
                className="btn btn-primary"
                style={{ width: '100%', maxStyle: '320px' }}
              >
                Sign In & Register
              </button>
            </div>
          ) : isFull ? (
            /* Sold Out */
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              color: 'var(--danger)',
              padding: '10px 0'
            }}>
              <AlertCircle size={20} />
              <span style={{ fontWeight: 600 }}>Registration Closed. Event is full.</span>
            </div>
          ) : (
            /* Logged in participant and event has capacity -> Register */
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Registering as</span>
                <span style={{ fontSize: '14px', fontWeight: 600 }}>{currentUser.name} ({currentUser.email})</span>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="btn btn-accent"
                style={{ width: '100%' }}
              >
                {loading ? 'Securing your seat...' : 'Confirm My Registration'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
