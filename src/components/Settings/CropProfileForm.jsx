import React, { useState } from 'react';
import { Save, X, Plus, Trash2, ChevronDown, ChevronUp, Edit3, Zap } from 'lucide-react';

const emptyPhase = {
    id: '',
    stage: 'flora',
    name: 'Nueva Fase',
    startWeek: 1,
    endWeek: 2,
    irrigationStrategy: 'Generativa',
    vpdTarget: 1.0, vpdMin: 0.8, vpdMax: 1.2,
    ppfdTarget: 500, ppfdMin: 400, ppfdMax: 600,
    tempTarget: 25.0, tempMin: 22.0, tempMax: 28.0,
    humidityTarget: 60.0, humidityMin: 50.0, humidityMax: 70.0,
    drybackTarget: 30.0, drybackMin: 20.0, drybackMax: 40.0,
    ecInputTarget: 2.5, ecInputMin: 2.0, ecInputMax: 3.0,
    ecOutputTarget: 3.0, ecOutputMin: 2.5, ecOutputMax: 4.0,
    phInputTarget: 6.0, phInputMin: 5.8, phInputMax: 6.2,
    phOutputTarget: 6.0, phOutputMin: 5.5, phOutputMax: 6.5
};

const generateFloraPhases = (totalWeeks) => {
    const lastWeek = totalWeeks;
    const bulkEnd = lastWeek - 1;

    return [
        {
            id: `phase-flora-stretch-${Date.now()}`,
            stage: 'flora',
            name: `Stretch (Semanas 1 a 3)`,
            startWeek: 1,
            endWeek: 3,
            irrigationStrategy: 'Generativa',
            vpdTarget: 1.2, vpdMin: 1.1, vpdMax: 1.3,
            ppfdTarget: 650, ppfdMin: 600, ppfdMax: 700,
            tempTarget: 23.5, tempMin: 23.0, tempMax: 24.0,
            humidityTarget: 55.0, humidityMin: 50.0, humidityMax: 60.0,
            drybackTarget: 45.0, drybackMin: 40.0, drybackMax: 50.0,
            ecInputTarget: 2.8, ecInputMin: 2.5, ecInputMax: 3.2,
            ecOutputTarget: 7.5, ecOutputMin: 5.0, ecOutputMax: 10.0,
            phInputTarget: 5.8, phInputMin: 5.6, phInputMax: 6.0,
            phOutputTarget: 5.8, phOutputMin: 5.5, phOutputMax: 6.2
        },
        {
            id: `phase-flora-bulk-${Date.now()}`,
            stage: 'flora',
            name: `Engorde / Bulking (Semanas 4 a ${bulkEnd})`,
            startWeek: 4,
            endWeek: bulkEnd,
            irrigationStrategy: 'Vegetativa',
            vpdTarget: 1.3, vpdMin: 1.2, vpdMax: 1.4,
            ppfdTarget: 850, ppfdMin: 800, ppfdMax: 900,
            tempTarget: 25.5, tempMin: 25.0, tempMax: 26.0,
            humidityTarget: 57.5, humidityMin: 55.0, humidityMax: 60.0,
            drybackTarget: 35.0, drybackMin: 30.0, drybackMax: 40.0,
            ecInputTarget: 2.8, ecInputMin: 2.5, ecInputMax: 3.5,
            ecOutputTarget: 4.0, ecOutputMin: 3.0, ecOutputMax: 5.0,
            phInputTarget: 6.0, phInputMin: 5.8, phInputMax: 6.2,
            phOutputTarget: 6.0, phOutputMin: 5.5, phOutputMax: 6.5
        },
        {
            id: `phase-flora-ripen-${Date.now()}`,
            stage: 'flora',
            name: `Maduración (Semana ${lastWeek})`,
            startWeek: lastWeek,
            endWeek: lastWeek,
            irrigationStrategy: 'Generativa',
            vpdTarget: 1.4, vpdMin: 1.3, vpdMax: 1.5,
            ppfdTarget: 800, ppfdMin: 700, ppfdMax: 850,
            tempTarget: 22.5, tempMin: 22.0, tempMax: 23.0,
            humidityTarget: 50.0, humidityMin: 45.0, humidityMax: 55.0,
            drybackTarget: 45.0, drybackMin: 40.0, drybackMax: 50.0,
            ecInputTarget: 1.5, ecInputMin: 1.0, ecInputMax: 2.0,
            ecOutputTarget: 2.0, ecOutputMin: 1.0, ecOutputMax: 3.0,
            phInputTarget: 6.2, phInputMin: 6.0, phInputMax: 6.5,
            phOutputTarget: 6.0, phOutputMin: 5.5, phOutputMax: 6.5
        }
    ];
};

const CropProfileForm = ({ profile, onSave, onCancel, initialExpandedPhaseId }) => {
    const [formData, setFormData] = useState({ ...profile });
    const [expandedPhases, setExpandedPhases] = useState(() => {
        if (initialExpandedPhaseId) {
            // Only expand the specific phase the user clicked edit on
            return { [initialExpandedPhaseId]: true };
        }
        return {};
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handlePhaseChange = (index, field, value) => {
        const newPhases = [...formData.phases];

        // Handle number conversions for specific fields
        if (['startWeek', 'endWeek'].includes(field)) {
            newPhases[index][field] = value === '' ? '' : parseInt(value);
        } else if (['vpdTarget', 'vpdMin', 'vpdMax', 'ppfdTarget', 'ppfdMin', 'ppfdMax',
            'tempTarget', 'tempMin', 'tempMax', 'drybackTarget', 'drybackMin', 'drybackMax',
            'humidityTarget', 'humidityMin', 'humidityMax',
            'ecInputTarget', 'ecInputMin', 'ecInputMax',
            'ecOutputTarget', 'ecOutputMin', 'ecOutputMax',
            'phInputTarget', 'phInputMin', 'phInputMax',
            'phOutputTarget', 'phOutputMin', 'phOutputMax'].includes(field)) {
            newPhases[index][field] = value === '' ? '' : parseFloat(value);
        } else {
            newPhases[index][field] = value;
        }

        setFormData({ ...formData, phases: newPhases });
    };

    const addPhase = () => {
        const newPhase = { ...emptyPhase, id: `phase-${Date.now()}` };
        const newPhases = [...(formData.phases || []), newPhase];
        setFormData({ ...formData, phases: newPhases });
        setExpandedPhases({ ...expandedPhases, [newPhase.id]: true });
    };

    const removePhase = (index) => {
        if (window.confirm('¿Eliminar esta fase?')) {
            const newPhases = [...formData.phases];
            newPhases.splice(index, 1);
            setFormData({ ...formData, phases: newPhases });
        }
    };

    const togglePhase = (id) => {
        setExpandedPhases(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleAutoGenerateFlora = () => {
        const weeks = parseInt(formData.floraTotalWeeks) || 8;
        if (!window.confirm(`¿Auto-generar 3 fases de flora para ${weeks} semanas? Esto reemplazará las fases de flora existentes.`)) return;

        const nonFloraPhases = (formData.phases || []).filter(p => p.stage !== 'flora');
        const newFloraPhases = generateFloraPhases(weeks);
        const allPhases = [...nonFloraPhases, ...newFloraPhases];

        setFormData({ ...formData, phases: allPhases });
        // Auto-expand new phases
        const newExpanded = { ...expandedPhases };
        newFloraPhases.forEach(p => { newExpanded[p.id] = true; });
        setExpandedPhases(newExpanded);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    const renderMetricGroup = (phase, index, label, fieldPrefix, unit, step = '0.1') => (
        <div className="metric-group">
            <h5>{label} ({unit})</h5>
            <div className="min-max-grid">
                <div className="form-group">
                    <label>Mínimo</label>
                    <input
                        type="number"
                        step={step}
                        className="form-input"
                        value={phase[`${fieldPrefix}Min`] ?? ''}
                        onChange={(e) => handlePhaseChange(index, `${fieldPrefix}Min`, e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label>Objetivo</label>
                    <input
                        type="number"
                        step={step}
                        className="form-input target-input"
                        value={phase[`${fieldPrefix}Target`] ?? ''}
                        onChange={(e) => handlePhaseChange(index, `${fieldPrefix}Target`, e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label>Máximo</label>
                    <input
                        type="number"
                        step={step}
                        className="form-input"
                        value={phase[`${fieldPrefix}Max`] ?? ''}
                        onChange={(e) => handlePhaseChange(index, `${fieldPrefix}Max`, e.target.value)}
                    />
                </div>
            </div>
        </div>
    );

    return (
        <form className="profile-form" onSubmit={handleSubmit}>
            <div className="form-header">
                <h2>
                    {profile.id.startsWith('profile-') && profile.name === 'Nueva Receta' ? 'Crear Receta' : 'Editar Receta'}
                </h2>
                <div className="form-actions">
                    <button type="button" className="btn-secondary" onClick={onCancel}>
                        <X size={16} /> Cancelar
                    </button>
                    <button type="submit" className="btn-primary">
                        <Save size={16} /> Guardar Cambios
                    </button>
                </div>
            </div>

            <div className="form-section">
                <h3>Información General</h3>
                <div className="form-row">
                    <div className="form-group" style={{ flex: 2 }}>
                        <label>Nombre de la Receta</label>
                        <input
                            type="text"
                            name="name"
                            className="form-input"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                        <label>Semanas de Flora</label>
                        <select
                            className="form-select"
                            value={formData.floraTotalWeeks || 8}
                            onChange={(e) => setFormData({ ...formData, floraTotalWeeks: parseInt(e.target.value) })}
                        >
                            <option value={7}>7 semanas</option>
                            <option value={8}>8 semanas</option>
                            <option value={9}>9 semanas</option>
                            <option value={10}>10 semanas</option>
                        </select>
                    </div>
                </div>
                <div className="form-group">
                    <label>Descripción</label>
                    <textarea
                        name="description"
                        className="form-textarea"
                        value={formData.description}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div className="form-section phases-editor">
                <div className="phases-header">
                    <h3>Fases del Cultivo</h3>
                    <div className="phases-header-actions">
                        <button
                            type="button"
                            className="btn-autogen"
                            onClick={handleAutoGenerateFlora}
                            title={`Auto-generar fases de flora para ${formData.floraTotalWeeks || 8} semanas`}
                        >
                            <Zap size={16} /> Auto-generar Flora ({formData.floraTotalWeeks || 8}sem)
                        </button>
                        <button type="button" className="btn-primary" onClick={addPhase}>
                            <Plus size={16} /> Agregar Fase
                        </button>
                    </div>
                </div>

                {formData.phases && formData.phases.length > 0 ? (
                    <div className="phases-edit-list">
                        {formData.phases.map((phase, index) => {
                            const isExpanded = expandedPhases[phase.id] ?? true;

                            return (
                                <div key={phase.id} className="phase-edit-card">
                                    <div
                                        className="phase-edit-header"
                                        onClick={() => togglePhase(phase.id)}
                                    >
                                        <div className="phase-edit-title">
                                            <span className={`phase-badge phase-${phase.stage.toLowerCase()}`}>
                                                {phase.stage}
                                            </span>
                                            <span className="phase-edit-name">{phase.name || 'Fase sin nombre'}</span>
                                            {phase.stage === 'flora' && phase.startWeek && (
                                                <span className="phase-edit-weeks">
                                                    (Semana {phase.startWeek} a {phase.endWeek || phase.startWeek})
                                                </span>
                                            )}
                                        </div>
                                        <div className="phase-edit-actions">
                                            <button
                                                type="button"
                                                className="phase-delete-btn"
                                                onClick={(e) => { e.stopPropagation(); removePhase(index); }}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                            {isExpanded ? <ChevronUp size={20} className="chevron-icon" /> : <ChevronDown size={20} className="chevron-icon" />}
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div className="phase-edit-body animate-fade-in">
                                            {/* Phase Basic Configuration */}
                                            <div className="phase-basic-config">
                                                <div className="form-group">
                                                    <label>Identificador / Nombre</label>
                                                    <input
                                                        type="text"
                                                        className="form-input"
                                                        value={phase.name}
                                                        onChange={(e) => handlePhaseChange(index, 'name', e.target.value)}
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label>Etapa Base</label>
                                                    <select
                                                        className="form-select"
                                                        value={phase.stage}
                                                        onChange={(e) => handlePhaseChange(index, 'stage', e.target.value)}
                                                    >
                                                        <option value="clone">Clones / Esquejes</option>
                                                        <option value="vege">Vegetativo</option>
                                                        <option value="flora">Floración</option>
                                                    </select>
                                                </div>

                                                {phase.stage === 'flora' ? (
                                                    <>
                                                        <div className="form-group phase-weeks-group">
                                                            <div className="week-field">
                                                                <label>Semana Inicio</label>
                                                                <input
                                                                    type="number"
                                                                    min="1"
                                                                    className="form-input"
                                                                    value={phase.startWeek || ''}
                                                                    onChange={(e) => handlePhaseChange(index, 'startWeek', e.target.value)}
                                                                />
                                                            </div>
                                                            <div className="week-field">
                                                                <label>Fin</label>
                                                                <input
                                                                    type="number"
                                                                    min={phase.startWeek || 1}
                                                                    className="form-input"
                                                                    value={phase.endWeek || ''}
                                                                    onChange={(e) => handlePhaseChange(index, 'endWeek', e.target.value)}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="form-group">
                                                            <label>Estrategia Riego</label>
                                                            <select
                                                                className="form-select"
                                                                value={phase.irrigationStrategy || ''}
                                                                onChange={(e) => handlePhaseChange(index, 'irrigationStrategy', e.target.value)}
                                                            >
                                                                <option value="">Seleccionar...</option>
                                                                <option value="Vegetativa">Vegetativa (P1/P2)</option>
                                                                <option value="Generativa">Generativa (P1/P3)</option>
                                                            </select>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="form-group">
                                                        <label>Estrategia (Opcional)</label>
                                                        <input
                                                            type="text"
                                                            className="form-input"
                                                            placeholder="Ej: Mantenimiento Madres"
                                                            value={phase.irrigationStrategy || ''}
                                                            onChange={(e) => handlePhaseChange(index, 'irrigationStrategy', e.target.value)}
                                                        />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="phase-metrics-divider"></div>

                                            {/* Metrics Configuration Form */}
                                            <div className="metrics-grid">
                                                {renderMetricGroup(phase, index, 'VPD', 'vpd', 'kPa')}
                                                {renderMetricGroup(phase, index, 'PPFD (Luz)', 'ppfd', 'µmol/m²/s', '10')}
                                                {renderMetricGroup(phase, index, 'Temp. Riego', 'temp', '°C')}
                                                {renderMetricGroup(phase, index, 'Humedad Rel.', 'humidity', '%', '1')}
                                                {renderMetricGroup(phase, index, 'Dryback Diario', 'dryback', '%', '1')}
                                                {renderMetricGroup(phase, index, 'EC Entrada', 'ecInput', 'mS/cm')}
                                                {renderMetricGroup(phase, index, 'EC Salida', 'ecOutput', 'mS/cm')}
                                                {renderMetricGroup(phase, index, 'pH Entrada', 'phInput', '')}
                                                {renderMetricGroup(phase, index, 'pH Salida', 'phOutput', '')}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="empty-phases">
                        <p>No hay fases configuradas. Agrega tu primera fase para comenzar.</p>
                        <button type="button" className="btn-secondary" onClick={addPhase}>
                            <Plus size={16} /> Agregar Fase
                        </button>
                    </div>
                )}
            </div>
        </form>
    );
};

export default CropProfileForm;
