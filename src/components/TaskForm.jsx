import React, { useState } from 'react';
import { PlusCircle, Clock, Shield } from 'lucide-react';
import './RequestForm.css'; // Reusing the dark styling for forms

const TaskForm = ({ onAddTask }) => {
    const [name, setName] = useState('');
    const [requiredRoles, setRequiredRoles] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [dateOffset, setDateOffset] = useState(0);
    const [requiresClosing, setRequiresClosing] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name || !startTime || !endTime) return;

        // Convert comma-separated string to array, similar to Soldier roles
        const rolesArray = requiredRoles
            ? requiredRoles.split(',').map(r => r.trim()).filter(r => r !== '')
            : [];

        const newTask = {
            id: `task-${Date.now()}`,
            name,
            requiredRoles: rolesArray,
            startTime,
            endTime,
            dateOffset: parseInt(dateOffset, 10),
            requiresClosing
        };

        onAddTask(newTask);

        // Reset Form
        setName('');
        setRequiredRoles('');
        setStartTime('');
        setEndTime('');
        setDateOffset(0);
        setRequiresClosing(false);
    };

    return (
        <div className="request-form-container" dir="rtl">
            <div className="form-header">
                <PlusCircle className="icon-request" size={24} style={{ color: 'var(--primary-color)' }} />
                <h2>יצירת משימה חדשה (פקודת מבצע)</h2>
            </div>

            <form onSubmit={handleSubmit} className="request-form">
                <div className="form-group">
                    <label htmlFor="task-name">שם המשימה:</label>
                    <input
                        type="text"
                        id="task-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder='למשל: "מארב כוכב", "פטרול גזרה"'
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="req-roles">הכשרות נדרשות (מופרד בפסיק):</label>
                    <input
                        type="text"
                        id="req-roles"
                        value={requiredRoles}
                        onChange={(e) => setRequiredRoles(e.target.value)}
                        placeholder='למשל: "לוחם, מפקד" (השאר ריק אם אין דרישה)'
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                        <label htmlFor="start-time">שעת התחלה:</label>
                        <input
                            type="time"
                            id="start-time"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="end-time">שעת סיום:</label>
                        <input
                            type="time"
                            id="end-time"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="date-offset">יום בשבוע הנוכחי (0 = ראשון, 6 = שבת):</label>
                    <input
                        type="number"
                        id="date-offset"
                        min="0"
                        max="6"
                        value={dateOffset}
                        onChange={(e) => setDateOffset(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', flex: '0 0 auto', marginTop: '1.5rem' }}>
                    <input
                        type="checkbox"
                        id="req-closing"
                        checked={requiresClosing}
                        onChange={(e) => setRequiresClosing(e.target.checked)}
                        style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                    />
                    <label htmlFor="req-closing" style={{ fontSize: '1rem', cursor: 'pointer' }}>
                        משימת סופ"ש (דורש חיילים שסוגרים שבת מסוג "זמן בסיס")
                    </label>
                </div>

                <button type="submit" className="btn-submit" style={{ backgroundColor: 'var(--primary-color)' }}>
                    <Clock size={18} /> הוסף משימה למערכת
                </button>
            </form>
        </div>
    );
};

export default TaskForm;
