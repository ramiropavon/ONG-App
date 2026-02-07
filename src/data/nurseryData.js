// Nursery Data - Dome/Tray Management
// No humidity sensors used (controlled saturated environment)
// Focus on day management and ventilation stages

export const nurseryDomes = [
    {
        id: 'DOME-001',
        name: 'Bandeja A1',
        geneticsId: 'g2',
        initialCount: 48,
        currentCount: 46,
        daysInNursery: 3,
        startDate: '2026-02-04',
        stage: 'humidity_high',
        ventStatus: 'closed',
        notes: 'Corte fresco, sellado completo',
    },
    {
        id: 'DOME-002',
        name: 'Bandeja A2',
        geneticsId: 'g1',
        initialCount: 42,
        currentCount: 40,
        daysInNursery: 7,
        startDate: '2026-01-31',
        stage: 'acclimatization',
        ventStatus: 'cracked',
        notes: 'Iniciando apertura de vents',
    },
    {
        id: 'DOME-003',
        name: 'Bandeja B1',
        geneticsId: 'g3',
        initialCount: 50,
        currentCount: 47,
        daysInNursery: 11,
        startDate: '2026-01-27',
        stage: 'hardening',
        ventStatus: 'open',
        notes: 'Endurecimiento final, raíces visibles',
    },
    {
        id: 'DOME-004',
        name: 'Bandeja B2',
        geneticsId: 'g2',
        initialCount: 45,
        currentCount: 38,
        daysInNursery: 16,
        startDate: '2026-01-22',
        stage: 'delayed',
        ventStatus: 'open',
        notes: 'RETRASO - Raíces lentas, revisar temperatura',
    },
    {
        id: 'DOME-005',
        name: 'Bandeja C1',
        geneticsId: 'g1',
        initialCount: 40,
        currentCount: 39,
        daysInNursery: 5,
        startDate: '2026-02-02',
        stage: 'humidity_high',
        ventStatus: 'closed',
        notes: 'Buena formación de callos',
    },
    {
        id: 'DOME-006',
        name: 'Bandeja C2',
        geneticsId: 'g3',
        initialCount: 44,
        currentCount: 42,
        daysInNursery: 9,
        startDate: '2026-01-29',
        stage: 'acclimatization',
        ventStatus: 'half',
        notes: 'Transición a hardening en 1 día',
    },
];

// Loss Log - Historical record of clone failures
export const nurseryLossLog = [
    {
        id: 'LOSS-001',
        geneticsId: 'g2',
        quantity: 2,
        reason: 'stem_rot',
        date: '2026-02-06',
        domeId: 'DOME-001',
    },
    {
        id: 'LOSS-002',
        geneticsId: 'g1',
        quantity: 2,
        reason: 'dried',
        date: '2026-02-05',
        domeId: 'DOME-002',
    },
    {
        id: 'LOSS-003',
        geneticsId: 'g3',
        quantity: 3,
        reason: 'stem_rot',
        date: '2026-02-04',
        domeId: 'DOME-003',
    },
    {
        id: 'LOSS-004',
        geneticsId: 'g2',
        quantity: 7,
        reason: 'weak',
        date: '2026-02-03',
        domeId: 'DOME-004',
    },
    {
        id: 'LOSS-005',
        geneticsId: 'g1',
        quantity: 1,
        reason: 'mold',
        date: '2026-02-02',
        domeId: 'DOME-005',
    },
];

// Stage definitions (for reference)
export const nurseryStages = {
    humidity_high: {
        name: 'Humedad Alta',
        days: [1, 5],
        description: 'Domo sellado, humedad saturada',
        ventStatus: 'closed',
    },
    acclimatization: {
        name: 'Aclimatación/Vents',
        days: [6, 10],
        description: 'Apertura gradual de ventilación',
        ventStatus: 'cracked',
    },
    hardening: {
        name: 'Hardening',
        days: [11, 14],
        description: 'Endurecimiento, vents abiertos',
        ventStatus: 'open',
    },
    delayed: {
        name: 'Retraso',
        days: [15, 999],
        description: 'Supera tiempo objetivo - Requiere acción',
        ventStatus: 'open',
    },
};

// Helper function to get dome health status
export const getDomeHealth = (dome) => {
    const lossRate = ((dome.initialCount - dome.currentCount) / dome.initialCount) * 100;
    if (lossRate <= 5) return { status: 'excellent', label: 'Excelente', color: '#00ff9d' };
    if (lossRate <= 10) return { status: 'good', label: 'Buena', color: '#4cc9f0' };
    if (lossRate <= 20) return { status: 'warning', label: 'Atención', color: '#ffb703' };
    return { status: 'critical', label: 'Crítico', color: '#ff3333' };
};
