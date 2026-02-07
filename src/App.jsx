import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import Sidebar from './components/Sidebar';
import RoomDetail from './components/RoomDetail';
import Inventory from './components/Inventory';
import Planner from './components/Planner';
import VegePipeline from './components/VegePipeline';
import NurseryDetails from './components/NurseryDetails';
import VegeDetails from './components/VegeDetails';
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
        {currentView === 'vege-pipeline' && <VegePipeline navigateTo={navigateTo} />}
        {currentView === 'vege-nursery-details' && <NurseryDetails navigateTo={navigateTo} />}
        {currentView === 'vege-vege-details' && <VegeDetails navigateTo={navigateTo} />}
        {/* Pre-Vege Details - Coming Soon */}
        {currentView === 'vege-pre-vege-details' && (
          <div className="stage-detail-placeholder">
            <h2>🌿 Pre-Vege Details</h2>
            <p>Vista de endurecimiento en desarrollo...</p>
            <button onClick={() => navigateTo('vege-pipeline')}>← Volver al Pipeline</button>
          </div>
        )}
        {currentView === 'inventory' && <Inventory />}
        {currentView === 'planner' && <Planner />}
      </main>
    </div>
  );
}

export default App;

