// Room Cycle Data — manages grow cycles per room
// Each room has one active cycle; old cycles are archived

const STORAGE_KEY = 'roomCycles';

/**
 * Get all cycles from localStorage
 */
export const getAllCycles = () => {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : getDefaultCycles();
};

/**
 * Get cycles for a specific room
 */
export const getCyclesByRoom = (roomId) => {
    return getAllCycles()
        .filter(c => c.roomId === roomId)
        .sort((a, b) => b.startDate.localeCompare(a.startDate));
};

/**
 * Get the active cycle for a room
 */
export const getActiveCycle = (roomId) => {
    return getAllCycles().find(c => c.roomId === roomId && c.status === 'active') || null;
};

/**
 * Get archived cycles for a room
 */
export const getArchivedCycles = (roomId) => {
    return getCyclesByRoom(roomId).filter(c => c.status === 'archived');
};

/**
 * Start a new cycle for a room (archives the current one)
 */
export const startNewCycle = (roomId, { genetics, startDate, notes }) => {
    const cycles = getAllCycles();

    // Archive current active cycle
    const activeIdx = cycles.findIndex(c => c.roomId === roomId && c.status === 'active');
    if (activeIdx >= 0) {
        cycles[activeIdx].status = 'archived';
        cycles[activeIdx].endDate = new Date().toISOString().split('T')[0];
    }

    // Create new cycle
    const newCycle = {
        id: `cycle-${roomId}-${Date.now()}`,
        roomId,
        startDate: startDate || new Date().toISOString().split('T')[0],
        endDate: null,
        genetics: genetics || [],
        status: 'active',
        notes: notes || '',
        createdAt: new Date().toISOString(),
    };

    cycles.push(newCycle);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cycles));
    return newCycle;
};

/**
 * Update active cycle config
 */
export const updateActiveCycle = (roomId, updates) => {
    const cycles = getAllCycles();
    const activeIdx = cycles.findIndex(c => c.roomId === roomId && c.status === 'active');
    if (activeIdx >= 0) {
        cycles[activeIdx] = { ...cycles[activeIdx], ...updates };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cycles));
        return cycles[activeIdx];
    }
    return null;
};

/**
 * Calculate days in current cycle
 */
export const getDaysInCycle = (startDate) => {
    if (!startDate) return 0;
    const diff = new Date() - new Date(startDate);
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
};

/**
 * Default seed cycles matching mockData rooms
 */
const getDefaultCycles = () => [
    {
        id: 'cycle-R2-001',
        roomId: 'R2',
        startDate: '2026-01-15',
        endDate: null,
        genetics: ['Avocado'],
        status: 'active',
        notes: 'Primer ciclo Flora A',
        createdAt: '2026-01-15T00:00:00',
    },
    {
        id: 'cycle-R3-001',
        roomId: 'R3',
        startDate: '2026-02-01',
        endDate: null,
        genetics: ['Sangría'],
        status: 'active',
        notes: 'Primer ciclo Flora B',
        createdAt: '2026-02-01T00:00:00',
    },
];

/**
 * Initialize seed data if nothing exists
 */
export const initSeedCycles = () => {
    if (!localStorage.getItem(STORAGE_KEY)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(getDefaultCycles()));
    }
};
