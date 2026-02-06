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
      type: 'Vegetativa',
      shots: 1,
      volumePerShot: 400,
      shotTimes: ['08:00'],
      ec: 1.8,
      ph: 5.9,
      waterTemp: 21
    },
    beds: [
      { id: 'V_B1', name: 'Cama Esquejes 1', type: 'Esquejes', m2: 2, count: 0 },
      { id: 'V_B2', name: 'Cama Esquejes 2', type: 'Esquejes', m2: 2, count: 0 },
      { id: 'V_B3', name: 'Cama Esquejes 3', type: 'Esquejes', m2: 2, count: 0 },
      { id: 'V_B4', name: 'Cama Madres', type: 'Madres', m2: 2, count: 8 },
    ],
    incubators: { count: 8, name: 'Estructura Enraizado' }
  },
  {
    id: 'R2',
    name: 'Sala Flora A',
    type: 'Flora',
    m2: 20,
    lightsWatts: 4000,
    temp: 26,
    humidity: 50,
    vpd: 1.2,
    co2: 1000,
    ppfd: 900,
    strategy: {
      name: 'Generativa 3.0 - Bulking',
      type: 'Generativa',
      shots: 6,
      volumePerShot: 150,
      shotTimes: ['08:00', '09:00', '10:00', '12:00', '14:00', '16:00'],
      ec: 2.8,
      ph: 5.8,
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
    strategy: {
      name: 'Vegetativa - Stretch',
      type: 'Vegetativa',
      shots: 4,
      volumePerShot: 200,
      shotTimes: ['08:00', '10:00', '12:00', '14:00'],
      ec: 2.2,
      ph: 6.0,
      waterTemp: 20
    }
  },
];

export const batches = [
  { id: 'B1', name: 'Lote #2023-10-A', roomId: 'R2', geneticsId: 'g1', plantCount: 120, startDate: '2023-10-01', phase: 'Flora', currentDay: 35, bedId: null },
  { id: 'B2', name: 'Lote #2023-11-B', roomId: 'R3', geneticsId: 'g2', plantCount: 110, startDate: '2023-11-01', phase: 'Flora', currentDay: 5, bedId: null },
  { id: 'B_E1', name: 'Esquejes Avocada', roomId: 'R1', geneticsId: 'g1', plantCount: 50, startDate: '2023-11-25', phase: 'Enraizado', daysOld: 10, bedId: 'V_B1' },
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
];
