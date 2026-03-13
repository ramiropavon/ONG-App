import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Plus, Save, Trash2, Edit3, ChevronDown, ChevronRight, Leaf, Sliders } from 'lucide-react';
import './Settings.css';
import { getInitialProfiles } from '../../data/mockCropProfiles';
import CropProfileForm from './CropProfileForm';
import RoomConfig from './RoomConfig';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('profiles');
    const [profiles, setProfiles] = useState([]);
    const [selectedProfileId, setSelectedProfileId] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editingPhaseId, setEditingPhaseId] = useState(null);

    useEffect(() => {
        const loaded = getInitialProfiles();
        setProfiles(loaded);
        if (loaded.length > 0) {
            setSelectedProfileId(loaded[0].id);
        }
    }, []);

    const handleSaveProfile = (updatedProfile) => {
        const newProfiles = profiles.map(p =>
            p.id === updatedProfile.id ? updatedProfile : p
        );
        // If it's a new profile
        if (!profiles.find(p => p.id === updatedProfile.id)) {
            newProfiles.push(updatedProfile);
        }

        setProfiles(newProfiles);
        localStorage.setItem('cropProfiles', JSON.stringify(newProfiles));
        setIsEditing(false);
        setEditingPhaseId(null);
    };

    const handleAddNew = () => {
        const newProfile = {
            id: `profile-${Date.now()}`,
            name: 'Nueva Receta',
            description: '',
            floraTotalWeeks: 8,
            phases: []
        };
        setProfiles([...profiles, newProfile]);
        setSelectedProfileId(newProfile.id);
        setIsEditing(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('¿Seguro que quieres eliminar esta receta?')) {
            const newProfiles = profiles.filter(p => p.id !== id);
            setProfiles(newProfiles);
            localStorage.setItem('cropProfiles', JSON.stringify(newProfiles));
            if (selectedProfileId === id) {
                setSelectedProfileId(newProfiles.length > 0 ? newProfiles[0].id : null);
                setIsEditing(false);
            }
        }
    };

    const handleEditPhase = (phaseId) => {
        setEditingPhaseId(phaseId);
        setIsEditing(true);
    };

    const selectedProfile = profiles.find(p => p.id === selectedProfileId);

    return (
        <div className="settings-container animate-fade-in">
            <header className="settings-header">
                <div>
                    <h1 className="page-title"><SettingsIcon size={28} className="title-icon" /> Configuración</h1>
                    <p className="page-subtitle">Gestiona tus perfiles de cultivo y la configuración de cada sala.</p>
                </div>
            </header>

            {/* Main Tabs */}
            <div className="settings-tabs">
                <button
                    className={`settings-tab ${activeTab === 'profiles' ? 'active' : ''}`}
                    onClick={() => setActiveTab('profiles')}
                >
                    <Sliders size={16} />
                    Perfiles de Cultivo
                </button>
                <button
                    className={`settings-tab ${activeTab === 'rooms' ? 'active' : ''}`}
                    onClick={() => setActiveTab('rooms')}
                >
                    <Leaf size={16} />
                    Configuración de Salas
                </button>
            </div>

            {/* TAB: Crop Profiles */}
            {activeTab === 'profiles' && (
                <div className="settings-content">
                    <aside className="profiles-sidebar">
                        <div className="sidebar-header-row">
                            <h2 className="sidebar-title">Tus Recetas</h2>
                            <button className="btn-primary-sm" onClick={handleAddNew}>
                                <Plus size={16} /> Nueva
                            </button>
                        </div>
                        <ul className="profiles-list">
                            {profiles.map(profile => (
                                <li
                                    key={profile.id}
                                    className={`profile-item ${selectedProfileId === profile.id ? 'active' : ''}`}
                                    onClick={() => {
                                        setSelectedProfileId(profile.id);
                                        setIsEditing(false);
                                        setEditingPhaseId(null);
                                    }}
                                >
                                    <div className="profile-item-info">
                                        <span className="profile-item-name">{profile.name}</span>
                                        <span className="profile-item-phases">{profile.phases?.length || 0} Fases · {profile.floraTotalWeeks || '?'} sem flora</span>
                                    </div>
                                    <ChevronRight size={18} color="var(--text-tertiary)" />
                                </li>
                            ))}
                        </ul>
                    </aside>

                    <main className="profile-editor">
                        {selectedProfile ? (
                            isEditing ? (
                                <CropProfileForm
                                    profile={selectedProfile}
                                    onSave={handleSaveProfile}
                                    onCancel={() => { setIsEditing(false); setEditingPhaseId(null); }}
                                    initialExpandedPhaseId={editingPhaseId}
                                />
                            ) : (
                                <div className="profile-view">
                                    <div className="profile-view-header">
                                        <div>
                                            <h2>{selectedProfile.name}</h2>
                                            <p>{selectedProfile.description}</p>
                                            {selectedProfile.floraTotalWeeks && (
                                                <span className="flora-weeks-badge">
                                                    🌸 {selectedProfile.floraTotalWeeks} semanas de flora
                                                </span>
                                            )}
                                        </div>
                                        <div className="profile-actions">
                                            <button className="btn-secondary" onClick={() => setIsEditing(true)}>
                                                <Edit3 size={16} /> Editar
                                            </button>
                                            <button className="btn-danger-outline" onClick={() => handleDelete(selectedProfile.id)}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="phases-list-preview">
                                        <h3>Fases Configuradas ({selectedProfile.phases?.length})</h3>
                                        {selectedProfile.phases && selectedProfile.phases.length > 0 ? (
                                            <div className="phases-grid">
                                                {selectedProfile.phases.map((phase, idx) => (
                                                    <div key={idx} className="phase-card">
                                                        <div className="phase-card-header">
                                                            <div className="phase-card-header-left">
                                                                <span className={`phase-badge phase-${phase.stage.toLowerCase()}`}>
                                                                    {phase.stage.toUpperCase()}
                                                                </span>
                                                                <h4>{phase.name}</h4>
                                                            </div>
                                                            <button
                                                                className="phase-card-edit-btn"
                                                                onClick={() => handleEditPhase(phase.id)}
                                                                title="Editar esta fase"
                                                            >
                                                                <Edit3 size={14} />
                                                            </button>
                                                        </div>
                                                        <div className="phase-card-body">
                                                            {phase.stage === 'flora' && phase.startWeek && (
                                                                <p className="phase-weeks">Semana {phase.startWeek} a {phase.endWeek}</p>
                                                            )}
                                                            <div className="phase-metrics-summary">
                                                                <div className="metric-pill">VPD: {phase.vpdTarget}</div>
                                                                <div className="metric-pill">PPFD: {phase.ppfdTarget}</div>
                                                                <div className="metric-pill">Temp. Riego: {phase.tempTarget}°C</div>
                                                                <div className="metric-pill">EC In: {phase.ecInputTarget || '-'}</div>
                                                                <div className="metric-pill">EC Out: {phase.ecOutputTarget || '-'}</div>
                                                                <div className="metric-pill ph-pill">pH In: {phase.phInputTarget || '-'}</div>
                                                                <div className="metric-pill ph-pill">pH Out: {phase.phOutputTarget || '-'}</div>
                                                            </div>
                                                            <div className="phase-strategy">
                                                                Estrategia: <strong>{phase.irrigationStrategy || 'N/A'}</strong>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="empty-state">No hay fases configuradas. Edita la receta para agregarlas.</p>
                                        )}
                                    </div>
                                </div>
                            )
                        ) : (
                            <div className="empty-selection">
                                <SettingsIcon size={48} color="var(--border-color)" />
                                <p>Selecciona o crea una receta</p>
                            </div>
                        )}
                    </main>
                </div>
            )}

            {/* TAB: Room Configuration */}
            {activeTab === 'rooms' && (
                <div className="settings-content room-config-tab">
                    <RoomConfig />
                </div>
            )}
        </div>
    );
};

export default Settings;
