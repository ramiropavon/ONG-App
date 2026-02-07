import React, { useMemo, useState } from 'react';
import {
    Sprout, Leaf, TreeDeciduous, AlertTriangle, ChevronRight,
    Calendar, Scissors, Heart, Clock, Target, TrendingUp
} from 'lucide-react';
import { rooms, genetics } from '../data/mockData';
import { vegePipelineData, motherPlants } from '../data/vegeData';
import './VegePipeline.css';

const VegePipeline = ({ navigateTo }) => {
    const [selectedMother, setSelectedMother] = useState(null);

    // Current date for calculations
    const currentDate = new Date();

    // Calculate stages data
    const stagesData = useMemo(() => {
        const nursery = vegePipelineData.filter(b => b.stage === 'nursery');
        const preVege = vegePipelineData.filter(b => b.stage === 'pre-vege');
        const vege = vegePipelineData.filter(b => b.stage === 'vege');

        const calcAvgDays = (batches) => {
            if (batches.length === 0) return 0;
            const total = batches.reduce((sum, b) => sum + b.daysInStage, 0);
            return Math.round(total / batches.length);
        };

        const countPlants = (batches) => batches.reduce((sum, b) => sum + b.plantCount, 0);
        const countGenetics = (batches) => new Set(batches.map(b => b.geneticsId)).size;

        return {
            nursery: {
                totalPlants: countPlants(nursery),
                avgDays: calcAvgDays(nursery),
                targetDays: 14,
                geneticsCount: countGenetics(nursery),
                batches: nursery,
            },
            preVege: {
                totalPlants: countPlants(preVege),
                avgDays: calcAvgDays(preVege),
                targetDays: 15,
                geneticsCount: countGenetics(preVege),
                batches: preVege,
            },
            vege: {
                totalPlants: countPlants(vege),
                avgDays: calcAvgDays(vege),
                targetDays: 21,
                geneticsCount: countGenetics(vege),
                batches: vege,
            },
        };
    }, []);

    // Next Event Data (Mock: Flora A Reset)
    const nextEvent = useMemo(() => {
        const floraRoom = rooms.find(r => r.id === 'R2');
        const targetPlants = floraRoom?.maxCapacity || 140;
        const stockAvailable = stagesData.vege.totalPlants;
        const daysUntilReset = 10; // Mock value
        const hasDeficit = stockAvailable < targetPlants;

        return {
            eventName: 'RESET SALA FLORA A',
            daysRemaining: daysUntilReset,
            targetPlants,
            stockAvailable,
            hasDeficit,
            deficitAmount: hasDeficit ? targetPlants - stockAvailable : 0,
        };
    }, [stagesData]);

    // Helper: Get genetic info
    const getGeneticInfo = (geneticsId) => {
        return genetics.find(g => g.id === geneticsId) || { name: 'Desconocida', color: '#666' };
    };

    // Helper: Calculate days since date
    const daysSince = (dateString) => {
        const date = new Date(dateString);
        const diffTime = Math.abs(currentDate - date);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    // Handle stage card click
    const handleStageClick = (stageName) => {
        navigateTo(`vege-${stageName}-details`);
    };

    // Handle mother card click
    const handleMotherClick = (mother) => {
        setSelectedMother(selectedMother?.id === mother.id ? null : mother);
    };

    return (
        <div className="vege-pipeline">
            {/* Header with Next Event Banner */}
            <header className="pipeline-header">
                <div className="header-titles">
                    <h2 className="view-title">Sala Vege - Pipeline de Producción</h2>
                    <p className="view-subtitle">Flujo de Propagación y Control de Stock</p>
                </div>
            </header>

            {/* SyncStatusBanner - Next Event */}
            <div className={`sync-status-banner ${nextEvent.hasDeficit ? 'deficit' : 'healthy'}`}>
                <div className="banner-content">
                    <div className="banner-main">
                        <div className="event-icon">
                            <Calendar size={24} />
                        </div>
                        <div className="event-info">
                            <span className="event-label">Próximo Evento</span>
                            <h3 className="event-name">{nextEvent.eventName}</h3>
                        </div>
                    </div>

                    <div className="banner-stats">
                        <div className="stat-item">
                            <Clock size={16} />
                            <span className="stat-value">{nextEvent.daysRemaining}</span>
                            <span className="stat-label">días</span>
                        </div>
                        <div className="stat-divider" />
                        <div className="stat-item">
                            <Target size={16} />
                            <span className="stat-value">{nextEvent.targetPlants}</span>
                            <span className="stat-label">objetivo</span>
                        </div>
                        <div className="stat-divider" />
                        <div className="stat-item stock">
                            <TrendingUp size={16} />
                            <span className={`stat-value ${nextEvent.hasDeficit ? 'deficit-value' : ''}`}>
                                {nextEvent.stockAvailable}
                            </span>
                            <span className="stat-label">stock vege</span>
                        </div>
                    </div>
                </div>

                {nextEvent.hasDeficit && (
                    <div className="deficit-alert">
                        <AlertTriangle size={18} />
                        <span>Déficit Detectado: Faltan <strong>{nextEvent.deficitAmount}</strong> plantas</span>
                    </div>
                )}
            </div>

            {/* Stage Cards Grid */}
            <section className="stages-section">
                <h3 className="section-title">Etapas del Pipeline</h3>

                <div className="stages-grid">
                    {/* Nursery Card */}
                    <div
                        className="stage-card nursery"
                        onClick={() => handleStageClick('nursery')}
                    >
                        <div className="stage-header">
                            <div className="stage-icon nursery-icon">
                                <span className="emoji-icon">🌱</span>
                            </div>
                            <div className="stage-meta">
                                <span className="stage-label">NURSERY</span>
                                <span className="stage-sublabel">Aeroclonador</span>
                            </div>
                            <ChevronRight className="stage-arrow" size={20} />
                        </div>

                        <div className="stage-big-number">
                            {stagesData.nursery.totalPlants}
                            <span className="big-number-unit">esquejes</span>
                        </div>

                        <div className="stage-details">
                            <div className="detail-row">
                                <Leaf size={14} />
                                <span>{stagesData.nursery.geneticsCount} Genéticas Activas</span>
                            </div>
                            <div className="detail-row metric">
                                <Clock size={14} />
                                <span>
                                    Día Promedio: <strong>{stagesData.nursery.avgDays}</strong>
                                    <span className="target-text"> (Meta: {stagesData.nursery.targetDays})</span>
                                </span>
                            </div>
                        </div>

                        <div className="stage-progress">
                            <div
                                className="progress-bar"
                                style={{
                                    width: `${Math.min(100, (stagesData.nursery.avgDays / stagesData.nursery.targetDays) * 100)}%`
                                }}
                            />
                        </div>
                    </div>

                    {/* Pre-Vege Card */}
                    <div
                        className="stage-card pre-vege"
                        onClick={() => handleStageClick('pre-vege')}
                    >
                        <div className="stage-header">
                            <div className="stage-icon pre-vege-icon">
                                <span className="emoji-icon">🌿</span>
                            </div>
                            <div className="stage-meta">
                                <span className="stage-label">PRE-VEGE</span>
                                <span className="stage-sublabel">Endurecimiento</span>
                            </div>
                            <ChevronRight className="stage-arrow" size={20} />
                        </div>

                        <div className="stage-big-number">
                            {stagesData.preVege.totalPlants}
                            <span className="big-number-unit">plantas</span>
                        </div>

                        <div className="stage-details">
                            <div className="detail-row">
                                <Sprout size={14} />
                                <span>Enraizando en sustrato</span>
                            </div>
                            <div className="detail-row metric">
                                <Clock size={14} />
                                <span>
                                    Día Promedio: <strong>{stagesData.preVege.avgDays}</strong>
                                    <span className="target-text"> (Meta: {stagesData.preVege.targetDays})</span>
                                </span>
                            </div>
                        </div>

                        <div className="stage-progress">
                            <div
                                className="progress-bar"
                                style={{
                                    width: `${Math.min(100, (stagesData.preVege.avgDays / stagesData.preVege.targetDays) * 100)}%`
                                }}
                            />
                        </div>
                    </div>

                    {/* Vege Card */}
                    <div
                        className="stage-card vege"
                        onClick={() => handleStageClick('vege')}
                    >
                        <div className="stage-header">
                            <div className="stage-icon vege-icon">
                                <span className="emoji-icon">🌳</span>
                            </div>
                            <div className="stage-meta">
                                <span className="stage-label">VEGE</span>
                                <span className="stage-sublabel">Listas para Flora - Coco 5L</span>
                            </div>
                            <ChevronRight className="stage-arrow" size={20} />
                        </div>

                        <div className="stage-big-number">
                            {stagesData.vege.totalPlants}
                            <span className="big-number-unit">plantas</span>
                            {stagesData.vege.avgDays > stagesData.vege.targetDays && (
                                <span className="ready-badge">READY TO FLIP</span>
                            )}
                        </div>

                        <div className="stage-details">
                            <div className="detail-row">
                                <TreeDeciduous size={14} />
                                <span>Stock disponible para Flora</span>
                            </div>
                            <div className="detail-row metric">
                                <Clock size={14} />
                                <span>
                                    Día Promedio: <strong>{stagesData.vege.avgDays}</strong>
                                    <span className="target-text"> (Meta: {stagesData.vege.targetDays})</span>
                                </span>
                            </div>
                        </div>

                        <div className="stage-progress overflow">
                            <div
                                className="progress-bar"
                                style={{
                                    width: `${Math.min(100, (stagesData.vege.avgDays / stagesData.vege.targetDays) * 100)}%`
                                }}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Mothers Section */}
            <section className="mothers-section">
                <h3 className="section-title">
                    <span>Banco de Madres</span>
                    <span className="mother-count">{motherPlants.length} activas</span>
                </h3>

                <div className="mothers-carousel">
                    {motherPlants.map(mother => {
                        const daysLastCut = daysSince(mother.lastCutDate);
                        const isRecovered = daysLastCut >= mother.recoveryDaysNeeded;
                        const isSelected = selectedMother?.id === mother.id;

                        return (
                            <div
                                key={mother.id}
                                className={`mother-card ${isSelected ? 'expanded' : ''} ${isRecovered ? 'ready' : 'recovering'}`}
                                onClick={() => handleMotherClick(mother)}
                            >
                                <div className="mother-header">
                                    <div className="mother-strain">
                                        <span
                                            className="strain-dot"
                                            style={{ backgroundColor: getGeneticInfo(mother.geneticsId).color }}
                                        />
                                        <span className="strain-name">{mother.strain}</span>
                                    </div>
                                    <div className={`health-badge ${mother.health.toLowerCase()}`}>
                                        <Heart size={12} />
                                        {mother.health}
                                    </div>
                                </div>

                                <div className="mother-stats">
                                    <div className="stat">
                                        <Scissors size={14} />
                                        <span>Último corte: hace {daysLastCut} días</span>
                                    </div>
                                    <div className="stat">
                                        <Clock size={14} />
                                        <span>Edad: {mother.ageDays} días</span>
                                    </div>
                                </div>

                                {isRecovered ? (
                                    <div className="recovery-status ready">
                                        <span className="status-dot" />
                                        Lista para corte
                                    </div>
                                ) : (
                                    <div className="recovery-status recovering">
                                        <span className="status-dot" />
                                        Recuperando ({mother.recoveryDaysNeeded - daysLastCut} días restantes)
                                    </div>
                                )}

                                {isSelected && (
                                    <div className="mother-expanded">
                                        <div className="expanded-divider" />
                                        <div className="expanded-stats">
                                            <div className="exp-stat">
                                                <span className="exp-label">Promedio por Corte</span>
                                                <span className="exp-value">{mother.avgClonesPerCut} esquejes</span>
                                            </div>
                                            <div className="exp-stat">
                                                <span className="exp-label">Días Recuperación</span>
                                                <span className="exp-value">{mother.recoveryDaysNeeded} días</span>
                                            </div>
                                            <div className="exp-stat">
                                                <span className="exp-label">Total Cortes</span>
                                                <span className="exp-value">{mother.totalCuts || 12}</span>
                                            </div>
                                        </div>
                                        <button className="view-history-btn">
                                            Ver Historial Completo
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </section>
        </div>
    );
};

export default VegePipeline;
