import React, { useState, useMemo } from 'react';
import { Thermometer, Droplets, Activity, Wind, Sun, Moon, AlertCircle, Calendar, Zap } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line, ReferenceArea, ReferenceLine, ComposedChart } from 'recharts';
import { pulseRealTime, pulseDayNightTemp, pulseDetailedEvolution, rooms } from '../data/mockData';
import './PulseClimateHealth.css';

const PulseClimateHealth = ({ roomId }) => {
    const [selectedDate, setSelectedDate] = useState('2026-02-07');
    const [difSelectedDay, setDifSelectedDay] = useState(6); // index, default=today (last)
    const [difViewMode, setDifViewMode] = useState('day'); // 'day' or 'week'
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
    const room = rooms.find(r => r.id === roomId);

    // Light schedule (8:00 - 20:00 = Day)
    const lightOnHour = 8;
    const lightOffHour = 20;
    const photoperiod = room?.photoperiod || 12;

    // DLI Calculation: PPFD × seconds of light / 1,000,000
    const dli = useMemo(() => {
        const ppfd = realTime.ppfd || 0;
        return ((ppfd * 3600 * photoperiod) / 1000000).toFixed(1);
    }, [realTime.ppfd, photoperiod]);

    const dliTarget = { min: 35, max: 45 }; // Flora targets
    const dliInRange = parseFloat(dli) >= dliTarget.min && parseFloat(dli) <= dliTarget.max;

    // Calculate DIF for each day + enriched data
    const difTableData = useMemo(() => {
        return dayNightData.map(d => {
            const dayDif = d.tempDay - d.tempNight;
            let status, color, icon, statusLabel;
            if (dayDif > 0) {
                status = 'stretch'; color = '#ef4444'; icon = '⚠️'; statusLabel = 'Estiramiento';
            } else if (dayDif <= -5) {
                status = 'purple'; color = '#a78bfa'; icon = '❄️'; statusLabel = 'Purple Boost';
            } else if (dayDif < 0) {
                status = 'ok'; color = '#10b981'; icon = '✅'; statusLabel = 'Óptimo';
            } else {
                status = 'neutral'; color = '#94a3b8'; icon = '◎'; statusLabel = 'Neutro';
            }
            return { ...d, dif: dayDif, status, color, icon, statusLabel };
        });
    }, [dayNightData]);

    // Selected day data for detail view
    const selectedDayData = difTableData[difSelectedDay] || difTableData[difTableData.length - 1];

    // Last day DIF for summary badge
    const lastDayData = difTableData[difTableData.length - 1];
    const dif = lastDayData.dif;

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
    const vpdInRange = realTime.vpd >= 1.0 && realTime.vpd <= 1.5;

    // CO2 Status — indoor cannabis needs 800-1200+ ppm during lights on
    const co2Target = { min: 800, max: 1200 };
    const co2Low = realTime.co2 < co2Target.min;
    const co2Status = realTime.co2 < 500 ? 'danger' : realTime.co2 < co2Target.min ? 'warning' : realTime.co2 > 1500 ? 'danger' : 'ok';

    // Temp Status
    const tempTarget = { min: 24, max: 28 };
    const tempStatus = realTime.temp >= tempTarget.min && realTime.temp <= tempTarget.max ? 'ok' : realTime.temp > 29 ? 'danger' : 'warning';

    // Humidity Status
    const humTarget = { min: 45, max: 55 };
    const humStatus = realTime.humidity >= humTarget.min && realTime.humidity <= humTarget.max ? 'ok' : realTime.humidity > 60 ? 'danger' : 'warning';

    // PPFD Status
    const ppfdTarget = { min: 800, max: 1100 };
    const ppfdInRange = realTime.ppfd >= ppfdTarget.min && realTime.ppfd <= ppfdTarget.max;

    // Current light status (based on PPFD)
    const isLightOn = realTime.ppfd > 0;

    // Weekly DIF average
    const avgDif = useMemo(() => {
        const sum = difTableData.reduce((acc, d) => acc + d.dif, 0);
        return (sum / difTableData.length).toFixed(1);
    }, [difTableData]);

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

    // DIF Tooltip for 24h chart
    const DifDayTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length > 0) {
            const point = payload[0]?.payload;
            if (!point) return null;
            return (
                <div className="dif-day-tooltip">
                    <div className="dif-day-tooltip-header">
                        <span>{label}</span>
                        <span className={point.isDay ? 'dif-tt-day' : 'dif-tt-night'}>
                            {point.isDay ? '☀️ Luces ON' : '🌙 Luces OFF'}
                        </span>
                    </div>
                    <div className="dif-day-tooltip-value">{point.temp}°C</div>
                </div>
            );
        }
        return null;
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

    // DIF gauge angle (-10 to +10 mapped to -90 to +90 degrees)
    const difGaugeAngle = useMemo(() => {
        const clampedDif = Math.max(-10, Math.min(10, selectedDayData.dif));
        return (clampedDif / 10) * 90;
    }, [selectedDayData]);

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
                <div className={`kpi-card-pulse kpi-${tempStatus}`}>
                    <Thermometer className={`kpi-icon ${tempStatus === 'ok' ? 'status-ok' : tempStatus === 'danger' ? 'status-alert' : 'status-warn'}`} size={24} />
                    <div className="kpi-content">
                        <div className="kpi-value">{realTime.temp}°C</div>
                        <div className="kpi-subtitle">Temperatura</div>
                        <div className="kpi-target">Target: {tempTarget.min}-{tempTarget.max}°C</div>
                    </div>
                </div>

                <div className={`kpi-card-pulse kpi-${humStatus}`}>
                    <Droplets className={`kpi-icon ${humStatus === 'ok' ? 'status-ok' : 'status-alert'}`} size={24} />
                    <div className="kpi-content">
                        <div className="kpi-value">{realTime.humidity}%</div>
                        <div className="kpi-subtitle">Humedad</div>
                        <div className="kpi-target">Target: {humTarget.min}-{humTarget.max}%</div>
                    </div>
                </div>

                <div className={`kpi-card-pulse kpi-${vpdInRange ? 'ok' : 'warning'}`}>
                    <Activity className={`kpi-icon ${vpdInRange ? 'status-optimal' : 'status-warn'}`} size={24} />
                    <div className="kpi-content">
                        <div className={`kpi-value ${vpdInRange ? 'vpd-optimal' : ''}`}>{realTime.vpd} kPa</div>
                        <div className="kpi-subtitle">VPD</div>
                        <div className="kpi-target">Target: 1.0-1.5 kPa</div>
                    </div>
                </div>

                <div className={`kpi-card-pulse kpi-${co2Status}`}>
                    <Wind className={`kpi-icon ${co2Status === 'ok' ? 'status-ok' : co2Status === 'danger' ? 'status-alert' : 'status-warn'}`} size={24} />
                    <div className="kpi-content">
                        <div className="kpi-value">{realTime.co2} ppm</div>
                        <div className="kpi-subtitle">
                            {co2Status === 'danger' ? '⚠ Nivel Crítico' : co2Status === 'warning' ? '⚠ Bajo para Indoor' : 'CO2 Óptimo'}
                        </div>
                        <div className="kpi-target">Target: {co2Target.min}-{co2Target.max} ppm</div>
                    </div>
                </div>

                <div className={`kpi-card-pulse kpi-${ppfdInRange ? 'ok' : 'warning'}`}>
                    {isLightOn ? <Sun className={`kpi-icon ${ppfdInRange ? 'light-on' : 'status-warn'}`} size={24} /> : <Moon className="kpi-icon light-off" size={24} />}
                    <div className="kpi-content">
                        <div className="kpi-value">{realTime.ppfd} µmol</div>
                        <div className="kpi-subtitle">PPFD</div>
                        <div className="kpi-target">Target: {ppfdTarget.min}-{ppfdTarget.max} µmol</div>
                    </div>
                </div>

                <div className={`kpi-card-pulse kpi-${dliInRange ? 'ok' : 'warning'}`}>
                    <Zap className={`kpi-icon ${dliInRange ? 'status-ok' : 'status-warn'}`} size={24} />
                    <div className="kpi-content">
                        <div className="kpi-value">{dli}</div>
                        <div className="kpi-subtitle">DLI (mol/m²/día)</div>
                        <div className="kpi-target">Target: {dliTarget.min}-{dliTarget.max}</div>
                    </div>
                </div>
            </div>

            {/* 2. DIFERENCIAL TÉRMICO (DIF) — Redesigned */}
            <div className="dif-morphology-section">
                {/* Header with view toggle */}
                <div className="section-header">
                    <h3>
                        <Thermometer size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                        Diferencial Térmico (DIF)
                    </h3>
                    <div className="dif-view-controls">
                        <button
                            className={`dif-view-btn ${difViewMode === 'day' ? 'active' : ''}`}
                            onClick={() => setDifViewMode('day')}
                        >
                            <Sun size={14} /> Vista Día
                        </button>
                        <button
                            className={`dif-view-btn ${difViewMode === 'week' ? 'active' : ''}`}
                            onClick={() => setDifViewMode('week')}
                        >
                            <Calendar size={14} /> Semana
                        </button>
                        <span className={`dif-badge ${difStatus}`}>{difMessage}</span>
                    </div>
                </div>

                {/* Day Selector Pills */}
                <div className="dif-day-selector">
                    {difTableData.map((d, idx) => {
                        const isSelected = idx === difSelectedDay;
                        const isToday = idx === difTableData.length - 1;
                        return (
                            <button
                                key={idx}
                                className={`dif-day-pill ${isSelected ? 'selected' : ''} ${isToday ? 'is-today' : ''}`}
                                onClick={() => { setDifSelectedDay(idx); setDifViewMode('day'); }}
                                style={{ '--pill-accent': d.color }}
                            >
                                <span className="dif-pill-day">{d.day}</span>
                                <span className="dif-pill-date">{d.date?.slice(5)}</span>
                                <span className="dif-pill-dif" style={{ color: d.color }}>
                                    {d.dif > 0 ? '+' : ''}{d.dif.toFixed(1)}°
                                </span>
                                <span className="dif-pill-icon">{d.icon}</span>
                            </button>
                        );
                    })}
                </div>

                {/* === DAY DETAIL VIEW === */}
                {difViewMode === 'day' && (
                    <div className="dif-day-detail">
                        {/* Top: Summary Cards */}
                        <div className="dif-summary-cards">
                            <div className="dif-summary-card dif-card-day">
                                <Sun size={20} className="dif-card-icon sun" />
                                <div className="dif-card-info">
                                    <span className="dif-card-label">Temp. Diurna</span>
                                    <span className="dif-card-value">{selectedDayData.tempDay}°C</span>
                                </div>
                                <div className="dif-card-bar-wrap">
                                    <div className="dif-card-bar" style={{ width: `${((selectedDayData.tempDay - 15) / 20) * 100}%`, background: 'linear-gradient(90deg, #f59e0b, #f97316)' }} />
                                </div>
                            </div>
                            <div className="dif-summary-card dif-card-night">
                                <Moon size={20} className="dif-card-icon moon" />
                                <div className="dif-card-info">
                                    <span className="dif-card-label">Temp. Nocturna</span>
                                    <span className="dif-card-value">{selectedDayData.tempNight}°C</span>
                                </div>
                                <div className="dif-card-bar-wrap">
                                    <div className="dif-card-bar" style={{ width: `${((selectedDayData.tempNight - 15) / 20) * 100}%`, background: 'linear-gradient(90deg, #6366f1, #818cf8)' }} />
                                </div>
                            </div>
                            <div className={`dif-summary-card dif-card-result dif-card-${selectedDayData.status}`}>
                                <Activity size={20} className="dif-card-icon" />
                                <div className="dif-card-info">
                                    <span className="dif-card-label">DIF Resultante</span>
                                    <span className="dif-card-value" style={{ color: selectedDayData.color }}>
                                        {selectedDayData.dif > 0 ? '+' : ''}{selectedDayData.dif.toFixed(1)}°C
                                    </span>
                                </div>
                                <span className="dif-card-status" style={{ color: selectedDayData.color }}>
                                    {selectedDayData.statusLabel}
                                </span>
                            </div>
                        </div>

                        {/* 24h Temperature Curve */}
                        <div className="dif-24h-chart">
                            <div className="dif-chart-title">
                                Curva térmica 24h — {selectedDayData.day} {selectedDayData.date}
                            </div>
                            <ResponsiveContainer width="100%" height={280}>
                                <AreaChart data={selectedDayData.hourly || []} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                                    <defs>
                                        <linearGradient id="tempDayGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.6} />
                                            <stop offset="95%" stopColor="#f97316" stopOpacity={0.05} />
                                        </linearGradient>
                                    </defs>

                                    {/* Night zones background */}
                                    <ReferenceArea x1="00:00" x2="08:00" fill="#1e3a8a" fillOpacity={0.2} />
                                    <ReferenceArea x1="20:00" x2="23:00" fill="#1e3a8a" fillOpacity={0.2} />
                                    <ReferenceArea x1="08:00" x2="20:00" fill="#fbbf24" fillOpacity={0.08} />

                                    {/* Day/Night temp reference lines */}
                                    <ReferenceLine y={selectedDayData.tempDay} stroke="#f97316" strokeDasharray="5 5" strokeWidth={1.5}
                                        label={{ value: `☀ ${selectedDayData.tempDay}°C`, position: 'right', fill: '#f97316', fontSize: 11 }} />
                                    <ReferenceLine y={selectedDayData.tempNight} stroke="#818cf8" strokeDasharray="5 5" strokeWidth={1.5}
                                        label={{ value: `🌙 ${selectedDayData.tempNight}°C`, position: 'right', fill: '#818cf8', fontSize: 11 }} />

                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                                    <XAxis dataKey="hour" stroke="#555" tick={{ fontSize: 11 }} interval={2} />
                                    <YAxis
                                        domain={[Math.floor(selectedDayData.tempNight - 2), Math.ceil(selectedDayData.tempDay + 2)]}
                                        stroke="#555"
                                        tick={{ fontSize: 11 }}
                                        tickFormatter={(v) => `${v}°`}
                                    />
                                    <Tooltip content={<DifDayTooltip />} />
                                    <Area
                                        type="monotone"
                                        dataKey="temp"
                                        stroke="#f97316"
                                        fill="url(#tempDayGrad)"
                                        strokeWidth={3}
                                        dot={false}
                                        activeDot={{ r: 6, fill: '#f97316', stroke: '#fff', strokeWidth: 2 }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                            <div className="dif-chart-legend-inline">
                                <span><span className="dif-inline-dot" style={{ background: 'rgba(30, 58, 138, 0.5)' }} /> Noche (20:00–08:00)</span>
                                <span><span className="dif-inline-dot" style={{ background: 'rgba(251, 191, 36, 0.3)' }} /> Día (08:00–20:00)</span>
                                <span><span className="dif-inline-line" style={{ borderColor: '#f97316' }} /> Temp. Día</span>
                                <span><span className="dif-inline-line" style={{ borderColor: '#818cf8' }} /> Temp. Noche</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* === WEEK OVERVIEW VIEW === */}
                {difViewMode === 'week' && (
                    <div className="dif-week-overview">
                        <div className="dif-week-grid">
                            {difTableData.map((d, idx) => {
                                const isToday = idx === difTableData.length - 1;
                                const absDif = Math.abs(d.dif);
                                const barHeight = Math.min(absDif * 12, 100);
                                return (
                                    <div
                                        key={idx}
                                        className={`dif-week-card ${isToday ? 'today' : ''}`}
                                        onClick={() => { setDifSelectedDay(idx); setDifViewMode('day'); }}
                                    >
                                        <div className="dif-week-card-header">
                                            <span className="dif-week-day">{d.day}</span>
                                            {isToday && <span className="dif-today-badge">HOY</span>}
                                        </div>

                                        {/* Temperature visual bars */}
                                        <div className="dif-temp-visual">
                                            <div className="dif-temp-bar-group">
                                                <div className="dif-temp-bar day-bar" style={{ height: `${((d.tempDay - 15) / 20) * 100}%` }}>
                                                    <span className="dif-temp-bar-label">{d.tempDay}°</span>
                                                </div>
                                                <div className="dif-temp-bar night-bar" style={{ height: `${((d.tempNight - 15) / 20) * 100}%` }}>
                                                    <span className="dif-temp-bar-label">{d.tempNight}°</span>
                                                </div>
                                            </div>
                                            <div className="dif-temp-labels">
                                                <span>☀️</span>
                                                <span>🌙</span>
                                            </div>
                                        </div>

                                        <div className="dif-week-dif" style={{ color: d.color }}>
                                            <span className="dif-week-icon">{d.icon}</span>
                                            <span>{d.dif > 0 ? '+' : ''}{d.dif.toFixed(1)}°C</span>
                                        </div>
                                        <div className="dif-week-status" style={{ color: d.color }}>{d.statusLabel}</div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Week average footer */}
                        <div className="dif-week-footer">
                            <div className="dif-week-avg">
                                <span className="dif-avg-label-text">Promedio Semanal:</span>
                                <span className="dif-avg-value" style={{ color: parseFloat(avgDif) > 0 ? '#ef4444' : parseFloat(avgDif) <= -5 ? '#a78bfa' : '#10b981' }}>
                                    {parseFloat(avgDif) > 0 ? '+' : ''}{avgDif}°C
                                </span>
                                <span className="dif-avg-status">
                                    {parseFloat(avgDif) > 2 ? '⚠️ Ajustar clima nocturno ↓' : parseFloat(avgDif) > 0 ? '⚠ DIF positivo leve' : '✅ DIF óptimo'}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Legend — always visible */}
                <div className="dif-legend-compact">
                    <div className="dif-legend-item">
                        <span className="dif-legend-dot" style={{ background: '#a78bfa' }} />
                        <span>DIF &lt; -5°C: Purple Boost / Resina</span>
                    </div>
                    <div className="dif-legend-item">
                        <span className="dif-legend-dot" style={{ background: '#10b981' }} />
                        <span>DIF 0 a -5°C: Óptimo flora</span>
                    </div>
                    <div className="dif-legend-item">
                        <span className="dif-legend-dot" style={{ background: '#ef4444' }} />
                        <span>DIF &gt; 0°C: Estiramiento (bajar temp nocturna)</span>
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
                        <ComposedChart data={evolutionData} margin={{ top: 20, right: 70, left: 20, bottom: 20 }}>
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
                        </ComposedChart>
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
