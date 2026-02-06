import React from 'react';
import { LayoutDashboard, Sprout, ClipboardList, Package, Droplets, Activity } from 'lucide-react';
import './Sidebar.css';
import { rooms } from '../data/mockData';

const Sidebar = ({ currentView, navigateTo }) => {
    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <Activity className="logo-icon" size={24} color="var(--accent-primary)" />
                <h1 className="app-title">TEMPLO <span className="highlight">VERDE</span></h1>
            </div>

            <nav className="nav-menu">
                <div className="nav-section">
                    <p className="nav-label">MAIN</p>
                    <button
                        className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
                        onClick={() => navigateTo('dashboard')}
                    >
                        <LayoutDashboard size={20} />
                        <span>Dashboard</span>
                    </button>
                </div>

                <div className="nav-section">
                    <p className="nav-label">SALAS</p>
                    {rooms.map(room => (
                        <button
                            key={room.id}
                            className={`nav-item ${currentView === 'room' && room.id === 'R1' /* TODO: fix logic */ ? '' : ''}`} // logic handled in parent usually, simplified here
                            onClick={() => navigateTo('room', room.id)}
                        >
                            <Sprout size={20} color={room.type === 'Vege' ? 'var(--accent-secondary)' : 'var(--accent-primary)'} />
                            <span>{room.name}</span>
                        </button>
                    ))}
                </div>

                <div className="nav-section">
                    <p className="nav-label">GESTIÓN</p>
                    <button
                        className={`nav-item ${currentView === 'inventory' ? 'active' : ''}`}
                        onClick={() => navigateTo('inventory')}
                    >
                        <Package size={20} />
                        <span>Inventario</span>
                    </button>
                    <button
                        className={`nav-item ${currentView === 'planner' ? 'active' : ''}`}
                        onClick={() => navigateTo('planner')}
                    >
                        <ClipboardList size={20} />
                        <span>Planificador</span>
                    </button>
                </div>
            </nav>

            <div className="user-status">
                <div className="status-indicator online"></div>
                <span>Operator: <strong>Admin</strong></span>
            </div>
        </aside>
    );
};

export default Sidebar;
