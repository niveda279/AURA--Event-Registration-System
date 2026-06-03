import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit3, Trash2, Users, Calendar, MapPin, BarChart3, Clock, ChevronRight, X, AlertCircle } from 'lucide-react';

export default function AdminDashboard({ onRefreshEvents }) {
  const { getAuthHeader } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Active states
  const [selectedEventForAttendees, setSelectedEventForAttendees] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [loadingAttendees, setLoadingAttendees] = useState(false);
  
  const [showEventForm, setShowEventForm] = useState(false);
  const [editEventId, setEditEventId] = useState(null); // If null, create mode; else edit mode
  
  // Form fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Tech');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const categories = ['Tech', 'Music', 'Art', 'Food', 'Design'];

  useEffect(() => {
    fetchOrganizerEvents();
  }, []);

  const fetchOrganizerEvents = async () => {
    try {
      setLoading(true);
      setError('');
      
      const res = await fetch('/api/events');
      if (!res.ok) throw new Error('Failed to fetch events.');
      const data = await res.json();
      
      // Filter events created by the logged-in organizer
      // In the real system, the backend could have an endpoint, but since we retrieve organizer_name and organizer_id
      // we can filter locally or fetch all. Let's see: /api/events returns all, but they have `organizer_id` attached.
      // So we filter events where event.organizer_id matches current user id!
      const userJSON = localStorage.getItem('aura_user');
      if (userJSON) {
        const user = JSON.parse(userJSON);
        const filtered = data.filter(e => e.organizer_id === user.id);
        setEvents(filtered);
      }
    } catch (err) {
      setError(err.message || 'Could not load your events.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateForm = () => {
    setEditEventId(null);
    setTitle('');
    setCategory('Tech');
    setDate('');
    setTime('');
    setLocation('');
    setCapacity('');
    setDescription('');
    setImageUrl('/assets/events/tech_summit.png'); // default fallback
    setShowEventForm(true);
  };

  const handleOpenEditForm = (event) => {
    setEditEventId(event.id);
    setTitle(event.title);
    setCategory(event.category);
    setDate(event.date);
    setTime(event.time);
    setLocation(event.location);
    setCapacity(event.capacity);
    setDescription(event.description);
    setImageUrl(event.image_url);
    setShowEventForm(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const payload = {
      title,
      description,
      date,
      time,
      location,
      category,
      capacity: parseInt(capacity, 10),
      image_url: imageUrl || `/assets/events/${category.toLowerCase() === 'tech' ? 'tech_summit' : category.toLowerCase() === 'music' ? 'synthwave_concert' : category.toLowerCase() === 'art' ? 'digital_art' : category.toLowerCase() === 'food' ? 'food_festival' : 'design_hackathon'}.png`
    };

    try {
      const url = editEventId ? `/api/events/${editEventId}` : '/api/events';
      const method = editEventId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save event.');

      setShowEventForm(false);
      fetchOrganizerEvents();
      if (onRefreshEvents) onRefreshEvents(); // Refresh home list
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteEvent = async (eventId, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? All existing attendee registrations for this event will be canceled.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete event.');
      }

      fetchOrganizerEvents();
      if (onRefreshEvents) onRefreshEvents();
      if (selectedEventForAttendees?.id === eventId) {
        setSelectedEventForAttendees(null);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleViewAttendees = async (event) => {
    setSelectedEventForAttendees(event);
    setLoadingAttendees(true);
    setAttendees([]);

    try {
      const res = await fetch(`/api/registrations/event/${event.id}`, {
        headers: getAuthHeader()
      });

      if (!res.ok) throw new Error('Failed to retrieve attendee list.');
      const data = await res.json();
      setAttendees(data);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoadingAttendees(false);
    }
  };

  // Dashboard calculations
  const totalEvents = events.length;
  const totalBookings = events.reduce((sum, e) => sum + (e.registered_count || 0), 0);
  const totalCapacity = events.reduce((sum, e) => sum + e.capacity, 0);
  const fillRate = totalCapacity > 0 ? Math.round((totalBookings / totalCapacity) * 100) : 0;

  return (
    <div className="container" style={{ paddingBottom: '80px' }}>
      
      {/* Header and Add button */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '40px'
      }}>
        <div>
          <h1 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '8px' }}>
            Organizer <span className="gradient-text-primary">Dashboard</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Schedule and configure your events, monitor attendee rosters, and view real-time statistics.
          </p>
        </div>
        
        <button 
          onClick={handleOpenCreateForm}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px' }}
        >
          <Plus size={18} />
          <span>Create Event</span>
        </button>
      </div>

      {/* Metrics Ratios Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '24px',
        marginBottom: '40px'
      }}>
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            padding: '12px',
            borderRadius: '12px',
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--accent)'
          }}>
            <Calendar size={24} />
          </div>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Hosted Events</span>
            <h3 style={{ fontSize: '28px', fontWeight: 800, marginTop: '2px' }}>{totalEvents}</h3>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            padding: '12px',
            borderRadius: '12px',
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--primary)'
          }}>
            <Users size={24} />
          </div>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Total Registrants</span>
            <h3 style={{ fontSize: '28px', fontWeight: 800, marginTop: '2px' }}>{totalBookings}</h3>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            padding: '12px',
            borderRadius: '12px',
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--success)'
          }}>
            <BarChart3 size={24} />
          </div>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Fill Ratio</span>
            <h3 style={{ fontSize: '28px', fontWeight: 800, marginTop: '2px' }}>{fillRate}%</h3>
          </div>
        </div>
      </div>

      {/* Main Body Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: selectedEventForAttendees ? '1.2fr 0.8fr' : '1fr',
        gap: '32px',
        alignItems: 'start',
        transition: 'var(--transition-smooth)'
      }}>
        
        {/* Events list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px' }}>Your Scheduled Events</h3>
          
          {events.length === 0 ? (
            <div className="glass-panel" style={{ padding: '60px 24px', textAlign: 'center', background: 'var(--bg-secondary)' }}>
              <Calendar size={40} style={{ stroke: 'var(--text-muted)', marginBottom: '12px' }} />
              <h4 style={{ fontWeight: 600, marginBottom: '6px' }}>No Events Scheduled</h4>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                Create your first event now and start welcoming attendee registrations!
              </p>
              <button onClick={handleOpenCreateForm} className="btn btn-primary btn-sm">Create Event</button>
            </div>
          ) : (
            events.map((event) => (
              <div 
                key={event.id}
                className="glass-panel"
                style={{
                  padding: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '20px',
                  border: selectedEventForAttendees?.id === event.id ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                  background: 'var(--bg-secondary)',
                  flexWrap: 'wrap'
                }}
              >
                {/* Event Summary Left */}
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flex: '1 1 280px' }}>
                  <img 
                    src={event.image_url} 
                    alt={event.title}
                    style={{ width: '80px', height: '60px', borderRadius: '8px', objectFit: 'cover' }}
                  />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span className={`tag tag-${event.category.toLowerCase()}`} style={{ fontSize: '9px', padding: '2px 8px' }}>
                        {event.category}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ID: {event.id}</span>
                    </div>
                    <h4 style={{ fontSize: '16px', fontWeight: 700 }}>{event.title}</h4>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                      <Calendar size={12} /> {event.date} at {event.time}
                    </span>
                  </div>
                </div>

                {/* Capacity Counter Middle */}
                <div style={{ minWidth: '130px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Bookings</span>
                  <span style={{ fontSize: '15px', fontWeight: 600 }}>{event.registered_count || 0} / {event.capacity} seats</span>
                  <div style={{ width: '100px', height: '4px', backgroundColor: 'var(--bg-primary)', borderRadius: '2px', marginTop: '6px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${Math.min(100, Math.round(((event.registered_count || 0) / event.capacity) * 100))}%`,
                      height: '100%',
                      backgroundColor: 'var(--accent)'
                    }} />
                  </div>
                </div>

                {/* Actions Right */}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button 
                    onClick={() => handleViewAttendees(event)}
                    className="btn btn-secondary"
                    style={{ padding: '8px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Users size={14} />
                    <span>Roster</span>
                  </button>
                  <button 
                    onClick={() => handleOpenEditForm(event)}
                    className="btn btn-secondary"
                    style={{ padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title="Edit Event"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button 
                    onClick={() => handleDeleteEvent(event.id, event.title)}
                    className="btn btn-secondary"
                    style={{ padding: '8px', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.15)' }}
                    title="Delete Event"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Attendees sidebar roster */}
        {selectedEventForAttendees && (
          <div className="glass-panel animate-card" style={{ padding: '24px', background: 'var(--bg-secondary)', position: 'sticky', top: '100px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Roster</h3>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{selectedEventForAttendees.title}</span>
              </div>
              <button 
                onClick={() => setSelectedEventForAttendees(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {loadingAttendees ? (
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Retrieving attendee details...</p>
            ) : attendees.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                <Users size={32} style={{ stroke: 'var(--text-muted)', marginBottom: '8px', opacity: 0.5 }} />
                <p style={{ fontSize: '13px' }}>No registrations completed for this event yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '450px', overflowY: 'auto', paddingRight: '4px' }}>
                {attendees.map((att, idx) => (
                  <div 
                    key={att.registration_id}
                    style={{
                      padding: '12px 14px',
                      background: 'rgba(13, 16, 23, 0.4)',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600, fontSize: '13px' }}>{att.name}</span>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>#{idx+1}</span>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block' }}>{att.email}</span>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>
                      Registered: {new Date(att.registered_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* CREATE / EDIT EVENT FORM MODAL OVERLAY */}
      {showEventForm && (
        <div className="modal-overlay" onClick={() => setShowEventForm(false)}>
          <div 
            className="modal-content glass-panel" 
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '550px',
              border: '1px solid var(--border-color)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
              background: 'var(--bg-secondary)'
            }}
          >
            {/* Close Button */}
            <button className="modal-close" onClick={() => setShowEventForm(false)}>
              <X size={18} />
            </button>

            {/* Modal Title */}
            <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '24px' }}>
              {editEventId ? 'Edit Event Configuration' : 'Schedule New Event'}
            </h2>

            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Event Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Next-Gen Tech Summit 2026"
                  className="form-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Category</label>
                  <select
                    className="form-input"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{ background: 'rgba(13, 16, 23, 0.6)' }}
                  >
                    {categories.map(c => (
                      <option key={c} value={c} style={{ background: 'var(--bg-secondary)' }}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Max Capacity</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 100"
                    className="form-input"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Date</label>
                  <input
                    type="date"
                    required
                    className="form-input"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Time</label>
                  <input
                    type="time"
                    required
                    className="form-input"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Location / Venue</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Convention Center Hall B or Virtual Zoom Link"
                  className="form-input"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Banner Image Asset Path</label>
                <input
                  type="text"
                  placeholder="/assets/events/tech_summit.png"
                  className="form-input"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Description</label>
                <textarea
                  required
                  rows="4"
                  placeholder="Describe details, schedules, speakers, or features of the event..."
                  className="form-input"
                  style={{ resize: 'vertical' }}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '14px', marginTop: '10px' }}
              >
                {editEventId ? 'Apply Update' : 'Schedule Event'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
