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

// ========== PULSE PRO SENSOR DATA ==========

// Real-time KPIs from Pulse Pro
export const pulseRealTime = {
  R2: {
    temp: 26.5,
    tempMaxYesterday: 28.0,
    humidity: 55,
    vpd: 1.4,
    co2: 420,
    ppfd: 950,
    status: 'ONLINE'
  },
  R3: {
    temp: 25.8,
    tempMaxYesterday: 27.2,
    humidity: 58,
    vpd: 1.2,
    co2: 410,
    ppfd: 850,
    status: 'ONLINE'
  }
};

// Day vs Night Temperature (DIF Analysis) - Last 7 days
export const pulseDayNightTemp = {
  R2: [
    { day: 'Lun', tempDay: 27.5, tempNight: 21.0 },
    { day: 'Mar', tempDay: 28.0, tempNight: 20.5 },
    { day: 'Mie', tempDay: 27.2, tempNight: 21.5 },
    { day: 'Jue', tempDay: 26.8, tempNight: 20.8 },
    { day: 'Vie', tempDay: 27.5, tempNight: 21.2 },
    { day: 'Sab', tempDay: 28.2, tempNight: 20.0 },
    { day: 'Dom', tempDay: 27.0, tempNight: 21.0 }
  ],
  R3: [
    { day: 'Lun', tempDay: 26.5, tempNight: 22.0 },
    { day: 'Mar', tempDay: 27.0, tempNight: 22.5 },
    { day: 'Mie', tempDay: 26.2, tempNight: 23.0 },
    { day: 'Jue', tempDay: 25.8, tempNight: 22.8 },
    { day: 'Vie', tempDay: 26.5, tempNight: 22.2 },
    { day: 'Sab', tempDay: 27.2, tempNight: 21.5 },
    { day: 'Dom', tempDay: 26.0, tempNight: 22.0 }
  ]
};

// VPD Time-in-Zone (Last 7 days) - Color-coded by quality
export const pulseVPDHistory = {
  R2: [
    { day: 'Lun', vpd: 1.35, zone: 'optimal' },
    { day: 'Mar', vpd: 1.42, zone: 'optimal' },
    { day: 'Mie', vpd: 1.28, zone: 'optimal' },
    { day: 'Jue', vpd: 1.55, zone: 'stress' },
    { day: 'Vie', vpd: 1.38, zone: 'optimal' },
    { day: 'Sab', vpd: 1.45, zone: 'optimal' },
    { day: 'Dom', vpd: 1.32, zone: 'optimal' }
  ],
  R3: [
    { day: 'Lun', vpd: 1.15, zone: 'optimal' },
    { day: 'Mar', vpd: 1.22, zone: 'optimal' },
    { day: 'Mie', vpd: 0.95, zone: 'stress' },
    { day: 'Jue', vpd: 1.18, zone: 'optimal' },
    { day: 'Vie', vpd: 1.25, zone: 'optimal' },
    { day: 'Sab', vpd: 1.30, zone: 'optimal' },
    { day: 'Dom', vpd: 1.12, zone: 'optimal' }
  ]
};

// Detailed 24h Environmental Evolution (for Master Chart)
export const pulseDetailedEvolution = {
  R2: [
    { time: '00:00', temp: 21.0, humidity: 62, vpd: 0.95, co2: 420, ppfd: 0 },
    { time: '01:00', temp: 20.8, humidity: 63, vpd: 0.92, co2: 422, ppfd: 0 },
    { time: '02:00', temp: 20.5, humidity: 64, vpd: 0.90, co2: 425, ppfd: 0 },
    { time: '03:00', temp: 20.3, humidity: 65, vpd: 0.88, co2: 428, ppfd: 0 },
    { time: '04:00', temp: 20.2, humidity: 65, vpd: 0.87, co2: 430, ppfd: 0 },
    { time: '05:00', temp: 20.5, humidity: 64, vpd: 0.89, co2: 432, ppfd: 0 },
    { time: '06:00', temp: 21.0, humidity: 62, vpd: 0.94, co2: 435, ppfd: 150 },
    { time: '07:00', temp: 22.5, humidity: 58, vpd: 1.05, co2: 425, ppfd: 450 },
    { time: '08:00', temp: 24.0, humidity: 54, vpd: 1.18, co2: 410, ppfd: 750 },
    { time: '09:00', temp: 25.5, humidity: 51, vpd: 1.28, co2: 395, ppfd: 900 },
    { time: '10:00', temp: 26.5, humidity: 48, vpd: 1.35, co2: 380, ppfd: 1050 },
    { time: '11:00', temp: 27.2, humidity: 46, vpd: 1.42, co2: 365, ppfd: 1150 },
    { time: '12:00', temp: 27.8, humidity: 45, vpd: 1.48, co2: 350, ppfd: 1200 },
    { time: '13:00', temp: 28.0, humidity: 44, vpd: 1.50, co2: 345, ppfd: 1180 },
    { time: '14:00', temp: 27.5, humidity: 46, vpd: 1.45, co2: 340, ppfd: 1100 },
    { time: '15:00', temp: 27.0, humidity: 48, vpd: 1.40, co2: 348, ppfd: 1000 },
    { time: '16:00', temp: 26.5, humidity: 50, vpd: 1.35, co2: 360, ppfd: 850 },
    { time: '17:00', temp: 25.8, humidity: 52, vpd: 1.30, co2: 375, ppfd: 600 },
    { time: '18:00', temp: 24.5, humidity: 55, vpd: 1.20, co2: 390, ppfd: 250 },
    { time: '19:00', temp: 23.0, humidity: 58, vpd: 1.08, co2: 405, ppfd: 0 },
    { time: '20:00', temp: 22.0, humidity: 60, vpd: 1.00, co2: 415, ppfd: 0 },
    { time: '21:00', temp: 21.5, humidity: 61, vpd: 0.98, co2: 418, ppfd: 0 },
    { time: '22:00', temp: 21.2, humidity: 62, vpd: 0.96, co2: 420, ppfd: 0 },
    { time: '23:00', temp: 21.0, humidity: 62, vpd: 0.95, co2: 420, ppfd: 0 }
  ],
  R3: [
    { time: '00:00', temp: 22.0, humidity: 60, vpd: 1.00, co2: 410, ppfd: 0 },
    { time: '01:00', temp: 21.8, humidity: 61, vpd: 0.98, co2: 412, ppfd: 0 },
    { time: '02:00', temp: 21.5, humidity: 62, vpd: 0.95, co2: 415, ppfd: 0 },
    { time: '03:00', temp: 21.3, humidity: 63, vpd: 0.93, co2: 418, ppfd: 0 },
    { time: '04:00', temp: 21.2, humidity: 63, vpd: 0.92, co2: 420, ppfd: 0 },
    { time: '05:00', temp: 21.5, humidity: 62, vpd: 0.94, co2: 422, ppfd: 0 },
    { time: '06:00', temp: 22.0, humidity: 60, vpd: 0.99, co2: 425, ppfd: 120 },
    { time: '07:00', temp: 23.0, humidity: 57, vpd: 1.08, co2: 415, ppfd: 400 },
    { time: '08:00', temp: 24.2, humidity: 54, vpd: 1.16, co2: 400, ppfd: 680 },
    { time: '09:00', temp: 25.0, humidity: 52, vpd: 1.22, co2: 385, ppfd: 820 },
    { time: '10:00', temp: 25.8, humidity: 50, vpd: 1.28, co2: 370, ppfd: 950 },
    { time: '11:00', temp: 26.5, humidity: 48, vpd: 1.35, co2: 358, ppfd: 1020 },
    { time: '12:00', temp: 27.0, humidity: 47, vpd: 1.40, co2: 345, ppfd: 1080 },
    { time: '13:00', temp: 27.2, humidity: 46, vpd: 1.42, co2: 340, ppfd: 1050 },
    { time: '14:00', temp: 26.8, humidity: 48, vpd: 1.38, co2: 335, ppfd: 980 },
    { time: '15:00', temp: 26.5, humidity: 49, vpd: 1.35, co2: 342, ppfd: 900 },
    { time: '16:00', temp: 26.0, humidity: 51, vpd: 1.30, co2: 355, ppfd: 750 },
    { time: '17:00', temp: 25.5, humidity: 53, vpd: 1.25, co2: 368, ppfd: 520 },
    { time: '18:00', temp: 24.8, humidity: 55, vpd: 1.18, co2: 385, ppfd: 200 },
    { time: '19:00', temp: 23.5, humidity: 58, vpd: 1.10, co2: 395, ppfd: 0 },
    { time: '20:00', temp: 22.8, humidity: 59, vpd: 1.04, co2: 405, ppfd: 0 },
    { time: '21:00', temp: 22.5, humidity: 60, vpd: 1.02, co2: 408, ppfd: 0 },
    { time: '22:00', temp: 22.2, humidity: 60, vpd: 1.01, co2: 410, ppfd: 0 },
    { time: '23:00', temp: 22.0, humidity: 60, vpd: 1.00, co2: 410, ppfd: 0 }
  ]
};
