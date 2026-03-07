import React, { useState } from 'react'; // fixed: warnings normalized to strings
import { Bell, AlertTriangle, AlertCircle, Clock, ChevronDown, ChevronUp, X, CheckSquare } from 'lucide-react';
import { checkConstraints } from '../utils/constraints';
import { isBefore, parse } from 'date-fns';
import './NotificationCenter.css';

/**
 * NotificationCenter — shows urgent commander warnings about:
 * 1. Overdue Routine Tasks (Red Checklists)
 * 2. Rest Violations (8/12 hours) from the assigned tasks
 */
const NotificationCenter = ({ soldiers, tasks, assignments, routineTasks = [], onNavigateToTask, onNavigateToRoutine }) => {
    const [isOpen, setIsOpen] = useState(false);

    const currentDate = new Date();

    // 1. Overdue Routine Tasks
    const overdueRoutines = React.useMemo(() => {
        const now = new Date();
        return routineTasks.filter(task => {
            if (task.isDone) return false;
            try {
                const targetTime = parse(`${task.date} ${task.time}`, 'yyyy-MM-dd HH:mm', new Date());
                return isBefore(targetTime, now);
            } catch (e) { return false; }
        });
    }, [routineTasks]);

    // 2. Rest Violations (Constraint 7) — now supports soft {type, severity, message} objects
    // Wrapped in useMemo to avoid O(N^2) synchronous calculations across 500 tasks on every tab switch
    const restViolations = React.useMemo(() => {
        const violations = [];
        const assignmentsArray = Object.entries(assignments || {}).map(([taskId, soldierId]) => ({ taskId, soldierId }));

        tasks.forEach(task => {
            const assignedId = assignments[task.id];
            if (!assignedId) return;
            const soldier = soldiers.find(s => s.id === assignedId);
            if (!soldier) return;

            const warnings = checkConstraints({ taskId: task.id, soldierId: assignedId }, soldier, task, assignmentsArray, tasks);

            // Normalize: warnings can be strings or {type, severity, message} objects
            const restWarnings = warnings
                .map(w => typeof w === 'string' ? w : (w && w.message) || '')
                .filter(msg => msg.includes('מנוחה') || msg.includes('REST') || msg.includes('חזרה'));

            if (restWarnings.length > 0) {
                violations.push({
                    task,
                    soldier,
                    messages: restWarnings,
                    isSoft: warnings.every(w => typeof w === 'object' && w.severity === 'soft')
                });
            }
        });
        return violations;
    }, [tasks, assignments, soldiers]);

    const totalWarnings = overdueRoutines.length + restViolations.length;
    const criticalCount = restViolations.length;

    if (totalWarnings === 0) return null;

    return (
        <div className="notification-center" dir="rtl">
            {/* Bell trigger */}
            <button
                className={`notif-bell ${criticalCount > 0 ? 'critical' : 'warning'} ${isOpen ? 'open' : ''}`}
                onClick={() => setIsOpen(o => !o)}
                title="חריגות מנוחה ומשימות שגרה"
            >
                <Bell size={20} />
                <span className="notif-badge">{totalWarnings}</span>
                <span className="notif-label">התרעות דחופות</span>
                {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {isOpen && (
                <div className="notif-panel">
                    <div className="notif-panel-header">
                        <span>התרעות דחופות ({totalWarnings})</span>
                        <button className="notif-close" onClick={() => setIsOpen(false)}>
                            <X size={16} />
                        </button>
                    </div>

                    {/* REST VIOLATIONS */}
                    {restViolations.length > 0 && (
                        <div className="notif-section">
                            <div className="notif-section-title critical">
                                <AlertCircle size={15} /> חריגות מנוחה (8/12 שעות)
                            </div>
                            {restViolations.map((v, i) => (
                                <button
                                    key={`rv-${i}`}
                                    className="notif-item critical notif-item-clickable"
                                    onClick={() => {
                                        if (onNavigateToTask) onNavigateToTask(v.task);
                                        setIsOpen(false);
                                    }}
                                >
                                    <AlertTriangle size={14} />
                                    <div className="notif-item-body">
                                        <strong>{v.soldier.name} — {v.task.name}</strong>
                                        {v.messages.map((m, idx) => (
                                            <span key={idx}>{m}</span>
                                        ))}
                                    </div>
                                    <span className="notif-goto">←</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* OVERDUE ROUTINE TASKS */}
                    {overdueRoutines.length > 0 && (
                        <div className="notif-section">
                            <div className="notif-section-title warning">
                                <CheckSquare size={15} /> משימות שגרה באיחור ({overdueRoutines.length})
                            </div>
                            {overdueRoutines.map(t => (
                                <button
                                    key={t.id}
                                    className="notif-item warning notif-item-clickable"
                                    onClick={() => {
                                        if (onNavigateToRoutine) onNavigateToRoutine();
                                        setIsOpen(false);
                                    }}
                                >
                                    <Clock size={14} />
                                    <div className="notif-item-body">
                                        <strong>{t.title}</strong>
                                        <span>היה אמור להתבצע ב- {t.date} {t.time}</span>
                                    </div>
                                    <span className="notif-goto">←</span>
                                </button>
                            ))}
                        </div>
                    )}

                </div>
            )}
        </div>
    );
};

export default NotificationCenter;
