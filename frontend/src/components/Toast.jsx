import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';

const Toast = ({ message, type = 'info', onClose, duration = 5000 }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, duration);
        return () => clearTimeout(timer);
    }, [onClose, duration]);

    const icons = {
        success: <FaCheckCircle className="text-emerald-400" />,
        error: <FaExclamationCircle className="text-red-400" />,
        info: <FaInfoCircle className="text-blue-400" />,
    };

    const colors = {
        success: 'border-emerald-500/20 bg-emerald-500/10',
        error: 'border-red-500/20 bg-red-500/10',
        info: 'border-blue-500/20 bg-blue-500/10',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={`glass p-4 rounded-2xl border ${colors[type]} shadow-2xl flex items-center gap-4 min-w-[300px] pointer-events-auto`}
        >
            <div className="text-xl">{icons[type]}</div>
            <div className="flex-1">
                <p className="text-sm font-bold text-white leading-tight">{message}</p>
            </div>
            <button onClick={onClose} className="text-slate-500 hover:text-white transition">
                <FaTimes size={14} />
            </button>
        </motion.div>
    );
};

export default function ToastContainer({ toasts, removeToast }) {
    return (
        <div className="fixed bottom-8 right-8 z-[9999] flex flex-col gap-3 pointer-events-none">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <Toast
                        key={toast.id}
                        {...toast}
                        onClose={() => removeToast(toast.id)}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
}
