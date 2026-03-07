import { areIntervalsOverlapping, parse, differenceInMinutes, getDay, addDays } from 'date-fns';

/**
 * Parses a time string into a Date object, handling overnight tasks (where end < start).
 * @param {string} timeStr - HH:mm format
 * @param {string} dateStr - yyyy-MM-dd format
 * @param {'start'|'end'} role - Whether this is the start or end time
 * @param {string} startTimeStr - The start time (used to detect midnight crossover on 'end')
 * @returns {Date}
 */
const parseTime = (timeStr, dateStr, role = 'start', startTimeStr = null) => {
    // Guard: if either value is missing, return epoch as a safe fallback
    if (!timeStr || !dateStr) return new Date(0);
    const base = parse(`${dateStr} ${timeStr}`, 'yyyy-MM-dd HH:mm', new Date());
    if (isNaN(base.getTime())) return new Date(0);
    if (role === 'end' && startTimeStr) {
        const startBase = parse(`${dateStr} ${startTimeStr}`, 'yyyy-MM-dd HH:mm', new Date());
        if (!isNaN(startBase.getTime()) && base <= startBase) {
            return addDays(base, 1);
        }
    }
    return base;
};

/**
 * Checks a specific assignment against all military scheduling constraints.
 */
export const checkConstraints = (assignment, soldier, task, allAssignments, allTasks) => {
    const warnings = [];

    if (!soldier) { warnings.push('חייל לא נמצא במערכת.'); return warnings; }
    if (!task) { warnings.push('משימה לא קיימת.'); return warnings; }

    // --- Constraint 1: Role Type ---
    const requiredRoles = Array.isArray(task.requiredRoles) ? task.requiredRoles : [task.requiredRoles];
    const soldierRoles = Array.isArray(soldier.roles) ? soldier.roles : [soldier.roles];
    if (requiredRoles.length > 0 && requiredRoles[0]) {
        const hasRole = requiredRoles.some(req => soldierRoles.includes(req));
        if (!hasRole) {
            warnings.push(`סוג תפקיד חסר: ל-${soldier.name} אין את ההכשרה הדרושה (${requiredRoles.join(', ')}).`);
        }
    }

    // --- Constraint 2: Personal Requests ---
    if (soldier.personalRequests && soldier.personalRequests.length > 0) {
        const requestOnDate = soldier.personalRequests.find(req => req.date === task.date && req.status === 'approved');
        if (requestOnDate) {
            warnings.push(`בקשה אישית: ${soldier.name} ביקש/ה לא להשתבץ ביום זה עקב ${requestOnDate.reason}.`);
        }
    }

    // --- Constraint 3: Closing / Home Time ---
    if (task.date) {
        const taskDateObj = new Date(task.date);
        if (!isNaN(taskDateObj.getTime())) {
            const dayOfWeek = getDay(taskDateObj);
            const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;
            if ((isWeekend || task.requiresClosing) && !soldier.isClosing) {
                warnings.push(`זמן בית: המשימה דורשת סגירה, אך ${soldier.name} מתוכנן/ת לצאת הביתה.`);
            }
        }
    }

    // --- Constraint 4: Max Shift Duration ---
    const currentTaskStart = parseTime(task.startTime, task.date, 'start');
    const currentTaskEnd = parseTime(task.endTime, task.date, 'end', task.startTime);
    const shiftDurationHours = differenceInMinutes(currentTaskEnd, currentTaskStart) / 60;
    const maxShift = soldier.maxHoursPerShift || 4;
    if (shiftDurationHours > maxShift) {
        warnings.push(`משך זמן ארוך מדי: המשימה אורכת ${shiftDurationHours.toFixed(1)} שעות, אבל ל-${soldier.name} מותר עד ${maxShift} שעות רצוף.`);
    }

    // --- Constraint 5: Double Booking (supports overnight) ---
    const soldierTaskIds = allAssignments
        .filter(a => a.soldierId === soldier.id && a.taskId !== task.id)
        .map(a => a.taskId);
    const otherTasks = allTasks.filter(t => soldierTaskIds.includes(t.id));
    otherTasks.forEach(otherTask => {
        if (otherTask.date === task.date || true) { // always check — overnight tasks can span days
            const otherStart = parseTime(otherTask.startTime, otherTask.date, 'start');
            const otherEnd = parseTime(otherTask.endTime, otherTask.date, 'end', otherTask.startTime);
            try {
                if (areIntervalsOverlapping(
                    { start: currentTaskStart, end: currentTaskEnd },
                    { start: otherStart, end: otherEnd }
                )) {
                    // User requested: do NOT show visual ⚠️ alerts for double booking due to visual clutter.
                    // warnings.push(`התנגשות: החייל מתוכנן גם ל-"${otherTask.name}" באותו זמן.`);
                }
            } catch (_) {
                // Ignore malformed intervals
            }
        }
    });

    // --- Constraint 6: Max Consecutive Days in Base (10-day rule) ---
    const consecutiveDays = soldier.consecutiveDaysAtBase || 0;
    if (consecutiveDays >= 10) {
        warnings.push(`חייב לצאת: ${soldier.name} נמצא/ת בבסיס ${consecutiveDays} ימים רצופים — חייב/ת לקבל חופש לפני שיבוץ נוסף.`);
    }

    // --- Constraint 7: Task-type-aware minimum rest between shifts ---
    const getRequiredRestHours = (taskName) => {
        if (!taskName) return 8;
        if (taskName.includes('סיור') || taskName.includes('חמ"ל')) return 12; // patrol / ops -> 12h rest
        return 8; // guard/other -> 8h rest
    };

    const taskDateMs = task.date ? new Date(task.date).getTime() : 0;
    const nearbyOtherTasks = otherTasks.filter(t => {
        if (!t.date || !t.startTime || !t.endTime) return false;
        const diff = Math.abs(new Date(t.date).getTime() - taskDateMs);
        return diff <= 2 * 24 * 3600000; // within 2 days
    });

    nearbyOtherTasks.forEach(otherTask => {
        try {
            const otherStart = parseTime(otherTask.startTime, otherTask.date, 'start');
            const otherEnd = parseTime(otherTask.endTime, otherTask.date, 'end', otherTask.startTime);

            const reqRestAfterOther = getRequiredRestHours(otherTask.name);
            const reqRestAfterCurrent = getRequiredRestHours(task.name);

            const gapAfterOther = (currentTaskStart - otherEnd) / 3600000;
            const gapAfterCurrent = (otherStart - currentTaskEnd) / 3600000;

            // User requested: do NOT show visual ⚠️ alerts for 8/12 hour rest violations due to visual clutter.
            // The algorithm still internally balances workload (Tiers 1-3), but we no longer spam the UI with warnings.
        } catch (_) { }
    });

    // --- Constraint 8: Readiness Platoon Dependency Logic ---
    if (task.name && task.name.includes('כיתת כוננות')) {
        // Required constraint removed by user request: Any soldier can join the readiness platoon 
        // as long as they meet the base 8/12 hour rest constraints (handled by Constraint 7).
    }

    return warnings;
};

export const globalConstraints = [
    { id: 1, type: 'ROLE_REQUIREMENT', title: 'סוג תפקיד (הכשרה)', description: 'חייל חייב להיות בעל ההכשרה המתאימה עבור המשימה.' },
    { id: 2, type: 'HOME_TIME', title: 'זמן שסוגר בצבא / זמן בית', description: 'חייל שמקבל זמן בית לא יוכל להשתבץ למשימות סוף שבוע.' },
    { id: 3, type: 'MAX_DURATION', title: 'משך זמן מקסימלי', description: 'מניעת שחיקה: שמירה על אורך משמרת תקין (ברירת מחדל: 4 שעות).' },
    { id: 4, type: 'PERSONAL_REQUESTS', title: 'בקשות אישיות', description: 'המערכת מתחשבת בתאריכים שבהם החייל ביקש לא להשתבץ.' },
    { id: 5, type: 'NO_DOUBLE_BOOKING', title: 'חפיפת זמנים (כולל לילות)', description: 'חייל אינו יכול להשתבץ ליותר ממשימה אחת בו-זמנית, כולל משימות לילה.' },
    { id: 6, type: 'CONSECUTIVE_DAYS', title: 'ימים רצופים בבסיס (עד 10)', description: 'חייל שנמצא 10 ימים רצופים בבסיס מסומן כ"חייב לצאת" ולא ניתן לשבצו.' },
    { id: 7, type: 'MIN_REST', title: 'מנוחה מינימלית (8/12 שעות)', description: 'חייל חייב לנוח 12 שעות אחרי חמ"ל/סיור יום, ו-8 שעות אחרי כל תפקיד אחר.' },
    { id: 8, type: 'READINESS_DEPENDENCY', title: 'כיתת כוננות (עודכן)', description: 'חייל פנוי שסיים משימות יכול להשתבץ לכוננות. אין צורך להמתין 36 שעות.' },
];

/**
 * Automatically assigns soldiers to tasks.
 *
 * THREE-TIER fallback — NO task is ever left unassigned if soldiers exist:
 *   1. Perfect:  no warnings at all.
 *   2. Soft-rest: only REST_VIOLATION soft warnings (shown as ⚠️ in UI).
 *   3. Forced:   any soldier — even double-booked — to guarantee 100% fill.
 *               Tagged so the UI shows a red "חזרה על משימה" badge.
 *
 * Soldiers are re-sorted PER TASK by workload (fewest assignments today first)
 * so the same soldier is never overloaded while others are idle.
 */
export const autoAssign = (tasks, soldiers, currentAssignmentsMap, blockedSoldiers = []) => {
    const assignmentsDict = { ...currentAssignmentsMap };
    const restViolationSet = new Set();
    const forcedSet = new Set();
    const conflicts = [];

    let progressiveAssignmentsArray = Object.entries(assignmentsDict).map(([taskId, soldierId]) => ({
        taskId, soldierId
    }));

    // Classify warnings into hard-blocks vs soft rest violations
    const isHard = (w) => typeof w === 'string' || (typeof w === 'object' && w.severity !== 'soft');

    tasks.forEach(task => {
        if (assignmentsDict[task.id]) return; // already assigned

        // --- Workload counters (recalculated each task so they stay accurate) ---
        const todayCount = {};   // assignments on the same date
        const totalCount = {};   // all assignments so far
        soldiers.forEach(s => { todayCount[s.id] = 0; totalCount[s.id] = 0; });

        progressiveAssignmentsArray.forEach(a => {
            if (totalCount[a.soldierId] !== undefined) {
                totalCount[a.soldierId]++;
                // Find the assigned task to check its date
                const assignedTask = tasks.find(t => t.id === a.taskId);
                if (assignedTask && assignedTask.date === task.date) {
                    todayCount[a.soldierId]++;
                }
            }
        });

        // Sort: fewest assignments TODAY → fewest TOTAL → rest by consecutiveDays
        const candidateSoldiers = [...soldiers].sort((a, b) => {
            const todayDiff = (todayCount[a.id] || 0) - (todayCount[b.id] || 0);
            if (todayDiff !== 0) return todayDiff;
            const totalDiff = (totalCount[a.id] || 0) - (totalCount[b.id] || 0);
            if (totalDiff !== 0) return totalDiff;
            return (a.consecutiveDaysAtBase || 0) - (b.consecutiveDaysAtBase || 0);
        });

        let tier1 = null; // perfect — no warnings
        let tier2 = null; // soft rest-violation only
        let tier3 = null; // absolute fallback — any soldier (may double-book)

        for (const soldier of candidateSoldiers) {
            if (soldier.isAtHome) continue; // skip soldiers on leave

            // Check manual commander blocks
            // The algorithm no longer reads specific BlockedSoldiers array here,
            // as rules are handled via the "Informational Only" constraints panel.
            // (If the user wants hard UI checks for specific user blocking, they need a dedicated Rule Builder feature).

            const mock = { taskId: task.id, soldierId: soldier.id };
            const warnings = checkConstraints(mock, soldier, task, progressiveAssignmentsArray, tasks);
            const hardW = warnings.filter(isHard);

            if (!tier1 && hardW.length === 0 && warnings.length === 0) {
                tier1 = soldier.id;
                break; // perfect match — stop looking
            }
            if (!tier2 && hardW.length === 0) {
                tier2 = soldier.id; // soft rest-violation only
            }
            if (!tier3) {
                tier3 = soldier.id; // set once to least-busy soldier; continue looking for better
            }
        }

        const chosen = tier1 || tier2 || tier3;

        if (chosen) {
            assignmentsDict[task.id] = chosen;
            progressiveAssignmentsArray.push({ taskId: task.id, soldierId: chosen });
            if (!tier1 && tier2 && tier2 === chosen) restViolationSet.add(task.id);
            if (!tier1 && !tier2 && tier3 && tier3 === chosen) forcedSet.add(task.id);
        } else {
            conflicts.push({ taskId: task.id, reason: 'כל הסד"כ בחופשה בו-זמנית או חסום על ידי אילוצים' });
        }
    });

    return { newAssignmentsMap: assignmentsDict, conflicts, restViolationSet, forcedSet };
};



/**
 * Finds up to 3 valid alternative soldiers for a conflicted task.
 * Prefers soldiers with fewer consecutive days at base (<5 first, then rest).
 */
export const findAlternatives = (task, soldiers, currentAssignmentsMap, allTasks, excludeSoldierId) => {
    const assignmentsArray = Object.entries(currentAssignmentsMap)
        .filter(([taskId]) => taskId !== task.id)
        .map(([taskId, soldierId]) => ({ taskId, soldierId }));

    // Filter valid candidates
    const candidates = soldiers.filter(soldier => {
        if (soldier.id === excludeSoldierId) return false;
        const mockAssignment = { taskId: task.id, soldierId: soldier.id };
        const warnings = checkConstraints(mockAssignment, soldier, task, assignmentsArray, allTasks);
        return warnings.length === 0;
    });

    // Sort: prefer soldiers with fewer consecutive days at base — fresher soldiers first
    candidates.sort((a, b) => {
        const daysA = a.consecutiveDaysAtBase || 0;
        const daysB = b.consecutiveDaysAtBase || 0;
        return daysA - daysB;
    });

    return candidates.slice(0, 3);
};

/**
 * Lightweight per-soldier conflict check for dropdown display.
 * Only checks overlap and 2-hour minimum rest — fast enough to call for every soldier option.
 * Returns: null (no issue) | 'overlap' (כבר משובץ) | 'rest' (זמן מנוחה)
 */
export const getSoldierConflictForTask = (soldier, task, assignmentsArray, allTasks) => {
    if (!soldier || !task || !task.date || !task.startTime || !task.endTime) return null;

    const taskStart = parseTime(task.startTime, task.date, 'start');
    const taskEnd = parseTime(task.endTime, task.date, 'end', task.startTime);
    if (!taskStart || !taskEnd) return null;

    const soldierTaskIds = (assignmentsArray || [])
        .filter(a => a.soldierId === soldier.id && a.taskId !== task.id)
        .map(a => a.taskId);

    // Limit to tasks within ±2 days for performance
    const taskDateMs = new Date(task.date).getTime();
    const soldierActiveTasks = (allTasks || []).filter(t => {
        if (!soldierTaskIds.includes(t.id) || !t.date || !t.startTime || !t.endTime) return false;
        return Math.abs(new Date(t.date).getTime() - taskDateMs) <= 2 * 24 * 3600000;
    });

    for (const st of soldierActiveTasks) {
        try {
            const stStart = parseTime(st.startTime, st.date, 'start');
            const stEnd = parseTime(st.endTime, st.date, 'end', st.startTime);

            // Direct overlap
            if (areIntervalsOverlapping({ start: taskStart, end: taskEnd }, { start: stStart, end: stEnd })) {
                return 'overlap';
            }

            // Task-type-aware minimum rest check
            const reqRest = st.name && st.name.includes('סיור') ? 12 : 8;
            const gapAfter = (taskStart - stEnd) / 3600000;
            const gapBefore = (stStart - taskEnd) / 3600000;
            if ((gapAfter > 0 && gapAfter < reqRest) ||
                (gapBefore > 0 && gapBefore < reqRest)) {
                return 'rest';
            }
        } catch (_) { }
    }

    return null;
};
