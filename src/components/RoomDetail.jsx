import React, { useState } from 'react';
import { rooms, batches, tasks, genetics, sensorHistory, irrigationLogs } from '../data/mockData';
import {
    Leaf, Calendar, Lightbulb, Thermometer, Layers, Sprout, Zap,
    Droplets, Activity, Wind, Clock, AlertCircle
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area, BarChart, Bar
} from 'recharts';
import FloraHighPerformance from './FloraHighPerformance';
import PulseClimateHealth from './PulseClimateHealth';
import './RoomDetail.css';


const getHarvestCountdown = (geneticsId, currentDay) => {
    const gen = genetics.find(g => g.id === geneticsId);
    if (!gen) return '?';
    return Math.max(0, gen.floweringDays - currentDay);
};

const calculateDays = (dateStr) => {
    const diff = new Date() - new Date(dateStr);
    return Math.floor(diff / (1000 * 60 * 60 * 24));
};

const RoomDetail = ({ roomId }) => {
    const [activeTab, setActiveTab] = useState('resumen');

    const room = rooms.find(r => r.id === roomId);

    // Data Filters
    const roomBatches = batches.filter(b => b.roomId === roomId);
    const roomTasks = tasks.filter(t => roomBatches.some(b => b.id === t.batchId));
    const roomSensors = sensorHistory.filter(s => s.roomId === roomId);
    const roomIrrigation = irrigationLogs.filter(i => i.roomId === roomId);

    if (!room) return <div className="room-detail">Select a room</div>;

    // --- Tab Rendering Helpers ---

    const renderVegeLayout = () => {
        const pipelineBatches = batches.filter(b => b.roomId === roomId && (b.phase === 'Enraizado' || b.phase === 'Vege'));

        return (
            <div className="vege-logistics-grid">
                {/* 1. PRODUCTION_PIPELINE */}
                <div className="pipeline-widget card-dark">
                    <div className="widget-header">
                        <Activity size={18} color="var(--accent-primary)" />
                        <h4>Production Pipeline</h4>
                        <span className="badge-mode">Flujo de Lotes</span>
                    </div>
                    <div className="pipeline-list">
                        {pipelineBatches.map(batch => {
                            const isEnraizado = batch.phase === 'Enraizado';
                            const progress = isEnraizado
                                ? (batch.startDay / batch.targetDay) * 100
                                : (batch.vegetativeDay / batch.targetVegetativeDays) * 100;

                            return (
                                <div key={batch.id} className="pipeline-item">
                                    <div className="item-main">
                                        <div className="item-loc">
                                            <span className="label">{batch.location}</span>
                                            <span className="val">{batch.name}</span>
                                        </div>
                                        <div className="item-status">
                                            <span className={`status-badge ${batch.status?.toLowerCase() || 'active'}`}>
                                                {isEnraizado ? `Día ${batch.startDay}/${batch.targetDay}` : `Día ${batch.vegetativeDay}/${batch.targetVegetativeDays}`}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="progress-bar-mini">
                                        <div className="progress-fill" style={{ width: `${Math.min(100, progress)}%` }}></div>
                                    </div>
                                    {batch.destinedFor && (
                                        <div className="sync-alert-box">
                                            {(() => {
                                                const destRoom = rooms.find(r => r.id === batch.destinedFor);
                                                const harvestDate = destRoom ? new Date(destRoom.harvestDate) : null;
                                                const readyDate = new Date(batch.readyDate);
                                                const diffDays = harvestDate ? Math.floor((harvestDate - readyDate) / (1000 * 60 * 60 * 24)) : 0;

                                                return (
                                                    <div className={`sync-status ${diffDays >= 0 ? 'optimal' : 'risk'}`}>
                                                        <Clock size={12} />
                                                        <span>Sync {destRoom?.name}: {diffDays >= 0 ? `+${diffDays} Day Buffer` : `${diffDays} Day Delay`}</span>
                                                        <span className="status-label">{diffDays >= 0 ? 'OPTIMAL' : 'DELAY_RISK'}</span>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 2. MOTHER_PLANT_CARDS */}
                <div className="mothers-widget card-dark">
                    <div className="widget-header">
                        <Layers size={18} color="#e056fd" />
                        <h4>Gestión de Madres (Stock)</h4>
                    </div>
                    <div className="mothers-grid">
                        {room.mothers?.map(mother => {
                            const daysSince = calculateDays(mother.lastCutDate);
                            const recoveryPct = Math.min(100, (daysSince / mother.recoveryDaysNeeded) * 100);
                            const isReady = recoveryPct >= 100;
                            const isOld = mother.ageDays > 365;

                            return (
                                <div key={mother.id} className={`mother-card ${isOld ? 'warning-border' : ''}`}>
                                    <div className="mother-head">
                                        <span className="mother-id">{mother.id}</span>
                                        <span className={`recovery-badge ${isReady ? 'ready' : 'recovering'}`}>
                                            {isReady ? 'READY TO CUT' : `RECOVERING (${Math.round(recoveryPct)}%)`}
                                        </span>
                                    </div>
                                    <div className="mother-details">
                                        <div className="m-strain">{mother.strain}</div>
                                        <div className="m-stats">
                                            <span>Edad: {mother.ageDays}d {isOld && <AlertCircle size={10} color="#ff5252" />}</span>
                                            <span>Ø {mother.avgClonesPerCut} esquejes</span>
                                        </div>
                                    </div>
                                    <div className="recovery-track">
                                        <div className="recovery-fill" style={{ width: `${recoveryPct}%` }}></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    };

    const renderOverview = () => {
        const deltaEC = room.rootZone && room.strategy ? (room.rootZone.runoffEC - (room.strategy.inputEC || room.strategy.ec)).toFixed(2) : 0;
        const isSaltHigh = deltaEC > 1.5;
        const isAcidic = room.rootZone?.runoffPH < 5.5;

        // Mock Events based on request
        const upcomingEvents = [
            { day: "Hoy", task: "Medición Runoff Manual", type: "measurement", urgent: true },
            { day: "Mañana", task: "Poda de Bajos (Lollipopping)", type: "stress", urgent: false },
            { day: "Viernes", task: "Top Dress / Booster PK", type: "feeding", urgent: false }
        ];

        return (
            <div className="resumen-tab-content">
                {/* 1. KEY ENVIRONMENTAL KPIs (Compact) */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <Thermometer size={20} className="stat-icon" />
                        <div><span className="label">Temp</span><div className="value">{room.temp}°C</div></div>
                    </div>
                    <div className="stat-card">
                        <Droplets size={20} className="stat-icon" />
                        <div><span className="label">Hum.</span><div className="value">{room.humidity}%</div></div>
                    </div>
                    <div className="stat-card">
                        <Activity size={20} className="stat-icon" />
                        <div><span className="label">VPD</span><div className="value">{room.vpd}</div></div>
                    </div>
                    <div className="stat-card">
                        <Zap size={20} className="stat-icon" />
                        <div><span className="label">PPFD</span><div className="value">{room.ppfd || '-'}</div></div>
                    </div>
                    <div className="stat-card">
                        <Wind size={20} className="stat-icon" />
                        <div><span className="label">CO2</span><div className="value">{room.co2 || '-'} <small style={{ fontSize: '0.4em' }}>ppm</small></div></div>
                    </div>
                </div>

                <div className="resumen-main-grid">
                    {/* Logica Especial por Tipo de Sala */}
                    {room.type === 'Vege' ? (
                        <>
                            {renderVegeLayout()}
                            {/* Cronograma en columna derecha para Vege */}
                            <div className="resumen-side-col">
                                <div className="timeline-widget card-dark">
                                    <div className="widget-header">
                                        <Calendar size={18} color="#4cc9f0" />
                                        <h4>Eventos</h4>
                                    </div>
                                    <div className="timeline-list">
                                        {upcomingEvents.map((event, idx) => (
                                            <div key={idx} className={`timeline-item ${event.urgent ? 'urgent' : ''}`}>
                                                <div className="item-details">
                                                    <div className="item-day">{event.day}</div>
                                                    <div className="item-task">{event.task}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* 2. CROP_CALENDAR_TIMELINE (Flora) */}
                            <div className="timeline-widget-full card-dark">
                                <div className="widget-header">
                                    <Calendar size={18} color="#4cc9f0" />
                                    <h4>Cronograma Semanal</h4>
                                </div>
                                <div className="timeline-list">
                                    {upcomingEvents.map((event, idx) => (
                                        <div key={idx} className={`timeline-item ${event.urgent ? 'urgent' : ''}`}>
                                            <div className="timeline-marker">
                                                <div className={`item-type-dot ${event.type}`}></div>
                                                <div className="timeline-line"></div>
                                            </div>
                                            <div className="item-details">
                                                <div className="item-day">{event.day}</div>
                                                <div className="item-task">{event.task}</div>
                                            </div>
                                            {event.urgent && <span className="urgent-tag">URGENTE</span>}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 3. QUICK STATUS / BATCH INFO (Flora) */}
                            <div className="batch-quick-info card-dark">
                                <div className="widget-header">
                                    <Leaf size={18} color="var(--accent-primary)" />
                                    <h4>Estado del Lote</h4>
                                </div>
                                <div className="batch-details-grid">
                                    {roomBatches.map(batch => (
                                        <div key={batch.id} className="batch-row">
                                            <span className="batch-name">{batch.name}</span>
                                            <span className="batch-days">Día {batch.currentDay} - {genetics.find(g => g.id === batch.geneticsId)?.name}</span>
                                            <div className="batch-progress-bar">
                                                <div className="progress-fill" style={{ width: `${(batch.currentDay / (genetics.find(g => g.id === batch.geneticsId)?.floweringDays || 60)) * 100}%` }}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    };

    const renderEnvironment = () => (
        <div className="ambiente-tab-content">
            {room.type === 'Vege' ? renderVegeLayout() : (
                <PulseClimateHealth roomId={roomId} />
            )}
        </div>
    );

    const renderIrrigation = () => {
        // Use FloraHighPerformance component for Flora rooms
        if (room.type === 'Flora') {
            return (
                <div className="riego-tab-content">
                    <FloraHighPerformance />
                </div>
            );
        }

        // Fallback for Vege or other room types
        const deltaEC = room.rootZone && room.strategy ? (room.rootZone.runoffEC - (room.strategy.inputEC || room.strategy.ec)).toFixed(2) : 0;
        const isSaltHigh = deltaEC > 1.5;
        const isAcidic = room.rootZone?.runoffPH < 5.5;

        return (
            <div className="riego-tab-content">
                <div className="riego-main-grid">
                    {/* 1. IRRIGATION_STRATEGY_CARD */}
                    {room.strategy && (
                        <div className="strategy-widget card-dark">
                            <div className="widget-header">
                                <Activity size={18} color="var(--accent-primary)" />
                                <h4>Estrategia de Riego</h4>
                                <span className="badge-mode">{room.strategy.name}</span>
                            </div>
                            <div className="widget-grid">
                                <div className="metric">
                                    <span className="label">Volumen Total</span>
                                    <span className="val">{room.strategy.totalVolumeL}L/planta</span>
                                </div>
                                <div className="metric">
                                    <span className="label">Frecuencia</span>
                                    <span className="val">{room.strategy.shotCount} x {room.strategy.shotVolumeMl}ml</span>
                                </div>
                                <div className="metric">
                                    <span className="label">Mezcla (Input)</span>
                                    <span className="val">EC {room.strategy.inputEC || room.strategy.ec} | pH {room.strategy.inputPH || room.strategy.ph}</span>
                                </div>
                                <div className="metric">
                                    <span className="label">Temp. Solución</span>
                                    <span className="val">{room.strategy.waterTemp}°C</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 2. ROOT_ZONE_HEALTH_WIDGET */}
                    {room.rootZone && (
                        <div className="rootzone-widget card-dark">
                            <div className="widget-header">
                                <Sprout size={18} color="#06d6a0" />
                                <h4>Salud de Raíces (Root Zone)</h4>
                            </div>
                            <div className="rootzone-content">
                                <div className="dryback-section">
                                    <div className="dryback-header">
                                        <span>Dryback Nocturno</span>
                                        <span className="val">{room.rootZone.drybackPercent}%</span>
                                    </div>
                                    <div className="progress-bar-mini">
                                        <div className="progress-target" style={{
                                            left: `${room.rootZone.drybackTarget[0]}%`,
                                            width: `${room.rootZone.drybackTarget[1] - room.rootZone.drybackTarget[0]}%`
                                        }}></div>
                                        <div className="progress-fill-root" style={{ width: `${room.rootZone.drybackPercent}%` }}></div>
                                    </div>
                                    <span className="target-label">Objetivo: {room.rootZone.drybackTarget[0]}-{room.rootZone.drybackTarget[1]}%</span>
                                </div>

                                <div className="runoff-grid">
                                    <div className={`runoff-item ${isSaltHigh ? 'alert-text' : ''}`}>
                                        <span className="label">EC de Salida (Runoff)</span>
                                        <span className="val">{room.rootZone.runoffEC} <small>(Δ {deltaEC})</small></span>
                                    </div>
                                    <div className={`runoff-item ${isAcidic ? 'alert-text' : ''}`}>
                                        <span className="label">pH de Salida (Runoff)</span>
                                        <span className="val">{room.rootZone.runoffPH}</span>
                                    </div>
                                </div>

                                {(isSaltHigh || isAcidic) && (
                                    <div className="root-alerts">
                                        {isSaltHigh && <div className="alert-sm danger"><AlertCircle size={12} /> ALERTA: Acumulación de Sales</div>}
                                        {isAcidic && <div className="alert-sm warning"><AlertCircle size={12} /> ALERTA: Zona Radicular Acidificada</div>}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* 3. IRRIGATION HISTORY */}
                <div className="irrigation-history-detailed">
                    <h3>Historial de Nutrición (EC In vs Out)</h3>
                    <div className="chart-container large">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={roomIrrigation}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                <XAxis dataKey="timestamp" tickFormatter={(t) => t.split('T')[0].slice(5)} stroke="#666" />
                                <YAxis stroke="#666" domain={[0, 5]} />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                                />
                                <Bar dataKey="ecIn" fill="var(--accent-primary)" name="EC Entrada" barSize={35} radius={[4, 4, 0, 0]} />
                                <Bar dataKey="ecOut" fill="var(--accent-danger)" name="EC Salida" barSize={35} radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        );
    };



    return (
        <div className="room-detail">
            <header className="room-header-adv">
                <div>
                    <h2 className="room-title">{room.name}</h2>
                    <div className="room-badges">
                        <span className={`badge ${room.type.toLowerCase()}`}>{room.type}</span>
                        <span className="badge info">{room.m2} m²</span>
                    </div>
                </div>

                {/* Tabs */}
                <div className="room-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'resumen' ? 'active' : ''}`}
                        onClick={() => setActiveTab('resumen')}
                    >
                        Resumen
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'ambiente' ? 'active' : ''}`}
                        onClick={() => setActiveTab('ambiente')}
                    >
                        Ambiente
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'riego' ? 'active' : ''}`}
                        onClick={() => setActiveTab('riego')}
                    >
                        Riego y Raíces
                    </button>
                </div>
            </header>

            <div className="tab-content">
                {activeTab === 'resumen' && renderOverview()}
                {activeTab === 'ambiente' && renderEnvironment()}
                {activeTab === 'riego' && renderIrrigation()}
            </div>
        </div>
    );
};

export default RoomDetail;
