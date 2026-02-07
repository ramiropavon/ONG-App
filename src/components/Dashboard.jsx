import React, { useMemo, useState } from 'react';
import {
    Calendar, Flower, Sprout, Zap, Activity, Droplets, Thermometer, Wind
} from 'lucide-react';
import { rooms, batches, tasks, genetics } from '../data/mockData';
import './Dashboard.css';

const Dashboard = ({ navigateTo }) => {
    const [dateRange, setDateRange] = useState('24h');

    // Global Scale Factor based on Date Range
    const timeFactor = useMemo(() => {
        switch (dateRange) {
            case '7d': return 7;
            case '30d': return 30;
            default: return 1;
        }
    }, [dateRange]);

    const stats = useMemo(() => {
        let floraPlants = 0;
        let floraMax = 0;
        let vegeClones = 0; // From batches (Esquejes)
        let vegeMothers = 0; // From Room Bed config
        let totalWatts = 0;
        let dailyKwh = 0;

        // 1. Plant Counts & Capacity
        rooms.forEach(r => {
            if (r.type === 'Flora') floraMax += (r.maxCapacity || 0);
            if (r.type === 'Vege') {
                // Count Mothers from beds
                const motherBed = r.beds?.find(b => b.type === 'Madres');
                if (motherBed) vegeMothers += motherBed.count;
            }

            // Energy Calculation
            const hours = r.type === 'Vege' ? 18 : 12;
            const kwh = (r.lightsWatts * hours) / 1000;
            dailyKwh += kwh;
            totalWatts += r.lightsWatts;
        });

        batches.forEach(b => {
            if (b.phase === 'Flora') floraPlants += b.plantCount;
            if (b.phase === 'Enraizado' || b.phase === 'Vege') vegeClones += b.plantCount;
        });

        // 2. Costs
        const kwhTotal = dailyKwh * timeFactor;
        const estimatedCost = kwhTotal * 0.15; // $0.15 per kWh

        // 3. Environment Stability (Mock)
        // Check if rooms are within target VPD (0.8 - 1.2 typically)
        // This is a mock "score"
        const stabilityScore = 92; // Fixed high score for demo

        return {
            floraPlants,
            floraMax,
            vegeClones,
            vegeMothers,
            kwhTotal: kwhTotal.toFixed(0),
            costCurrency: estimatedCost.toFixed(2),
            stabilityScore,
            totalWatts
        };
    }, [timeFactor]);

    // Helper: Determine Cycle Stage
    const getCycleDetails = (room, batch) => {
        if (!batch) return { percent: 0, label: 'Sin Cultivo', color: 'var(--text-muted)' };

        let totalDays = 60; // Default
        let color = '#4cc9f0'; // Vege cyan

        if (room.type === 'Flora') {
            const gen = genetics.find(g => g.id === batch.geneticsId);
            totalDays = gen ? gen.floweringDays : 63;
            color = '#f72585'; // Flora magenta
        } else {
            totalDays = 21; // Rooting/Vege cycle assumption
        }

        const progress = Math.min(100, (batch.currentDay / totalDays) * 100);
        let statusLabel = `Día ${batch.currentDay}`;

        // Semantic Labeling
        if (room.type === 'Flora') {
            const week = Math.ceil(batch.currentDay / 7);
            if (week <= 2) statusLabel = `Semana ${week} - Estiramiento`;
            else if (week <= 5) statusLabel = `Semana ${week} - Generación de Pistilos`;
            else if (week <= 7) statusLabel = `Semana ${week} - Engorde`;
            else {
                statusLabel = `Semana ${week} - Maduración/Lavado`;
                color = '#ffb703'; // Amber for finish
            }
        } else {
            statusLabel = `Enraizado - Día ${batch.currentDay}`;
        }

        return { percent: progress, label: statusLabel, color, totalDays };
    };

    return (
        <div className="dashboard">
            <header className="dashboard-header-modern">
                <div className="header-titles">
                    <h2 className="view-title">Dashboard General</h2>
                    <p className="view-subtitle">Monitor de Ciclos & Eficiencia Ambiental</p>
                </div>

                <div className="header-actions">
                    <div className="date-range-picker">
                        <Calendar size={16} className="calendar-icon" />
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            className="bg-transparent border-none text-sm font-medium focus:outline-none"
                        >
                            <option value="24h">Últimas 24h</option>
                            <option value="7d">Últimos 7 días</option>
                            <option value="30d">Últimos 30 días</option>
                        </select>
                    </div>
                </div>
            </header>

            {/* NEW KPI Grid */}
            <div className="kpi-grid">
                {/* 1. Flora Capacity */}
                <div className="kpi-card">
                    <div className="kpi-icon"><Flower size={24} color="#f72585" /></div>
                    <div className="kpi-content">
                        <span className="kpi-label">Plantas Flora</span>
                        <div className="kpi-value">{stats.floraPlants}</div>
                        <span className="kpi-sub">Ocupación: {stats.floraPlants}/{stats.floraMax}</span>
                    </div>
                </div>

                {/* 2. Vege Split */}
                <div className="kpi-card">
                    <div className="kpi-icon"><Sprout size={24} color="#4cc9f0" /></div>
                    <div className="kpi-content">
                        <span className="kpi-label">Sala Vegetativo</span>
                        <div className="kpi-value-split">
                            <span>{stats.vegeClones} <small>Esquejes</small></span>
                            <span className="divider">|</span>
                            <span>{stats.vegeMothers} <small>Madres</small></span>
                        </div>
                    </div>
                </div>

                {/* 3. Energy Dynamic */}
                <div className="kpi-card">
                    <div className="kpi-icon"><Zap size={24} color="#ffb703" /></div>
                    <div className="kpi-content">
                        <span className="kpi-label">Consumo Total</span>
                        <div className="kpi-value">{stats.kwhTotal} <small style={{ fontSize: '0.4em' }}>kWh</small></div>
                        <span className="kpi-sub">Costo est.: ${stats.costCurrency} ({dateRange})</span>
                    </div>
                </div>

                {/* 4. Environmental Stability */}
                <div className="kpi-card">
                    <div className="kpi-icon"><Activity size={24} color={stats.stabilityScore > 90 ? '#06d6a0' : '#ffd166'} /></div>
                    <div className="kpi-content">
                        <span className="kpi-label">Estabilidad Amb.</span>
                        <div className="kpi-value" style={{ color: stats.stabilityScore > 90 ? '#06d6a0' : '#ffd166' }}>
                            {stats.stabilityScore}%
                        </div>
                        <span className="kpi-sub">% tiempo en rango VPD</span>
                    </div>
                </div>
            </div>

            {/* Central Section: Room Cycle Progress */}
            <section className="cycle-section">
                <h3 className="section-title">Progreso de Ciclos Activos</h3>
                <div className="cycle-list">
                    {rooms.map(room => {
                        const activeBatch = batches.find(b => b.roomId === room.id);
                        const { percent, label, color } = getCycleDetails(room, activeBatch);

                        return (
                            <div key={room.id} className="cycle-row" onClick={() => navigateTo('room', room.id)}>
                                <div className="cycle-info">
                                    <div className="room-name-group">
                                        <div className="room-title-row">
                                            <h4>{room.name}</h4>
                                            {room.type === 'Flora' && activeBatch && (
                                                <span className="genetics-badge" style={{ backgroundColor: genetics.find(g => g.id === activeBatch.geneticsId)?.color + '33', color: genetics.find(g => g.id === activeBatch.geneticsId)?.color }}>
                                                    {genetics.find(g => g.id === activeBatch.geneticsId)?.name}
                                                </span>
                                            )}
                                        </div>
                                        <span className="batch-name">{activeBatch ? activeBatch.name : 'Sin cultivo'}</span>
                                    </div>

                                    <div className="metrics-container">
                                        <div className="env-summary">
                                            <div className="env-pill"><Thermometer size={12} /> {room.temp}°C</div>
                                            <div className="env-pill"><Droplets size={12} /> {room.humidity}%</div>
                                            <div className="env-pill highlight"><Wind size={12} /> {room.vpd} VPD</div>
                                            <div className="env-pill tech"><Zap size={12} /> {room.ppfd} PPFD</div>
                                            <div className="env-pill tech"><Activity size={12} /> {room.co2} ppm</div>
                                        </div>

                                        {room.strategy && (
                                            <div className="irrigation-summary">
                                                <div className="irr-pill"><Droplets size={12} color="var(--accent-primary)" /> EC {room.strategy.ec}</div>
                                                <div className="irr-pill"><Activity size={12} color="#4cc9f0" /> pH {room.strategy.ph}</div>
                                                <div className="irr-pill"><Thermometer size={12} color="#ffb703" /> {room.strategy.waterTemp}°C</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="cycle-progress-container">
                                    <div className="progress-meta">
                                        <span className="stage-badge" style={{ borderColor: color, color: color }}>
                                            {label}
                                        </span>
                                        <span className="progress-pct">{Math.round(percent)}%</span>
                                    </div>
                                    <div className="progress-track">
                                        <div
                                            className="progress-fill"
                                            style={{ width: `${percent}%`, backgroundColor: color }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>
        </div>
    );
};

export default Dashboard;
