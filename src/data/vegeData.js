// Vege Pipeline Data - Batches organized by production stage
// DaysInStage = Calculated as CurrentDate - BatchStartDate (not using daily height metrics)

export const vegePipelineData = [
    // NURSERY Stage (Aeroclonador)
    {
        id: 'NUR-001',
        name: 'Lote Gelato #12',
        stage: 'nursery',
        geneticsId: 'g2',
        plantCount: 60,
        startDate: '2026-01-30',
        daysInStage: 8,
        targetDays: 14,
        location: 'Aeroclonador 1',
        rootDevelopment: 'Iniciando',
        notes: 'Corte de madre M-Gelato-04',
    },
    {
        id: 'NUR-002',
        name: 'Lote Avocado #08',
        stage: 'nursery',
        geneticsId: 'g1',
        plantCount: 45,
        startDate: '2026-02-02',
        daysInStage: 5,
        targetDays: 14,
        location: 'Aeroclonador 2',
        rootDevelopment: 'Callos formándose',
        notes: 'Alta tasa de éxito esperada',
    },
    {
        id: 'NUR-003',
        name: 'Lote Sour Diesel #03',
        stage: 'nursery',
        geneticsId: 'g3',
        plantCount: 40,
        startDate: '2026-01-26',
        daysInStage: 12,
        targetDays: 14,
        location: 'Aeroclonador 1',
        rootDevelopment: 'Raíces visibles',
        notes: 'Listos para trasplante en 2 días',
    },

    // PRE-VEGE Stage (Endurecimiento en sustrato)
    {
        id: 'PV-001',
        name: 'Lote Gelato Pre-Vege',
        stage: 'pre-vege',
        geneticsId: 'g2',
        plantCount: 55,
        startDate: '2026-01-21',
        daysInStage: 17,
        targetDays: 15,
        location: 'Cama Pre-Vege 1',
        substrate: 'Coco 1L',
        rootZoneStatus: 'Colonizado 80%',
        notes: 'Preparar para trasplante a 5L',
    },
    {
        id: 'PV-002',
        name: 'Lote Avocado Pre-Vege',
        stage: 'pre-vege',
        geneticsId: 'g1',
        plantCount: 48,
        startDate: '2026-01-25',
        daysInStage: 13,
        targetDays: 15,
        location: 'Cama Pre-Vege 2',
        substrate: 'Coco 1L',
        rootZoneStatus: 'Colonizado 65%',
        notes: 'Buen desarrollo',
    },

    // VEGE Stage (Listas para Flora - Coco 5L)
    {
        id: 'VG-001',
        name: 'Lote Sangría Ready',
        stage: 'vege',
        geneticsId: 'g2',
        plantCount: 95,
        startDate: '2026-01-08',
        daysInStage: 30,
        targetDays: 21,
        location: 'Área Vege Principal',
        substrate: 'Coco 5L',
        readyForFlora: true,
        destinedRoom: 'R2',
        notes: 'READY TO FLIP - Superan meta de días',
    },
    {
        id: 'VG-002',
        name: 'Lote Gelato Vege',
        stage: 'vege',
        geneticsId: 'g2',
        plantCount: 70,
        startDate: '2026-01-15',
        daysInStage: 23,
        targetDays: 21,
        location: 'Área Vege Principal',
        substrate: 'Coco 5L',
        readyForFlora: true,
        destinedRoom: 'R3',
        notes: 'Listo para siguiente reset',
    },
    {
        id: 'VG-003',
        name: 'Lote Avocado Vege',
        stage: 'vege',
        geneticsId: 'g1',
        plantCount: 70,
        startDate: '2026-01-20',
        daysInStage: 18,
        targetDays: 21,
        location: 'Área Vege Reserva',
        substrate: 'Coco 5L',
        readyForFlora: false,
        destinedRoom: null,
        notes: '3 días para meta',
    },
];

// Mother Plants - Banco de Madres
export const motherPlants = [
    {
        id: 'M-Gelato-04',
        strain: 'Gelato #41',
        geneticsId: 'g2',
        ageDays: 145,
        lastCutDate: '2026-01-28',
        recoveryDaysNeeded: 15,
        avgClonesPerCut: 42,
        health: 'Excelente',
        totalCuts: 8,
        notes: 'Elite phenotype, alto vigor',
    },
    {
        id: 'M-Avocado-01',
        strain: 'Avocado',
        geneticsId: 'g1',
        ageDays: 210,
        lastCutDate: '2026-02-01',
        recoveryDaysNeeded: 18,
        avgClonesPerCut: 35,
        health: 'Buena',
        totalCuts: 12,
        notes: 'Producción estable',
    },
    {
        id: 'M-Sangria-02',
        strain: 'Sangría',
        geneticsId: 'g2',
        ageDays: 380,
        lastCutDate: '2026-01-10',
        recoveryDaysNeeded: 14,
        avgClonesPerCut: 50,
        health: 'Excelente',
        totalCuts: 24,
        notes: 'Madre veterana, máxima producción',
    },
    {
        id: 'M-SourD-01',
        strain: 'Sour Diesel',
        geneticsId: 'g3',
        ageDays: 95,
        lastCutDate: '2026-01-22',
        recoveryDaysNeeded: 16,
        avgClonesPerCut: 38,
        health: 'Buena',
        totalCuts: 4,
        notes: 'Nueva adquisición, muy prometedora',
    },
];

// Summary calculations helper
export const getPipelineSummary = () => {
    const nurseryTotal = vegePipelineData
        .filter(b => b.stage === 'nursery')
        .reduce((sum, b) => sum + b.plantCount, 0);

    const preVegeTotal = vegePipelineData
        .filter(b => b.stage === 'pre-vege')
        .reduce((sum, b) => sum + b.plantCount, 0);

    const vegeTotal = vegePipelineData
        .filter(b => b.stage === 'vege')
        .reduce((sum, b) => sum + b.plantCount, 0);

    const readyForFlora = vegePipelineData
        .filter(b => b.stage === 'vege' && b.readyForFlora)
        .reduce((sum, b) => sum + b.plantCount, 0);

    return {
        nurseryTotal,
        preVegeTotal,
        vegeTotal,
        readyForFlora,
        totalPipeline: nurseryTotal + preVegeTotal + vegeTotal,
        activeMothers: motherPlants.length,
    };
};
