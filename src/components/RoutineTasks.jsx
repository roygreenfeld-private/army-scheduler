import React, { useState } from 'react';
import { format, isBefore, parse } from 'date-fns';
import { CheckCircle2, Circle, Plus, X } from 'lucide-react';
import './RoutineTasks.css';

const RoutineTasks = ({ tasks, toggleTask, onAddTask, isCommander }) => {
    const currentDate = new Date();
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ title: '', date: format(new Date(), 'yyyy-MM-dd'), time: '08:00', assignee: '', description: '' });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.title.trim()) return;
        onAddTask({
            id: `rt_${Date.now()}`,
            title: form.title.trim(),
            date: form.date,
            time: form.time,
            assignee: form.assignee.trim(),
            description: form.description.trim(),
            isDone: false,
        });
        setForm({ title: '', date: format(new Date(), 'yyyy-MM-dd'), time: '08:00', assignee: '', description: '' });
        setShowForm(false);
    };

    return (
        <div className="routine-dashboard fade-in">
            <div className="dashboard-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h2>משימות שגרה</h2>
                        <p>מטלות שוטפות לסגל ומפקדים</p>
                    </div>
                    {isCommander && (
                        <button
                            className="btn-add-routine"
                            onClick={() => setShowForm(v => !v)}
                        >
                            {showForm ? <X size={16} /> : <Plus size={16} />}
                            {showForm ? 'ביטול' : 'הוסף משימה'}
                        </button>
                    )}
                </div>
            </div>

            {/* Add Task Form */}
            {showForm && isCommander && (
                <form className="add-routine-form" onSubmit={handleSubmit} dir="rtl">
                    <div className="form-row">
                        <div className="form-group">
                            <label>שם המשימה *</label>
                            <input
                                type="text"
                                placeholder="לדוגמה: מסדר נשק מחלקתי"
                                value={form.title}
                                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>אחראי</label>
                            <input
                                type="text"
                                placeholder="שם האחראי"
                                value={form.assignee}
                                onChange={e => setForm(p => ({ ...p, assignee: e.target.value }))}
                            />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>תאריך</label>
                            <input
                                type="date"
                                value={form.date}
                                onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                            />
                        </div>
                        <div className="form-group">
                            <label>שעה</label>
                            <input
                                type="time"
                                value={form.time}
                                onChange={e => setForm(p => ({ ...p, time: e.target.value }))}
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>תיאור (אופציונלי)</label>
                        <input
                            type="text"
                            placeholder="תיאור קצר של המשימה"
                            value={form.description}
                            onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                        <button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>ביטול</button>
                        <button type="submit" className="btn-submit-routine">הוסף משימה ✓</button>
                    </div>
                </form>
            )}

            <div className="routine-table-container">
                <table className="routine-table" dir="rtl">
                    <thead>
                        <tr>
                            <th style={{ width: '60px' }}>סטטוס</th>
                            <th>שם המשימה</th>
                            <th>תאריך ושעה</th>
                            <th>אחראי</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tasks.length === 0 && (
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                    אין משימות שגרה מוגדרות. לחץ "הוסף משימה" כדי להתחיל.
                                </td>
                            </tr>
                        )}
                        {tasks.map(task => {
                            const targetTime = parse(`${task.date} ${task.time}`, 'yyyy-MM-dd HH:mm', new Date());
                            const isOverdue = !task.isDone && isBefore(targetTime, currentDate);

                            let rowClass = 'routine-row';
                            if (task.isDone) rowClass += ' done';
                            else if (isOverdue) rowClass += ' overdue';

                            // Hebrew date display
                            const hebrewDate = new Date(task.date).toLocaleDateString('he-IL', {
                                weekday: 'short', day: 'numeric', month: 'long'
                            });

                            return (
                                <tr key={task.id} className={rowClass}>
                                    <td className="action-cell">
                                        <button
                                            className="btn-toggle-done"
                                            onClick={() => toggleTask(task.id)}
                                            disabled={!isCommander}
                                            title={task.isDone ? 'בוטל ביצוע' : 'סמן כבוצע'}
                                        >
                                            {task.isDone
                                                ? <CheckCircle2 size={22} color="#10b981" />
                                                : <Circle size={22} color={isOverdue ? '#ef4444' : '#94a3b8'} />}
                                        </button>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 600 }}>{task.title}</div>
                                        {task.description && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>{task.description}</div>}
                                    </td>
                                    <td dir="rtl" style={{ fontSize: '0.85rem' }}>
                                        {hebrewDate} | {task.time}
                                        {isOverdue && <div style={{ color: '#ef4444', fontSize: '0.72rem', fontWeight: 700 }}>⏰ חריגת מועד</div>}
                                    </td>
                                    <td>{task.assignee || '—'}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RoutineTasks;
