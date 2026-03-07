import React, { useState } from 'react';
import { CalendarClock, FileWarning } from 'lucide-react';
import './RequestForm.css';

const RequestForm = ({ soldiers, onAddRequest }) => {
    const [selectedSoldier, setSelectedSoldier] = useState('');
    const [date, setDate] = useState('');
    const [reason, setReason] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedSoldier || !date || !reason) return;

        onAddRequest(selectedSoldier, { id: `req_${Date.now()}`, date, reason, status: 'pending' });

        // Reset form fields
        setSelectedSoldier('');
        setDate('');
        setReason('');
    };

    return (
        <div className="request-form-container" dir="rtl">
            <div className="form-header">
                <CalendarClock className="icon-request" size={24} />
                <h2>הגשת בקשה אישית משירות / זמן בית</h2>
            </div>

            <form onSubmit={handleSubmit} className="request-form">
                <div className="form-group">
                    <label htmlFor="soldier-select">בחר חייל:</label>
                    <select
                        id="soldier-select"
                        value={selectedSoldier}
                        onChange={(e) => setSelectedSoldier(e.target.value)}
                        required
                    >
                        <option value="">-- בחר איש סגל --</option>
                        {soldiers.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="date-input">תאריך פטור/חופשה:</label>
                    <input
                        type="date"
                        id="date-input"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="reason-input">סיבה / פירוט:</label>
                    <input
                        type="text"
                        id="reason-input"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder='למשל: "תור לרופא בחר"פ", "אירוע משפחתי"'
                        required
                    />
                </div>

                <button type="submit" className="btn-submit">
                    <FileWarning size={18} /> הגש בקשה נתונה למערכת
                </button>
            </form>
        </div>
    );
};

export default RequestForm;
