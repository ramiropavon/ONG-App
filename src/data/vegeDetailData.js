// Vege Detail Data - Environment and Irrigation Focus
// Coco High Performance Logic

export const vegeEnvironment = {
    // Current readings
    currentVPD: 1.05,
    currentTemp: 25,
    currentHumidity: 62,
    co2: 650,
    ppfd: 350,
    photoperiod: 18,

    // DLI (Daily Light Integral) - Critical for vege
    // DLI = PPFD × (3600 × photoperiod) / 1,000,000
    currentDLI: 22.7, // 350 × 3600 × 18 / 1000000 ≈ 22.7
    targetDLI: {
        min: 25,
        max: 30,
    },

    // 24-hour VPD data
    hourlyData: [
        { hour: '00:00', vpd: 0.75, temp: 22, humidity: 68 },
        { hour: '01:00', vpd: 0.72, temp: 21, humidity: 70 },
        { hour: '02:00', vpd: 0.70, temp: 21, humidity: 71 },
        { hour: '03:00', vpd: 0.68, temp: 20, humidity: 72 },
        { hour: '04:00', vpd: 0.65, temp: 20, humidity: 74 },
        { hour: '05:00', vpd: 0.70, temp: 21, humidity: 72 },
        { hour: '06:00', vpd: 0.85, temp: 23, humidity: 66 }, // Lights ON
        { hour: '07:00', vpd: 0.95, temp: 24, humidity: 63 },
        { hour: '08:00', vpd: 1.05, temp: 25, humidity: 60 },
        { hour: '09:00', vpd: 1.10, temp: 26, humidity: 58 },
        { hour: '10:00', vpd: 1.15, temp: 26, humidity: 56 },
        { hour: '11:00', vpd: 1.18, temp: 27, humidity: 55 },
        { hour: '12:00', vpd: 1.20, temp: 27, humidity: 54 }, // Peak
        { hour: '13:00', vpd: 1.22, temp: 27, humidity: 53 },
        { hour: '14:00', vpd: 1.18, temp: 27, humidity: 55 },
        { hour: '15:00', vpd: 1.15, temp: 26, humidity: 56 },
        { hour: '16:00', vpd: 1.10, temp: 26, humidity: 58 },
        { hour: '17:00', vpd: 1.05, temp: 25, humidity: 60 },
        { hour: '18:00', vpd: 1.00, temp: 25, humidity: 62 },
        { hour: '19:00', vpd: 0.95, temp: 24, humidity: 64 },
        { hour: '20:00', vpd: 0.90, temp: 24, humidity: 65 },
        { hour: '21:00', vpd: 0.85, temp: 23, humidity: 66 },
        { hour: '22:00', vpd: 0.82, temp: 23, humidity: 67 },
        { hour: '23:00', vpd: 0.78, temp: 22, humidity: 68 }, // Lights OFF
    ],
};

// Irrigation Events - Coco requires multiple small feedings
export const vegeIrrigationEvents = [
    { time: '06:30', volumeMl: 150, ec: 1.8, ph: 5.9, type: 'first_light' },
    { time: '08:00', volumeMl: 100, ec: 1.8, ph: 5.9, type: 'scheduled' },
    { time: '10:00', volumeMl: 120, ec: 1.8, ph: 5.9, type: 'scheduled' },
    { time: '12:00', volumeMl: 130, ec: 1.8, ph: 5.9, type: 'scheduled' },
    { time: '14:00', volumeMl: 120, ec: 1.8, ph: 5.9, type: 'scheduled' },
    { time: '16:00', volumeMl: 110, ec: 1.8, ph: 5.9, type: 'scheduled' },
    { time: '18:00', volumeMl: 100, ec: 1.8, ph: 5.9, type: 'scheduled' },
    { time: '20:00', volumeMl: 80, ec: 1.6, ph: 5.9, type: 'last_light' },
];

// Root Health Monitor - Manual EC tracking
export const vegeRootHealth = {
    ecIn: 1.8,      // Tank EC
    ecOut: 2.3,     // Runoff EC
    phIn: 5.9,
    phOut: 6.1,
    lastMeasurement: '2026-02-07T10:00:00',
};

// 7-Day EC Trend Data (Stacking Visualization)
export const ecTrendData = [
    { day: 'Lun', dayFull: 'Lunes', ecIn: 1.6, ecOut: 1.5, date: '2026-02-01' },      // Consumo Alto
    { day: 'Mar', dayFull: 'Martes', ecIn: 1.6, ecOut: 1.8, date: '2026-02-02' },     // Óptimo
    { day: 'Mié', dayFull: 'Miércoles', ecIn: 1.8, ecOut: 2.2, date: '2026-02-03' },  // Óptimo
    { day: 'Jue', dayFull: 'Jueves', ecIn: 1.8, ecOut: 2.5, date: '2026-02-04' },     // Óptimo (límite)
    { day: 'Vie', dayFull: 'Viernes', ecIn: 1.8, ecOut: 3.2, date: '2026-02-05' },    // Acumulación
    { day: 'Sáb', dayFull: 'Sábado', ecIn: 1.8, ecOut: 3.8, date: '2026-02-06' },     // Acumulación alta
    { day: 'Hoy', dayFull: 'Domingo', ecIn: 1.8, ecOut: 2.3, date: '2026-02-07' },    // Post-lavado, recuperando
];

// Dryback Data - Overnight Substrate Drying
export const drybackData = {
    currentDryback: 28,       // Current dryback percentage achieved last night
    targetRange: {
        min: 20,
        max: 30,
    },
    lastNightStart: 65,       // Substrate WC% at lights off
    lastNightEnd: 37,         // Substrate WC% at lights on
    measurement: '2026-02-07T06:00:00',

    // Historical dryback (optional, for trend)
    history: [
        { date: '2026-02-07', dryback: 28 },
        { date: '2026-02-06', dryback: 25 },
        { date: '2026-02-05', dryback: 32 },
        { date: '2026-02-04', dryback: 18 },  // Too wet
        { date: '2026-02-03', dryback: 22 },
        { date: '2026-02-02', dryback: 38 },  // Too dry
        { date: '2026-02-01', dryback: 26 },
    ],
};

// EC Bar Color Logic (4 levels)
export const getECBarStatus = (ecIn, ecOut) => {
    const diff = ecOut - ecIn;

    if (diff < 0) {
        return {
            status: 'hungry',
            label: 'Consumo Alto',
            color: '#4cc9f0', // Cyan
            description: 'La planta consume más de lo que recibe'
        };
    } else if (diff <= 1.2) {
        return {
            status: 'optimal',
            label: 'Rango Óptimo',
            color: '#00ff9d', // Green Neon
            description: 'Balance saludable entre entrada y salida'
        };
    } else if (diff < 2.5) {
        return {
            status: 'accumulation',
            label: 'Acumulación',
            color: '#ffb703', // Amber
            description: 'Sales acumulándose - Monitorear'
        };
    } else {
        return {
            status: 'toxicity',
            label: 'Bloqueo/Toxicidad',
            color: '#f72585', // Magenta/Red
            description: 'Lavado urgente requerido'
        };
    }
};

// Dryback Status Logic
export const getDrybackStatus = (dryback) => {
    if (dryback < 15) {
        return {
            status: 'too_wet',
            label: 'Sustrato Muy Húmedo',
            color: '#4cc9f0',
            action: '⚠ Retrasar primer riego',
            icon: 'droplets'
        };
    } else if (dryback >= 15 && dryback < 20) {
        return {
            status: 'wet',
            label: 'Ligeramente Húmedo',
            color: '#4cc9f0',
            action: 'Considerar retrasar P1',
            icon: 'droplet'
        };
    } else if (dryback >= 20 && dryback <= 30) {
        return {
            status: 'optimal',
            label: 'Óptimo',
            color: '#00ff9d',
            action: 'Mantener horario de riego',
            icon: 'check'
        };
    } else if (dryback > 30 && dryback <= 35) {
        return {
            status: 'dry',
            label: 'Secado Alto',
            color: '#ffb703',
            action: 'Considerar aumentar volumen P1',
            icon: 'alert'
        };
    } else {
        return {
            status: 'too_dry',
            label: 'Secado Excesivo',
            color: '#ff3333',
            action: '⚠ Aumentar volumen P1',
            icon: 'alert-triangle'
        };
    }
};

// DLI Calculator Helper
export const calculateDLI = (ppfd, hoursOfLight) => {
    // DLI = PPFD × seconds of light / 1,000,000
    return (ppfd * 3600 * hoursOfLight) / 1000000;
};

