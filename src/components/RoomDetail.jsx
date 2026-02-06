import React, { useState } from 'react';
import { rooms, batches, tasks, genetics, sensorHistory, irrigationLogs } from '../data/mockData';
import {
    Leaf, Calendar, Lightbulb, Thermometer, Layers, Sprout,
    Droplets, Activity, Wind, Clock
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area, BarChart, Bar
} from 'recharts';
import './RoomDetail.css';

const getHarvestCountdown = (geneticsId, currentDay) => {
    const gen = genetics.find(g => g.id === geneticsId);
    if (!gen) return '?';
    return Math.max(0, gen.floweringDays - currentDay);
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

    const renderVegeLayout = () => (
        <div className="vege-layout">
            <h3 className="section-header">Estructura de Sala</h3>
            <div className="beds-grid">
                {/* Incubators */}
                {room.incubators && (
                    <div className="bed-card incubator">
                        <div className="bed-header">
                            <Sprout size={20} className="icon-incubator" />
                            <h4>{room.incubators.name}</h4>
                        </div>
                        <div className="bed-stats">
                            <span>{room.incubators.count} Incubadoras</span>
                            <span className="status-ok">Enraizando</span>
                        </div>
                    </div>
                )}
                {/* Beds */}
                {room.beds && room.beds.map(bed => {
                    const bedBatch = roomBatches.find(b => b.bedId === bed.id);
                    return (
                        <div key={bed.id} className="bed-card">
                            <div className="bed-header">
                                <Layers size={20} className={bed.type === 'Madres' ? 'icon-mother' : 'icon-clone'} />
                                <h4>{bed.name}</h4>
                                <span className="bed-type">{bed.type}</span>
                            </div>
                            <div className="bed-content">
                                {bedBatch ? (
                                    <>
                                        <div className="batch-name">{bedBatch.name}</div>
                                        <div className="batch-stats">
                                            <div className="stat">
                                                <span className="label">Plantas</span>
                                                <span className="val">{bedBatch.plantCount}</span>
                                            </div>
                                            {bedBatch.daysOld !== undefined && (
                                                <div className="stat">
                                                    <span className="label">Edad</span>
                                                    <span className="val">{bedBatch.daysOld} días</span>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <div className="empty-bed">Cama disponible</div>
                                )}
                            </div>
                            <div className="bed-footer">
                                <span>{bed.m2}m²</span>
                                {bed.type === 'Madres' && <span className="highlight">Riego: Estrategia B</span>}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    const renderOverview = () => (
        <>
            <div className="stats-grid">
                <div className="stat-card">
                    <Thermometer size={20} className="stat-icon" />
                    <div>
                        <span className="label">Temp</span>
                        <div className="value">{room.temp}°C</div>
                    </div>
                </div>
                <div className="stat-card">
                    <Droplets size={20} className="stat-icon" />
                    <div>
                        <span className="label">Humedad</span>
                        <div className="value">{room.humidity}%</div>
                    </div>
                </div>
                <div className="stat-card">
                    <Wind size={20} className="stat-icon" />
                    <div>
                        <span className="label">VPD</span>
                        <div className="value">{room.vpd}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <Lightbulb size={20} className="stat-icon" />
                    <div>
                        <span className="label">PPFD</span>
                        <div className="value">{room.ppfd || '-'}</div>
                    </div>
                </div>
            </div>

            {room.type === 'Vege' ? renderVegeLayout() : (
                <section className="section">
                    <h3>Lotes Activos</h3>
                    <div className="batches-list">
                        {roomBatches.map(batch => (
                            <div key={batch.id} className="batch-card">
                                <div className="batch-header">
                                    <h4>{batch.name}</h4>
                                    <span className="phase">{batch.phase}</span>
                                </div>
                                <div className="batch-details">
                                    <div className="detail-item">
                                        <Leaf size={16} />
                                        <span>{batch.plantCount} Plantas</span>
                                    </div>
                                    {batch.currentDay && (
                                        <div className="detail-item">
                                            <Calendar size={16} />
                                            <span>Día {batch.currentDay}</span>
                                        </div>
                                    )}
                                    {batch.phase === 'Flora' && (
                                        <div className="detail-item countdown">
                                            <span className="countdown-label">Cosecha en:</span>
                                            <strong>{getHarvestCountdown(batch.geneticsId, batch.currentDay)} días</strong>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <section className="section">
                <h3>Tareas Pendientes</h3>
                <div className="tasks-list">
                    {roomTasks.length > 0 ? roomTasks.map(task => (
                        <div key={task.id} className={`task-item ${task.status.toLowerCase()}`}>
                            <div className="task-check"></div>
                            <div className="task-info">
                                <span className="task-name">{task.task}</span>
                                <span className="task-date">{task.scheduledDate}</span>
                            </div>
                            <span className="task-status">{task.status}</span>
                        </div>
                    )) : <p className="no-data">No hay tareas pendientes.</p>}
                </div>
            </section>
        </>
    );

    const renderEnvironment = () => (
        <div className="charts-section">
            <h3>Variación 24h: Temp / Humedad / VPD</h3>
            <div className="chart-container large">
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={roomSensors}>
                        <defs>
                            <linearGradient id="colorVpd" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--accent-secondary)" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="var(--accent-secondary)" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis dataKey="time" stroke="#666" />
                        <YAxis yAxisId="left" stroke="#8884d8" orientation="left" />
                        <YAxis yAxisId="right" stroke="#82ca9d" orientation="right" />
                        <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} />
                        <Area yAxisId="right" type="monotone" dataKey="vpd" stroke="var(--accent-secondary)" fill="url(#colorVpd)" name="VPD (kPa)" />
                        <Line yAxisId="left" type="monotone" dataKey="temp" stroke="#ffc658" name="Temp (°C)" dot={false} />
                        <Line yAxisId="right" type="monotone" dataKey="humidity" stroke="#82ca9d" name="Hum (%)" dot={false} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="kpi-grid" style={{ marginTop: '20px' }}>
                <div className="kpi-card">
                    <div className="kpi-content">
                        <span className="kpi-label">VPD Promedio</span>
                        <div className="kpi-value">{room.vpd}</div>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-content">
                        <span className="kpi-label">Temp Max (24h)</span>
                        <div className="kpi-value">27.5°C</div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderFeeding = () => (
        <div className="feeding-section">
            {/* Strategy Card */}
            {room.strategy && (
                <div className="strategy-card">
                    <div className="strategy-header">
                        <Activity size={24} color="var(--accent-primary)" />
                        <div>
                            <h4>{room.strategy.name}</h4>
                            <span className="strategy-type">{room.strategy.type}</span>
                        </div>
                    </div>
                    <div className="strategy-details">
                        <div className="strategy-item">
                            <span className="label">Riegos</span>
                            <span className="val">{room.strategy.shots} disparos</span>
                        </div>
                        <div className="strategy-item">
                            <span className="label">Volumen</span>
                            <span className="val">{room.strategy.volumePerShot} ml/planta</span>
                        </div>
                        <div className="strategy-item">
                            <span className="label">Objetivos</span>
                            <span className="val">EC {room.strategy.ec} / pH {room.strategy.ph}</span>
                        </div>
                        <div className="strategy-item">
                            <span className="label">Temp Agua</span>
                            <span className="val">{room.strategy.waterTemp}°C</span>
                        </div>
                    </div>
                    <div className="shot-timeline">
                        <Clock size={16} />
                        <span>Horarios: {room.strategy.shotTimes.join(' - ')}</span>
                    </div>
                </div>
            )}

            <h3>Historial de Riego (EC In vs Out)</h3>
            <div className="chart-container large">
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={roomIrrigation}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                        <XAxis dataKey="timestamp" tickFormatter={(t) => t.split('T')[0].slice(5)} stroke="#666" />
                        <YAxis stroke="#666" domain={[0, 4]} />
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                        />
                        <Bar dataKey="ecIn" fill="var(--accent-primary)" name="EC In" barSize={30} radius={[4, 4, 0, 0]} />
                        <Bar dataKey="ecOut" fill="var(--accent-danger)" name="EC Out" barSize={30} radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );

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
                        Alimentación
                    </button>
                </div>
            </header>

            <div className="tab-content">
                {activeTab === 'resumen' && renderOverview()}
                {activeTab === 'ambiente' && renderEnvironment()}
                {activeTab === 'riego' && renderFeeding()}
            </div>
        </div>
    );
};

export default RoomDetail;
