import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Leaf, Sun, Moon, RotateCcw, Save, CheckCircle, History, ChevronDown, ChevronUp } from 'lucide-react';
import { rooms, genetics } from '../../data/mockData';
import { getActiveCycle, getArchivedCycles, startNewCycle, initSeedCycles, getDaysInCycle } from '../../data/roomCycleData';

const RoomConfig = () => {
    const [selectedRoomId, setSelectedRoomId] = useState(null);
    const [roomConfigs, setRoomConfigs] = useState({});
    const [saved, setSaved] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);
    const [resetForm, setResetForm] = useState({ genetics: '', startDate: '', notes: '' });
    const [showArchive, setShowArchive] = useState(false);

    const floraRooms = rooms.filter(r => r.type === 'Flora');

    useEffect(() => {
        initSeedCycles();

        // Load saved configs or use defaults from mockData
        const savedConfigs = localStorage.getItem('roomConfigs');
        if (savedConfigs) {
            setRoomConfigs(JSON.parse(savedConfigs));
        } else {
            const defaults = {};
            floraRooms.forEach(room => {
                defaults[room.id] = {
                    lightsOnTime: room.lightsOnTime || '06:00',
                    lightsOffTime: room.lightsOffTime || '18:00',
                    floraStartDate: room.floraStartDate || '',
                    activeGenetics: room.activeGenetics || [],
                    targetVpd: room.vpd || 1.2,
                    targetPpfd: room.ppfd || 900,
                    targetTemp: room.temp || 25,
                    targetEcInput: room.strategy?.inputEC || 2.5,
                    targetEcOutput: room.rootZone?.runoffEC || 3.5,
                };
            });
            setRoomConfigs(defaults);
        }

        if (floraRooms.length > 0) {
            setSelectedRoomId(floraRooms[0].id);
        }
    }, []);

    const selectedRoom = floraRooms.find(r => r.id === selectedRoomId);
    const config = roomConfigs[selectedRoomId] || {};
    const activeCycle = selectedRoomId ? getActiveCycle(selectedRoomId) : null;
    const archivedCycles = selectedRoomId ? getArchivedCycles(selectedRoomId) : [];

    const handleConfigChange = (field, value) => {
        const updated = {
            ...roomConfigs,
            [selectedRoomId]: {
                ...roomConfigs[selectedRoomId],
                [field]: value
            }
        };
        setRoomConfigs(updated);
        setSaved(false);
    };

    const handleSave = () => {
        localStorage.setItem('roomConfigs', JSON.stringify(roomConfigs));
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleReset = () => {
        if (!resetForm.genetics || !resetForm.startDate) return;

        const newCycle = startNewCycle(selectedRoomId, {
            genetics: [resetForm.genetics],
            startDate: resetForm.startDate,
            notes: resetForm.notes,
        });

        // Update room config
        handleConfigChange('floraStartDate', resetForm.startDate);
        handleConfigChange('activeGenetics', [resetForm.genetics]);

        // Save immediately
        const updatedConfigs = {
            ...roomConfigs,
            [selectedRoomId]: {
                ...roomConfigs[selectedRoomId],
                floraStartDate: resetForm.startDate,
                activeGenetics: [resetForm.genetics],
            }
        };
        setRoomConfigs(updatedConfigs);
        localStorage.setItem('roomConfigs', JSON.stringify(updatedConfigs));

        setShowResetModal(false);
        setResetForm({ genetics: '', startDate: '', notes: '' });
    };

    const getPhotoperiod = () => {
        const on = config.lightsOnTime || '06:00';
        const off = config.lightsOffTime || '18:00';
        const [hOn, mOn] = on.split(':').map(Number);
        const [hOff, mOff] = off.split(':').map(Number);
        let hours = hOff - hOn + (mOff - mOn) / 60;
        if (hours < 0) hours += 24;
        return hours;
    };

    if (!selectedRoom) return null;

    return (
        <div className="room-config-container">
            {/* Room Selector */}
            <div className="rc-room-selector">
                {floraRooms.map(room => (
                    <button
                        key={room.id}
                        className={`rc-room-btn ${selectedRoomId === room.id ? 'active' : ''}`}
                        onClick={() => { setSelectedRoomId(room.id); setSaved(false); }}
                    >
                        <Leaf size={16} />
                        {room.name}
                    </button>
                ))}
            </div>

            {/* Active Cycle Banner */}
            {activeCycle && (
                <div className="rc-cycle-banner">
                    <div className="rc-cycle-info">
                        <span className="rc-cycle-label">Ciclo Activo</span>
                        <span className="rc-cycle-genetics">{activeCycle.genetics?.join(', ')}</span>
                        <span className="rc-cycle-days">
                            Día {getDaysInCycle(activeCycle.startDate)} — Inicio: {activeCycle.startDate}
                        </span>
                    </div>
                    <button
                        className="rc-reset-btn"
                        onClick={() => setShowResetModal(true)}
                    >
                        <RotateCcw size={16} />
                        Resetear Sala
                    </button>
                </div>
            )}

            <div className="rc-sections">
                {/* LIGHT SCHEDULE */}
                <div className="rc-section">
                    <h3 className="rc-section-title">
                        <Sun size={18} className="rc-icon-light" />
                        Horario de Luces
                    </h3>
                    <div className="rc-fields-row">
                        <div className="rc-field">
                            <label><Sun size={14} /> Encendido</label>
                            <input
                                type="time"
                                value={config.lightsOnTime || '06:00'}
                                onChange={(e) => handleConfigChange('lightsOnTime', e.target.value)}
                            />
                        </div>
                        <div className="rc-field">
                            <label><Moon size={14} /> Apagado</label>
                            <input
                                type="time"
                                value={config.lightsOffTime || '18:00'}
                                onChange={(e) => handleConfigChange('lightsOffTime', e.target.value)}
                            />
                        </div>
                        <div className="rc-field rc-computed">
                            <label>Fotoperíodo</label>
                            <span className="rc-computed-value">{getPhotoperiod()}h luz / {24 - getPhotoperiod()}h oscuridad</span>
                        </div>
                    </div>
                </div>

                {/* CYCLE INFO */}
                <div className="rc-section">
                    <h3 className="rc-section-title">
                        <Calendar size={18} className="rc-icon-cal" />
                        Ciclo de Cultivo
                    </h3>
                    <div className="rc-fields-row">
                        <div className="rc-field">
                            <label>Inicio de Flora</label>
                            <input
                                type="date"
                                value={config.floraStartDate || ''}
                                onChange={(e) => handleConfigChange('floraStartDate', e.target.value)}
                            />
                        </div>
                        <div className="rc-field">
                            <label>Genéticas Activas</label>
                            <input
                                type="text"
                                placeholder="Ej: Avocado, Sangría"
                                value={(config.activeGenetics || []).join(', ')}
                                onChange={(e) => handleConfigChange('activeGenetics', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                            />
                        </div>
                    </div>
                </div>



                {/* ARCHIVED CYCLES */}
                {archivedCycles.length > 0 && (
                    <div className="rc-section rc-archive-section">
                        <button
                            className="rc-archive-toggle"
                            onClick={() => setShowArchive(!showArchive)}
                        >
                            <History size={18} className="rc-icon-archive" />
                            <span>Ciclos Anteriores ({archivedCycles.length})</span>
                            {showArchive ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                        {showArchive && (
                            <div className="rc-archive-list">
                                {archivedCycles.map((cycle, idx) => (
                                    <div key={idx} className="rc-archive-item">
                                        <div className="rc-archive-genetics">{cycle.genetics?.join(', ')}</div>
                                        <div className="rc-archive-dates">
                                            {cycle.startDate} → {cycle.endDate || 'En curso'}
                                        </div>
                                        {cycle.notes && <div className="rc-archive-notes">{cycle.notes}</div>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Save Button */}
            <div className="rc-footer">
                <button
                    className={`rc-save-btn ${saved ? 'saved' : ''}`}
                    onClick={handleSave}
                >
                    {saved ? (
                        <><CheckCircle size={18} /> Guardado ✓</>
                    ) : (
                        <><Save size={18} /> Guardar Configuración</>
                    )}
                </button>
            </div>

            {/* Reset Modal */}
            {showResetModal && (
                <>
                    <div className="rc-modal-overlay" onClick={() => setShowResetModal(false)} />
                    <div className="rc-modal">
                        <h3>🔄 Resetear Sala — {selectedRoom.name}</h3>
                        <p className="rc-modal-desc">
                            Se archivará el ciclo actual y se iniciará uno nuevo. Los datos históricos no se pierden.
                        </p>
                        <div className="rc-modal-fields">
                            <div className="rc-field">
                                <label>Nueva Genética</label>
                                <input
                                    type="text"
                                    placeholder="Ej: Gelato #41"
                                    value={resetForm.genetics}
                                    onChange={(e) => setResetForm({ ...resetForm, genetics: e.target.value })}
                                />
                            </div>
                            <div className="rc-field">
                                <label>Fecha Inicio Flora</label>
                                <input
                                    type="date"
                                    value={resetForm.startDate}
                                    onChange={(e) => setResetForm({ ...resetForm, startDate: e.target.value })}
                                />
                            </div>
                            <div className="rc-field">
                                <label>Notas (opcional)</label>
                                <textarea
                                    placeholder="Ej: Segundo corrida de Gelato..."
                                    value={resetForm.notes}
                                    onChange={(e) => setResetForm({ ...resetForm, notes: e.target.value })}
                                    rows={2}
                                />
                            </div>
                        </div>
                        <div className="rc-modal-actions">
                            <button className="rc-btn-cancel" onClick={() => setShowResetModal(false)}>
                                Cancelar
                            </button>
                            <button
                                className="rc-btn-confirm"
                                onClick={handleReset}
                                disabled={!resetForm.genetics || !resetForm.startDate}
                            >
                                <RotateCcw size={16} />
                                Confirmar Reset
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default RoomConfig;
