import React, { useState, useEffect } from 'react';
import EventCard from '../components/EventCard';
import { Search, Filter, Compass, AlertCircle } from 'lucide-react';

export default function Home({ onOpenDetails, refreshTrigger }) {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const categories = ['All', 'Tech', 'Music', 'Art', 'Food', 'Design'];

  useEffect(() => {
    fetchEvents();
  }, [search, category, refreshTrigger]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError('');
      
      let url = '/api/events';
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category && category !== 'All') params.append('category', category);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error('Failed to retrieve events.');
      }
      const data = await res.json();
      setEvents(data);
    } catch (err) {
      setError(err.message || 'Could not load event data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ paddingBottom: '80px' }}>
      {/* Hero Welcome Banner */}
      <div 
        className="glass-panel" 
        style={{
          padding: '50px 40px',
          borderRadius: 'var(--border-radius-lg)',
          marginBottom: '50px',
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(6, 182, 212, 0.05) 100%)',
          border: '1px solid var(--border-color)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Artistic glowing radial gradients in background */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          right: '-10%',
          width: '300px',
          height: '300px',
          background: 'var(--primary-glow)',
          borderRadius: '50%',
          filter: 'blur(80px)',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-15%',
          left: '10%',
          width: '200px',
          height: '200px',
          background: 'var(--accent-glow)',
          borderRadius: '50%',
          filter: 'blur(60px)',
          pointerEvents: 'none'
        }} />

        <div style={{ maxWidth: '650px', position: 'relative', zIndex: 1 }}>
          <span style={{
            fontSize: '12px',
            textTransform: 'uppercase',
            fontWeight: 800,
            letterSpacing: '0.15em',
            color: 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px'
          }}>
            <Compass size={14} />
            <span>Discover What's Next</span>
          </span>
          
          <h1 style={{
            fontSize: '46px',
            lineHeight: '1.15',
            fontWeight: 800,
            marginBottom: '20px'
          }}>
            Uncover Premier <span className="gradient-text-primary">Gatherings</span> & Conferences.
          </h1>
          
          <p style={{
            fontSize: '16px',
            color: 'var(--text-secondary)',
            lineHeight: '1.6'
          }}>
            AURA is the gateway to high-end design hackathons, retro synthwave concerts, digital projection art, and immersive technical summits. Register in one click and track your tickets instantly.
          </p>
        </div>
      </div>

      {/* Filter and Search Section */}
      <div 
        className="glass-panel" 
        style={{
          padding: '24px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '24px',
          justifyContent: 'space-between',
          alignItems: 'center',
          border: '1px solid var(--border-color)',
          background: 'var(--bg-secondary)'
        }}
      >
        {/* Search Input bar */}
        <div style={{ position: 'relative', flex: '1 1 320px', maxWidth: '450px' }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '15px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '48px', height: '48px' }}
            placeholder="Search by title, location or keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Categories Tab selectors */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className="btn"
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                background: category === cat ? 'var(--primary)' : 'var(--bg-primary)',
                border: '1px solid ' + (category === cat ? 'var(--primary)' : 'var(--border-color)'),
                color: category === cat ? 'white' : 'var(--text-secondary)',
                fontSize: '13px',
                fontWeight: 600,
                fontFamily: 'var(--font-display)',
                cursor: 'pointer',
                transition: 'var(--transition-fast)'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Events Listing Output */}
      {error && (
        <div style={{
          marginTop: '40px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid var(--danger)',
          padding: '20px',
          borderRadius: 'var(--border-radius-md)',
          color: 'var(--danger)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <AlertCircle size={24} />
          <div>
            <h4 style={{ fontWeight: 700, marginBottom: '4px' }}>Failed to Load Events</h4>
            <p style={{ fontSize: '14px' }}>{error}</p>
          </div>
        </div>
      )}

      {loading ? (
        /* Render loading skeletons */
        <div className="events-grid">
          {[1, 2, 3].map((n) => (
            <div 
              key={n} 
              className="glass-panel" 
              style={{ height: '460px', overflow: 'hidden', padding: 0 }}
            >
              <div className="skeleton" style={{ width: '100%', height: '180px' }} />
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="skeleton" style={{ width: '40%', height: '20px', borderRadius: '4px' }} />
                <div className="skeleton" style={{ width: '90%', height: '24px', borderRadius: '4px' }} />
                <div className="skeleton" style={{ width: '100%', height: '50px', borderRadius: '8px' }} />
                <div className="skeleton" style={{ width: '70%', height: '18px', borderRadius: '4px', marginTop: '20px' }} />
                <div className="skeleton" style={{ width: '100%', height: '6px', borderRadius: '3px' }} />
              </div>
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        /* Empty state */
        <div style={{
          textAlign: 'center',
          padding: '80px 20px',
          color: 'var(--text-secondary)'
        }}>
          <Compass size={48} style={{ stroke: 'var(--text-muted)', marginBottom: '16px' }} />
          <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
            No Events Found
          </h3>
          <p style={{ fontSize: '14px' }}>
            We couldn't find any events matching "{search}" in the category "{category}". Try relaxing your search criteria.
          </p>
        </div>
      ) : (
        /* Display cards */
        <div className="events-grid">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onOpenDetails={() => onOpenDetails(event)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
