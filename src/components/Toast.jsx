import React, { useEffect, useState } from 'react';
import './Toast.css';

/**
 * Toast — displays a temporary notification in the top-left corner.
 * Auto-dismisses after `duration` ms.
 */
const Toast = ({ toasts, onDismiss }) => {
    return (
        <div className="toast-container" aria-live="polite">
            {toasts.map(toast => (
                <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
            ))}
        </div>
    );
};

const ToastItem = ({ toast, onDismiss }) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
            setTimeout(() => onDismiss(toast.id), 300); // wait for fade-out
        }, toast.duration || 4000);
        return () => clearTimeout(timer);
    }, [toast.id, toast.duration, onDismiss]);

    return (
        <div className={`toast toast-${toast.type} ${visible ? 'toast-enter' : 'toast-exit'}`}>
            <span className="toast-icon">
                {toast.type === 'error' ? '⛔' :
                    toast.type === 'warning' ? '⚠️' :
                        toast.type === 'success' ? '✅' : 'ℹ️'}
            </span>
            <div className="toast-body">
                {toast.title && <strong className="toast-title">{toast.title}</strong>}
                <span className="toast-msg">{toast.message}</span>
            </div>
            <button className="toast-close" onClick={() => onDismiss(toast.id)}>×</button>
        </div>
    );
};

export default Toast;

/**
 * useToast — hook that manages the toast queue.
 * Returns { toasts, showToast, dismissToast }
 */
export const useToast = () => {
    const [toasts, setToasts] = useState([]);

    const showToast = ({ type = 'info', title = '', message, duration = 4000 }) => {
        const id = `toast_${Date.now()}_${Math.random()}`;
        setToasts(prev => [...prev, { id, type, title, message, duration }]);
    };

    const dismissToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return { toasts, showToast, dismissToast };
};
