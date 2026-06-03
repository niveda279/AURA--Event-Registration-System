import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import MyRegistrations from './pages/MyRegistrations';
import AdminDashboard from './pages/AdminDashboard';
import EventModal from './components/EventModal';
import LoginModal from './components/LoginModal';

function MainApp() {
  const { currentUser, isAuthenticated, isOrganizer } = useAuth();
  const [currentTab, setCurrentTab] = useState('home'); // home, my-registrations, admin
  
  // Modals state
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  // A refresh count trigger to reload event lists across views when edits/registrations/cancellations occur
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleOpenDetails = (event) => {
    setSelectedEvent(event);
  };

  const handleCloseDetails = () => {
    setSelectedEvent(null);
  };

  const handleRegisterSuccess = () => {
    triggerRefresh();
    // Update local selected event registered count for immediate visual response
    if (selectedEvent) {
      setSelectedEvent(prev => ({
        ...prev,
        registered_count: (prev.registered_count || 0) + 1
      }));
    }
  };

  const handleCancelSuccess = () => {
    triggerRefresh();
    if (selectedEvent) {
      setSelectedEvent(prev => ({
        ...prev,
        registered_count: Math.max(0, (prev.registered_count || 1) - 1)
      }));
    }
  };

  return (
    <div>
      {/* Navigation Header */}
      <Navbar 
        onOpenLogin={() => setShowLoginModal(true)} 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
      />

      {/* Pages Container Layout */}
      <main style={{ marginTop: '20px' }}>
        {currentTab === 'home' && (
          <Home 
            onOpenDetails={handleOpenDetails} 
            refreshTrigger={refreshTrigger} 
          />
        )}
        
        {currentTab === 'my-registrations' && isAuthenticated && !isOrganizer && (
          <MyRegistrations 
            onOpenDetails={handleOpenDetails} 
            refreshTrigger={refreshTrigger}
            onCancelSuccess={handleCancelSuccess}
          />
        )}

        {currentTab === 'admin' && isAuthenticated && isOrganizer && (
          <AdminDashboard 
            onRefreshEvents={triggerRefresh} 
          />
        )}
      </main>

      {/* Footer Branding */}
      <footer style={{
        textAlign: 'center',
        padding: '40px 20px',
        borderTop: '1px solid var(--border-color)',
        color: 'var(--text-muted)',
        fontSize: '13px',
        marginTop: '60px',
        fontFamily: 'var(--font-display)'
      }}>
        <p>&copy; 2026 AURA Event Platform. Built with Express, SQLite and React.</p>
      </footer>

      {/* Auth Modal Overlay */}
      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} />
      )}

      {/* Event Details and Ticket Checkout Modal Overlay */}
      {selectedEvent && (
        <EventModal 
          event={selectedEvent} 
          onClose={handleCloseDetails}
          onRegisterSuccess={handleRegisterSuccess}
          onCancelSuccess={handleCancelSuccess}
          onOpenLogin={() => {
            handleCloseDetails();
            setShowLoginModal(true);
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
