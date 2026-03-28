import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import { FaHistory, FaCheckCircle, FaClock, FaPen, FaFileAlt } from 'react-icons/fa';

const StatusBadge = ({ status }) => {
    const styles = {
        pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        process: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        done: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    };
    return (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${styles[status]}`}>
            {status.toUpperCase()}
        </span>
    );
};

export default function RevisionMenu() {
    const [revisions, setRevisions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRevisions = async () => {
            try {
                const res = await api.get('/revisions');
                setRevisions(res.data);
            } catch (error) {
                console.error('Failed to fetch revisions', error);
            } finally {
                setLoading(false);
            }
        };
        fetchRevisions();
    }, []);

    if (loading) return <div className="min-h-screen bg-slate-900 pt-24 pb-12 px-4 text-center text-slate-500">Memuat riwayat revisi...</div>;

    return (
        <div className="min-h-screen bg-slate-900 pt-24 pb-12 px-4">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-black text-white flex items-center gap-3">
                        Riwayat Revisi <FaHistory className="text-purple-500" />
                    </h1>
                </div>

                {revisions.length === 0 ? (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-dark p-20 text-center rounded-[32px] border-white/5">
                        <FaPen size={48} className="mx-auto mb-4 text-slate-700" />
                        <h3 className="text-xl font-bold text-slate-500">Belum ada revisi yang diajukan</h3>
                        <p className="text-sm text-slate-600 mt-2">Permintaan revisi Anda akan muncul di sini setelah diajukan dari Dashboard.</p>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {revisions.map((rev) => (
                            <motion.div 
                                key={rev.id}
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="glass p-6 rounded-2xl border-white/5 hover:border-purple-500/20 transition-all flex items-center gap-6"
                            >
                                <div className="p-4 rounded-xl bg-purple-500/10 text-purple-400 shrink-0">
                                    <FaFileAlt size={24} />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase">Order #{rev.order_id}</span>
                                        <StatusBadge status={rev.status} />
                                    </div>
                                    <h3 className="font-bold text-white text-lg">{rev.order?.title}</h3>
                                    <p className="text-sm text-slate-400 line-clamp-1 italic">"{rev.description}"</p>
                                </div>
                                <div className="text-right hidden sm:block">
                                    <p className="text-xs text-slate-500 font-bold mb-1 uppercase tracking-tighter">Tanggal Pengajuan</p>
                                    <p className="text-sm text-white font-medium flex items-center justify-end gap-2">
                                        <FaClock size={12} className="text-slate-600" /> {new Date(rev.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
