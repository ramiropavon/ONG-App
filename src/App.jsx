import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import Sidebar from './components/Sidebar';
import RoomDetail from './components/RoomDetail';
import Inventory from './components/Inventory';
import Planner from './components/Planner';
import './index.css';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedRoomId, setSelectedRoomId] = useState(null);

  const navigateTo = (view, roomId = null) => {
    setCurrentView(view);
    if (roomId) setSelectedRoomId(roomId);
  };

  return (
    <div className="app-container">
      <Sidebar currentView={currentView} navigateTo={navigateTo} />
      <main className="main-content">
        {currentView === 'dashboard' && <Dashboard navigateTo={navigateTo} />}
        {currentView === 'room' && <RoomDetail roomId={selectedRoomId} />}
        {currentView === 'inventory' && <Inventory />}
        {currentView === 'planner' && <Planner />}
      </main>
    </div>
  );
}

export default App;
