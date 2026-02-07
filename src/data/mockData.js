export const genetics = [
  { id: 'g1', name: 'Avocado', type: 'Sativa', floweringDays: 65, color: '#FFD700' },
  { id: 'g2', name: 'Sangría', type: 'Indica', floweringDays: 56, color: '#C71585' },
  { id: 'g3', name: 'Sour Diesel', type: 'Sativa', floweringDays: 70, color: '#32CD32' },
];

export const rooms = [
  {
    id: 'R1',
    name: 'Sala Vege',
    type: 'Vege',
    m2: 10,
    lightsWatts: 600,
    temp: 24,
    humidity: 65,
    vpd: 0.8,
    co2: 600,
    ppfd: 300,
    strategy: {
      name: 'Estrategia Madres - Mantenimiento',
      totalVolumeL: 0.4,
      shotCount: 1,
      shotVolumeMl: 400,
      inputEC: 1.8,
      inputPH: 5.9,
      waterTemp: 21
    },
    beds: [
      { id: 'V_B1', name: 'Cama Esquejes 1', type: 'Esquejes', m2: 2, count: 0 },
      { id: 'V_B2', name: 'Cama Esquejes 2', type: 'Esquejes', m2: 2, count: 0 },
      { id: 'V_B3', name: 'Cama Esquejes 3', type: 'Esquejes', m2: 2, count: 0 },
      { id: 'V_B4', name: 'Cama Madres', type: 'Madres', m2: 2, count: 8 },
    ],
    mothers: [
      { id: 'M-Gelato-04', strain: 'Gelato #41', ageDays: 145, lastCutDate: '2024-01-25', recoveryDaysNeeded: 15, avgClonesPerCut: 42 },
      { id: 'M-Avocado-01', strain: 'Avocado', ageDays: 210, lastCutDate: '2024-02-01', recoveryDaysNeeded: 18, avgClonesPerCut: 35 },
      { id: 'M-Sangria-02', strain: 'Sangría', ageDays: 380, lastCutDate: '2024-01-10', recoveryDaysNeeded: 14, avgClonesPerCut: 50 },
    ],
    incubators: { count: 8, name: 'Estructura Enraizado' },
    maxCapacity: 300
  },
  {
    id: 'R2',
    name: 'Sala Flora A',
    type: 'Flora',
    m2: 20,
    lightsWatts: 4000,
    temp: 26,
    humidity: 50,
    vpd: 1.25,
    co2: 1100,
    ppfd: 950,
    maxCapacity: 140,
    harvestDate: '2024-03-15',
    rootZone: {
      drybackPercent: 32,
      drybackTarget: [25, 35],
      runoffEC: 4.2,
      runoffPH: 5.4,
    },
    strategy: {
      name: 'Generativa (Bulking)',
      totalVolumeL: 1.35,
      shotCount: 9,
      shotVolumeMl: 150,
      inputEC: 2.8,
      inputPH: 5.8,
      waterTemp: 20
    }
  },
  {
    id: 'R3',
    name: 'Sala Flora B',
    type: 'Flora',
    m2: 20,
    lightsWatts: 4000,
    temp: 25.5,
    humidity: 55,
    vpd: 1.1,
    co2: 950,
    ppfd: 850,
    maxCapacity: 140,
    harvestDate: '2024-03-28',
    rootZone: {
      drybackPercent: 28,
      drybackTarget: [25, 35],
      runoffEC: 3.2,
      runoffPH: 5.9,
    },
    strategy: {
      name: 'Vegetativa (Stretch)',
      totalVolumeL: 2.1,
      shotCount: 6,
      shotVolumeMl: 350,
      inputEC: 2.2,
      inputPH: 6.0,
      waterTemp: 20
    }
  },
];

export const batches = [
  { id: 'B1', name: 'Lote #2023-10-A', roomId: 'R2', geneticsId: 'g1', plantCount: 120, startDate: '2023-10-01', phase: 'Flora', currentDay: 35, bedId: null },
  { id: 'B2', name: 'Lote #2023-11-B', roomId: 'R3', geneticsId: 'g2', plantCount: 110, startDate: '2023-11-01', phase: 'Flora', currentDay: 5, bedId: null },
  {
    id: 'B_E1',
    name: 'Esquejes Avocada',
    roomId: 'R1',
    geneticsId: 'g1',
    plantCount: 50,
    startDate: '2023-11-25',
    phase: 'Enraizado',
    location: 'Incubadora 1',
    startDay: 12,
    targetDay: 14,
    status: 'Rooting',
    bedId: 'V_B1'
  },
  {
    id: 'B_V1',
    name: 'Lote Pre-Vege Gelato',
    roomId: 'R1',
    geneticsId: 'g2',
    plantCount: 120,
    phase: 'Vege',
    location: 'Cama Pre-Vege 2',
    vegetativeDay: 18,
    targetVegetativeDays: 28,
    destinedFor: 'R2',
    readyDate: '2024-03-14',
    bedId: 'V_B2'
  },
];

export const inventory = [
  { id: 'i1', product: 'Athena Pro Bloom', type: 'Nutrientes', quantityMl: 2500, dailyUsageMl: 150, minAlertMl: 1000 },
  { id: 'i2', product: 'Athena Pro Core', type: 'Nutrientes', quantityMl: 800, dailyUsageMl: 120, minAlertMl: 1000 },
  { id: 'i3', product: 'Coco Substrate (50L)', type: 'Sustrato', quantityMl: 10, dailyUsageMl: 0.5, minAlertMl: 5 },
  { id: 'i4', product: 'pH Down', type: 'Reguladores', quantityMl: 300, dailyUsageMl: 15, minAlertMl: 500 },
];

export const tasks = [
  { id: 'T1', batchId: 'B1', task: 'Defoliación día 42', scheduledDate: '2023-11-12', status: 'Pending' },
  { id: 'T2', batchId: 'B2', task: 'Entutorado', scheduledDate: '2023-11-08', status: 'Pending' },
  { id: 'T3', batchId: 'B3', task: 'Limpieza de filtros', scheduledDate: '2023-11-06', status: 'Done' }
];

export const sensorHistory = [
  { time: '00:00', temp: 22, humidity: 60, vpd: 0.8, ppfd: 0, roomId: 'R1' },
  { time: '04:00', temp: 21, humidity: 62, vpd: 0.7, ppfd: 0, roomId: 'R1' },
  { time: '08:00', temp: 24, humidity: 65, vpd: 0.9, ppfd: 300, roomId: 'R1' },
  { time: '12:00', temp: 26, humidity: 60, vpd: 1.1, ppfd: 400, roomId: 'R1' },
  { time: '16:00', temp: 25, humidity: 63, vpd: 1.0, ppfd: 350, roomId: 'R1' },
  { time: '20:00', temp: 23, humidity: 65, vpd: 0.8, ppfd: 0, roomId: 'R1' },

  // Flora A (R2)
  { time: '00:00', temp: 23, humidity: 55, vpd: 1.0, ppfd: 0, roomId: 'R2' },
  { time: '04:00', temp: 22, humidity: 58, vpd: 0.9, ppfd: 0, roomId: 'R2' },
  { time: '08:00', temp: 25, humidity: 52, vpd: 1.3, ppfd: 800, roomId: 'R2' },
  { time: '12:00', temp: 28, humidity: 48, vpd: 1.6, ppfd: 1000, roomId: 'R2' },
  { time: '16:00', temp: 27, humidity: 50, vpd: 1.4, ppfd: 900, roomId: 'R2' },
  { time: '20:00', temp: 24, humidity: 55, vpd: 1.1, ppfd: 0, roomId: 'R2' },
];

export const irrigationLogs = [
  { timestamp: '2023-12-05T08:00:00', ecIn: 2.8, ecOut: 3.2, phOut: 6.1, waterTemp: 21, roomId: 'R2' },
  { timestamp: '2023-12-05T12:00:00', ecIn: 2.8, ecOut: 3.5, phOut: 6.0, waterTemp: 22, roomId: 'R2' },
  { timestamp: '2023-12-05T16:00:00', ecIn: 2.8, ecOut: 3.8, phOut: 5.9, waterTemp: 22, roomId: 'R2' },
  { timestamp: '2023-12-04T08:00:00', ecIn: 2.8, ecOut: 3.1, phOut: 6.1, waterTemp: 21, roomId: 'R2' },
  { timestamp: '2023-12-04T16:00:00', ecIn: 2.8, ecOut: 3.6, phOut: 5.9, waterTemp: 22, roomId: 'R2' },
  // Vege Logs
  { timestamp: '2023-12-05T08:00:00', ecIn: 1.8, ecOut: 1.9, phOut: 6.0, waterTemp: 21, roomId: 'R1' },
  { timestamp: '2023-12-04T08:00:00', ecIn: 1.8, ecOut: 1.85, phOut: 6.1, waterTemp: 21, roomId: 'R1' },
  // Flora B Logs
  { timestamp: '2023-12-05T08:00:00', ecIn: 2.2, ecOut: 2.5, phOut: 6.1, waterTemp: 20, roomId: 'R3' },
  { timestamp: '2023-12-05T16:00:00', ecIn: 2.2, ecOut: 2.8, phOut: 5.9, waterTemp: 20, roomId: 'R3' },
];
