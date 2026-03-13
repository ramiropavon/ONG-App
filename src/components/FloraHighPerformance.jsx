import React, { useMemo, useState } from 'react';
import {
    Droplets, Thermometer, Moon, Sun,
    AlertTriangle, ArrowUp, BarChart2, FlaskConical
} from 'lucide-react';
import {
    floraECTrendData, floraDrybackData, floraTempDIFData,
    getFloraECStatus, getFloraDrybackStatus, getDIFStatus
} from '../data/floraDetailData';
import './FloraHighPerformance.css';

// Mock Feeding Recipe Data
const currentRecipe = {
    week: 5,
    base: 'A+B (3ml/L)',
    additives: 'PK Booster (1.5ml/L) + Silicio',
    targetEC: 2.8
};

const FloraHighPerformance = () => {
    const [showTooltip, setShowTooltip] = useState(null);

    // EC Trend Data with colors
    const ecChartData = useMemo(() => {
        return floraECTrendData.map(day => ({
            ...day,
            ...getFloraECStatus(day.ecIn, day.ecOut),
            delta: (day.ecOut - day.ecIn).toFixed(1)
        }));
    }, []);

    // Max EC for chart scaling
    const maxEcOut = useMemo(() => {
        return Math.max(...floraECTrendData.map(d => d.ecOut), 5.5);
    }, []);

    // Average EC Input for reference line
    const avgEcIn = useMemo(() => {
        const sum = floraECTrendData.reduce((acc, d) => acc + d.ecIn, 0);
        return (sum / floraECTrendData.length).toFixed(1);
    }, []);

    // Dryback Status
    const drybackStatus = useMemo(() => {
        return getFloraDrybackStatus(floraDrybackData.currentDryback);
    }, []);

    // DIF Status
    const difValue = floraTempDIFData.nightTemp - floraTempDIFData.dayTemp;
    const difStatus = useMemo(() => {
        if (difValue > 0) {
            return {
                status: 'stretch_alert',
                label: 'ALERTA ESTIRAMIENTO',
                color: '#ff3333',
                icon: '⚠️',
                description: 'Noche más cálida que el día → Fomenta estiramiento no deseado',
                benefit: '⚠ Internodos largos, flores menos compactas'
            };
        } else if (difValue <= -4) {
            return {
                status: 'purple_boost',
                label: 'PURPLE BOOST',
                color: '#a78bfa',
                icon: '❄️',
                description: 'DIF negativo óptimo → Antocianinas + densidad de tricomas',
                benefit: 'Colores intensos, mayor producción de resina'
            };
        } else {
            return {
                status: 'mild_negative',
                label: 'DIF MODERADO',
                color: '#4cc9f0',
                icon: '🌙',
                description: 'DIF negativo leve → Buena calidad general',
                benefit: 'Flores compactas, buen desarrollo'
            };
        }
    }, [difValue]);

    // Latest day data
    const latestDay = ecChartData[ecChartData.length - 1];

    return (
        <div className="flora-hp-container">

            {/* ===== 0. RECETA / MENÚ ACTUAL ===== */}
            <section className="recipe-bar-v2">
                <div className="recipe-bar-left">
                    <FlaskConical size={16} className="recipe-icon" />
                    <span className="recipe-week">Receta Semana {currentRecipe.week}</span>
                </div>
                <div className="recipe-bar-center">
                    <div className="recipe-detail">
                        <span className="recipe-key">Base</span>
                        <span className="recipe-val">{currentRecipe.base}</span>
                    </div>
                    <div className="recipe-sep" />
                    <div className="recipe-detail">
                        <span className="recipe-key">Aditivos</span>
                        <span className="recipe-val">{currentRecipe.additives}</span>
                    </div>
                </div>
                <div className="recipe-bar-right">
                    <span className="recipe-target-label">EC Objetivo</span>
                    <span className="recipe-target-value">{currentRecipe.targetEC}</span>
                </div>
            </section>

            {/* ===== 1. ACUMULACIÓN DE SALES (EC STACKING) ===== */}
            <section className="flora-card stacking-card">
                <div className="card-header">
                    <div className="header-left">
                        <BarChart2 size={20} color="#00ff9d" />
                        <h3>Acumulación de Sales (EC)</h3>
                    </div>
                    <div className="header-legend">
                        <span className="pill blue">🔵 Consumiendo</span>
                        <span className="pill green">✅ Saludable</span>
                        <span className="pill magenta">🔴 Bloqueo</span>
                    </div>
                </div>

                {/* Chart */}
                <div className="ec-chart-area">
                    {/* Y-Axis */}
                    <div className="ec-y-axis">
                        <span>{maxEcOut.toFixed(1)}</span>
                        <span>{(maxEcOut / 2).toFixed(1)}</span>
                        <span>0</span>
                    </div>

                    {/* Chart Container */}
                    <div className="ec-chart-container">
                        {/* Reference Line */}
                        <div
                            className="ec-ref-line"
                            style={{ bottom: `${(avgEcIn / maxEcOut) * 100}%` }}
                        >
                            <span className="ec-ref-label">EC Entrada: {avgEcIn}</span>
                        </div>

                        {/* Bars */}
                        <div className="ec-bars">
                            {ecChartData.map((day, idx) => (
                                <div
                                    key={idx}
                                    className="ec-bar-col"
                                    onMouseEnter={() => setShowTooltip(idx)}
                                    onMouseLeave={() => setShowTooltip(null)}
                                >
                                    {/* Value on top */}
                                    <span className="ec-bar-value">{day.ecOut}</span>

                                    {/* Bar */}
                                    <div
                                        className="ec-bar"
                                        style={{
                                            height: `${(day.ecOut / maxEcOut) * 100}%`,
                                            backgroundColor: day.color
                                        }}
                                    />

                                    {/* Day label */}
                                    <span className="ec-bar-day">{day.day}</span>

                                    {/* Tooltip */}
                                    {showTooltip === idx && (
                                        <div className="ec-tooltip">
                                            <div className="tooltip-row">
                                                <span>Entrada:</span>
                                                <span>{day.ecIn}</span>
                                            </div>
                                            <div className="tooltip-row">
                                                <span>Salida:</span>
                                                <span style={{ color: day.color }}>{day.ecOut}</span>
                                            </div>
                                            <div className="tooltip-row delta">
                                                <span>Delta:</span>
                                                <span style={{ color: day.color }}>+{day.delta}</span>
                                            </div>
                                            <div className="tooltip-status" style={{ color: day.color }}>
                                                {day.label}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Compact Summary */}
                <div className="ec-summary-compact">
                    <div className="ec-summary-flow">
                        <span className="ec-summary-label">Hoy:</span>
                        <span className="ec-summary-in">EC {latestDay?.ecIn}</span>
                        <span className="ec-summary-arrow">→</span>
                        <span className="ec-summary-out" style={{ color: latestDay?.color }}>
                            EC {latestDay?.ecOut}
                        </span>
                        <span className="ec-summary-delta" style={{ color: latestDay?.color }}>
                            (Δ +{latestDay?.delta})
                        </span>
                    </div>
                    <span
                        className="ec-summary-badge"
                        style={{
                            color: latestDay?.color,
                            borderColor: latestDay?.color,
                            backgroundColor: `${latestDay?.color}15`
                        }}
                    >
                        {latestDay?.label}
                    </span>
                </div>
            </section>

            {/* ===== 2. DIRECCIONAMIENTO GENERATIVO (DRYBACK) ===== */}
            <section className="flora-card dryback-card">
                <div className="card-header">
                    <div className="header-left">
                        <Droplets size={20} color="#a78bfa" />
                        <div className="header-title-group">
                            <h3>Direccionamiento Generativo</h3>
                            <span className="header-subtitle">Control de secado nocturno del sustrato</span>
                        </div>
                    </div>
                    <div className="header-target">
                        Objetivo: {floraDrybackData.targetRange.min}% – {floraDrybackData.targetRange.max}%
                    </div>
                </div>

                <div className="dryback-content">
                    {/* Gauge with zone labels */}
                    <div className="dryback-gauge-v2">
                        <div className="gauge-track">
                            <div className="zone vegetative" />
                            <div className="zone generative" />
                            <div className="zone stress" />

                            {/* Fill */}
                            <div
                                className="gauge-fill"
                                style={{
                                    width: `${Math.min(floraDrybackData.currentDryback, 50) * 2}%`,
                                    backgroundColor: drybackStatus.color
                                }}
                            />

                            {/* Marker */}
                            <div
                                className="current-marker"
                                style={{ left: `${Math.min(floraDrybackData.currentDryback, 50) * 2}%` }}
                            />
                        </div>

                        {/* Zone Labels */}
                        <div className="gauge-zone-labels">
                            <span className="zone-label veg">Vegetativo</span>
                            <span className="zone-label gen">Generativo</span>
                            <span className="zone-label str">Estrés</span>
                        </div>

                        {/* % Markers */}
                        <div className="gauge-pct-markers">
                            <span>0%</span>
                            <span>15%</span>
                            <span>25%</span>
                            <span>35%</span>
                            <span>50%</span>
                        </div>
                    </div>

                    {/* Value + Status Row */}
                    <div className="dryback-info-row">
                        <div className="dryback-main-value">
                            <span className="dryback-big-number" style={{ color: drybackStatus.color }}>
                                {floraDrybackData.currentDryback}%
                            </span>
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

                        <div
                            className="dryback-status-badge"
                            style={{
                                backgroundColor: `${drybackStatus.color}20`,
                                color: drybackStatus.color,
                                borderColor: `${drybackStatus.color}50`
                            }}
                        >
                            ◎ {drybackStatus.label.toUpperCase()}
                        </div>
                    </div>

                    {/* Action CTA */}
                    {(floraDrybackData.currentDryback < floraDrybackData.targetRange.min ||
                        floraDrybackData.currentDryback > floraDrybackData.targetRange.max) && (
                            <div className="action-cta" style={{ borderColor: `${drybackStatus.color}50` }}>
                                <AlertTriangle size={16} color={drybackStatus.color} />
                                <span>{drybackStatus.action}</span>
                            </div>
                        )}
                </div>
            </section>

            {/* ===== 3. CLIMA & DIF — COMPACTO ===== */}
            <section className="flora-card dif-compact-card">
                <div className="card-header">
                    <div className="header-left">
                        <Thermometer size={20} color="#ff6b6b" />
                        <h3>Diferencial Térmico (DIF)</h3>
                    </div>
                    <div
                        className="dif-badge-compact"
                        style={{
                            backgroundColor: `${difStatus.color}20`,
                            color: difStatus.color
                        }}
                    >
                        {difStatus.status === 'stretch_alert' ? (
                            <ArrowUp size={14} />
                        ) : (
                            <span className="dif-badge-icon">{difStatus.icon}</span>
                        )}
                        <span>{difStatus.label}</span>
                    </div>
                </div>

                {/* Compact DIF Row */}
                <div className="dif-compact-row">
                    {/* Day Temp */}
                    <div className="dif-temp-block day">
                        <Sun size={20} color="#ffb703" />
                        <div className="dif-temp-data">
                            <span className="dif-temp-val">{floraTempDIFData.dayTemp}°C</span>
                            <span className="dif-temp-label">Día (máx)</span>
                        </div>
                    </div>

                    {/* DIF Center Value */}
                    <div className="dif-center" style={{ color: difStatus.color }}>
                        <span className="dif-center-icon">
                            {difStatus.status === 'stretch_alert' ? (
                                <ArrowUp size={24} className="stretch-icon" />
                            ) : (
                                difStatus.icon
                            )}
                        </span>
                        <span className="dif-center-value">
                            {difValue > 0 ? '+' : ''}{difValue.toFixed(1)}°C
                        </span>
                        <span className="dif-center-label">DIF</span>
                    </div>

                    {/* Night Temp */}
                    <div className="dif-temp-block night">
                        <Moon size={20} color="#a78bfa" />
                        <div className="dif-temp-data">
                            <span className="dif-temp-val">{floraTempDIFData.nightTemp}°C</span>
                            <span className="dif-temp-label">Noche (mín)</span>
                        </div>
                    </div>
                </div>

                {/* Description line */}
                <div className="dif-compact-desc" style={{ borderColor: `${difStatus.color}30` }}>
                    <span className="dif-compact-desc-text">{difStatus.description}</span>
                    <span className="dif-compact-desc-benefit" style={{ color: difStatus.color }}>
                        {difStatus.benefit}
                    </span>
                </div>
            </section>
        </div>
    );
};

export default FloraHighPerformance;
