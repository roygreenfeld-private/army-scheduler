import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';
import './ConstraintPanel.css';

const MILITARY_RULES = [
    { id: 1, title: 'סוג תפקיד (הכשרה)', description: 'חייל חייב להיות בעל ההכשרה המתאימה (למשל: לוחם, חובש) עבור המשימה.' },
    { id: 2, title: 'זמן שסוגר בצבא / זמן בית', description: 'חייל שמקבל "זמן בית" (יוצא שבת) לא יוכל להשתבץ למשימות סוף שבוע.' },
    { id: 3, title: 'משך זמן מקסימלי', description: 'מניעת שחיקה: שמירה על אורך משמרת תקין (ברירת מחדל: 4 שעות).' },
    { id: 4, title: 'בקשות אישיות', description: 'המערכת מתחשבת בתאריכים שבהם החייל ביקש לא להשתבץ (פטורים, חופשות מיוחדות).' },
    { id: 5, title: 'חפיפת זמנים (כפילות)', description: 'חייל אינו יכול להשתבץ לשתי קרבה או משימות שונות באותו הזמן.' }
];

const ConstraintPanel = ({ rules = MILITARY_RULES }) => {
    return (
        <div className="constraint-panel" dir="rtl">
            <div className="panel-header">
                <ShieldCheck className="icon-shield" size={24} />
                <h2>חוקי שיבוץ צבאיים (אילוצים)</h2>
            </div>
            <p className="panel-subtitle">
                המערכת מוודאת אוטומטית שכל שיבוץ עומד בנהלים ובפקודות הבאות:
            </p>
            <ul className="rules-list">
                {rules.map(rule => (
                    <li key={rule.id} className="rule-item">
                        <div className="rule-icon">
                            <Info size={16} />
                        </div>
                        <div className="rule-content">
                            <strong>{rule.title}</strong>
                            <span>{rule.description}</span>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ConstraintPanel;
