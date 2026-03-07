import React from 'react';
import { CalendarClock, Check, X, Clock } from 'lucide-react';

const RequestsAdmin = ({ soldiers, onUpdateRequestStatus }) => {
    // Flatten all personal requests into a single array
    const allRequests = soldiers.flatMap(s =>
        (s.personalRequests || []).map(req => ({
            ...req,
            soldierId: s.id,
            soldierName: s.name,
            soldierPlatoon: s.platoon || ''
        }))
    ).sort((a, b) => {
        // Sort: pending first, then by date mapping
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        if (a.status !== 'pending' && b.status === 'pending') return 1;
        return new Date(a.date) - new Date(b.date);
    });

    return (
        <div className="requests-admin-container" dir="rtl" style={{ padding: '1rem' }}>
            <div className="form-header" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                <CalendarClock size={24} style={{ color: 'var(--primary-color)' }} />
                <h2 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.4rem' }}>ניהול בקשות חיילים</h2>
            </div>

            {allRequests.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem', backgroundColor: 'var(--surface-color)', borderRadius: '12px' }}>
                    אין בקשות במערכת.
                </div>
            ) : (
                <div style={{ overflowX: 'auto', background: 'var(--surface-color)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <table style={{ width: '100%', textAlign: 'right', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.05)' }}>
                                <th style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>חייל</th>
                                <th style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>תאריך בקשה</th>
                                <th style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>פירוט/סיבה</th>
                                <th style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>סטטוס</th>
                                <th style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', textAlign: 'center' }}>פעולות</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allRequests.map(req => (
                                <tr key={req.id || `${req.soldierId}-${req.date}`} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s', opacity: req.status === 'rejected' ? 0.6 : 1 }}>
                                    <td style={{ padding: '1rem', fontWeight: 'bold' }}>
                                        {req.soldierName} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{req.soldierPlatoon}</span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>{req.date}</td>
                                    <td style={{ padding: '1rem' }}>{req.reason}</td>
                                    <td style={{ padding: '1rem' }}>
                                        {req.status === 'approved' && <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}><Check size={14} /> אושר (חוסם שיבוץ)</span>}
                                        {req.status === 'rejected' && <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}><X size={14} /> נדחה</span>}
                                        {(!req.status || req.status === 'pending') && <span style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} /> ממתין</span>}
                                    </td>
                                    <td style={{ padding: '1rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                                        <button
                                            className="btn-secondary"
                                            style={{ backgroundColor: req.status === 'approved' ? 'rgba(16,185,129,0.2)' : 'transparent', color: req.status === 'approved' ? '#10b981' : 'var(--text-main)', padding: '0.4rem 0.8rem' }}
                                            onClick={() => onUpdateRequestStatus(req.soldierId, req.id, 'approved')}
                                            disabled={req.status === 'approved'}
                                        >
                                            <Check size={16} /> אישור
                                        </button>
                                        <button
                                            className="btn-secondary"
                                            style={{ backgroundColor: req.status === 'rejected' ? 'rgba(239,68,68,0.2)' : 'transparent', color: req.status === 'rejected' ? '#ef4444' : 'var(--text-main)', padding: '0.4rem 0.8rem' }}
                                            onClick={() => onUpdateRequestStatus(req.soldierId, req.id, 'rejected')}
                                            disabled={req.status === 'rejected'}
                                        >
                                            <X size={16} /> דחייה
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default RequestsAdmin;
