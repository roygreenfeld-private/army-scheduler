import React, { useState } from 'react';
import { ShieldAlert, FileText, Trash2, AlertTriangle, AlertCircle, ShieldCheck, CheckCircle, Info } from 'lucide-react';
import { globalConstraints } from '../utils/constraints';

const ConstraintsManager = ({ dynamicConstraints, onAddConstraint, onRemoveConstraint }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState(5);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title || !description) return;

        onAddConstraint({
            id: Date.now().toString(),
            title,
            description,
            priority: Number(priority),
            dateAdded: new Date().toLocaleDateString('he-IL')
        });

        setTitle('');
        setDescription('');
        setPriority(5);
    };

    const activeConstraints = Object.values(dynamicConstraints).sort((a, b) => b.priority - a.priority);

    // Color logic based on priority 1-10
    const getPriorityColor = (p) => {
        if (p >= 8) return 'var(--error-color)';
        if (p >= 5) return 'var(--warning-color)';
        return 'var(--primary-color)';
    };

    return (
        <div dir="rtl" style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <header>
                <h2 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '12px', margin: '0 0 0.5rem 0' }}>
                    <ShieldAlert color="var(--error-color)" size={32} />
                    חוקי שיבוץ ואילוצי מערכת
                </h2>
                <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', margin: 0 }}>
                    ריכוז כלל נהלי השיבוץ. המערכת מסנכרנת בין חוקי הברזל הצבאיים לבין האילוצים המיוחדים שהמפקד מגדיר (מתועדפים 1 עד 10).
                </p>
            </header>

            {/* System Constraints (Read Only) */}
            <div style={{ background: 'var(--bg-color)', borderRadius: '12px', padding: '1.5rem', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-soft)' }}>
                <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)', fontSize: '1.25rem' }}>
                    <ShieldCheck size={20} color="var(--success-color)" /> חוקי ברזל מערכתיים (נאכפים אוטומטית ע"י האלגוריתם)
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                    {globalConstraints.map(rule => (
                        <div key={rule.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', background: 'var(--surface-color)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                            <Info size={18} color="var(--primary-color)" style={{ marginTop: '2px', flexShrink: 0 }} />
                            <div>
                                <strong style={{ display: 'block', fontSize: '1rem', color: 'var(--text-main)', marginBottom: '4px' }}>{rule.title}</strong>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>{rule.description}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
                {/* Form Section */}
                <div style={{ background: 'var(--surface-color)', borderRadius: '12px', padding: '2rem', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-soft)' }}>
                    <h3 style={{ margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)', fontSize: '1.25rem' }}>
                        <FileText size={20} color="var(--primary-color)" /> יצירת אילוץ חדש
                    </h3>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '600' }}>כותרת האילוץ</label>
                            <input
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="לדוגמה: כמות חובשים בסיור"
                                style={{ width: '100%', padding: '0.85rem', background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)', outline: 'none' }}
                                required
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '600' }}>פירוט והנחיות</label>
                            <textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="תאר את הכלל במפורט לטובת המפקד המשבץ..."
                                rows={3}
                                style={{ width: '100%', padding: '0.85rem', background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)', outline: 'none', resize: 'none' }}
                                required
                            />
                        </div>

                        <div>
                            <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                                <span>תעדוף / קריטיות (1-10)</span>
                                <span style={{ color: getPriorityColor(priority) }}>{priority}</span>
                            </label>
                            <input
                                type="range"
                                min="1" max="10"
                                value={priority}
                                onChange={e => setPriority(e.target.value)}
                                style={{ width: '100%', cursor: 'pointer' }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                <span>נמוך (1)</span>
                                <span>רמות ביניים</span>
                                <span>חובה אבסולוטית (10)</span>
                            </div>
                        </div>

                        <button
                            type="submit"
                            style={{ marginTop: '1rem', padding: '1rem', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0, 139, 229, 0.3)', transition: 'all 0.2s' }}
                            onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseOut={e => e.currentTarget.style.transform = 'none'}
                        >
                            <CheckCircle2 size={20} />
                            שמור אילוץ למערכת
                        </button>
                    </form>
                </div>

                {/* Active Constraints List */}
                <div style={{ background: 'var(--surface-color)', borderRadius: '12px', padding: '2rem', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-soft)', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)', fontSize: '1.25rem' }}>
                        <AlertCircle size={20} color="var(--warning-color)" /> רשימת אילוצים תקפים ({activeConstraints.length})
                    </h3>

                    {activeConstraints.length === 0 ? (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', background: 'var(--bg-color)', borderRadius: '8px', border: '1px dashed var(--border-color)', minHeight: '200px' }}>
                            <CheckCircle2 size={36} color="var(--success-color)" style={{ marginBottom: '8px', opacity: 0.8 }} />
                            <p>אין אילוצים כלליים לבסיס</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', maxHeight: '500px', paddingRight: '4px' }}>
                            {activeConstraints.map(constraint => {
                                const color = getPriorityColor(constraint.priority);
                                return (
                                    <div key={constraint.id} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '1rem', background: 'var(--bg-color)', borderRight: `4px solid ${color}`, borderRadius: '8px', border: '1px solid var(--border-color)', borderRightColor: color }}>
                                        <div>
                                            <div style={{ fontWeight: 'bold', color: 'var(--text-main)', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                {constraint.title}
                                                <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', background: `${color}20`, color: color, fontWeight: '800' }}>
                                                    עדיפות: {constraint.priority}
                                                </span>
                                            </div>
                                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '8px', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>
                                                {constraint.description}
                                            </p>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px', opacity: 0.6 }}>
                                                הוזן בתאריך: {constraint.dateAdded}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => onRemoveConstraint(constraint.id)}
                                            style={{ background: 'transparent', border: 'none', color: 'var(--error-color)', padding: '4px', cursor: 'pointer', opacity: 0.7, transition: 'opacity 0.2s' }}
                                            onMouseOver={e => e.currentTarget.style.opacity = 1}
                                            onMouseOut={e => e.currentTarget.style.opacity = 0.7}
                                            title="מחק אילוץ"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ConstraintsManager;
