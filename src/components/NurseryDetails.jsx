import React, { useState, useMemo } from 'react';
import {
    ArrowLeft, Leaf, AlertTriangle, CheckCircle, Clock,
    Wind, Droplets, Trash2, Plus, TrendingUp, X
} from 'lucide-react';
import { genetics } from '../data/mockData';
import { nurseryDomes, nurseryLossLog } from '../data/nurseryData';
import './NurseryDetails.css';

const NurseryDetails = ({ navigateTo }) => {
    const [showLossForm, setShowLossForm] = useState(false);
    const [lossForm, setLossForm] = useState({
        geneticsId: '',
        quantity: 1,
        reason: 'stem_rot'
    });
    const [lossHistory, setLossHistory] = useState(nurseryLossLog);

    // Inventory Summary
    const inventorySummary = useMemo(() => {
        const totalAlive = nurseryDomes.reduce((sum, dome) => sum + dome.currentCount, 0);
        const totalInitial = nurseryDomes.reduce((sum, dome) => sum + dome.initialCount, 0);
        const weeklyLosses = lossHistory.filter(log => {
            const logDate = new Date(log.date);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return logDate >= weekAgo;
        }).reduce((sum, log) => sum + log.quantity, 0);

        const successRate = totalInitial > 0
            ? Math.round(((totalInitial - weeklyLosses) / totalInitial) * 100)
            : 100;

        return { totalAlive, totalInitial, weeklyLosses, successRate };
    }, [lossHistory]);

    // Dome stage calculation
    const getDomeStage = (dome) => {
        const { daysInNursery } = dome;
        if (daysInNursery <= 5) {
            return { stage: 1, name: 'Humedad Alta', progress: (daysInNursery / 5) * 100, color: '#4cc9f0' };
        } else if (daysInNursery <= 10) {
            return { stage: 2, name: 'Aclimatación/Vents', progress: ((daysInNursery - 5) / 5) * 100, color: '#00ff9d' };
        } else if (daysInNursery <= 14) {
            return { stage: 3, name: 'Hardening', progress: ((daysInNursery - 10) / 4) * 100, color: '#ffb703' };
        } else {
            return { stage: 4, name: 'RETRASO', progress: 100, color: '#ff3333', isDelayed: true };
        }
    };

    // Handle loss form submission
    const handleLossSubmit = (e) => {
        e.preventDefault();
        if (!lossForm.geneticsId || lossForm.quantity < 1) return;

        const newLoss = {
            id: `LOSS-${Date.now()}`,
            geneticsId: lossForm.geneticsId,
            quantity: parseInt(lossForm.quantity),
            reason: lossForm.reason,
            date: new Date().toISOString().split('T')[0]
        };

        setLossHistory([newLoss, ...lossHistory]);
        setLossForm({ geneticsId: '', quantity: 1, reason: 'stem_rot' });
        setShowLossForm(false);
    };

    const getReasonLabel = (reason) => {
        const reasons = {
            stem_rot: 'Tallo Podrido',
            dried: 'Seco',
            mold: 'Hongos',
            weak: 'Débil',
            other: 'Otro'
        };
        return reasons[reason] || reason;
    };

    const getGeneticName = (geneticsId) => {
        return genetics.find(g => g.id === geneticsId)?.name || 'Desconocida';
    };

    return (
        <div className="nursery-details">
            {/* Header */}
            <header className="detail-header">
                <button className="back-btn" onClick={() => navigateTo('vege-pipeline')}>
                    <ArrowLeft size={20} />
                    <span>Pipeline</span>
                </button>
                <div className="header-info">
                    <h2 className="detail-title">
                        <span className="emoji-lg">🌱</span>
                        Nursery - Gestión de Domos
                    </h2>
                    <p className="detail-subtitle">Control de Propagación y Aclimatación</p>
                </div>
            </header>

            {/* Inventory Summary Banner */}
            <div className="inventory-banner">
                <div className="inv-stat main">
                    <Leaf size={24} />
                    <div className="stat-content">
                        <span className="stat-value">{inventorySummary.totalAlive}</span>
                        <span className="stat-label">Esquejes Vivos</span>
                    </div>
                </div>
                <div className="inv-divider" />
                <div className="inv-stat">
                    <TrendingUp size={20} />
                    <div className="stat-content">
                        <span className={`stat-value ${inventorySummary.successRate >= 90 ? 'success' : 'warning'}`}>
                            {inventorySummary.successRate}%
                        </span>
                        <span className="stat-label">Tasa Éxito Semanal</span>
                    </div>
                </div>
                <div className="inv-divider" />
                <div className="inv-stat">
                    <Trash2 size={20} />
                    <div className="stat-content">
                        <span className="stat-value loss">{inventorySummary.weeklyLosses}</span>
                        <span className="stat-label">Bajas (7 días)</span>
                    </div>
                </div>
            </div>

            <div className="nursery-content">
                {/* Main: Dome Manager */}
                <section className="dome-manager">
                    <h3 className="section-title">
                        <span>Domos Activos</span>
                        <span className="dome-count">{nurseryDomes.length} bandejas</span>
                    </h3>

                    <div className="domes-grid">
                        {nurseryDomes.map(dome => {
                            const stageInfo = getDomeStage(dome);
                            const genetic = genetics.find(g => g.id === dome.geneticsId);

                            return (
                                <div
                                    key={dome.id}
                                    className={`dome-card ${stageInfo.isDelayed ? 'delayed' : ''}`}
                                >
                                    <div className="dome-header">
                                        <div className="dome-name">
                                            <span
                                                className="genetic-dot"
                                                style={{ backgroundColor: genetic?.color || '#666' }}
                                            />
                                            <span>{dome.name}</span>
                                        </div>
                                        <div className="dome-day">
                                            <Clock size={14} />
                                            Día {dome.daysInNursery}
                                        </div>
                                    </div>

                                    <div className="dome-count-display">
                                        <span className="count-current">{dome.currentCount}</span>
                                        <span className="count-separator">/</span>
                                        <span className="count-initial">{dome.initialCount}</span>
                                        <span className="count-label">esquejes</span>
                                    </div>

                                    <div className="dome-genetic">
                                        {genetic?.name || 'Sin Asignar'}
                                    </div>

                                    {/* Stage Progress Bar */}
                                    <div className="stage-progress-container">
                                        <div className="stage-labels">
                                            <span className={stageInfo.stage >= 1 ? 'active' : ''}>
                                                <Droplets size={12} /> Alta Hum.
                                            </span>
                                            <span className={stageInfo.stage >= 2 ? 'active' : ''}>
                                                <Wind size={12} /> Vents
                                            </span>
                                            <span className={stageInfo.stage >= 3 ? 'active' : ''}>
                                                <CheckCircle size={12} /> Hardening
                                            </span>
                                        </div>
                                        <div className="stage-track">
                                            <div
                                                className="stage-fill"
                                                style={{
                                                    width: `${Math.min(100, (dome.daysInNursery / 14) * 100)}%`,
                                                    backgroundColor: stageInfo.color
                                                }}
                                            />
                                            <div className="stage-markers">
                                                <div className="marker" style={{ left: '35.7%' }} />
                                                <div className="marker" style={{ left: '71.4%' }} />
                                            </div>
                                        </div>
                                        <div className="stage-current">
                                            <span
                                                className="stage-badge"
                                                style={{ borderColor: stageInfo.color, color: stageInfo.color }}
                                            >
                                                {stageInfo.name}
                                            </span>
                                        </div>
                                    </div>

                                    {stageInfo.isDelayed && (
                                        <div className="delay-alert">
                                            <AlertTriangle size={14} />
                                            <span>Retraso: {dome.daysInNursery - 14} días extra</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Side Panel: Loss Registration */}
                <aside className="loss-panel">
                    <div className="panel-header">
                        <h4>Registro de Bajas</h4>
                        <button
                            className="add-loss-btn"
                            onClick={() => setShowLossForm(!showLossForm)}
                        >
                            {showLossForm ? <X size={18} /> : <Plus size={18} />}
                        </button>
                    </div>

                    {showLossForm && (
                        <form className="loss-form" onSubmit={handleLossSubmit}>
                            <div className="form-group">
                                <label>Cepa</label>
                                <select
                                    value={lossForm.geneticsId}
                                    onChange={(e) => setLossForm({ ...lossForm, geneticsId: e.target.value })}
                                    required
                                >
                                    <option value="">Seleccionar...</option>
                                    {genetics.map(g => (
                                        <option key={g.id} value={g.id}>{g.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Cantidad</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={lossForm.quantity}
                                    onChange={(e) => setLossForm({ ...lossForm, quantity: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Motivo</label>
                                <select
                                    value={lossForm.reason}
                                    onChange={(e) => setLossForm({ ...lossForm, reason: e.target.value })}
                                >
                                    <option value="stem_rot">Tallo Podrido</option>
                                    <option value="dried">Seco</option>
                                    <option value="mold">Hongos</option>
                                    <option value="weak">Débil</option>
                                    <option value="other">Otro</option>
                                </select>
                            </div>
                            <button type="submit" className="submit-btn">
                                Registrar Baja
                            </button>
                        </form>
                    )}

                    <div className="loss-history">
                        {lossHistory.length === 0 ? (
                            <p className="empty-state">Sin bajas registradas</p>
                        ) : (
                            lossHistory.slice(0, 10).map(log => (
                                <div key={log.id} className="loss-entry">
                                    <div className="loss-info">
                                        <span className="loss-genetic">{getGeneticName(log.geneticsId)}</span>
                                        <span className="loss-reason">{getReasonLabel(log.reason)}</span>
                                    </div>
                                    <div className="loss-meta">
                                        <span className="loss-qty">-{log.quantity}</span>
                                        <span className="loss-date">{log.date}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default NurseryDetails;
