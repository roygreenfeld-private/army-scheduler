import React, { useState } from 'react';
import { UserPlus, Shield } from 'lucide-react';
import './RequestForm.css'; // We'll reuse the dark RTL aesthetic from RequestForm

const SoldierForm = ({ onAddSoldier }) => {
    const [name, setName] = useState('');
    const [idNumber, setIdNumber] = useState('');
    const [roles, setRoles] = useState('');
    const [isClosing, setIsClosing] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name || !idNumber || !roles) return;

        // Convert comma separated string to array of roles
        const rolesArray = roles.split(',').map(r => r.trim()).filter(r => r !== '');

        const newSoldier = {
            id: `s_${idNumber}_${Date.now()}`, // Ensure truly unique ID
            name: name.trim(),
            roles: rolesArray,
            isClosing,
            maxHoursPerShift: 4,
            personalRequests: [],
            platoon: 'מחלקה 1',
            consecutiveDaysAtBase: 0  // New soldiers start at 0 days
        };

        onAddSoldier(newSoldier);

        // Reset Form
        setName('');
        setIdNumber('');
        setRoles('');
        setIsClosing(false);
    };

    return (
        <div className="request-form-container" dir="rtl">
            <div className="form-header">
                <UserPlus className="icon-request" size={24} style={{ color: 'var(--primary-color)' }} />
                <h2>קליטת חייל חדש למאגר (DB)</h2>
            </div>

            <form onSubmit={handleSubmit} className="request-form">
                <div className="form-group">
                    <label htmlFor="name-input">שם מלא מדרגה (למשל סגן ישראל ישראלי):</label>
                    <input
                        type="text"
                        id="name-input"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder="דרגה ושם מלא"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="id-input">מספר אישי:</label>
                    <input
                        type="text"
                        id="id-input"
                        value={idNumber}
                        onChange={(e) => setIdNumber(e.target.value)}
                        required
                        placeholder="1234567"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="roles-input">הכשרות ותפקידים (מופרד בפסיק):</label>
                    <input
                        type="text"
                        id="roles-input"
                        value={roles}
                        onChange={(e) => setRoles(e.target.value)}
                        placeholder='למשל: "לוחם, חופ"ל, מפקד"'
                        required
                    />
                </div>

                <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', flex: '0 0 auto', marginTop: '1.5rem' }}>
                    <input
                        type="checkbox"
                        id="closing-input"
                        checked={isClosing}
                        onChange={(e) => setIsClosing(e.target.checked)}
                        style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                    />
                    <label htmlFor="closing-input" style={{ fontSize: '1rem', cursor: 'pointer' }}>
                        החייל סוגר (רתוק לבסיס בסופ"ש)
                    </label>
                </div>

                <button type="submit" className="btn-submit" style={{ backgroundColor: 'var(--primary-color)' }}>
                    <Shield size={18} /> קלוט חייל למערכת
                </button>
            </form>
        </div>
    );
};

export default SoldierForm;
