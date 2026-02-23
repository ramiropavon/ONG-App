import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Plus, Save, Trash2, Edit3, ChevronDown, ChevronRight } from 'lucide-react';
import './Settings.css';
import { getInitialProfiles } from '../../data/mockCropProfiles';
import CropProfileForm from './CropProfileForm';

const Settings = () => {
    const [profiles, setProfiles] = useState([]);
    const [selectedProfileId, setSelectedProfileId] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

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
    };

    const handleAddNew = () => {
        const newProfile = {
            id: `profile-${Date.now()}`,
            name: 'Nueva Receta',
            description: '',
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

    const selectedProfile = profiles.find(p => p.id === selectedProfileId);

    return (
        <div className="settings-container animate-fade-in">
            <header className="settings-header">
                <div>
                    <h1 className="page-title"><SettingsIcon size={28} className="title-icon" /> Configuración de Cultivo</h1>
                    <p className="page-subtitle">Gestiona las recetas o perfiles de cultivo ("Crop Profiles") para definir los parámetros óptimos ideales.</p>
                </div>
                <button className="btn-primary" onClick={handleAddNew}>
                    <Plus size={18} /> Nueva Receta
                </button>
            </header>

            <div className="settings-content">
                <aside className="profiles-sidebar">
                    <h2 className="sidebar-title">Tus Recetas</h2>
                    <ul className="profiles-list">
                        {profiles.map(profile => (
                            <li
                                key={profile.id}
                                className={`profile-item ${selectedProfileId === profile.id ? 'active' : ''}`}
                                onClick={() => {
                                    setSelectedProfileId(profile.id);
                                    setIsEditing(false);
                                }}
                            >
                                <div className="profile-item-info">
                                    <span className="profile-item-name">{profile.name}</span>
                                    <span className="profile-item-phases">{profile.phases?.length || 0} Fases</span>
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
                                onCancel={() => setIsEditing(false)}
                            />
                        ) : (
                            <div className="profile-view">
                                <div className="profile-view-header">
                                    <div>
                                        <h2>{selectedProfile.name}</h2>
                                        <p>{selectedProfile.description}</p>
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
                                                        <span className={`phase-badge phase-${phase.stage.toLowerCase()}`}>
                                                            {phase.stage.toUpperCase()}
                                                        </span>
                                                        <h4>{phase.name}</h4>
                                                    </div>
                                                    <div className="phase-card-body">
                                                        {phase.stage === 'flora' && phase.startWeek && (
                                                            <p className="phase-weeks">Semana {phase.startWeek} a {phase.endWeek}</p>
                                                        )}
                                                        <div className="phase-metrics-summary">
                                                            <div className="metric-pill">VPD: {phase.vpdTarget}</div>
                                                            <div className="metric-pill">PPFD: {phase.ppfdTarget}</div>
                                                            <div className="metric-pill">Temp: {phase.tempTarget}°C</div>
                                                            <div className="metric-pill">EC: {phase.ecTarget || '-'}</div>
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
        </div>
    );
};

export default Settings;
