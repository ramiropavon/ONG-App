import React from 'react';
import { LayoutDashboard, Sprout, ClipboardList, Package, Droplets, Activity, GitBranch, Menu, X, Settings as SettingsIcon } from 'lucide-react';
import './Sidebar.css';
import './SidebarMobile.css';
import { rooms } from '../data/mockData';

const Sidebar = ({ currentView, navigateTo, isOpen, toggleSidebar }) => {
    // Separate Vege room from Flora rooms
    const vegeRoom = rooms.find(r => r.type === 'Vege');
    const floraRooms = rooms.filter(r => r.type === 'Flora');

    return (
        <>
            {/* Mobile Toggle Button (Fixed on screen) */}
            <button className="mobile-menu-btn" onClick={toggleSidebar}>
                <Menu size={24} color="var(--accent-primary)" />
            </button>

            {/* Overlay for mobile */}
            <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={toggleSidebar}></div>

            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <Activity className="logo-icon" size={24} />
                    <h1 className="app-title">TEMPLO <span className="highlight">VERDE</span></h1>
                    <button className="close-sidebar-btn" onClick={toggleSidebar}>
                        <X size={20} />
                    </button>
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
                        {/* Vege Pipeline - Special Navigation */}
                        {vegeRoom && (
                            <button
                                className={`nav-item ${currentView === 'vege-pipeline' || currentView.startsWith('vege-') ? 'active' : ''}`}
                                onClick={() => navigateTo('vege-pipeline')}
                            >
                                <GitBranch size={20} color="var(--accent-secondary)" />
                                <span>{vegeRoom.name}</span>
                                <span className="nav-badge">Pipeline</span>
                            </button>
                        )}
                        {/* Flora Rooms */}
                        {floraRooms.map(room => (
                            <button
                                key={room.id}
                                className={`nav-item ${currentView === 'room' ? '' : ''}`}
                                onClick={() => navigateTo('room', room.id)}
                            >
                                <Sprout size={20} color="var(--accent-primary)" />
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
                        <button
                            className={`nav-item ${currentView === 'settings' ? 'active' : ''}`}
                            onClick={() => navigateTo('settings')}
                        >
                            <SettingsIcon size={20} />
                            <span>Configuración</span>
                        </button>
                    </div>
                </nav>

                <div className="user-status">
                    <div className="status-indicator online"></div>
                    <span>Operator: <strong>Admin</strong></span>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;

