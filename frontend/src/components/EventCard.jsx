import React from 'react';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';

export default function EventCard({ event, onOpenDetails }) {
  const { title, description, date, time, location, category, capacity, registered_count, image_url } = event;
  
  // Format Date (e.g., "Jul 15, 2026")
  const formatDate = (dateStr) => {
    try {
      const options = { month: 'short', day: 'numeric', year: 'numeric' };
      return new Date(dateStr).toLocaleDateString('en-US', options);
    } catch (e) {
      return dateStr;
    }
  };

  const seatsFilled = registered_count || 0;
  const seatsLeft = Math.max(0, capacity - seatsFilled);
  const fillPercentage = Math.min(100, Math.round((seatsFilled / capacity) * 100));

  // Determine tag style based on category
  const getTagClass = (cat) => {
    const c = cat.toLowerCase();
    if (c === 'tech') return 'tag tag-tech';
    if (c === 'music') return 'tag tag-music';
    if (c === 'art') return 'tag tag-art';
    if (c === 'food') return 'tag tag-food';
    if (c === 'design') return 'tag tag-design';
    return 'tag tag-tech';
  };

  return (
    <div 
      className="glass-panel animate-card" 
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '460px',
        overflow: 'hidden',
        transition: 'var(--transition-smooth)',
        cursor: 'pointer'
      }}
      onClick={onOpenDetails}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-8px) scale(1.01)';
        e.currentTarget.style.borderColor = 'var(--primary)';
        e.currentTarget.style.boxShadow = '0 12px 30px rgba(139, 92, 246, 0.2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        e.currentTarget.style.borderColor = 'var(--glass-border)';
        e.currentTarget.style.boxShadow = 'var(--glass-shadow)';
      }}
    >
      {/* Event Cover Image */}
      <div style={{ width: '100%', height: '180px', overflow: 'hidden', position: 'relative' }}>
        <img 
          src={image_url || '/assets/events/default_event.png'} 
          alt={title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.5s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        />
        <div style={{ position: 'absolute', top: '16px', left: '16px' }}>
          <span className={getTagClass(category)}>{category}</span>
        </div>
      </div>

      {/* Card Content */}
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
        <div>
          <h3 style={{
            fontSize: '20px',
            marginBottom: '10px',
            lineHeight: '1.3',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            color: 'var(--text-primary)'
          }}>
            {title}
          </h3>
          <p style={{
            fontSize: '13px',
            color: 'var(--text-secondary)',
            marginBottom: '20px',
            lineHeight: '1.5',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}>
            {description}
          </p>
        </div>

        <div>
          {/* Metadata Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            marginBottom: '20px',
            fontSize: '13px',
            color: 'var(--text-muted)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={14} className="gradient-text-primary" style={{ stroke: 'var(--accent)' }} />
              <span>{formatDate(date)}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={14} style={{ stroke: 'var(--accent)' }} />
              <span>{time}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', gridColumn: 'span 2' }}>
              <MapPin size={14} style={{ stroke: 'var(--accent)', flexShrink: 0 }} />
              <span style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>{location}</span>
            </div>
          </div>

          {/* Seat Capacity Bar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}>
                <Users size={12} />
                <span>{seatsFilled} / {capacity} Registered</span>
              </span>
              <span style={{
                fontWeight: 600,
                color: seatsLeft === 0 ? 'var(--danger)' : seatsLeft < 10 ? 'var(--warning)' : 'var(--success)'
              }}>
                {seatsLeft === 0 ? 'Sold Out' : `${seatsLeft} left`}
              </span>
            </div>
            <div style={{
              width: '100%',
              height: '6px',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '3px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${fillPercentage}%`,
                height: '100%',
                background: 'linear-gradient(90deg, var(--primary) 0%, var(--accent) 100%)',
                borderRadius: '3px',
                transition: 'width 0.4s ease'
              }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
