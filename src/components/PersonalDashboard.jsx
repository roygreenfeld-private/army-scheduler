import React, { useState } from 'react';
import { CalendarDays, ClipboardList, Send, CheckCircle, Clock, X } from 'lucide-react';
import RequestForm from './RequestForm';

const PersonalDashboard = ({ soldiers, hydratedTasks, assignments, onAddRequest }) => {
    const [selectedSoldierId, setSelectedSoldierId] = useState('');

    const soldier = soldiers.find(s => s.id === selectedSoldierId);

    // Personal Assignments for this soldier
    const personalTasks = hydratedTasks.filter(task => assignments[task.id] === selectedSoldierId);

    // Sort personal requests by date
    const personalRequests = (soldier?.personalRequests || []).sort((a, b) => new Date(a.date) - new Date(b.date));

    return (
        <div className="personal-dashboard" dir="rtl" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* Identity Selector (Mock Login) */}
            <div style={{ padding: '1.5rem', background: 'var(--surface-color)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <h3 style={{ margin: '0 0 1rem 0', color: 'var(--text-main)', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CalendarDays size={20} color="var(--primary-color)" />
                    לוח שיבוצים אישי
                </h3>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>בחר את הפרופיל שלך (הדמיית התחברות):</label>
                <select
                    style={{ width: '100%', maxWidth: '400px', padding: '0.75rem', background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)' }}
                    value={selectedSoldierId}
                    onChange={e => setSelectedSoldierId(e.target.value)}
                >
                    <option value="">-- בחר פרופיל --</option>
                    {soldiers.map(s => <option key={s.id} value={s.id}>{s.name} ({s.roles.join(', ')})</option>)}
                </select>
            </div>

            {soldier && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>

                    {/* Left Column: Schedule & Tracking */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                        {/* Weekly Schedule */}
                        <div style={{ background: 'var(--surface-color)', borderRadius: '12px', padding: '1.5rem', border: '1px solid var(--border-color)' }}>
                            <h4 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <ClipboardList size={18} color="var(--primary-color)" /> המשמרות הקרובות שלי
                            </h4>
                            {personalTasks.length === 0 ? (
                                <p style={{ color: 'var(--text-muted)' }}>אין לך משמרות מתוכננות לשבוע הקרוב.</p>
                            ) : (
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {personalTasks.map(task => (
                                        <li key={task.id} style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid var(--primary-color)' }}>
                                            <strong style={{ fontSize: '1.1rem' }}>{task.name}</strong>
                                            <div style={{ textAlign: 'left', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                                <div>{task.date}</div>
                                                <div dir="ltr">{task.startTime} - {task.endTime}</div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Request Status */}
                        <div style={{ background: 'var(--surface-color)', borderRadius: '12px', padding: '1.5rem', border: '1px solid var(--border-color)' }}>
                            <h4 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Clock size={18} color="var(--primary-color)" /> סטטוס הבקשות שלי
                            </h4>
                            {personalRequests.length === 0 ? (
                                <p style={{ color: 'var(--text-muted)' }}>לא הגשת בקשות לאחרונה.</p>
                            ) : (
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                            <th style={{ padding: '0.5rem' }}>תאריך המבוקש</th>
                                            <th style={{ padding: '0.5rem' }}>סיבה</th>
                                            <th style={{ padding: '0.5rem' }}>סטטוס</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {personalRequests.map((req, idx) => (
                                            <tr key={req.id || idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                <td style={{ padding: '0.75rem' }}>{req.date}</td>
                                                <td style={{ padding: '0.75rem' }}>{req.reason}</td>
                                                <td style={{ padding: '0.75rem' }}>
                                                    {req.status === 'approved' && <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle2 size={14} /> אושר</span>}
                                                    {req.status === 'rejected' && <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}><X size={14} /> נדחה</span>}
                                                    {(!req.status || req.status === 'pending') && <span style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} /> בטיפול</span>}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Submit New Request */}
                    <div>
                        <div style={{ background: 'var(--surface-color)', borderRadius: '12px', padding: '1.5rem', border: '1px solid var(--primary-color)' }}>
                            <h4 style={{ margin: '0 0 -1rem 0', display: 'flex', alignItems: 'center', gap: '8px', zIndex: 10, position: 'relative' }}>
                                <Send size={18} color="var(--primary-color)" /> הגשת בקשה חדשה
                            </h4>
                            {/* We re-use RequestForm but pass ONLY this soldier to forces submission under their assumed ID */}
                            <RequestForm
                                soldiers={[soldier]}
                                onAddRequest={onAddRequest}
                            />
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
};

export default PersonalDashboard;
