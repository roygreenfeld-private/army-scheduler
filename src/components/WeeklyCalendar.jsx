import React, { useState, useMemo, useEffect } from 'react';
import {
  format,
  addDays,
  startOfWeek,
  subWeeks,
  addWeeks,
  isSameDay,
  subDays
} from 'date-fns';
import {
  ChevronRight,
  ChevronLeft,
  CalendarDays,
  AlertTriangle,
  User,
  Users,
  Clock,
  Briefcase,
  Wand2,
  List,
  Grid,
  CheckCircle,
  Calendar as CalendarIcon,
  ArrowRightLeft
} from 'lucide-react';
import { checkConstraints, findAlternatives, getSoldierConflictForTask } from '../utils/constraints';
import './WeeklyCalendar.css';

const WeeklyCalendar = ({ soldiers, tasks, assignments, onAssign, onAutoAssign, currentUserRole, jumpDate, viewModeOverride, onViewModeChange, restViolationTaskIds = new Set(), forcedTaskIds = new Set() }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewModeState, setViewModeState] = useState('day'); // Default to daily view
  const [altModalTask, setAltModalTask] = useState(null);
  const [altModalSoldiers, setAltModalSoldiers] = useState([]);

  const viewMode = viewModeOverride || viewModeState;
  const setViewMode = (mode) => {
    setViewModeState(mode);
    if (onViewModeChange) onViewModeChange(mode);
  };

  // Jump to a specific date when triggered from NotificationCenter
  useEffect(() => {
    if (jumpDate instanceof Date && !isNaN(jumpDate.getTime())) {
      setCurrentDate(jumpDate);
    }
  }, [jumpDate]);

  // Stable anchor: start of the real current week as a string (prevents infinite memo re-runs)
  const baseStartOfWeekStr = useMemo(
    () => format(startOfWeek(new Date(), { weekStartsOn: 0 }), 'yyyy-MM-dd'),
    [] // only compute once on mount
  );

  const hydratedTasks = useMemo(() => {
    return (tasks || []).map(task => {
      if (!task) return task;
      // If the task already has a real date, use it directly
      if (task.date) return task;
      // Otherwise calculate from dateOffset
      if (task.dateOffset == null) return task;
      const taskDate = addDays(new Date(baseStartOfWeekStr), task.dateOffset);
      return { ...task, date: format(taskDate, 'yyyy-MM-dd') };
    });
  }, [baseStartOfWeekStr, tasks]);

  // Calculate Days based on viewMode
  const calendarDays = useMemo(() => {
    if (viewMode === 'day') {
      return [currentDate];
    } else if (viewMode === 'week') {
      const startDate = startOfWeek(currentDate, { weekStartsOn: 0 });
      return Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));
    }
    return [];
  }, [currentDate, viewMode]);

  // Navigation handlers
  const handlePrev = () => {
    if (viewMode === 'day') setCurrentDate(prev => subDays(prev, 1));
    if (viewMode === 'week') setCurrentDate(prev => subWeeks(prev, 1));

  };

  const handleNext = () => {
    if (viewMode === 'day') setCurrentDate(prev => addDays(prev, 1));
    if (viewMode === 'week') setCurrentDate(prev => addWeeks(prev, 1));

  };

  const handleToday = () => setCurrentDate(new Date());

  // Toggle alternatives panel for a conflicting task
  const handleShowAlternatives = (task, conflictedSoldierId) => {
    const alts = findAlternatives(task, soldiers, assignments, hydratedTasks, conflictedSoldierId);
    setAltModalSoldiers(alts);
    setAltModalTask(task);
  };

  const closeAltModal = () => {
    setAltModalTask(null);
    setAltModalSoldiers([]);
  };

  // Memoize the flat assignments array — prevents re-render loop when used as useMemo dep
  const assignmentsArray = useMemo(
    () => Object.entries(assignments || {}).map(([taskId, soldierId]) => ({ taskId, soldierId })),
    [assignments]
  );

  // Detect Conflicts
  const conflicts = useMemo(() => {
    const allConflicts = [];
    try {
      assignmentsArray.forEach(assignment => {
        if (!assignment.soldierId || !assignment.taskId) return;
        const soldier = (soldiers || []).find(s => s.id === assignment.soldierId);
        const task = (hydratedTasks || []).find(t => t.id === assignment.taskId);
        if (!soldier || !task || !task.date) return;

        const warnings = checkConstraints(assignment, soldier, task, assignmentsArray, hydratedTasks);
        warnings.forEach(warn => {
          // Normalize: warnings can be strings OR {type, severity, message} objects
          const msg = typeof warn === 'string' ? warn : (warn && warn.message) || '';
          const isSoft = typeof warn === 'object' && warn.severity === 'soft';
          if (!msg) return;
          allConflicts.push({
            id: `warn-${task.id}-${soldier.id}-${msg.slice(0, 10)}`,
            taskId: task.id,
            soldierId: soldier.id,
            message: msg,
            isSoft,
          });
        });
      });
    } catch (e) {
      console.error('Conflict check error:', e);
    }
    return allConflicts;
  }, [assignmentsArray, hydratedTasks, soldiers]);

  const hasConflict = (taskId) => conflicts.some(c => c.taskId === taskId);
  const isCommander = currentUserRole === 'commander';

  // Rest-violation badge helper
  const getViolationBadge = (taskId) => {
    if (forcedTaskIds.has(taskId)) {
      return <span className="badge-forced">⚠️ חזרה על משימה</span>;
    }
    if (restViolationTaskIds.has(taskId)) {
      return <span className="badge-rest-warn">⚠️ חריגת מנוחה</span>;
    }
    return null;
  };

  return (
    <div className="calendar-container" dir="rtl">
      <div className="calendar-header">
        <div className="header-title">
          <CalendarDays className="icon-calendar" />
          <h2>
            {viewMode === 'day' && currentDate.toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            {viewMode === 'week' && calendarDays.length >= 7 &&
              `שבוע: ${calendarDays[0].toLocaleDateString('he-IL', { day: 'numeric', month: 'long' })} – ${calendarDays[6].toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' })}`
            }

          </h2>
        </div>

        {/* View Toggles */}
        <div className="view-toggles">
          <button
            className={`btn-view ${viewMode === 'day' ? 'active' : ''}`}
            onClick={() => setViewMode('day')}
            title="תצוגה יומית"
          >
            <List size={18} />
          </button>
          <button
            className={`btn-view ${viewMode === 'week' ? 'active' : ''}`}
            onClick={() => setViewMode('week')}
            title="תצוגה שבועית"
          >
            <Grid size={18} />
          </button>
        </div>

        <div className="header-actions">
          {isCommander && (
            <button className="btn-secondary" onClick={onAutoAssign} style={{ display: 'flex', alignItems: 'center', gap: '8px', borderColor: 'var(--primary-color)', color: 'var(--primary-color)' }}>
              <Wand2 size={16} /> שיבוץ אוטומטי
            </button>
          )}
          <button className="btn-secondary" onClick={handleToday}>היום</button>
          <div className="nav-buttons">
            <button className="btn-icon" onClick={handlePrev} title="קודם"><ChevronRight size={20} /></button>
            <button className="btn-icon" onClick={handleNext} title="הבא"><ChevronLeft size={20} /></button>
          </div>
        </div>
      </div>

      <div className="calendar-grid-wrapper">
        <div className={`calendar-grid view-${viewMode}`}>
          {calendarDays.map((day, idx) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const isTodayDay = isSameDay(day, new Date());
            const isCurrentMonth = format(day, 'MM') === format(currentDate, 'MM');
            const tasksForDay = hydratedTasks.filter(t => t.date === dateStr);

            // Hebrew day/date display using native Intl
            const dayNameHe = day.toLocaleDateString('he-IL', { weekday: 'short' });
            const dayNumHe = day.toLocaleDateString('he-IL', { day: 'numeric' });

            // Grabbing CSS classes
            let dayClasses = `day-column ${isTodayDay ? 'today' : ''}`;


            return (
              <div key={`${dateStr}-${idx}`} className={dayClasses}>
                <div className="day-header">
                  <span className="day-name">{dayNameHe}</span>
                  <span className="day-number">{dayNumHe}</span>
                </div>
                <div className="day-tasks">
                  {(() => {


                    // Day / Week view: Group by task prefix/name (everything before the colon)
                    const groupedTasks = {};
                    tasksForDay.forEach(t => {
                      const groupName = t.name.includes(':') ? t.name.split(':')[0].trim() : (t.name.split(' - ')[0] || t.name);
                      if (!groupedTasks[groupName]) groupedTasks[groupName] = [];
                      groupedTasks[groupName].push(t);
                    });

                    if (Object.keys(groupedTasks).length === 0) {
                      return <div className="no-tasks">אין משימות להיום</div>;
                    }

                    return Object.entries(groupedTasks).map(([groupName, groupTasks]) => (
                      <div key={groupName} className="task-group-container">
                        <div className="task-group-header">
                          <h4 className="task-group-title">{groupName}</h4>
                          <span className="task-group-count">{groupTasks.length} משמרות</span>
                        </div>

                        <div className="task-group-list">
                          {groupTasks.map(task => {
                            const taskConflicts = conflicts.filter(c => c.taskId === task.id);
                            const isConflicting = taskConflicts.length > 0;
                            const hasRestViolation = taskConflicts.some(c => c.message.includes('מנוחה'));
                            const assignedEmpId = assignments[task.id] || '';

                            const assignedSoldier = soldiers.find(s => s.id === assignedEmpId);
                            const isAssignedCmdr = assignedSoldier && (assignedSoldier.roles.includes('מפקד') || assignedSoldier.roles.includes('מ"מ') || assignedSoldier.roles.includes('סמל'));
                            const roleLabel = task.name.includes(':') ? task.name.split(':')[1].trim() : '';

                            const isForced = forcedTaskIds.has(task.id);

                            return (
                              <div key={task.id} className={`task-inline-row ${hasRestViolation ? 'rest-violation' : ''} ${isForced ? 'forced-assignment' : ''}`}>
                                {/* 1. Time & Role */}
                                <div className="task-inline-meta" style={{ display: 'flex', flexDirection: 'column' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <span className="inline-time">{task.startTime}-{task.endTime}</span>
                                  </div>
                                  {roleLabel && <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{roleLabel}</span>}
                                  {getViolationBadge(task.id)}
                                </div>

                                {/* 2. Assignment Dropdown */}
                                <div className="task-inline-assign">
                                  <select
                                    className={`assign-select inline-select ${!assignedEmpId ? 'unassigned' : ''}`}
                                    value={assignedEmpId}
                                    onChange={(e) => onAssign(task.id, e.target.value)}
                                    disabled={!isCommander}
                                    style={{ fontWeight: isAssignedCmdr ? 'bold' : 'normal' }}
                                  >
                                    <option value="">-- ללא שיבוץ --</option>
                                    {soldiers.map(s => {
                                      const conflict = getSoldierConflictForTask(s, task, assignmentsArray, hydratedTasks);
                                      const isCmdr = s.roles.includes('מפקד') || s.roles.includes('מ"מ') || s.roles.includes('סמל');
                                      const prefix = isCmdr ? '⭐ ' : '';

                                      const suffix =
                                        conflict === 'overlap' ? ' ⚠️ (כפילות)' :
                                          conflict === 'rest' ? ' ⚠️ (מנוחה)' : '';

                                      let styleObj = { fontWeight: isCmdr ? 'bold' : 'normal' };
                                      if (conflict) {
                                        styleObj.color = conflict === 'overlap' ? '#ef4444' : '#f59e0b';
                                        styleObj.opacity = 0.75;
                                      }

                                      return (
                                        <option
                                          key={s.id}
                                          value={s.id}
                                          style={styleObj}
                                        >
                                          {prefix}{s.name} {suffix}
                                        </option>
                                      );
                                    })}
                                  </select>
                                </div>

                                {/* 3. Suggest Alternatives Button ⇄ */}
                                {(isConflicting || !assignedEmpId || isCommander) && (
                                  <button
                                    className="btn-suggest-alts-inline"
                                    onClick={() => handleShowAlternatives(task, assignedEmpId)}
                                    title="הצע חלופות"
                                  >
                                    <ArrowRightLeft size={14} />
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {
        altModalTask && (
          <div className="modal-overlay" onClick={closeAltModal}>
            <div className="modal-content alt-modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>חלופות ל: {altModalTask.name} ({altModalTask.startTime}-{altModalTask.endTime})</h3>
                <button className="btn-close" onClick={closeAltModal}>×</button>
              </div>

              <div className="alternatives-list modal-alts">
                {altModalSoldiers.length === 0 ? (
                  <p className="no-alts-msg">אין חיילים פנויים שעומדים בכל האילוצים (כולל מנוחה).</p>
                ) : (
                  altModalSoldiers.map(alt => (
                    <div key={alt.id} className="alt-soldier-row">
                      <div className="alt-soldier-info">
                        <span className="alt-name">{alt.name}</span>
                        <span className="alt-platoon">{alt.platoon || ''}</span>
                      </div>
                      <button
                        className="btn-swap"
                        onClick={() => {
                          onAssign(altModalTask.id, alt.id);
                          closeAltModal();
                        }}
                      >
                        <CheckCircle2 size={14} /> החלף
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
};

export default WeeklyCalendar;
