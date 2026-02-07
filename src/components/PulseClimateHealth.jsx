import React from 'react';
import { Thermometer, Droplets, Activity, Wind, Sun, Moon, AlertCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, ReferenceLine } from 'recharts';
import { pulseRealTime, pulseDayNightTemp, pulseVPDHistory, pulseCO2Cycle } from '../data/mockData';
import './PulseClimateHealth.css';

const PulseClimateHealth = ({ roomId }) => {
    const realTime = pulseRealTime[roomId] || pulseRealTime.R2;
    const dayNightData = pulseDayNightTemp[roomId] || pulseDayNightTemp.R2;
    const vpdHistory = pulseVPDHistory[roomId] || pulseVPDHistory.R2;
    const co2Data = pulseCO2Cycle[roomId] || pulseCO2Cycle.R2;

    // Calculate DIF logic
    const lastDayData = dayNightData[dayNightData.length - 1];
    const dif = lastDayData.tempDay - lastDayData.tempNight;

    let difStatus = 'neutral';
    let difMessage = 'Crecimiento Neutro';
    let difIcon = '◎';

    if (dif < -5) {
        difStatus = 'purple-boost';
        difMessage = '❄️ PURPLE BOOST / RESINA';
        difIcon = '❄️';
    } else if (dif > 0) {
        difStatus = 'stretch-alert';
        difMessage = '⚠ ALERTA ESTIRAMIENTO';
        difIcon = '⚠';
    }

    // VPD Status
    const vpdInRange = realTime.vpd >= 1.2 && realTime.vpd <= 1.5;

    // CO2 Alert
    const co2Low = realTime.co2 < 350;

    // Current light status (based on PPFD)
    const isLightOn = realTime.ppfd > 0;

    return (
        <div className="pulse-climate-health">
            {/* PULSE STATUS INDICATOR */}
            <div className="pulse-status-indicator">
                <div className={`pulse-dot ${realTime.status === 'ONLINE' ? 'online' : 'offline'}`}></div>
                <span>Pulse Pro: {realTime.status}</span>
            </div>

            {/* 1. HEADER: PULSE REAL-TIME STRIP */}
            <div className="pulse-realtime-strip">
                <div className="kpi-card-pulse">
                    <Thermometer className="kpi-icon" size={24} />
                    <div className="kpi-content">
                        <div className="kpi-value">{realTime.temp}°C</div>
                        <div className="kpi-subtitle">Max ayer: {realTime.tempMaxYesterday}°C</div>
                    </div>
                </div>

                <div className="kpi-card-pulse">
                    <Droplets className={`kpi-icon ${realTime.humidity >= 45 && realTime.humidity <= 60 ? 'status-ok' : 'status-alert'}`} size={24} />
                    <div className="kpi-content">
                        <div className="kpi-value">{realTime.humidity}%</div>
                        <div className="kpi-subtitle">Humedad</div>
                    </div>
                </div>

                <div className="kpi-card-pulse vpd-critical">
                    <Activity className={`kpi-icon ${vpdInRange ? 'status-optimal' : ''}`} size={24} />
                    <div className="kpi-content">
                        <div className={`kpi-value ${vpdInRange ? 'vpd-optimal' : ''}`}>{realTime.vpd} kPa</div>
                        <div className="kpi-subtitle">VPD (Pulse)</div>
                    </div>
                </div>

                <div className="kpi-card-pulse">
                    <Wind className={`kpi-icon ${co2Low ? 'status-alert' : ''}`} size={24} />
                    <div className="kpi-content">
                        <div className="kpi-value">{realTime.co2} ppm</div>
                        <div className="kpi-subtitle">
                            {co2Low ? '⚠ Aire Viciado' : 'CO2 Ambiente'}
                        </div>
                    </div>
                </div>

                <div className="kpi-card-pulse">
                    {isLightOn ? <Sun className="kpi-icon light-on" size={24} /> : <Moon className="kpi-icon light-off" size={24} />}
                    <div className="kpi-content">
                        <div className="kpi-value">{realTime.ppfd} µmol</div>
                        <div className="kpi-subtitle">PPFD {isLightOn ? '(Día)' : '(Noche)'}</div>
                    </div>
                </div>
            </div>

            {/* 2. MORFOLOGÍA & ESTRÉS (DIF) */}
            <div className="dif-morphology-section">
                <div className="section-header">
                    <h3>Morfología & Estrés (DIF)</h3>
                    <span className={`dif-badge ${difStatus}`}>{difMessage}</span>
                </div>

                <div className="dif-chart-container">
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={dayNightData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                            <XAxis dataKey="day" stroke="#888" />
                            <YAxis stroke="#888" domain={[15, 30]} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #444', borderRadius: '8px' }}
                                labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                            />
                            <Bar dataKey="tempDay" fill="#f59e0b" name="Temp Día" radius={[8, 8, 0, 0]} />
                            <Bar dataKey="tempNight" fill="#6366f1" name="Temp Noche" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="dif-explanation">
                    <div className="dif-info-card">
                        <span className="dif-label">DIF Actual:</span>
                        <span className={`dif-value ${difStatus}`}>{dif > 0 ? '+' : ''}{dif.toFixed(1)}°C</span>
                    </div>
                    <div className="dif-guide">
                        <div className="guide-item">
                            <span className="guide-icon purple">❄️</span>
                            <span>DIF &lt; -5°C: Purple Boost / Resina</span>
                        </div>
                        <div className="guide-item">
                            <span className="guide-icon neutral">◎</span>
                            <span>DIF ≈ 0°C: Crecimiento Neutro</span>
                        </div>
                        <div className="guide-item">
                            <span className="guide-icon alert">⚠</span>
                            <span>DIF &gt; 0°C: Alerta Estiramiento</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. CALIDAD DE AIRE & VENTILACIÓN */}
            <div className="air-quality-grid">
                {/* LEFT: VPD Time-in-Zone */}
                <div className="vpd-zone-section">
                    <div className="section-header">
                        <h3>Calidad VPD (Time-in-Zone)</h3>
                    </div>

                    <div className="vpd-zone-chart">
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={vpdHistory} margin={{ top: 20, right: 10, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                <XAxis dataKey="day" stroke="#888" />
                                <YAxis stroke="#888" domain={[0, 2]} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #444', borderRadius: '8px' }}
                                    labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                                />
                                <Bar dataKey="vpd" name="VPD (kPa)" radius={[8, 8, 0, 0]}>
                                    {vpdHistory.map((entry, index) => {
                                        let fillColor = '#10b981'; // Green (optimal)
                                        if (entry.zone === 'stress') {
                                            if (entry.vpd < 1.0 || entry.vpd > 1.8) {
                                                fillColor = '#ef4444'; // Red (danger)
                                            } else {
                                                fillColor = '#f59e0b'; // Yellow (stress)
                                            }
                                        }
                                        return <Bar key={index} dataKey="vpd" fill={fillColor} />;
                                    })}
                                </Bar>
                                <ReferenceLine y={1.0} stroke="#10b981" strokeDasharray="3 3" strokeOpacity={0.5} />
                                <ReferenceLine y={1.5} stroke="#10b981" strokeDasharray="3 3" strokeOpacity={0.5} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="vpd-legend">
                        <div className="legend-item">
                            <span className="legend-dot green"></span>
                            <span>Óptimo (1.0-1.5 kPa)</span>
                        </div>
                        <div className="legend-item">
                            <span className="legend-dot yellow"></span>
                            <span>Estrés Leve (0.8-1.0 / 1.5-1.8)</span>
                        </div>
                        <div className="legend-item">
                            <span className="legend-dot red"></span>
                            <span>Peligro (&lt;0.8 / &gt;1.8)</span>
                        </div>
                    </div>
                </div>

                {/* RIGHT: CO2 Respiratory Monitor */}
                <div className="co2-monitor-section">
                    <div className="section-header">
                        <h3>Ciclo de Carbono (Natural)</h3>
                    </div>

                    <div className="co2-chart">
                        <ResponsiveContainer width="100%" height={280}>
                            <AreaChart data={co2Data} margin={{ top: 20, right: 10, left: 10, bottom: 5 }}>
                                <defs>
                                    <linearGradient id="colorCO2" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis dataKey="time" stroke="#888" />
                                <YAxis stroke="#888" domain={[300, 450]} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #444', borderRadius: '8px' }}
                                    labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                                />
                                <ReferenceLine y={400} stroke="#64748b" strokeDasharray="5 5" label={{ value: 'Nivel Exterior (400ppm)', position: 'right', fill: '#64748b', fontSize: 11 }} />
                                <Area type="monotone" dataKey="co2" stroke="#94a3b8" fill="url(#colorCO2)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="co2-insight">
                        <AlertCircle size={16} className="insight-icon" />
                        <p>Si el gráfico cae muy por debajo de 400ppm durante el día, la extracción es insuficiente (las plantas consumen todo el CO2 disponible).</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PulseClimateHealth;
