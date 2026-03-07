/**
 * @typedef {Object} PersonalRequest
 * @property {string} date - Date of the request in YYYY-MM-DD
 * @property {string} reason - Reason for request (e.g., "תור חר"פ", "אירוע משפחתי")
 */

/**
 * @typedef {Object} Soldier
 * @property {string} id - Unique identifier
 * @property {string} name - Full name
 * @property {string[]} roles - Role types (סוג תפקיד: e.g., "לוחם", "נהג", "חובש", "מפקד")
 * @property {number} homeTimeBalance - Time at home earned (זמן בית - hours or days)
 * @property {boolean} isClosing - Whether the soldier is staying at base this weekend (זמן שסוגר בצבא)
 * @property {PersonalRequest[]} personalRequests - Specific dates the soldier asked not to be scheduled
 * @property {number} [maxHoursPerShift] - Maximum allowed hours per shift (e.g., 4 or 8)
 * @property {number} [hoursRested] - Hours rested before next shift (שעות מטכ"ליות)
 */

/**
 * @typedef {Object} MilitaryTask
 * @property {string} id - Task ID
 * @property {string} name - Name of task
 * @property {string} taskType - Type of task (סוג משימה: e.g., "שמירה", "מטבח", "סיור", "פטרול")
 * @property {string[]} requiredRoles - Required roles to perform this task (e.g., ["לוחם"])
 * @property {string} startTime - Start time in HH:mm
 * @property {string} endTime - End time in HH:mm
 * @property {string} date - Date of task in YYYY-MM-DD
 * @property {number} duration - Duration in hours (משך זמן)
 * @property {boolean} requiresClosing - If true, only soldiers who are "closing" can do this task (e.g. weekend guard)
 */

/**
 * @typedef {Object} Assignment
 * @property {string} taskId - The ID of the task
 * @property {string} soldierId - The ID of the assigned soldier
 */

export default {};
