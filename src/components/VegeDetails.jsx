import React, { useState, useMemo } from 'react';
import {
    ArrowLeft, Thermometer, Droplets, Sun, Wind, Activity,
    Zap, TrendingUp, TrendingDown, AlertCircle, CheckCircle, AlertTriangle,
    Clock, BarChart2, Moon
} from 'lucide-react';
import {
    vegeEnvironment, vegeIrrigationEvents, vegeRootHealth,
    ecTrendData, drybackData, getECBarStatus, getDrybackStatus
} from '../data/vegeDetailData';
import './VegeDetails.css';

const VegeDetails = ({ navigateTo }) => {
    const [activeTab, setActiveTab] = useState('ambiente');
    const [ecInput, setEcInput] = useState(vegeRootHealth.ecIn);
    const [ecOutput, setEcOutput] = useState(vegeRootHealth.ecOut);

    // VPD Chart Data (Simulated 24h)
    const vpdData = useMemo(() => {
        return vegeEnvironment.hourlyData.map(point => ({
            ...point,
            inRange: point.vpd >= 0.8 && point.vpd <= 1.2
        }));
    }, []);

    // DLI Calculation
    const dliStatus = useMemo(() => {
        const { currentDLI, targetDLI } = vegeEnvironment;
        const percentage = (currentDLI / targetDLI.max) * 100;
        let status = 'optimal';
        let message = 'Óptimo';

        if (currentDLI < targetDLI.min) {
            status = 'low';
            message = 'Bajo - Aumentar intensidad o horas';
        } else if (currentDLI > targetDLI.max) {
            status = 'high';
            message = 'Alto - Riesgo de estrés lumínico';
        }

        return { percentage: Math.min(100, percentage), status, message };
    }, []);

    // EC Trend Data with colors
    const ecChartData = useMemo(() => {
        return ecTrendData.map(day => ({
            ...day,
            ...getECBarStatus(day.ecIn, day.ecOut)
        }));
    }, []);

    // Find max EC for chart scaling
    const maxEcOut = useMemo(() => {
        return Math.max(...ecTrendData.map(d => d.ecOut), 4);
    }, []);

    // Average EC Input for reference line
    const avgEcIn = useMemo(() => {
        const sum = ecTrendData.reduce((acc, d) => acc + d.ecIn, 0);
        return (sum / ecTrendData.length).toFixed(1);
    }, []);

    // Dryback Status
    const drybackStatus = useMemo(() => {
        return getDrybackStatus(drybackData.currentDryback);
    }, []);

    // Root Health Status (EC Logic)
    const rootHealthStatus = useMemo(() => {
        const diff = ecOutput - ecInput;

        if (diff < 0) {
            return {
                status: 'hungry',
                label: 'Consumo Alto (Hambre)',
                description: 'EC de salida menor que entrada. La planta consume más de lo que recibe.',
                action: 'Considerar aumentar EC de entrada',
                color: '#4cc9f0',
                icon: TrendingDown
            };
        } else if (diff <= 1.2) {
            return {
                status: 'optimal',
                label: 'Balance Óptimo',
                description: `Delta EC: +${diff.toFixed(1)} - Zona de confort.`,
                action: 'Mantener régimen actual',
                color: '#00ff9d',
                icon: CheckCircle
            };
        } else if (diff < 2.5) {
            return {
                status: 'accumulation',
                label: 'Acumulación de Sales',
                description: `Delta EC: +${diff.toFixed(1)} - Sales acumulándose.`,
                action: 'Monitorear y considerar lavado',
                color: '#ffb703',
                icon: AlertCircle
            };
        } else {
            return {
                status: 'toxicity',
                label: 'Bloqueo/Toxicidad',
                description: `Delta EC: +${diff.toFixed(1)} - Exceso crítico de sales.`,
                action: 'Lavado urgente requerido',
                color: '#f72585',
                icon: AlertTriangle
            };
        }
    }, [ecInput, ecOutput]);

    // Daily Irrigation Summary
    const irrigationSummary = useMemo(() => {
        const totalVolume = vegeIrrigationEvents.reduce((sum, e) => sum + e.volumeMl, 0);
        const eventCount = vegeIrrigationEvents.length;
        return { totalVolume, eventCount };
    }, []);

    return (
        <div className="vege-details">
            {/* Header */}
            <header className="detail-header">
                <button className="back-btn" onClick={() => navigateTo('vege-pipeline')}>
                    <ArrowLeft size={20} />
                    <span>Pipeline</span>
                </button>
                <div className="header-info">
                    <h2 className="detail-title">
                        <span className="emoji-lg">🌳</span>
                        Vege - Control de Crecimiento
                    </h2>
                    <p className="detail-subtitle">Ambiente y Alimentación en Coco de Alto Rendimiento</p>
                </div>
            </header>

            {/* Tab Navigation */}
            <div className="tab-nav">
                <button
                    className={`tab-btn ${activeTab === 'ambiente' ? 'active' : ''}`}
                    onClick={() => setActiveTab('ambiente')}
                >
                    <Wind size={18} />
                    Ambiente
                </button>
                <button
                    className={`tab-btn ${activeTab === 'alimentacion' ? 'active' : ''}`}
                    onClick={() => setActiveTab('alimentacion')}
                >
                    <Droplets size={18} />
                    Alimentación (Coco)
                </button>
            </div>

            {/* Tab Content */}
            <div className="tab-content">
                {activeTab === 'ambiente' && (
                    <div className="ambiente-tab">
                        {/* VPD Section */}
                        <section className="vpd-section">
                            <div className="section-header">
                                <h3>
                                    <Activity size={20} color="var(--accent-primary)" />
                                    VPD - Déficit de Presión de Vapor
                                </h3>
                                <div className="vpd-current">
                                    <span className="vpd-value">{vegeEnvironment.currentVPD}</span>
                                    <span className="vpd-unit">kPa</span>
                                    <span className={`vpd-status ${vegeEnvironment.currentVPD >= 0.8 && vegeEnvironment.currentVPD <= 1.2 ? 'optimal' : 'warning'}`}>
                                        {vegeEnvironment.currentVPD >= 0.8 && vegeEnvironment.currentVPD <= 1.2 ? 'En Rango' : 'Fuera de Rango'}
                                    </span>
                                </div>
                            </div>

                            {/* VPD Chart */}
                            <div className="vpd-chart">
                                <div className="chart-area">
                                    <div className="chart-optimal-zone" />
                                    <div className="chart-bars">
                                        {vpdData.map((point, idx) => (
                                            <div
                                                key={idx}
                                                className={`chart-bar ${point.inRange ? 'in-range' : 'out-range'}`}
                                                style={{ height: `${(point.vpd / 1.6) * 100}%` }}
                                                title={`${point.hour}: ${point.vpd} kPa`}
                                            >
                                                <span className="bar-tooltip">{point.vpd}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="chart-labels">
                                        {vpdData.filter((_, i) => i % 4 === 0).map((point, idx) => (
                                            <span key={idx}>{point.hour}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="chart-legend">
                                    <span className="legend-item optimal">
                                        <span className="legend-dot" /> Rango Óptimo (0.8 - 1.2)
                                    </span>
                                    <span className="legend-item warning">
                                        <span className="legend-dot" /> Fuera de Rango
                                    </span>
                                </div>
                            </div>

                            {/* Environment Stats */}
                            <div className="env-stats-grid">
                                <div className="env-stat-card">
                                    <Thermometer size={20} color="#ff6b6b" />
                                    <div className="stat-info">
                                        <span className="stat-value">{vegeEnvironment.currentTemp}°C</span>
                                        <span className="stat-label">Temperatura</span>
                                    </div>
                                </div>
                                <div className="env-stat-card">
                                    <Droplets size={20} color="#4cc9f0" />
                                    <div className="stat-info">
                                        <span className="stat-value">{vegeEnvironment.currentHumidity}%</span>
                                        <span className="stat-label">Humedad</span>
                                    </div>
                                </div>
                                <div className="env-stat-card">
                                    <Wind size={20} color="#00ff9d" />
                                    <div className="stat-info">
                                        <span className="stat-value">{vegeEnvironment.co2}ppm</span>
                                        <span className="stat-label">CO₂</span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* DLI Section */}
                        <section className="dli-section">
                            <div className="section-header">
                                <h3>
                                    <Sun size={20} color="#ffb703" />
                                    DLI - Integral de Luz Diaria
                                </h3>
                                <div className="dli-target">
                                    Meta: {vegeEnvironment.targetDLI.min}-{vegeEnvironment.targetDLI.max} mol/m²/día
                                </div>
                            </div>

                            <div className="dli-gauge">
                                <div className="gauge-track">
                                    <div
                                        className={`gauge-fill ${dliStatus.status}`}
                                        style={{ width: `${dliStatus.percentage}%` }}
                                    />
                                    <div className="gauge-markers">
                                        <div className="marker min" style={{ left: `${(vegeEnvironment.targetDLI.min / vegeEnvironment.targetDLI.max) * 100}%` }}>
                                            <span>{vegeEnvironment.targetDLI.min}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="dli-info">
                                    <div className="dli-current">
                                        <span className="dli-value">{vegeEnvironment.currentDLI}</span>
                                        <span className="dli-unit">mol/m²/día</span>
                                    </div>
                                    <div className={`dli-status ${dliStatus.status}`}>
                                        {dliStatus.status === 'low' && <TrendingDown size={18} />}
                                        {dliStatus.status === 'high' && <TrendingUp size={18} />}
                                        {dliStatus.status === 'optimal' && <CheckCircle size={18} />}
                                        <span>{dliStatus.message}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="light-stats">
                                <div className="light-stat">
                                    <Zap size={16} />
                                    <span>PPFD Actual: <strong>{vegeEnvironment.ppfd} µmol/m²/s</strong></span>
                                </div>
                                <div className="light-stat">
                                    <Clock size={16} />
                                    <span>Fotoperiodo: <strong>{vegeEnvironment.photoperiod}h</strong></span>
                                </div>
                            </div>
                        </section>
                    </div>
                )}

                {activeTab === 'alimentacion' && (
                    <div className="alimentacion-tab">
                        {/* EC Trend Chart - 7 Days Stacking */}
                        <section className="ec-trend-section">
                            <div className="section-header">
                                <h3>
                                    <BarChart2 size={20} color="var(--accent-secondary)" />
                                    Tendencia EC Runoff (7 Días)
                                </h3>
                                <div className="ec-trend-legend">
                                    <span className="legend-pill cyan">Consumo</span>
                                    <span className="legend-pill green">Óptimo</span>
                                    <span className="legend-pill amber">Acumulación</span>
                                    <span className="legend-pill magenta">Toxicidad</span>
                                </div>
                            </div>

                            {/* EC Chart */}
                            <div className="ec-chart-container">
                                <div className="ec-chart">
                                    {/* Y-Axis Labels */}
                                    <div className="chart-y-axis">
                                        <span>{maxEcOut.toFixed(1)}</span>
                                        <span>{(maxEcOut / 2).toFixed(1)}</span>
                                        <span>0</span>
                                    </div>

                                    {/* Chart Area */}
                                    <div className="chart-main">
                                        {/* Reference Line (EC Input) */}
                                        <div
                                            className="ec-reference-line"
                                            style={{ bottom: `${(avgEcIn / maxEcOut) * 100}%` }}
                                        >
                                            <span className="ref-label">EC Riego: {avgEcIn}</span>
                                        </div>

                                        {/* Bars */}
                                        <div className="ec-bars">
                                            {ecChartData.map((day, idx) => (
                                                <div key={idx} className="ec-bar-wrapper">
                                                    <div
                                                        className="ec-bar"
                                                        style={{
                                                            height: `${(day.ecOut / maxEcOut) * 100}%`,
                                                            backgroundColor: day.color
                                                        }}
                                                    >
                                                        <span className="ec-bar-value">{day.ecOut}</span>
                                                    </div>
                                                    <span className="ec-bar-day">{day.day}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Chart Summary */}
                                <div className="ec-chart-summary">
                                    <div className="summary-card">
                                        <span className="summary-label">EC Entrada Prom.</span>
                                        <span className="summary-value">{avgEcIn}</span>
                                    </div>
                                    <div className="summary-card">
                                        <span className="summary-label">EC Salida Hoy</span>
                                        <span className="summary-value" style={{ color: ecChartData[ecChartData.length - 1]?.color }}>
                                            {ecChartData[ecChartData.length - 1]?.ecOut}
                                        </span>
                                    </div>
                                    <div className="summary-card">
                                        <span className="summary-label">Estado</span>
                                        <span
                                            className="summary-status"
                                            style={{
                                                color: ecChartData[ecChartData.length - 1]?.color,
                                                borderColor: ecChartData[ecChartData.length - 1]?.color
                                            }}
                                        >
                                            {ecChartData[ecChartData.length - 1]?.label}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Dryback Progress Section */}
                        <section className="dryback-section">
                            <div className="section-header">
                                <h3>
                                    <Moon size={20} color="#a78bfa" />
                                    Dryback Nocturno (Secado)
                                </h3>
                                <div className="dryback-target">
                                    Objetivo: {drybackData.targetRange.min}%-{drybackData.targetRange.max}%
                                </div>
                            </div>

                            <div className="dryback-gauge">
                                <div className="dryback-track">
                                    {/* Target Zone Marker */}
                                    <div
                                        className="dryback-target-zone"
                                        style={{
                                            left: `${(drybackData.targetRange.min / 50) * 100}%`,
                                            width: `${((drybackData.targetRange.max - drybackData.targetRange.min) / 50) * 100}%`
                                        }}
                                    />
                                    {/* Fill */}
                                    <div
                                        className="dryback-fill"
                                        style={{
                                            width: `${(drybackData.currentDryback / 50) * 100}%`,
                                            backgroundColor: drybackStatus.color
                                        }}
                                    />
                                    {/* Markers */}
                                    <div className="dryback-markers">
                                        <span className="marker-label" style={{ left: '30%' }}>15%</span>
                                        <span className="marker-label" style={{ left: '40%' }}>20%</span>
                                        <span className="marker-label" style={{ left: '60%' }}>30%</span>
                                        <span className="marker-label" style={{ left: '70%' }}>35%</span>
                                    </div>
                                </div>

                                <div className="dryback-info">
                                    <div className="dryback-current">
                                        <span
                                            className="dryback-value"
                                            style={{ color: drybackStatus.color }}
                                        >
                                            {drybackData.currentDryback}%
                                        </span>
                                        <span className="dryback-label">Dryback</span>
                                    </div>
                                    <div className={`dryback-status ${drybackStatus.status}`} style={{ borderColor: drybackStatus.color }}>
                                        {drybackStatus.status === 'optimal' && <CheckCircle size={18} color={drybackStatus.color} />}
                                        {drybackStatus.status === 'too_wet' && <Droplets size={18} color={drybackStatus.color} />}
                                        {drybackStatus.status === 'wet' && <Droplets size={18} color={drybackStatus.color} />}
                                        {drybackStatus.status === 'dry' && <AlertCircle size={18} color={drybackStatus.color} />}
                                        {drybackStatus.status === 'too_dry' && <AlertTriangle size={18} color={drybackStatus.color} />}
                                        <span style={{ color: drybackStatus.color }}>{drybackStatus.label}</span>
                                    </div>
                                </div>

                                {/* Action Message */}
                                <div className="dryback-action" style={{ borderColor: `${drybackStatus.color}40` }}>
                                    <span>{drybackStatus.action}</span>
                                </div>
                            </div>

                            {/* WC Change */}
                            <div className="wc-change">
                                <div className="wc-item">
                                    <span className="wc-label">WC% Apagado</span>
                                    <span className="wc-value">{drybackData.lastNightStart}%</span>
                                </div>
                                <span className="wc-arrow">→</span>
                                <div className="wc-item">
                                    <span className="wc-label">WC% Encendido</span>
                                    <span className="wc-value">{drybackData.lastNightEnd}%</span>
                                </div>
                            </div>
                        </section>

                        {/* Root Health Monitor */}
                        <section className="root-health-section">
                            <div className="section-header">
                                <h3>
                                    <Activity size={20} color={rootHealthStatus.color} />
                                    Monitor de Salud de Raíz
                                </h3>
                            </div>

                            <div className="ec-inputs">
                                <div className="ec-input-group">
                                    <label>
                                        <TrendingDown size={14} />
                                        EC Entrada (Tanque)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        max="5"
                                        value={ecInput}
                                        onChange={(e) => setEcInput(parseFloat(e.target.value) || 0)}
                                    />
                                </div>
                                <div className="ec-arrow">→</div>
                                <div className="ec-input-group">
                                    <label>
                                        <TrendingUp size={14} />
                                        EC Salida (Runoff)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        max="8"
                                        value={ecOutput}
                                        onChange={(e) => setEcOutput(parseFloat(e.target.value) || 0)}
                                    />
                                </div>
                            </div>

                            <div className={`health-status-card ${rootHealthStatus.status}`}>
                                <div className="status-header">
                                    <rootHealthStatus.icon size={24} color={rootHealthStatus.color} />
                                    <span className="status-label" style={{ color: rootHealthStatus.color }}>
                                        {rootHealthStatus.label}
                                    </span>
                                </div>
                                <p className="status-description">{rootHealthStatus.description}</p>
                                <div className="status-action">
                                    <span className="action-label">Acción Recomendada:</span>
                                    <span className="action-text">{rootHealthStatus.action}</span>
                                </div>
                            </div>

                            {/* EC Reference Guide */}
                            <div className="ec-guide">
                                <h4>Guía de Interpretación EC (4 Niveles)</h4>
                                <div className="guide-items">
                                    <div className="guide-item cyan">
                                        <span className="guide-dot" />
                                        <span>Out &lt; In = Consumo Alto (Aumentar EC)</span>
                                    </div>
                                    <div className="guide-item green">
                                        <span className="guide-dot" />
                                        <span>Out ≤ In +1.2 = Rango Óptimo</span>
                                    </div>
                                    <div className="guide-item amber">
                                        <span className="guide-dot" />
                                        <span>Out &lt; In +2.5 = Acumulación (Monitorear)</span>
                                    </div>
                                    <div className="guide-item magenta">
                                        <span className="guide-dot" />
                                        <span>Out ≥ In +2.5 = Toxicidad (Lavado Urgente)</span>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VegeDetails;
