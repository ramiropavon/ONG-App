import React, { useMemo, useState } from 'react';
import {
    Leaf, Calendar, Thermometer, Droplets, Activity, Wind, Sun, Moon,
    AlertCircle, AlertTriangle, ArrowUp, BarChart2, Zap, Sprout
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
    CartesianGrid, LineChart, Line, ReferenceArea, ReferenceLine, ComposedChart
} from 'recharts';
import {
    floraECTrendData, floraDrybackData, floraTempDIFData,
    getFloraECStatus, getFloraDrybackStatus
} from '../data/floraDetailData';
import { batches, genetics, pulseRealTime, pulseDayNightTemp, pulseDetailedEvolution } from '../data/mockData';
import { getActiveCycle, getDaysInCycle } from '../data/roomCycleData';
import './FloraHighPerformance.css';
import './FloraRoomDashboard.css';

const FloraRoomDashboard = ({ room }) => {
    const roomId = room.id;
    const [showTooltip, setShowTooltip] = useState(null);
    const [visibleSeries, setVisibleSeries] = useState({
        temp: true,
        humidity: false,
        vpd: true,
        co2: false,
        ppfd: false
    });

    // ─── DATA SOURCES ───
    const realTime = pulseRealTime[roomId] || pulseRealTime.R2;
    const evolutionData = pulseDetailedEvolution[roomId] || pulseDetailedEvolution.R2;
    const photoperiod = room?.photoperiod || 12;
    const lightOnHour = 8;
    const lightOffHour = 20;

    // ─── FLORA INFO ───
    const roomBatches = batches.filter(b => b.roomId === roomId && b.phase === 'Flora');
    const totalPlants = roomBatches.reduce((sum, b) => sum + (b.plantCount || 0), 0);
    const activeCycle = getActiveCycle(roomId);
    const daysInCycle = activeCycle ? getDaysInCycle(activeCycle.startDate) : 0;
    const floraStartDate = room.floraStartDate || activeCycle?.startDate || '—';
    const activeGenetics = room.activeGenetics || activeCycle?.genetics || [];

    // ─── KPI CALCULATIONS ───
    const dli = useMemo(() => {
        const ppfd = realTime.ppfd || 0;
        return ((ppfd * 3600 * photoperiod) / 1000000).toFixed(1);
    }, [realTime.ppfd, photoperiod]);

    const dliTarget = { min: 35, max: 45 };
    const dliInRange = parseFloat(dli) >= dliTarget.min && parseFloat(dli) <= dliTarget.max;
    const tempTarget = { min: 24, max: 28 };
    const tempStatus = realTime.temp >= tempTarget.min && realTime.temp <= tempTarget.max ? 'ok' : realTime.temp > 29 ? 'danger' : 'warning';
    const humTarget = { min: 45, max: 55 };
    const humStatus = realTime.humidity >= humTarget.min && realTime.humidity <= humTarget.max ? 'ok' : realTime.humidity > 60 ? 'danger' : 'warning';
    const vpdInRange = realTime.vpd >= 1.0 && realTime.vpd <= 1.5;
    const co2Target = { min: 800, max: 1200 };
    const co2Status = realTime.co2 < 500 ? 'danger' : realTime.co2 < co2Target.min ? 'warning' : realTime.co2 > 1500 ? 'danger' : 'ok';
    const ppfdTarget = { min: 800, max: 1100 };
    const ppfdInRange = realTime.ppfd >= ppfdTarget.min && realTime.ppfd <= ppfdTarget.max;
    const isLightOn = realTime.ppfd > 0;

    // ─── EC STACKING ───
    const ecChartData = useMemo(() => {
        return floraECTrendData.map(day => ({
            ...day,
            ...getFloraECStatus(day.ecIn, day.ecOut),
            delta: (day.ecOut - day.ecIn).toFixed(1)
        }));
    }, []);

    const maxEcOut = useMemo(() => Math.max(...floraECTrendData.map(d => d.ecOut), 5.5), []);
    const avgEcIn = useMemo(() => {
        const sum = floraECTrendData.reduce((acc, d) => acc + d.ecIn, 0);
        return (sum / floraECTrendData.length).toFixed(1);
    }, []);
    const latestDay = ecChartData[ecChartData.length - 1];

    // ─── DRYBACK ───
    const drybackStatus = useMemo(() => getFloraDrybackStatus(floraDrybackData.currentDryback), []);

    // ─── DIAGNOSTICO AMBIENTAL HELPERS ───
    const toggleSeries = (series) => {
        const currentlyActive = Object.values(visibleSeries).filter(v => v).length;
        const isCurrentlyVisible = visibleSeries[series];
        if (!isCurrentlyVisible && currentlyActive >= 3) return;
        setVisibleSeries(prev => ({ ...prev, [series]: !prev[series] }));
    };

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

    const CorrelationTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length > 0) {
            const dataPoint = evolutionData.find(d => d.time === label);
            if (!dataPoint) return null;
            const hour = parseInt(label.split(':')[0]);
            const isDayTime = hour >= lightOnHour && hour < lightOffHour;
            return (
                <div className="frd-correlation-tooltip">
                    <div className="frd-tooltip-header">
                        <span className="frd-tooltip-time">{label}</span>
                        <span className={`frd-tooltip-period ${isDayTime ? 'day' : 'night'}`}>
                            {isDayTime ? '☀️ Día' : '🌙 Noche'}
                        </span>
                    </div>
                    <div className="frd-tooltip-metrics">
                        <div className="frd-metric-row">
                            <span>🌡️</span><span>Temp:</span>
                            <span>{dataPoint.temp}°C</span>
                            <span style={{ color: getMetricStatus('temp', dataPoint.temp).color }}>{getMetricStatus('temp', dataPoint.temp).status}</span>
                        </div>
                        <div className="frd-metric-row">
                            <span>💧</span><span>Hum:</span>
                            <span>{dataPoint.humidity}%</span>
                            <span style={{ color: getMetricStatus('humidity', dataPoint.humidity).color }}>{getMetricStatus('humidity', dataPoint.humidity).status}</span>
                        </div>
                        <div className="frd-metric-row">
                            <span>🌫️</span><span>VPD:</span>
                            <span>{dataPoint.vpd} kPa</span>
                            <span style={{ color: getMetricStatus('vpd', dataPoint.vpd).color }}>{getMetricStatus('vpd', dataPoint.vpd).status}</span>
                        </div>
                        <div className="frd-metric-row">
                            <span>☁️</span><span>CO2:</span>
                            <span>{dataPoint.co2} ppm</span>
                            <span style={{ color: getMetricStatus('co2', dataPoint.co2).color }}>{getMetricStatus('co2', dataPoint.co2).status}</span>
                        </div>
                        <div className="frd-metric-row">
                            <span>💡</span><span>Luz:</span>
                            <span>{dataPoint.ppfd} µmol</span>
                            <span style={{ color: getMetricStatus('ppfd', dataPoint.ppfd).color }}>{getMetricStatus('ppfd', dataPoint.ppfd).status}</span>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    const hasHighCO2 = evolutionData.some(d => d.co2 > 1500);
    const hasHighTemp = evolutionData.some(d => d.temp > 29);
    const hasHighHumidity = evolutionData.some(d => d.humidity > 60);
    const activeCount = Object.values(visibleSeries).filter(v => v).length;

    // Format date for display
    const formatDate = (dateStr) => {
        if (!dateStr || dateStr === '—') return '—';
        const d = new Date(dateStr + 'T12:00:00');
        return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    return (
        <div className="flora-room-dashboard">

            {/* ═══════ 1. FLORA INFO HEADER ═══════ */}
            <section className="frd-info-header">
                <div className="frd-info-grid">
                    <div className="frd-info-item">
                        <Sprout size={20} className="frd-info-icon plants" />
                        <div className="frd-info-data">
                            <span className="frd-info-value">{totalPlants}</span>
                            <span className="frd-info-label">Plantas en Flora</span>
                        </div>
                    </div>
                    <div className="frd-info-item">
                        <Calendar size={20} className="frd-info-icon calendar" />
                        <div className="frd-info-data">
                            <span className="frd-info-value">{formatDate(floraStartDate)}</span>
                            <span className="frd-info-label">Inicio de Flora</span>
                        </div>
                    </div>
                    <div className="frd-info-item">
                        <Leaf size={20} className="frd-info-icon cycle" />
                        <div className="frd-info-data">
                            <span className="frd-info-value">Día {daysInCycle}</span>
                            <span className="frd-info-label">del Ciclo</span>
                        </div>
                    </div>
                    <div className="frd-info-item">
                        <Leaf size={20} className="frd-info-icon genetics" />
                        <div className="frd-info-data">
                            <span className="frd-info-value">{activeGenetics.join(', ') || '—'}</span>
                            <span className="frd-info-label">Genéticas</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════ 2. KPI STRIP ═══════ */}
            <section className="frd-kpi-strip">
                <div className={`frd-kpi kpi-${tempStatus}`}>
                    <Thermometer className="frd-kpi-icon" size={22} />
                    <div className="frd-kpi-content">
                        <div className="frd-kpi-value">{realTime.temp}°C</div>
                        <div className="frd-kpi-label">Temp</div>
                        <div className="frd-kpi-target">{tempTarget.min}-{tempTarget.max}°C</div>
                    </div>
                </div>
                <div className={`frd-kpi kpi-${humStatus}`}>
                    <Droplets className="frd-kpi-icon" size={22} />
                    <div className="frd-kpi-content">
                        <div className="frd-kpi-value">{realTime.humidity}%</div>
                        <div className="frd-kpi-label">Humedad</div>
                        <div className="frd-kpi-target">{humTarget.min}-{humTarget.max}%</div>
                    </div>
                </div>
                <div className={`frd-kpi kpi-${vpdInRange ? 'ok' : 'warning'}`}>
                    <Activity className="frd-kpi-icon" size={22} />
                    <div className="frd-kpi-content">
                        <div className="frd-kpi-value">{realTime.vpd} kPa</div>
                        <div className="frd-kpi-label">VPD</div>
                        <div className="frd-kpi-target">1.0-1.5 kPa</div>
                    </div>
                </div>
                <div className={`frd-kpi kpi-${co2Status}`}>
                    <Wind className="frd-kpi-icon" size={22} />
                    <div className="frd-kpi-content">
                        <div className="frd-kpi-value">{realTime.co2} ppm</div>
                        <div className="frd-kpi-label">CO2</div>
                        <div className="frd-kpi-target">{co2Target.min}-{co2Target.max} ppm</div>
                    </div>
                </div>
                <div className={`frd-kpi kpi-${ppfdInRange ? 'ok' : 'warning'}`}>
                    {isLightOn ? <Sun className="frd-kpi-icon" size={22} /> : <Moon className="frd-kpi-icon" size={22} />}
                    <div className="frd-kpi-content">
                        <div className="frd-kpi-value">{realTime.ppfd} µmol</div>
                        <div className="frd-kpi-label">PPFD</div>
                        <div className="frd-kpi-target">{ppfdTarget.min}-{ppfdTarget.max}</div>
                    </div>
                </div>
                <div className={`frd-kpi kpi-${dliInRange ? 'ok' : 'warning'}`}>
                    <Zap className="frd-kpi-icon" size={22} />
                    <div className="frd-kpi-content">
                        <div className="frd-kpi-value">{dli}</div>
                        <div className="frd-kpi-label">DLI</div>
                        <div className="frd-kpi-target">{dliTarget.min}-{dliTarget.max}</div>
                    </div>
                </div>
            </section>

            {/* ═══════ 3. DIAGNÓSTICO AMBIENTAL ═══════ */}
            <section className="frd-card">
                <div className="frd-section-header">
                    <h3>
                        <Activity size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                        Diagnóstico Ambiental (24h)
                    </h3>
                    <div className="frd-metric-selector">
                        <button className={`frd-metric-pill ${visibleSeries.temp ? 'active temp' : ''}`} onClick={() => toggleSeries('temp')}>🌡️ Temp</button>
                        <button className={`frd-metric-pill ${visibleSeries.humidity ? 'active humidity' : ''}`} onClick={() => toggleSeries('humidity')}>💧 Hum</button>
                        <button className={`frd-metric-pill ${visibleSeries.vpd ? 'active vpd' : ''}`} onClick={() => toggleSeries('vpd')}>🌫️ VPD</button>
                        <button className={`frd-metric-pill ${visibleSeries.ppfd ? 'active ppfd' : ''}`} onClick={() => toggleSeries('ppfd')}>💡 PPFD</button>
                        <button className={`frd-metric-pill ${visibleSeries.co2 ? 'active co2' : ''}`} onClick={() => toggleSeries('co2')}>☁️ CO2</button>
                    </div>
                </div>

                {activeCount < 3 && (
                    <div className="frd-selection-hint">
                        <AlertCircle size={14} />
                        <span>Selecciona hasta 3 métricas para correlacionar ({activeCount}/3)</span>
                    </div>
                )}

                <div className="frd-day-night-legend">
                    <div className="frd-legend-item">
                        <div className="frd-legend-box day"></div>
                        <span>☀️ Día (08:00 - 20:00)</span>
                    </div>
                    <div className="frd-legend-item">
                        <div className="frd-legend-box night"></div>
                        <span>🌙 Noche (20:00 - 08:00)</span>
                    </div>
                </div>

                <div className="frd-chart-wrap">
                    <ResponsiveContainer width="100%" height={380}>
                        <ComposedChart data={evolutionData} margin={{ top: 20, right: 70, left: 20, bottom: 20 }}>
                            <defs>
                                <linearGradient id="frdPpfdGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#facc15" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="#facc15" stopOpacity={0} />
                                </linearGradient>
                            </defs>

                            <ReferenceArea x1="00:00" x2="08:00" fill="#1e3a8a" fillOpacity={0.25} />
                            <ReferenceArea x1="08:00" x2="20:00" fill="#fbbf24" fillOpacity={0.15} />
                            <ReferenceArea x1="20:00" x2="23:00" fill="#1e3a8a" fillOpacity={0.25} />

                            {visibleSeries.co2 && hasHighCO2 && (
                                <ReferenceLine y={1500} yAxisId="right" stroke="#ef4444" strokeDasharray="5 5" strokeWidth={2}
                                    label={{ value: 'CO2 Crítico', position: 'right', fill: '#ef4444', fontSize: 10 }} />
                            )}
                            {visibleSeries.temp && hasHighTemp && (
                                <ReferenceLine y={29} yAxisId="left" stroke="#ef4444" strokeDasharray="5 5" strokeWidth={2}
                                    label={{ value: 'Temp Crítica (29°C)', position: 'left', fill: '#ef4444', fontSize: 10 }} />
                            )}
                            {visibleSeries.humidity && hasHighHumidity && (
                                <ReferenceLine y={60} yAxisId="left" stroke="#ef4444" strokeDasharray="5 5" strokeWidth={2}
                                    label={{ value: 'Hum Crítica (60%)', position: 'left', fill: '#ef4444', fontSize: 10 }} />
                            )}

                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                            <XAxis dataKey="time" stroke="#888" tick={{ fontSize: 11 }} interval={2} />
                            <YAxis yAxisId="left" stroke="#888" domain={[0, 100]} />
                            <YAxis yAxisId="right" orientation="right" stroke="#888" domain={[0, 1500]} />
                            <Tooltip content={<CorrelationTooltip />} />

                            {visibleSeries.ppfd && (
                                <Area yAxisId="right" type="monotone" dataKey="ppfd" stroke="#facc15" fill="url(#frdPpfdGrad)" strokeWidth={2} name="PPFD" animationDuration={800} />
                            )}
                            {visibleSeries.co2 && (
                                <Line yAxisId="right" type="monotone" dataKey="co2" stroke="#e5e7eb" strokeWidth={2.5} dot={false} name="CO2" animationDuration={800} />
                            )}
                            {visibleSeries.temp && (
                                <Line yAxisId="left" type="monotone" dataKey="temp" stroke="#f97316" strokeWidth={3} dot={false} name="Temp" animationDuration={800} />
                            )}
                            {visibleSeries.humidity && (
                                <Line yAxisId="left" type="monotone" dataKey="humidity" stroke="#3b82f6" strokeWidth={3} dot={false} name="Humedad" animationDuration={800} />
                            )}
                            {visibleSeries.vpd && (
                                <Line yAxisId="left" type="monotone" dataKey="vpd" stroke="#4ade80" strokeWidth={3} dot={false} name="VPD" animationDuration={800} />
                            )}
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </section>

            {/* ═══════ 4. ACUMULACIÓN DE SALES (EC STACKING) ═══════ */}
            <section className="frd-card">
                <div className="frd-section-header">
                    <div className="frd-header-left">
                        <BarChart2 size={20} color="#00ff9d" />
                        <h3>Acumulación de Sales (EC)</h3>
                    </div>
                    <div className="frd-header-legend">
                        <span className="frd-pill blue">🔵 Consumiendo</span>
                        <span className="frd-pill green">✅ Saludable</span>
                        <span className="frd-pill magenta">🔴 Bloqueo</span>
                    </div>
                </div>

                <div className="ec-chart-area">
                    <div className="ec-y-axis">
                        <span>{maxEcOut.toFixed(1)}</span>
                        <span>{(maxEcOut / 2).toFixed(1)}</span>
                        <span>0</span>
                    </div>
                    <div className="ec-chart-container">
                        <div className="ec-ref-line" style={{ bottom: `${(avgEcIn / maxEcOut) * 100}%` }}>
                            <span className="ec-ref-label">EC Entrada: {avgEcIn}</span>
                        </div>
                        <div className="ec-bars">
                            {ecChartData.map((day, idx) => (
                                <div key={idx} className="ec-bar-col" onMouseEnter={() => setShowTooltip(idx)} onMouseLeave={() => setShowTooltip(null)}>
                                    <span className="ec-bar-value">{day.ecOut}</span>
                                    <div className="ec-bar" style={{ height: `${(day.ecOut / maxEcOut) * 100}%`, backgroundColor: day.color }} />
                                    <span className="ec-bar-day">{day.day}</span>
                                    {showTooltip === idx && (
                                        <div className="ec-tooltip">
                                            <div className="tooltip-row"><span>Entrada:</span><span>{day.ecIn}</span></div>
                                            <div className="tooltip-row"><span>Salida:</span><span style={{ color: day.color }}>{day.ecOut}</span></div>
                                            <div className="tooltip-row delta"><span>Delta:</span><span style={{ color: day.color }}>+{day.delta}</span></div>
                                            <div className="tooltip-status" style={{ color: day.color }}>{day.label}</div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="ec-summary-compact">
                    <div className="ec-summary-flow">
                        <span className="ec-summary-label">Hoy:</span>
                        <span className="ec-summary-in">EC {latestDay?.ecIn}</span>
                        <span className="ec-summary-arrow">→</span>
                        <span className="ec-summary-out" style={{ color: latestDay?.color }}>EC {latestDay?.ecOut}</span>
                        <span className="ec-summary-delta" style={{ color: latestDay?.color }}>(Δ +{latestDay?.delta})</span>
                    </div>
                    <span className="ec-summary-badge" style={{ color: latestDay?.color, borderColor: latestDay?.color, backgroundColor: `${latestDay?.color}15` }}>
                        {latestDay?.label}
                    </span>
                </div>
            </section>

            {/* ═══════ 5. DIRECCIONAMIENTO GENERATIVO / VEGETATIVO ═══════ */}
            <section className="frd-card">
                <div className="frd-section-header">
                    <div className="frd-header-left">
                        <Droplets size={20} color="#a78bfa" />
                        <div>
                            <h3>Direccionamiento Generativo</h3>
                            <span className="frd-header-subtitle">Control de secado nocturno del sustrato</span>
                        </div>
                    </div>
                    <div className="frd-header-target">
                        Objetivo: {floraDrybackData.targetRange.min}% – {floraDrybackData.targetRange.max}%
                    </div>
                </div>

                <div className="dryback-content">
                    <div className="dryback-gauge-v2">
                        <div className="gauge-track">
                            <div className="zone vegetative" />
                            <div className="zone generative" />
                            <div className="zone stress" />
                            <div className="gauge-fill" style={{ width: `${Math.min(floraDrybackData.currentDryback, 50) * 2}%`, backgroundColor: drybackStatus.color }} />
                            <div className="current-marker" style={{ left: `${Math.min(floraDrybackData.currentDryback, 50) * 2}%` }} />
                        </div>
                        <div className="gauge-zone-labels">
                            <span className="zone-label veg">Vegetativo</span>
                            <span className="zone-label gen">Generativo</span>
                            <span className="zone-label str">Estrés</span>
                        </div>
                        <div className="gauge-pct-markers">
                            <span>0%</span><span>15%</span><span>25%</span><span>35%</span><span>50%</span>
                        </div>
                    </div>

                    <div className="dryback-info-row">
                        <div className="dryback-main-value">
                            <span className="dryback-big-number" style={{ color: drybackStatus.color }}>{floraDrybackData.currentDryback}%</span>
                            <span className="dryback-sublabel">Dryback nocturno</span>
                        </div>
                        <div className="dryback-wc-flow">
                            <div className="wc-item">
                                <span className="wc-label">Saturación al apagar</span>
                                <span className="wc-value">{floraDrybackData.lastNightStart}%</span>
                            </div>
                            <span className="wc-arrow">→</span>
                            <div className="wc-item">
                                <span className="wc-label">Saturación al encender</span>
                                <span className="wc-value">{floraDrybackData.lastNightEnd}%</span>
                            </div>
                        </div>
                        <div className="dryback-status-badge" style={{ backgroundColor: `${drybackStatus.color}20`, color: drybackStatus.color, borderColor: `${drybackStatus.color}50` }}>
                            ◎ {drybackStatus.label.toUpperCase()}
                        </div>
                    </div>

                    {(floraDrybackData.currentDryback < floraDrybackData.targetRange.min || floraDrybackData.currentDryback > floraDrybackData.targetRange.max) && (
                        <div className="action-cta" style={{ borderColor: `${drybackStatus.color}50` }}>
                            <AlertTriangle size={16} color={drybackStatus.color} />
                            <span>{drybackStatus.action}</span>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default FloraRoomDashboard;
