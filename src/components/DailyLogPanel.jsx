import React, { useState, useEffect } from 'react';
import { X, Save, Wifi, Edit3, CheckCircle, Clock } from 'lucide-react';
import { getTodayLog, saveDailyLog, createEmptyLog, initSeedLogs, getRecentLogs } from '../data/dailyLogData';
import { pulseRealTime } from '../data/mockData';
import './DailyLogPanel.css';

const DailyLogPanel = ({ isOpen, onClose, room }) => {
    const [log, setLog] = useState(null);
    const [saved, setSaved] = useState(false);
    const [recentLogs, setRecentLogs] = useState([]);

    useEffect(() => {
        initSeedLogs();
    }, []);

    useEffect(() => {
        if (isOpen && room) {
            // Load today's log or create empty
            const existing = getTodayLog(room.id);
            if (existing) {
                setLog(existing);
            } else {
                const empty = createEmptyLog(room.id, room.cycleId, getDayOfFlora(room));
                // Pre-fill auto values from Pulse Pro
                const pulse = pulseRealTime[room.id];
                if (pulse) {
                    empty.auto = {
                        vpd: pulse.vpd,
                        temp: pulse.temp,
                        humidity: pulse.humidity,
                        ppfd: pulse.ppfd,
                    };
                }
                setLog(empty);
            }
            setRecentLogs(getRecentLogs(room.id, 5));
            setSaved(false);
        }
    }, [isOpen, room]);

    const getDayOfFlora = (room) => {
        if (!room.floraStartDate) return 0;
        const diff = new Date() - new Date(room.floraStartDate);
        return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
    };

    const handleManualChange = (field, value) => {
        setLog(prev => ({
            ...prev,
            manual: { ...prev.manual, [field]: value }
        }));
        setSaved(false);
    };

    const handleSave = () => {
        if (!log) return;
        saveDailyLog(log);
        setSaved(true);
        setRecentLogs(getRecentLogs(room.id, 5));
        setTimeout(() => setSaved(false), 2000);
    };

    if (!isOpen || !log) return null;

    const dayOfFlora = getDayOfFlora(room);
    const todayStr = new Date().toLocaleDateString('es-AR', {
        weekday: 'long', day: 'numeric', month: 'long'
    });

    return (
        <>
            <div className="daily-log-overlay" onClick={onClose} />
            <div className={`daily-log-panel ${isOpen ? 'open' : ''}`}>
                <div className="dlp-header">
                    <div className="dlp-header-info">
                        <h3>📝 Registro Diario</h3>
                        <span className="dlp-date">{todayStr}</span>
                        <div className="dlp-room-info">
                            <span className="dlp-room-name">{room.name}</span>
                            <span className="dlp-day-badge">Día {dayOfFlora} de Flora</span>
                        </div>
                    </div>
                    <button className="dlp-close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="dlp-body">
                    {/* AUTO VALUES (from Pulse Pro) */}
                    <div className="dlp-section">
                        <div className="dlp-section-header">
                            <Wifi size={16} className="dlp-icon-auto" />
                            <h4>Datos Automáticos <span className="dlp-source">Pulse Pro</span></h4>
                        </div>
                        <div className="dlp-auto-grid">
                            <div className="dlp-auto-item">
                                <span className="dlp-auto-label">VPD</span>
                                <span className="dlp-auto-value">{log.auto.vpd || '—'}</span>
                            </div>
                            <div className="dlp-auto-item">
                                <span className="dlp-auto-label">Temp</span>
                                <span className="dlp-auto-value">{log.auto.temp || '—'}°C</span>
                            </div>
                            <div className="dlp-auto-item">
                                <span className="dlp-auto-label">Humedad</span>
                                <span className="dlp-auto-value">{log.auto.humidity || '—'}%</span>
                            </div>
                            <div className="dlp-auto-item">
                                <span className="dlp-auto-label">PPFD</span>
                                <span className="dlp-auto-value">{log.auto.ppfd || '—'}</span>
                            </div>
                        </div>
                    </div>

                    {/* MANUAL VALUES */}
                    <div className="dlp-section">
                        <div className="dlp-section-header">
                            <Edit3 size={16} className="dlp-icon-manual" />
                            <h4>Datos Manuales</h4>
                        </div>

                        <div className="dlp-manual-grid">
                            <div className="dlp-input-group">
                                <label>EC Entrada</label>
                                <div className="dlp-input-wrap">
                                    <input
                                        type="number"
                                        step="0.1"
                                        placeholder="2.8"
                                        value={log.manual.ecInput}
                                        onChange={(e) => handleManualChange('ecInput', e.target.value)}
                                    />
                                    <span className="dlp-unit">mS/cm</span>
                                </div>
                            </div>

                            <div className="dlp-input-group">
                                <label>EC Salida</label>
                                <div className="dlp-input-wrap">
                                    <input
                                        type="number"
                                        step="0.1"
                                        placeholder="3.5"
                                        value={log.manual.ecOutput}
                                        onChange={(e) => handleManualChange('ecOutput', e.target.value)}
                                    />
                                    <span className="dlp-unit">mS/cm</span>
                                </div>
                            </div>

                            <div className="dlp-input-group">
                                <label>pH Entrada</label>
                                <div className="dlp-input-wrap">
                                    <input
                                        type="number"
                                        step="0.1"
                                        placeholder="5.8"
                                        value={log.manual.phInput}
                                        onChange={(e) => handleManualChange('phInput', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="dlp-input-group">
                                <label>pH Salida</label>
                                <div className="dlp-input-wrap">
                                    <input
                                        type="number"
                                        step="0.1"
                                        placeholder="6.1"
                                        value={log.manual.phOutput}
                                        onChange={(e) => handleManualChange('phOutput', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="dlp-input-group">
                                <label>Temp. Agua</label>
                                <div className="dlp-input-wrap">
                                    <input
                                        type="number"
                                        step="0.5"
                                        placeholder="21"
                                        value={log.manual.waterTemp}
                                        onChange={(e) => handleManualChange('waterTemp', e.target.value)}
                                    />
                                    <span className="dlp-unit">°C</span>
                                </div>
                            </div>

                            <div className="dlp-input-group">
                                <label>Dryback</label>
                                <div className="dlp-input-wrap">
                                    <input
                                        type="number"
                                        step="1"
                                        placeholder="28"
                                        value={log.manual.drybackPct}
                                        onChange={(e) => handleManualChange('drybackPct', e.target.value)}
                                    />
                                    <span className="dlp-unit">%</span>
                                </div>
                            </div>
                        </div>

                        <div className="dlp-notes-group">
                            <label>Notas / Observaciones</label>
                            <textarea
                                placeholder="Ej: Stacking saludable, planta comiendo bien..."
                                value={log.manual.notes}
                                onChange={(e) => handleManualChange('notes', e.target.value)}
                                rows={2}
                            />
                        </div>
                    </div>

                    {/* RECENT HISTORY */}
                    {recentLogs.length > 0 && (
                        <div className="dlp-section">
                            <div className="dlp-section-header">
                                <Clock size={16} className="dlp-icon-history" />
                                <h4>Últimos Registros</h4>
                            </div>
                            <div className="dlp-history-list">
                                {recentLogs.map((entry, idx) => (
                                    <div key={idx} className="dlp-history-item">
                                        <span className="dlp-h-date">{entry.date}</span>
                                        <span className="dlp-h-metric">EC {entry.manual.ecInput}→{entry.manual.ecOutput}</span>
                                        <span className="dlp-h-metric">pH {entry.manual.phInput}→{entry.manual.phOutput}</span>
                                        {entry.manual.notes && <span className="dlp-h-note">{entry.manual.notes}</span>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="dlp-footer">
                    <button
                        className={`dlp-save-btn ${saved ? 'saved' : ''}`}
                        onClick={handleSave}
                    >
                        {saved ? (
                            <><CheckCircle size={18} /> Guardado ✓</>
                        ) : (
                            <><Save size={18} /> Guardar Registro</>
                        )}
                    </button>
                </div>
            </div>
        </>
    );
};

export default DailyLogPanel;
