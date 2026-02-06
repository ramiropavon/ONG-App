import React, { useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import {
    AlertTriangle, Zap, Sprout, Flower, TrendingUp
} from 'lucide-react';
import { rooms, batches, tasks } from '../data/mockData';
import './Dashboard.css';

const Dashboard = ({ navigateTo }) => {
    // Global Calculations
    const stats = useMemo(() => {
        let floraPlants = 0;
        let vegePlants = 0;
        let totalWatts = 0;
        let dailyKwh = 0;

        // Plant Counts
        batches.forEach(b => {
            if (b.phase === 'Flora') floraPlants += b.plantCount;
            if (b.phase === 'Vege' || b.phase === 'Enraizado') vegePlants += b.plantCount;
        });

        // Energy (Mock: Vege 18h, Flora 12h)
        rooms.forEach(r => {
            const hours = r.type === 'Vege' ? 18 : 12;
            const kwh = (r.lightsWatts * hours) / 1000;
            dailyKwh += kwh;
            totalWatts += r.lightsWatts;
        });

        // Mock Cost (0.15$ per kWh)
        const dailyCost = dailyKwh * 0.15;

        // Active Alerts (High severity only)
        const criticalTasks = tasks.filter(t => t.scheduledDate <= new Date().toISOString().split('T')[0] && t.status === 'Pending');

        return {
            floraPlants,
            vegePlants,
            totalWatts,
            dailyCost: dailyCost.toFixed(2),
            criticalTasks
        };
    }, []);

    const plantDistData = [
        { name: 'Vegetativo', count: stats.vegePlants, color: '#4cc9f0' },
        { name: 'Floración', count: stats.floraPlants, color: '#f72585' },
    ];

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <div>
                    <h2 className="view-title">Resumen General ONG</h2>
                    <p className="view-subtitle">Estado global del cultivo y operaciones</p>
                </div>
                <div className="live-badge">ONLINE</div>
            </header>

            {/* Global KPI Grid */}
            <div className="kpi-grid">
                <div className="kpi-card">
                    <div className="kpi-icon"><Flower size={24} color="#f72585" /></div>
                    <div className="kpi-content">
                        <span className="kpi-label">Plantas en Flora</span>
                        <div className="kpi-value">{stats.floraPlants}</div>
                        <span className="kpi-sub">Total en salas Flora</span>
                    </div>
                </div>

                <div className="kpi-card">
                    <div className="kpi-icon"><Sprout size={24} color="#4cc9f0" /></div>
                    <div className="kpi-content">
                        <span className="kpi-label">Plantas en Vege</span>
                        <div className="kpi-value">{stats.vegePlants}</div>
                        <span className="kpi-sub">Madres + Esquejes</span>
                    </div>
                </div>

                <div className="kpi-card">
                    <div className="kpi-icon"><Zap size={24} color="#ffb703" /></div>
                    <div className="kpi-content">
                        <span className="kpi-label">Gasto Energético</span>
                        <div className="kpi-value">${stats.dailyCost}</div>
                        <span className="kpi-sub">Estimado diario ({stats.totalWatts}W Total)</span>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-icon"><TrendingUp size={24} color="#06d6a0" /></div>
                    <div className="kpi-content">
                        <span className="kpi-label">Salud del Cultivo</span>
                        <div className="kpi-value">98%</div>
                        <span className="kpi-sub">Sin plagas activas reportadas</span>
                    </div>
                </div>
            </div>

            <div className="charts-grid">
                <div className="chart-card">
                    <h3>Distribución de Plantas</h3>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={plantDistData}>
                                <XAxis dataKey="name" stroke="#666" />
                                <YAxis stroke="#666" />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                                />
                                <Bar dataKey="count" barSize={60} radius={[4, 4, 0, 0]}>
                                    {plantDistData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="alerts-section" style={{ flex: 1 }}>
                    <h3>Alertas y Tareas Urgentes</h3>
                    {stats.criticalTasks.length > 0 ? (
                        stats.criticalTasks.map(t => (
                            <div key={t.id} className="alert-item warning">
                                <AlertTriangle size={20} />
                                <span><strong>Tarea Pendiente:</strong> {t.task}</span>
                            </div>
                        ))
                    ) : (
                        <div className="alert-item" style={{ borderLeft: '4px solid #06d6a0' }}>
                            <Zap size={20} color="#06d6a0" />
                            <span>Todo al día. Buen trabajo.</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
