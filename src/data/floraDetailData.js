// Flora Detail Data - High Performance Flowering Metrics
// Generative Steering & Salt Stacking Logic

// 7-Day EC Stacking Trend Data
export const floraECTrendData = [
    { day: 'Lun', dayFull: 'Lunes', ecIn: 2.8, ecOut: 2.5, date: '2026-02-01' },      // Hambre
    { day: 'Mar', dayFull: 'Martes', ecIn: 2.8, ecOut: 3.2, date: '2026-02-02' },     // Stacking Saludable
    { day: 'Mié', dayFull: 'Miércoles', ecIn: 2.8, ecOut: 3.8, date: '2026-02-03' },  // Stacking Saludable
    { day: 'Jue', dayFull: 'Jueves', ecIn: 2.8, ecOut: 4.2, date: '2026-02-04' },     // Stacking Saludable (límite)
    { day: 'Vie', dayFull: 'Viernes', ecIn: 2.8, ecOut: 5.0, date: '2026-02-05' },    // Bloqueo
    { day: 'Sáb', dayFull: 'Sábado', ecIn: 2.8, ecOut: 3.5, date: '2026-02-06' },     // Post-lavado
    { day: 'Hoy', dayFull: 'Domingo', ecIn: 2.8, ecOut: 4.0, date: '2026-02-07' },    // Stacking Saludable
];

// Dryback Data - Generative Steering
export const floraDrybackData = {
    currentDryback: 28,       // Current dryback percentage achieved last night
    targetRange: {
        min: 25,
        max: 30,
    },
    phase: 'generative',      // 'vegetative', 'generative', 'stress'
    lastNightStart: 58,       // Substrate WC% at lights off
    lastNightEnd: 30,         // Substrate WC% at lights on
    measurement: '2026-02-07T06:00:00',

    // Historical dryback for mini-trend
    history: [
        { date: '2026-02-07', dryback: 28 },
        { date: '2026-02-06', dryback: 26 },
        { date: '2026-02-05', dryback: 32 },
        { date: '2026-02-04', dryback: 12 },  // Vegetativo (muy húmedo)
        { date: '2026-02-03', dryback: 18 },
        { date: '2026-02-02', dryback: 38 },  // Estrés
        { date: '2026-02-01', dryback: 25 },
    ],
};

// Temperature DIF Data (Day vs Night)
export const floraTempDIFData = {
    dayTemp: 27.5,        // Temp Max Día
    nightTemp: 21.0,      // Temp Min Noche
    dif: -6.5,            // Negativo = Noche más fría (DIF negativo)
    targetDIF: {
        min: -8,
        max: -4,
    },

    // 24h temperature profile
    hourlyTemps: [
        { hour: '00:00', temp: 21.0, period: 'night' },
        { hour: '02:00', temp: 20.5, period: 'night' },
        { hour: '04:00', temp: 20.8, period: 'night' },
        { hour: '06:00', temp: 22.0, period: 'transition' },  // Lights ON
        { hour: '08:00', temp: 24.5, period: 'day' },
        { hour: '10:00', temp: 26.0, period: 'day' },
        { hour: '12:00', temp: 27.0, period: 'day' },
        { hour: '14:00', temp: 27.5, period: 'day' },         // Peak
        { hour: '16:00', temp: 27.0, period: 'day' },
        { hour: '18:00', temp: 25.5, period: 'transition' },  // Lights OFF
        { hour: '20:00', temp: 23.0, period: 'night' },
        { hour: '22:00', temp: 21.5, period: 'night' },
    ],
};

// EC Stacking Status Logic (Flora-specific thresholds)
export const getFloraECStatus = (ecIn, ecOut) => {
    const diff = ecOut - ecIn;

    if (diff < 0) {
        return {
            status: 'hungry',
            label: 'Hambre',
            color: '#4cc9f0', // Cyan/Blue
            description: 'Runoff < Input - Planta consumiendo más de lo que recibe',
            tooltip: `EC Entrada: ${ecIn} | EC Salida: ${ecOut} (${diff.toFixed(1)} Consumo)`
        };
    } else if (diff <= 1.5) {
        return {
            status: 'stacking_healthy',
            label: 'Stacking Saludable',
            color: '#00ff9d', // Green Neon
            description: 'Balance óptimo para floración',
            tooltip: `EC Entrada: ${ecIn} | EC Salida: ${ecOut} (+${diff.toFixed(1)} Stacking)`
        };
    } else if (diff <= 2.0) {
        return {
            status: 'stacking_high',
            label: 'Stacking Alto',
            color: '#ffb703', // Amber
            description: 'Monitorear - Considerar lavado preventivo',
            tooltip: `EC Entrada: ${ecIn} | EC Salida: ${ecOut} (+${diff.toFixed(1)} Stacking)`
        };
    } else {
        return {
            status: 'lockout',
            label: 'Bloqueo',
            color: '#f72585', // Magenta/Red
            description: 'Lavado urgente requerido',
            tooltip: `EC Entrada: ${ecIn} | EC Salida: ${ecOut} (+${diff.toFixed(1)} BLOQUEO)`
        };
    }
};

// Dryback Status Logic (Generative Steering)
export const getFloraDrybackStatus = (dryback) => {
    if (dryback < 15) {
        return {
            status: 'vegetative',
            label: 'Modo Vegetativo',
            color: '#4cc9f0', // Blue
            phase: 'Muy húmedo - Fomenta crecimiento vegetativo',
            action: '⚠ Ajustar volumen de último disparo (P2)',
            icon: 'leaf'
        };
    } else if (dryback >= 15 && dryback < 25) {
        return {
            status: 'transition',
            label: 'Transición',
            color: '#4cc9f0', // Blue
            phase: 'Ligeramente húmedo',
            action: 'Aumentar dryback para zona generativa',
            icon: 'trending-up'
        };
    } else if (dryback >= 25 && dryback <= 32) {
        return {
            status: 'generative',
            label: 'Zona Generativa',
            color: '#ffb703', // Amber/Orange
            phase: 'Óptimo para floración - Fomenta producción de resina',
            action: 'Mantener horario de riego',
            icon: 'target'
        };
    } else if (dryback > 32 && dryback <= 38) {
        return {
            status: 'stress_mild',
            label: 'Estrés Leve',
            color: '#ff6b6b', // Light Red
            phase: 'Secado alto - Puede inducir estrés beneficioso',
            action: 'Aumentar volumen P1 si es necesario',
            icon: 'alert'
        };
    } else {
        return {
            status: 'stress_high',
            label: 'Estrés Hídrico',
            color: '#ff3333', // Red
            phase: 'Secado excesivo - Riesgo de daño',
            action: '⚠ Ajustar volumen de último disparo (P2)',
            icon: 'alert-triangle'
        };
    }
};

// DIF Status Logic
export const getDIFStatus = (dif) => {
    if (dif <= -4) {
        return {
            status: 'purple_boost',
            label: 'Purple Boost',
            color: '#a78bfa', // Purple
            icon: '❄️',
            description: 'DIF negativo óptimo - Fomenta producción de antocianinas (colores púrpura) y resina',
            benefit: 'Colores intensos, mayor densidad de tricomas'
        };
    } else if (dif < 0) {
        return {
            status: 'mild_negative',
            label: 'DIF Leve',
            color: '#4cc9f0', // Cyan
            icon: '🌙',
            description: 'DIF negativo moderado',
            benefit: 'Buena calidad de flores'
        };
    } else if (dif === 0) {
        return {
            status: 'neutral',
            label: 'DIF Neutro',
            color: '#ffb703', // Amber
            icon: '⚖️',
            description: 'Sin diferencial térmico',
            benefit: 'Crecimiento balanceado'
        };
    } else if (dif <= 4) {
        return {
            status: 'stretch_mild',
            label: 'Estiramiento Leve',
            color: '#ffb703', // Amber
            icon: '⚠️',
            description: 'Noche más cálida que el día',
            benefit: 'Puede fomentar estiramiento indeseado'
        };
    } else {
        return {
            status: 'stretch_high',
            label: 'Estiramiento Alto',
            color: '#ff3333', // Red
            icon: '🔥',
            description: 'DIF positivo alto - Fomenta estiramiento',
            benefit: '⚠ Alerta: Internodos largos, flores menos compactas'
        };
    }
};

// Current Room Environment (for Flora)
export const floraEnvironment = {
    currentTemp: 26.5,
    currentHumidity: 55,
    currentVPD: 1.35,
    co2: 800,
    ppfd: 900,
    photoperiod: 12,
    dli: 38.9, // 900 × 3600 × 12 / 1000000

    targetVPD: {
        min: 1.2,
        max: 1.5,
    },
    targetDLI: {
        min: 35,
        max: 45,
    },
};
