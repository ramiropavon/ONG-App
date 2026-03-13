// Daily Log Data — helpers for saving/reading daily grow room logs
// Persists to localStorage with room+date keys

const STORAGE_KEY = 'dailyLogs';

/**
 * Get all daily logs from localStorage
 */
export const getAllLogs = () => {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
};

/**
 * Get logs for a specific room
 */
export const getLogsByRoom = (roomId) => {
    return getAllLogs().filter(log => log.roomId === roomId);
};

/**
 * Get log for a specific room and date
 */
export const getLogByRoomAndDate = (roomId, date) => {
    const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
    return getAllLogs().find(log => log.roomId === roomId && log.date === dateStr) || null;
};

/**
 * Get today's log for a room
 */
export const getTodayLog = (roomId) => {
    const today = new Date().toISOString().split('T')[0];
    return getLogByRoomAndDate(roomId, today);
};

/**
 * Get last N logs for a room, sorted by date descending
 */
export const getRecentLogs = (roomId, count = 7) => {
    return getLogsByRoom(roomId)
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, count);
};

/**
 * Save or update a daily log
 * @param {Object} logData - { roomId, date, cycleId, dayOfFlora, auto: {...}, manual: {...} }
 */
export const saveDailyLog = (logData) => {
    const logs = getAllLogs();
    const existingIndex = logs.findIndex(
        log => log.roomId === logData.roomId && log.date === logData.date
    );

    const entry = {
        ...logData,
        updatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
        // Update existing
        logs[existingIndex] = { ...logs[existingIndex], ...entry };
    } else {
        // Create new
        entry.createdAt = new Date().toISOString();
        logs.push(entry);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
    return entry;
};

/**
 * Delete a daily log
 */
export const deleteDailyLog = (roomId, date) => {
    const logs = getAllLogs().filter(
        log => !(log.roomId === roomId && log.date === date)
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
};

/**
 * Create an empty log template
 */
export const createEmptyLog = (roomId, cycleId, dayOfFlora) => ({
    roomId,
    date: new Date().toISOString().split('T')[0],
    cycleId: cycleId || null,
    dayOfFlora: dayOfFlora || 0,
    auto: {
        vpd: null,
        temp: null,
        humidity: null,
        ppfd: null,
    },
    manual: {
        ecInput: '',
        ecOutput: '',
        phInput: '',
        phOutput: '',
        waterTemp: '',
        drybackPct: '',
        notes: '',
    },
});

// Seed data — ejemplo de registros previos
export const seedDailyLogs = [
    {
        roomId: 'R2', date: '2026-02-22', cycleId: 'cycle-R2-001', dayOfFlora: 38,
        auto: { vpd: 1.35, temp: 26.5, humidity: 55, ppfd: 950 },
        manual: { ecInput: '2.8', ecOutput: '3.5', phInput: '5.8', phOutput: '6.1', waterTemp: '21', drybackPct: '28', notes: 'Stacking saludable' },
        createdAt: '2026-02-22T10:00:00', updatedAt: '2026-02-22T10:00:00'
    },
    {
        roomId: 'R2', date: '2026-02-21', cycleId: 'cycle-R2-001', dayOfFlora: 37,
        auto: { vpd: 1.4, temp: 27.0, humidity: 52, ppfd: 980 },
        manual: { ecInput: '2.8', ecOutput: '4.0', phInput: '5.9', phOutput: '6.0', waterTemp: '20', drybackPct: '30', notes: '' },
        createdAt: '2026-02-21T10:00:00', updatedAt: '2026-02-21T10:00:00'
    },
    {
        roomId: 'R3', date: '2026-02-22', cycleId: 'cycle-R3-001', dayOfFlora: 21,
        auto: { vpd: 1.2, temp: 25.8, humidity: 58, ppfd: 850 },
        manual: { ecInput: '2.2', ecOutput: '2.8', phInput: '6.0', phOutput: '6.2', waterTemp: '20', drybackPct: '22', notes: 'Stretch fase final' },
        createdAt: '2026-02-22T10:00:00', updatedAt: '2026-02-22T10:00:00'
    },
];

/**
 * Initialize seed data if no logs exist
 */
export const initSeedLogs = () => {
    if (getAllLogs().length === 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(seedDailyLogs));
    }
};
