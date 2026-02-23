import React, { useState } from 'react';
import { Save, X, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

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
    ecTarget: 2.5, ecMin: 2.0, ecMax: 3.0
};

const CropProfileForm = ({ profile, onSave, onCancel }) => {
    const [formData, setFormData] = useState({ ...profile });
    const [expandedPhases, setExpandedPhases] = useState({});

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
            'humidityTarget', 'humidityMin', 'humidityMax', 'ecTarget', 'ecMin', 'ecMax'].includes(field)) {
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
                        value={phase[`${fieldPrefix}Min`] || ''}
                        onChange={(e) => handlePhaseChange(index, `${fieldPrefix}Min`, e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label>Objetivo</label>
                    <input
                        type="number"
                        step={step}
                        className="form-input target-input"
                        value={phase[`${fieldPrefix}Target`] || ''}
                        onChange={(e) => handlePhaseChange(index, `${fieldPrefix}Target`, e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label>Máximo</label>
                    <input
                        type="number"
                        step={step}
                        className="form-input"
                        value={phase[`${fieldPrefix}Max`] || ''}
                        onChange={(e) => handlePhaseChange(index, `${fieldPrefix}Max`, e.target.value)}
                    />
                </div>
            </div>
        </div>
    );

    return (
        <form className="profile-form" onSubmit={handleSubmit}>
            <div className="form-header flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
                <h2 className="text-2xl font-bold text-white">
                    {profile.id.startsWith('profile-') && profile.name === 'Nueva Receta' ? 'Crear Receta' : 'Editar Receta'}
                </h2>
                <div className="form-actions flex gap-4">
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
                    <div className="form-group flex-2">
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

            <div className="form-section phases-editor mt-8">
                <div className="phases-header flex justify-between items-center bg-gray-800 p-4 rounded-lg">
                    <h3 className="text-xl font-semibold mb-0 border-none pb-0">Fases del Cultivo</h3>
                    <button type="button" className="btn-primary" onClick={addPhase}>
                        <Plus size={16} /> Agregar Fase
                    </button>
                </div>

                {formData.phases && formData.phases.length > 0 ? (
                    <div className="flex flex-col gap-6 mt-4">
                        {formData.phases.map((phase, index) => {
                            const isExpanded = expandedPhases[phase.id] ?? true;

                            return (
                                <div key={phase.id} className="phase-edit-card bg-gray-900 border border-gray-700 rounded-xl overflow-hidden shadow-lg">
                                    <div
                                        className="phase-edit-header flex justify-between items-center p-4 bg-gray-800 cursor-pointer hover:bg-gray-700 transition"
                                        onClick={() => togglePhase(phase.id)}
                                    >
                                        <div className="phase-edit-title flex items-center gap-3">
                                            <span className={`phase-badge phase-${phase.stage.toLowerCase()} px-2 py-1 rounded text-xs font-bold uppercase`}>
                                                {phase.stage}
                                            </span>
                                            <span className="font-semibold text-lg text-white">{phase.name || 'Fase sin nombre'}</span>
                                            {phase.stage === 'flora' && phase.startWeek && (
                                                <span className="text-gray-400 text-sm ml-2">
                                                    (Semana {phase.startWeek} a {phase.endWeek || phase.startWeek})
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <button
                                                type="button"
                                                className="text-red-400 hover:text-red-300 p-2"
                                                onClick={(e) => { e.stopPropagation(); removePhase(index); }}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                            {isExpanded ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div className="phase-edit-body p-6 animate-fade-in">
                                            {/* Phase Basic Configuration */}
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
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
                                                        <div className="form-group flex items-end gap-2">
                                                            <div className="w-1/2">
                                                                <label>Semana Inicio</label>
                                                                <input
                                                                    type="number"
                                                                    min="1"
                                                                    className="form-input"
                                                                    value={phase.startWeek || ''}
                                                                    onChange={(e) => handlePhaseChange(index, 'startWeek', e.target.value)}
                                                                />
                                                            </div>
                                                            <div className="w-1/2">
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
                                                    <div className="form-group col-span-2">
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

                                            <div className="border-t border-gray-700 pt-6"></div>

                                            {/* Metrics Configuration Form */}
                                            <div className="metrics-grid">
                                                {renderMetricGroup(phase, index, 'VPD', 'vpd', 'kPa')}
                                                {renderMetricGroup(phase, index, 'PPFD (Luz)', 'ppfd', 'µmol/m²/s', '10')}
                                                {renderMetricGroup(phase, index, 'Temperatura', 'temp', '°C')}
                                                {renderMetricGroup(phase, index, 'Humedad Rel.', 'humidity', '%', '1')}
                                                {renderMetricGroup(phase, index, 'Dryback Diario', 'dryback', '%', '1')}
                                                {renderMetricGroup(phase, index, 'EC de Runoff', 'ec', 'dS/m')}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-10 bg-gray-900 border border-gray-800 rounded-lg mt-4 text-gray-400">
                        <p>No hay fases configuradas. Agrega tu primera fase para comenzar.</p>
                        <button type="button" className="btn-secondary mt-4" onClick={addPhase}>
                            <Plus size={16} /> Agregar Fase
                        </button>
                    </div>
                )}
            </div>
        </form>
    );
};

export default CropProfileForm;
