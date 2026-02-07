import React, { useMemo, useState } from 'react';
import {
    Activity, Droplets, Thermometer, Moon, Sun, Target, TrendingUp,
    AlertTriangle, CheckCircle, ArrowUp, BarChart2, Info, Beaker, FlaskConical
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

    // DIF Status - Corrected Logic
    const difStatus = useMemo(() => {
        const dif = floraTempDIFData.nightTemp - floraTempDIFData.dayTemp;
        // Positive DIF = Night warmer than Day = Stretch Alert
        // Negative DIF = Night cooler than Day = Purple Boost
        if (dif > 0) {
            return {
                status: 'stretch_alert',
                label: 'ALERTA ESTIRAMIENTO',
                color: '#ff3333',
                icon: '⚠️',
                iconComponent: ArrowUp,
                description: 'Noche más cálida que el día - Fomenta estiramiento',
                benefit: '⚠ Internodos largos, flores menos compactas'
            };
        } else if (dif <= -4) {
            return {
                status: 'purple_boost',
                label: 'PURPLE BOOST',
                color: '#a78bfa',
                icon: '❄️',
                iconComponent: null,
                description: 'DIF negativo óptimo - Fomenta producción de antocianinas',
                benefit: 'Colores intensos, mayor densidad de tricomas'
            };
        } else {
            return {
                status: 'mild_negative',
                label: 'DIF Moderado',
                color: '#4cc9f0',
                icon: '🌙',
                iconComponent: null,
                description: 'DIF negativo leve',
                benefit: 'Buena calidad de flores'
            };
        }
    }, []);

    // Calculate actual DIF value
    const difValue = floraTempDIFData.nightTemp - floraTempDIFData.dayTemp;

    return (
        <div className="flora-hp-container">
            {/* 0. NUEVO: Contexto de Receta (Feeding Menu) */}
            <section className="recipe-context-bar">
                <div className="recipe-header">
                    <FlaskConical size={16} color="#00ff9d" />
                    <span className="recipe-title">Menú Actual (Semana {currentRecipe.week})</span>
                </div>
                <div className="recipe-details">
                    <div className="recipe-item">
                        <span className="recipe-label">Base:</span>
                        <span className="recipe-value">{currentRecipe.base}</span>
                    </div>
                    <div className="recipe-divider" />
                    <div className="recipe-item">
                        <span className="recipe-label">Aditivos:</span>
                        <span className="recipe-value">{currentRecipe.additives}</span>
                    </div>
                    <div className="recipe-divider" />
                    <div className="recipe-item target">
                        <span className="recipe-label">Target:</span>
                        <span className="recipe-value highlight">{currentRecipe.targetEC} EC</span>
                    </div>
                </div>
            </section>

            {/* 1. TARJETA PRINCIPAL: Control de Nutrición (Stacking) - CUSTOM CHART */}
            <section className="flora-card stacking-card">
                <div className="card-header">
                    <div className="header-left">
                        <BarChart2 size={22} color="#00ff9d" />
                        <h3>Control de Nutrición (Stacking)</h3>
                    </div>
                    <div className="header-legend">
                        <span className="pill blue">Hambre</span>
                        <span className="pill green">Stacking Sano</span>
                        <span className="pill magenta">Bloqueo</span>
                    </div>
                </div>

                {/* Custom Bar Chart Container */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                    {/* Y-Axis */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        paddingTop: '12px',
                        paddingBottom: '36px',
                        fontSize: '0.7rem',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--text-muted)',
                        textAlign: 'right',
                        width: '36px'
                    }}>
                        <span>{maxEcOut.toFixed(1)}</span>
                        <span>{(maxEcOut / 2).toFixed(1)}</span>
                        <span>0</span>
                    </div>

                    {/* Chart Area - Pure HTML/CSS */}
                    <div style={{
                        flex: 1,
                        position: 'relative',
                        height: '240px',
                        background: 'rgba(0, 0, 0, 0.25)',
                        borderRadius: '14px',
                        padding: '20px',
                        paddingBottom: '36px'
                    }}>
                        {/* Reference Line - Background Layer */}
                        <div
                            style={{
                                position: 'absolute',
                                left: '20px',
                                right: '20px',
                                bottom: `calc(36px + ${(avgEcIn / maxEcOut) * 100}%)`,
                                borderTop: '2px dashed rgba(255, 220, 100, 0.6)',
                                opacity: 0.2,
                                zIndex: 0
                            }}
                        >
                            <span style={{
                                position: 'absolute',
                                right: '0',
                                top: '-22px',
                                fontSize: '0.7rem',
                                fontFamily: 'var(--font-mono)',
                                color: '#ffd966',
                                background: 'rgba(255, 220, 100, 0.15)',
                                border: '1px solid rgba(255, 220, 100, 0.3)',
                                padding: '3px 8px',
                                borderRadius: '6px',
                                fontWeight: 600,
                                whiteSpace: 'nowrap'
                            }}>
                                EC Input: {avgEcIn}
                            </span>
                        </div>

                        {/* Bars Container */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'flex-end',
                            justifyContent: 'space-between',
                            gap: '8px',
                            height: '100%',
                            position: 'relative',
                            zIndex: 10
                        }}>
                            {ecChartData.map((day, idx) => (
                                <div
                                    key={idx}
                                    style={{
                                        flex: 1,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'flex-end',
                                        height: '100%',
                                        position: 'relative',
                                        cursor: 'pointer'
                                    }}
                                    onMouseEnter={() => setShowTooltip(idx)}
                                    onMouseLeave={() => setShowTooltip(null)}
                                >
                                    {/* Value Label - Above Bar */}
                                    <span style={{
                                        fontSize: '0.7rem',
                                        fontFamily: 'var(--font-mono)',
                                        fontWeight: 700,
                                        color: 'rgba(255, 255, 255, 0.85)',
                                        marginBottom: '4px',
                                        textAlign: 'center'
                                    }}>
                                        {day.ecOut}
                                    </span>

                                    {/* Bar Visual */}
                                    <div
                                        style={{
                                            width: '100%',
                                            maxWidth: '42px',
                                            height: `${(day.ecOut / maxEcOut) * 100}%`,
                                            backgroundColor: day.color,
                                            borderRadius: '6px 6px 0 0',
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                            position: 'relative'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.filter = 'brightness(1.3)';
                                            e.currentTarget.style.transform = 'scaleY(1.02)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.filter = 'brightness(1)';
                                            e.currentTarget.style.transform = 'scaleY(1)';
                                        }}
                                    />

                                    {/* Day Label - Below Bar */}
                                    <span style={{
                                        position: 'absolute',
                                        bottom: '-28px',
                                        fontSize: '0.65rem',
                                        fontFamily: 'var(--font-mono)',
                                        color: '#6b7280',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                        opacity: 0.7
                                    }}>
                                        {day.day}
                                    </span>

                                    {/* Enhanced Tooltip */}
                                    {showTooltip === idx && (
                                        <div className="ec-tooltip">
                                            <div className="tooltip-row">
                                                <span>Input:</span>
                                                <span>{day.ecIn}</span>
                                            </div>
                                            <div className="tooltip-row">
                                                <span>Output:</span>
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

                {/* Summary Row */}
                <div className="summary-row">
                    <div className="summary-item">
                        <span className="label">EC Entrada</span>
                        <span className="value">{avgEcIn}</span>
                    </div>
                    <div className="summary-item">
                        <span className="label">EC Salida Hoy</span>
                        <span
                            className="value"
                            style={{ color: ecChartData[ecChartData.length - 1]?.color }}
                        >
                            {ecChartData[ecChartData.length - 1]?.ecOut}
                        </span>
                    </div>
                    <div className="summary-item">
                        <span className="label">Delta</span>
                        <span
                            className="value delta"
                            style={{ color: ecChartData[ecChartData.length - 1]?.color }}
                        >
                            +{ecChartData[ecChartData.length - 1]?.delta}
                        </span>
                    </div>
                    <div className="summary-item status">
                        <span
                            className="status-badge"
                            style={{
                                color: ecChartData[ecChartData.length - 1]?.color,
                                borderColor: ecChartData[ecChartData.length - 1]?.color
                            }}
                        >
                            {ecChartData[ecChartData.length - 1]?.label}
                        </span>
                    </div>
                </div>
            </section>

            {/* 2. TARJETA SECUNDARIA: Generative Steering (Dryback) - LIMPIADA */}
            <section className="flora-card dryback-card">
                <div className="card-header">
                    <div className="header-left">
                        <Moon size={22} color="#a78bfa" />
                        <h3>Generative Steering (Dryback)</h3>
                        {/* Info button removed - text moved to status badge */}
                    </div>
                    <div className="header-target">
                        Objetivo: {floraDrybackData.targetRange.min}% - {floraDrybackData.targetRange.max}%
                    </div>
                </div>

                <div className="dryback-content">
                    {/* Clean Gauge - Sin texto superpuesto */}
                    <div className="dryback-gauge clean">
                        <div className="gauge-track">
                            {/* Zone Background Colors */}
                            <div className="zone vegetative" />
                            <div className="zone generative" />
                            <div className="zone stress" />

                            {/* Fill only */}
                            <div
                                className="gauge-fill"
                                style={{
                                    width: `${Math.min(floraDrybackData.currentDryback, 50) * 2}%`,
                                    backgroundColor: drybackStatus.color
                                }}
                            />

                            {/* Current Marker */}
                            <div
                                className="current-marker"
                                style={{ left: `${Math.min(floraDrybackData.currentDryback, 50) * 2}%` }}
                            />
                        </div>

                        {/* Simple Percentage Markers */}
                        <div className="pct-markers simple">
                            <span>0%</span>
                            <span>15%</span>
                            <span>25%</span>
                            <span>35%</span>
                            <span>50%</span>
                        </div>
                    </div>

                    {/* Value Display with WC Stats */}
                    <div className="dryback-display clean">
                        {/* Main Value */}
                        <div className="dryback-main">
                            <span
                                className="dryback-value"
                                style={{ color: drybackStatus.color }}
                            >
                                {floraDrybackData.currentDryback}%
                            </span>
                            <span className="dryback-label">Dryback</span>
                        </div>

                        {/* WC Stats - Center Absolute */}
                        <div className="wc-stats-clean">
                            <div className="wc-text-row">
                                <span>WC INICIAL</span>
                                <span className="wc-val">{floraDrybackData.lastNightStart}%</span>
                                <span>→</span>
                                <span>WC FINAL</span>
                                <span className="wc-val">{floraDrybackData.lastNightEnd}%</span>
                            </div>
                        </div>

                        {/* Status Badge */}
                        <div
                            className="status-badge-pill"
                            style={{
                                backgroundColor: `${drybackStatus.color}20`,
                                color: drybackStatus.color,
                                borderColor: `${drybackStatus.color}50`
                            }}
                        >
                            {drybackStatus.status === 'generative' ? '◎ ZONA GENERATIVA' : `◎ ${drybackStatus.label.toUpperCase()}`}
                        </div>
                    </div>

                    {/* Action CTA (if out of target) */}
                    {(floraDrybackData.currentDryback < floraDrybackData.targetRange.min ||
                        floraDrybackData.currentDryback > floraDrybackData.targetRange.max) && (
                            <div className="action-cta" style={{ borderColor: `${drybackStatus.color}50` }}>
                                <AlertTriangle size={16} color={drybackStatus.color} />
                                <span>{drybackStatus.action}</span>
                            </div>
                        )}
                </div>
            </section>

            {/* 3. TARJETA TERCIARIA: Clima & DIF - LÓGICA CORREGIDA */}
            <section className="flora-card dif-card">
                <div className="card-header">
                    <div className="header-left">
                        <Thermometer size={22} color="#ff6b6b" />
                        <h3>Clima & DIF</h3>
                    </div>
                    <div
                        className={`dif-badge ${difStatus.status}`}
                        style={{ backgroundColor: `${difStatus.color}20`, color: difStatus.color }}
                    >
                        {difStatus.status === 'stretch_alert' ? (
                            <ArrowUp size={16} />
                        ) : (
                            <span className="dif-icon">{difStatus.icon}</span>
                        )}
                        <span>{difStatus.label}</span>
                    </div>
                </div>

                <div className="dif-content">
                    {/* Dual Bar Chart (Day vs Night) */}
                    <div className="temp-comparison">
                        <div className="temp-bar-group day">
                            <div className="bar-container">
                                <div
                                    className="temp-bar"
                                    style={{ height: `${(floraTempDIFData.dayTemp / 35) * 100}%` }}
                                />
                            </div>
                            <div className="temp-info">
                                <Sun size={18} color="#ffb703" />
                                <span className="temp-value">{floraTempDIFData.dayTemp}°C</span>
                                <span className="temp-label">Día (Max)</span>
                            </div>
                        </div>

                        <div className="dif-indicator">
                            <div className="dif-value" style={{ color: difStatus.color }}>
                                {difStatus.status === 'stretch_alert' ? (
                                    <ArrowUp size={32} className="stretch-icon" />
                                ) : (
                                    <span className="dif-icon-lg">{difStatus.icon}</span>
                                )}
                                <span className="dif-number">{difValue > 0 ? '+' : ''}{difValue.toFixed(1)}°C</span>
                            </div>
                            <span className="dif-label">DIF</span>
                        </div>

                        <div className="temp-bar-group night">
                            <div className="bar-container">
                                <div
                                    className="temp-bar night"
                                    style={{ height: `${(floraTempDIFData.nightTemp / 35) * 100}%` }}
                                />
                            </div>
                            <div className="temp-info">
                                <Moon size={18} color="#a78bfa" />
                                <span className="temp-value">{floraTempDIFData.nightTemp}°C</span>
                                <span className="temp-label">Noche (Min)</span>
                            </div>
                        </div>
                    </div>

                    {/* Status Description */}
                    <div className="dif-status-box" style={{ borderColor: `${difStatus.color}40` }}>
                        <p className="dif-description">{difStatus.description}</p>
                        <p className="dif-benefit" style={{ color: difStatus.color }}>
                            {difStatus.benefit}
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default FloraHighPerformance;
