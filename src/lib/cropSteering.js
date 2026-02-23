import { differenceInDays, parseISO } from 'date-fns';

/**
 * Calculates current targets based on the batch's context and crop profile.
 * @param {Object} batchContext - Information about the current batch.
 *   Expected structure: { stage: 'vege' | 'flora' | 'clone', startDate: 'YYYY-MM-DD' }
 * @param {Object} profile - The crop profile containing phases.
 * @param {Date|String} currentDate - The current date to calculate against.
 * @returns {Object|null} The target parameters for the current day.
 */
export const getCurrentTargetParams = (batchContext, profile, currentDate = new Date()) => {
    if (!profile || !profile.phases || profile.phases.length === 0) return null;

    const { stage, startDate } = batchContext;

    // For stages without week ranges, find by stage straight away
    if (stage === 'clone' || stage === 'vege' || stage === 'Enraizado') {
        // Enraizado mapping to clone
        const searchStage = stage === 'Enraizado' ? 'clone' : stage.toLowerCase();
        return profile.phases.find(p => p.stage.toLowerCase() === searchStage) || null;
    }

    if (stage === 'flora' || stage === 'Flora') {
        if (!startDate) return null;

        const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
        const current = typeof currentDate === 'string' ? parseISO(currentDate) : currentDate;

        const diffDays = differenceInDays(current, start);
        const currentWeek = Math.floor(diffDays / 7) + 1; // Week 1 starts at day 0

        // Find matching phase for this week
        const matchingPhase = profile.phases.find(p =>
            p.stage.toLowerCase() === 'flora' &&
            currentWeek >= p.startWeek &&
            currentWeek <= p.endWeek
        );

        // If no match found but it's flora, might be past the last week, return the last phase
        if (!matchingPhase) {
            const floraPhases = profile.phases.filter(p => p.stage.toLowerCase() === 'flora');
            if (floraPhases.length === 0) return null;
            // Sort by week and get the latest
            floraPhases.sort((a, b) => a.endWeek - b.endWeek);
            const lastPhase = floraPhases[floraPhases.length - 1];

            if (currentWeek > lastPhase.endWeek) {
                return lastPhase;
            } else {
                // Must be before the first week, return first
                return floraPhases[0];
            }
        }

        return matchingPhase;
    }

    return null;
};
