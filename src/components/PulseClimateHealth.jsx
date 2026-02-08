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

    // Toggle series visibility
    const toggleSeries = (series) => {
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
                return { status: 'Normal', color: '#10b981' };
            case 'ppfd':
                if (value > 1000) return { status: 'Alto', color: '#fbbf24' };
                if (value === 0) return { status: 'Noche', color: '#6366f1' };
                return { status: 'Activo', color: '#10b981' };
            default:
                return { status: '', color: '#94a3b8' };
        }
    };

    // Custom Tooltip for Master Chart
    const MasterTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length > 0) {
            const dataPoint = evolutionData.find(d => d.time === label);
            if (!dataPoint) return null;

            return (
                <div className="master-tooltip">
                    <p className="tooltip-time">{label}</p>
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
                            <span className="metric-icon">🌬️</span>
                            <span className="metric-label">CO2:</span>
                            <span className="metric-value">{dataPoint.co2} ppm</span>
                            <span className="metric-status" style={{ color: getMetricStatus('co2', dataPoint.co2).color }}>
                                {getMetricStatus('co2', dataPoint.co2).status}
                            </span>
                        </div>
                        <div className="metric-row">
                            <span className="metric-icon">💡</span>
                            <span className="metric-label">PPFD:</span>
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

            {/* 3. MASTER ENVIRONMENT CHART */}
            <div className="master-environment-chart">
                <div className="section-header">
                    <h3>Master Environment (24h) - {selectedDate}</h3>
                    <div className="series-toggles">
                        <button
                            className={`toggle-btn ${visibleSeries.temp ? 'active temp' : ''}`}
                            onClick={() => toggleSeries('temp')}
                        >
                            {visibleSeries.temp ? '☑' : '☐'} Temp
                        </button>
                        <button
                            className={`toggle-btn ${visibleSeries.humidity ? 'active humidity' : ''}`}
                            onClick={() => toggleSeries('humidity')}
                        >
                            {visibleSeries.humidity ? '☑' : '☐'} Humedad
                        </button>
                        <button
                            className={`toggle-btn ${visibleSeries.vpd ? 'active vpd' : ''}`}
                            onClick={() => toggleSeries('vpd')}
                        >
                            {visibleSeries.vpd ? '☑' : '☐'} VPD
                        </button>
                        <button
                            className={`toggle-btn ${visibleSeries.co2 ? 'active co2' : ''}`}
                            onClick={() => toggleSeries('co2')}
                        >
                            {visibleSeries.co2 ? '☑' : '☐'} CO2
                        </button>
                        <button
                            className={`toggle-btn ${visibleSeries.ppfd ? 'active ppfd' : ''}`}
                            onClick={() => toggleSeries('ppfd')}
                        >
                            {visibleSeries.ppfd ? '☑' : '☐'} PPFD
                        </button>
                    </div>
                </div>

                <div className="master-chart-container">
                    <ResponsiveContainer width="100%" height={450}>
                        <LineChart data={evolutionData} margin={{ top: 20, right: 70, left: 20, bottom: 20 }}>
                            <defs>
                                <linearGradient id="ppfdGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />

                            {/* Alert Zones */}
                            {visibleSeries.humidity && (
                                <ReferenceArea
                                    yAxisId="left"
                                    y1={60}
                                    y2={100}
                                    fill="#ef4444"
                                    fillOpacity={0.1}
                                    label={{ value: 'Riesgo Botrytis', position: 'insideTopRight', fill: '#ef4444', fontSize: 11 }}
                                />
                            )}

                            {visibleSeries.temp && (
                                <ReferenceArea
                                    yAxisId="left"
                                    y1={29}
                                    y2={35}
                                    fill="#ef4444"
                                    fillOpacity={0.08}
                                    label={{ value: 'Pérdida Terpenos', position: 'insideTopLeft', fill: '#ef4444', fontSize: 11 }}
                                />
                            )}

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

                            <Tooltip content={<MasterTooltip />} />

                            {/* PPFD Area (Background) */}
                            {visibleSeries.ppfd && (
                                <Area
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="ppfd"
                                    stroke="#fbbf24"
                                    fill="url(#ppfdGradient)"
                                    strokeWidth={2}
                                    strokeDasharray="5 5"
                                    name="PPFD (µmol)"
                                />
                            )}

                            {/* CO2 Line */}
                            {visibleSeries.co2 && (
                                <Line
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="co2"
                                    stroke="#94a3b8"
                                    strokeWidth={2}
                                    dot={false}
                                    name="CO2 (ppm)"
                                />
                            )}

                            {/* Temperature Line */}
                            {visibleSeries.temp && (
                                <Line
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="temp"
                                    stroke="#f59e0b"
                                    strokeWidth={3}
                                    dot={false}
                                    name="Temp (°C)"
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
                                />
                            )}

                            {/* VPD Line */}
                            {visibleSeries.vpd && (
                                <Line
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="vpd"
                                    stroke="#10b981"
                                    strokeWidth={3}
                                    dot={false}
                                    name="VPD (kPa)"
                                />
                            )}
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-insight">
                    <AlertCircle size={16} className="insight-icon" />
                    <p>
                        <strong>Zonas de Alerta Activas:</strong> El gráfico muestra áreas sombreadas para condiciones de riesgo.
                        Humedad &gt;60% aumenta riesgo de Botrytis. Temperatura &gt;29°C causa pérdida de terpenos.
                        Usa los toggles para comparar métricas y detectar correlaciones.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PulseClimateHealth;
