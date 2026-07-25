import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        // Fallback safety if used outside provider
        return {
            showToast: (msg, type) => console.log(`[Toast ${type}]: ${msg}`),
            success: (msg) => console.log(`[Success]: ${msg}`),
            error: (msg) => console.error(`[Error]: ${msg}`),
            info: (msg) => console.log(`[Info]: ${msg}`),
            warning: (msg) => console.warn(`[Warning]: ${msg}`),
            confirm: ({ message, onConfirm }) => { if (window.confirm(message)) onConfirm(); }
        };
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    const [confirmModal, setConfirmModal] = useState(null);

    const addToast = useCallback((message, type = 'info', duration = 4000) => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, type }]);

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const success = useCallback((msg) => addToast(msg, 'success'), [addToast]);
    const error   = useCallback((msg) => addToast(msg, 'error', 5000), [addToast]);
    const info    = useCallback((msg) => addToast(msg, 'info'), [addToast]);
    const warning = useCallback((msg) => addToast(msg, 'warning'), [addToast]);

    const confirm = useCallback(({ title = 'Confirmation', message, onConfirm, onCancel }) => {
        setConfirmModal({
            title,
            message,
            onConfirm: () => {
                setConfirmModal(null);
                if (onConfirm) onConfirm();
            },
            onCancel: () => {
                setConfirmModal(null);
                if (onCancel) onCancel();
            }
        });
    }, []);

    return (
        <ToastContext.Provider value={{ showToast: addToast, success, error, info, warning, confirm }}>
            {children}

            {/* ── Toast Container (Top Right) ── */}
            <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-xl border backdrop-blur-md transition-all animate-slide-in-right ${
                            toast.type === 'success' ? 'bg-emerald-900/90 border-emerald-500/50 text-emerald-100 shadow-emerald-950/40' :
                            toast.type === 'error'   ? 'bg-rose-900/90 border-rose-500/50 text-rose-100 shadow-rose-950/40' :
                            toast.type === 'warning' ? 'bg-amber-900/90 border-amber-500/50 text-amber-100 shadow-amber-950/40' :
                            'bg-indigo-900/90 border-indigo-500/50 text-indigo-100 shadow-indigo-950/40'
                        }`}
                    >
                        <div className="mt-0.5 shrink-0">
                            {toast.type === 'success' && <CheckCircle2 size={20} className="text-emerald-400" />}
                            {toast.type === 'error'   && <AlertCircle size={20} className="text-rose-400" />}
                            {toast.type === 'warning' && <AlertTriangle size={20} className="text-amber-400" />}
                            {toast.type === 'info'    && <Info size={20} className="text-indigo-400" />}
                        </div>
                        <div className="flex-1 text-xs font-semibold leading-relaxed">
                            {toast.message}
                        </div>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="text-white/60 hover:text-white transition-colors p-0.5 rounded-lg hover:bg-white/10"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ))}
            </div>

            {/* ── Confirm Modal ── */}
            {confirmModal && (
                <div className="fixed inset-0 z-[10000] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-zoom-in">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20">
                                <AlertTriangle size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-white">{confirmModal.title}</h3>
                                <p className="text-xs text-slate-400 font-medium">Please confirm your action</p>
                            </div>
                        </div>
                        <p className="text-sm text-slate-300 font-medium leading-relaxed">
                            {confirmModal.message}
                        </p>
                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                onClick={confirmModal.onCancel}
                                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmModal.onConfirm}
                                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black shadow-lg shadow-red-900/30 transition-all hover:scale-105"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ToastContext.Provider>
    );
};
