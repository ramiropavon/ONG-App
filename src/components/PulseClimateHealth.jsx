import React, { useState } from 'react';
import { Thermometer, Droplets, Activity, Wind, Sun, Moon, AlertCircle, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, LineChart, Line, ReferenceArea, ReferenceLine } from 'recharts';
import { pulseRealTime, pulseDayNightTemp, pulseDetailedEvolution } from '../data/mockData';
import './PulseClimateHealth.css';

const PulseClimateHealth = ({ roomId }) => {
    const [selectedDate, setSelectedDate] = useState('2026-02-07');
    const [visibleSeries, setVisibleSeries] = useState({
        temp: true,
        humidity: false,
        vpd: true,
        co2: false,
        ppfd: false
    });

    const realTime = pulseRealTime[roomId] || pulseRealTime.R2;
    const dayNightData = pulseDayNightTemp[roomId] || pulseDayNightTemp.R2;
    const evolutionData = pulseDetailedEvolution[roomId] || pulseDetailedEvolution.R2;

    // Light schedule (8:00 - 20:00 = Day)
    const lightOnHour = 8;
    const lightOffHour = 20;

    // Calculate DIF logic
    const lastDayData = dayNightData[dayNightData.length - 1];
    const dif = lastDayData.tempDay - lastDayData.tempNight;

    let difStatus = 'neutral';
    let difMessage = 'Crecimiento Neutro';

    if (dif < -5) {
        difStatus = 'purple-boost';
        difMessage = '❄️ PURPLE BOOST / RESINA';
    } else if (dif > 0) {
        difStatus = 'stretch-alert';
        difMessage = '⚠ ALERTA ESTIRAMIENTO';
    }

    // VPD Status
    const vpdInRange = realTime.vpd >= 1.2 && realTime.vpd <= 1.5;

    // CO2 Alert
    const co2Low = realTime.co2 < 350;

    // Current light status (based on PPFD)
    const isLightOn = realTime.ppfd > 0;

    // Toggle series visibility (max 3 at a time)
    const toggleSeries = (series) => {
        const currentlyActive = Object.values(visibleSeries).filter(v => v).length;
        const isCurrentlyVisible = visibleSeries[series];

        // If trying to activate and already have 3 active, don't allow
        if (!isCurrentlyVisible && currentlyActive >= 3) {
            return;
        }

        setVisibleSeries(prev => ({
            ...prev,
            [series]: !prev[series]
        }));
    };

    // Get status for each metric
    const getMetricStatus = (metric, value) => {
        switch (metric) {
            case 'temp':
                if (value > 29) return { status: '⚠️ Alto', color: '#ef4444' };
                if (value < 18) return { status: '⚠️ Bajo', color: '#3b82f6' };
                return { status: 'En Rango', color: '#10b981' };
            case 'humidity':
                if (value > 60) return { status: '⚠️ Alto', color: '#ef4444' };
                if (value < 40) return { status: '⚠️ Bajo', color: '#f59e0b' };
                return { status: 'En Rango', color: '#10b981' };
            case 'vpd':
                if (value >= 1.0 && value <= 1.5) return { status: 'Óptimo', color: '#10b981' };
                if (value < 0.8 || value > 1.8) return { status: '⚠️ Peligro', color: '#ef4444' };
                return { status: 'Aceptable', color: '#f59e0b' };
            case 'co2':
                if (value < 350) return { status: '⚠️ Bajo', color: '#ef4444' };
                if (value > 1500) return { status: '⚠️ Alto', color: '#ef4444' };
                return { status: 'Normal', color: '#10b981' };
            case 'ppfd':
                if (value > 1000) return { status: 'Alto', color: '#fbbf24' };
                if (value === 0) return { status: 'Noche', color: '#6366f1' };
                return { status: 'Activo', color: '#10b981' };
            default:
                return { status: '', color: '#94a3b8' };
        }
    };

    // Enhanced Tooltip showing ALL metrics
    const CorrelationTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length > 0) {
            const dataPoint = evolutionData.find(d => d.time === label);
            if (!dataPoint) return null;

            const hour = parseInt(label.split(':')[0]);
            const isDayTime = hour >= lightOnHour && hour < lightOffHour;

            return (
                <div className="correlation-tooltip">
                    <div className="tooltip-header">
                        <span className="tooltip-time">{label}</span>
                        <span className={`tooltip-period ${isDayTime ? 'day' : 'night'}`}>
                            {isDayTime ? '☀️ Día' : '🌙 Noche'}
                        </span>
                    </div>
                    <div className="tooltip-metrics">
                        <div className="metric-row">
                            <span className="metric-icon">🌡️</span>
                            <span className="metric-label">Temp:</span>
                            <span className="metric-value">{dataPoint.temp}°C</span>
                            <span className="metric-status" style={{ color: getMetricStatus('temp', dataPoint.temp).color }}>
                                {getMetricStatus('temp', dataPoint.temp).status}
                            </span>
                        </div>
                        <div className="metric-row">
                            <span className="metric-icon">💧</span>
                            <span className="metric-label">Hum:</span>
                            <span className="metric-value">{dataPoint.humidity}%</span>
                            <span className="metric-status" style={{ color: getMetricStatus('humidity', dataPoint.humidity).color }}>
                                {getMetricStatus('humidity', dataPoint.humidity).status}
                            </span>
                        </div>
                        <div className="metric-row">
                            <span className="metric-icon">🌫️</span>
                            <span className="metric-label">VPD:</span>
                            <span className="metric-value">{dataPoint.vpd} kPa</span>
                            <span className="metric-status" style={{ color: getMetricStatus('vpd', dataPoint.vpd).color }}>
                                {getMetricStatus('vpd', dataPoint.vpd).status}
                            </span>
                        </div>
                        <div className="metric-row">
                            <span className="metric-icon">☁️</span>
                            <span className="metric-label">CO2:</span>
                            <span className="metric-value">{dataPoint.co2} ppm</span>
                            <span className="metric-status" style={{ color: getMetricStatus('co2', dataPoint.co2).color }}>
                                {getMetricStatus('co2', dataPoint.co2).status}
                            </span>
                        </div>
                        <div className="metric-row">
                            <span className="metric-icon">💡</span>
                            <span className="metric-label">Luz:</span>
                            <span className="metric-value">{dataPoint.ppfd} µmol</span>
                            <span className="metric-status" style={{ color: getMetricStatus('ppfd', dataPoint.ppfd).color }}>
                                {getMetricStatus('ppfd', dataPoint.ppfd).status}
                            </span>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    // Check if any metric exceeds critical thresholds
    const hasHighCO2 = evolutionData.some(d => d.co2 > 1500);
    const hasHighTemp = evolutionData.some(d => d.temp > 29);
    const hasHighHumidity = evolutionData.some(d => d.humidity > 60);

    const activeCount = Object.values(visibleSeries).filter(v => v).length;

    return (
        <div className="pulse-climate-health">
            {/* PULSE STATUS & DATE FILTER */}
            <div className="pulse-header-controls">
                <div className="pulse-status-indicator">
                    <div className={`pulse-dot ${realTime.status === 'ONLINE' ? 'online' : 'offline'}`}></div>
                    <span>Pulse Pro: {realTime.status}</span>
                </div>

                <div className="date-filter">
                    <Calendar size={16} className="calendar-icon" />
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="date-input"
                    />
                </div>
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
                        <div className="kpi-subtitle">PPFD</div>
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

            {/* 3. MASTER CORRELATION CHART */}
            <div className="correlation-chart-container">
                <div className="section-header">
                    <h3>Diagnóstico Ambiental (24h) - {selectedDate}</h3>
                    <div className="metric-selector">
                        <button
                            className={`metric-pill ${visibleSeries.temp ? 'active temp' : ''}`}
                            onClick={() => toggleSeries('temp')}
                        >
                            🌡️ Temp
                        </button>
                        <button
                            className={`metric-pill ${visibleSeries.humidity ? 'active humidity' : ''}`}
                            onClick={() => toggleSeries('humidity')}
                        >
                            💧 Humedad
                        </button>
                        <button
                            className={`metric-pill ${visibleSeries.vpd ? 'active vpd' : ''}`}
                            onClick={() => toggleSeries('vpd')}
                        >
                            🌫️ VPD
                        </button>
                        <button
                            className={`metric-pill ${visibleSeries.ppfd ? 'active ppfd' : ''}`}
                            onClick={() => toggleSeries('ppfd')}
                        >
                            💡 PPFD
                        </button>
                        <button
                            className={`metric-pill ${visibleSeries.co2 ? 'active co2' : ''}`}
                            onClick={() => toggleSeries('co2')}
                        >
                            ☁️ CO2
                        </button>
                    </div>
                </div>

                {activeCount < 3 && (
                    <div className="selection-hint">
                        <AlertCircle size={14} />
                        <span>Selecciona hasta 3 métricas para correlacionar ({activeCount}/3)</span>
                    </div>
                )}

                {/* Day/Night Legend */}
                <div className="day-night-legend">
                    <div className="legend-item-cycle">
                        <div className="legend-box day"></div>
                        <span>☀️ Día (08:00 - 20:00)</span>
                    </div>
                    <div className="legend-item-cycle">
                        <div className="legend-box night"></div>
                        <span>🌙 Noche (20:00 - 08:00)</span>
                    </div>
                </div>

                <div className="correlation-chart">
                    <ResponsiveContainer width="100%" height={450}>
                        <LineChart data={evolutionData} margin={{ top: 20, right: 70, left: 20, bottom: 20 }}>
                            <defs>
                                <linearGradient id="ppfdGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#facc15" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="#facc15" stopOpacity={0} />
                                </linearGradient>
                            </defs>

                            {/* Day/Night Background Zones - Enhanced Visibility */}
                            <ReferenceArea
                                x1="00:00"
                                x2="08:00"
                                fill="#1e3a8a"
                                fillOpacity={0.25}
                            />
                            <ReferenceArea
                                x1="08:00"
                                x2="20:00"
                                fill="#fbbf24"
                                fillOpacity={0.15}
                            />
                            <ReferenceArea
                                x1="20:00"
                                x2="23:00"
                                fill="#1e3a8a"
                                fillOpacity={0.25}
                            />

                            {/* Critical Threshold Lines */}
                            {visibleSeries.co2 && hasHighCO2 && (
                                <ReferenceLine
                                    y={1500}
                                    yAxisId="right"
                                    stroke="#ef4444"
                                    strokeDasharray="5 5"
                                    strokeWidth={2}
                                    label={{ value: 'CO2 Crítico (1500ppm)', position: 'right', fill: '#ef4444', fontSize: 10 }}
                                />
                            )}

                            {visibleSeries.temp && hasHighTemp && (
                                <ReferenceLine
                                    y={29}
                                    yAxisId="left"
                                    stroke="#ef4444"
                                    strokeDasharray="5 5"
                                    strokeWidth={2}
                                    label={{ value: 'Temp Crítica (29°C)', position: 'left', fill: '#ef4444', fontSize: 10 }}
                                />
                            )}

                            {visibleSeries.humidity && hasHighHumidity && (
                                <ReferenceLine
                                    y={60}
                                    yAxisId="left"
                                    stroke="#ef4444"
                                    strokeDasharray="5 5"
                                    strokeWidth={2}
                                    label={{ value: 'Hum Crítica (60%)', position: 'left', fill: '#ef4444', fontSize: 10 }}
                                />
                            )}

                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />

                            <XAxis
                                dataKey="time"
                                stroke="#888"
                                tick={{ fontSize: 11 }}
                                interval={2}
                            />

                            <YAxis
                                yAxisId="left"
                                stroke="#888"
                                domain={[0, 100]}
                                label={{ value: 'Temp (°C) / Hum (%) / VPD (kPa)', angle: -90, position: 'insideLeft', style: { fill: '#888', fontSize: 11 } }}
                            />

                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                stroke="#888"
                                domain={[0, 1500]}
                                label={{ value: 'CO2 (ppm) / PPFD (µmol)', angle: 90, position: 'insideRight', style: { fill: '#888', fontSize: 11 } }}
                            />

                            <Tooltip content={<CorrelationTooltip />} />

                            {/* PPFD Area (Background) */}
                            {visibleSeries.ppfd && (
                                <Area
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="ppfd"
                                    stroke="#facc15"
                                    fill="url(#ppfdGradient)"
                                    strokeWidth={2}
                                    name="Luz/PAR (µmol)"
                                    animationDuration={800}
                                />
                            )}

                            {/* CO2 Line */}
                            {visibleSeries.co2 && (
                                <Line
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="co2"
                                    stroke="#e5e7eb"
                                    strokeWidth={2.5}
                                    dot={false}
                                    name="CO2 (ppm)"
                                    animationDuration={800}
                                />
                            )}

                            {/* Temperature Line */}
                            {visibleSeries.temp && (
                                <Line
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="temp"
                                    stroke="#f97316"
                                    strokeWidth={3}
                                    dot={false}
                                    name="Temp (°C)"
                                    animationDuration={800}
                                />
                            )}

                            {/* Humidity Line */}
                            {visibleSeries.humidity && (
                                <Line
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="humidity"
                                    stroke="#3b82f6"
                                    strokeWidth={3}
                                    dot={false}
                                    name="Humedad (%)"
                                    animationDuration={800}
                                />
                            )}

                            {/* VPD Line */}
                            {visibleSeries.vpd && (
                                <Line
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="vpd"
                                    stroke="#4ade80"
                                    strokeWidth={3}
                                    dot={false}
                                    name="VPD (kPa)"
                                    animationDuration={800}
                                />
                            )}
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-insight">
                    <AlertCircle size={16} className="insight-icon" />
                    <p>
                        <strong>Correlación Inteligente:</strong> Las zonas sombreadas indican ciclos de luz (☀️ Día: amarillo / 🌙 Noche: azul).
                        Las líneas rojas punteadas marcan umbrales críticos. El tooltip muestra TODAS las métricas en cada punto temporal para facilitar el análisis de correlaciones.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PulseClimateHealth;
