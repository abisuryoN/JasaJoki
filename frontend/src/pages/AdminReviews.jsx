import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaTimesCircle, FaStar, FaQuoteLeft, FaTrash } from 'react-icons/fa';
import api from '../api';

export default function AdminReviews() {
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending'); // pending, approved, rejected

    useEffect(() => {
        fetchReviews();
    }, [filter]);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/reviews?status=' + filter);
            if (res.data?.success) {
                setReviews(res.data.data);
            }
            // Fetch stats separately or process from all if provided
            const resStats = await api.get('/admin/reviews?status=all');
            if (resStats.data?.success) {
                const all = resStats.data.data;
                setStats({
                    pending: all.filter(r => r.status === 'pending').length,
                    approved: all.filter(r => r.status === 'approved').length,
                    rejected: all.filter(r => r.status === 'rejected').length,
                });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await api.put(`/admin/reviews/${id}/status`, { status });
            fetchReviews();
        } catch (err) {
            alert('Gagal mengupdate status');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Yakin ingin menghapus ulasan ini secara permanen?')) return;
        try {
            await api.delete(`/admin/reviews/${id}`);
            fetchReviews();
        } catch (err) {
            alert('Gagal menghapus ulasan');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-black text-white">Moderasi Ulasan</h1>
            </div>

            {/* Stats / Filter Tabs */}
            <div className="flex gap-4 mb-8 border-b border-white/10 pb-4">
                <button 
                    onClick={() => setFilter('pending')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition ${filter === 'pending' ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/50' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                >
                    Menunggu Konfirmasi <span className="bg-yellow-500 text-slate-900 px-2 py-0.5 rounded-full text-xs">{stats.pending}</span>
                </button>
                <button 
                    onClick={() => setFilter('approved')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition ${filter === 'approved' ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/50' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                >
                    Ditampilkan (Approved) <span className="bg-emerald-500 text-slate-900 px-2 py-0.5 rounded-full text-xs">{stats.approved}</span>
                </button>
                <button 
                    onClick={() => setFilter('rejected')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition ${filter === 'rejected' ? 'bg-red-500/20 text-red-500 border border-red-500/50' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                >
                    Ditolak (Rejected) <span className="bg-red-500 text-slate-900 px-2 py-0.5 rounded-full text-xs">{stats.rejected}</span>
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="text-center py-10 text-slate-400">Memuat ulasan...</div>
                ) : reviews.length === 0 ? (
                    <div className="text-center py-16 glass-morphism rounded-3xl border border-white/5">
                        <div className="text-4xl mb-4">📭</div>
                        <h3 className="text-xl font-bold text-white mb-2">Tidak ada ulasan</h3>
                        <p className="text-slate-400">Belum ada ulasan di kategori ini.</p>
                    </div>
                ) : (
                    reviews.map((t) => (
                        <motion.div 
                            key={t.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-morphism p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center"
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-4 mb-2">
                                    <h4 className="font-bold text-white text-lg">{t.name || t.user?.name || 'Anonymous'}</h4>
                                    <div className="flex text-yellow-400 text-sm">
                                        {[...Array(5)].map((_, i) => (
                                            <FaStar key={i} className={i < t.rating ? "text-yellow-400" : "text-slate-700"} />
                                        ))}
                                    </div>
                                    <span className="text-xs text-slate-500">{new Date(t.created_at).toLocaleString()}</span>
                                </div>
                                <p className="text-slate-300 italic flex gap-2 items-start">
                                    <FaQuoteLeft className="text-slate-600 shrink-0 mt-1" size={12} />
                                    {t.comment}
                                </p>
                            </div>

                            <div className="flex items-center gap-2 w-full md:w-auto shrink-0 border-t md:border-t-0 border-white/10 pt-4 md:pt-0">
                                {filter === 'pending' && (
                                    <>
                                        <button onClick={() => updateStatus(t.id, 'approved')} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-lg font-bold transition">
                                            <FaCheckCircle /> Terima
                                        </button>
                                        <button onClick={() => updateStatus(t.id, 'rejected')} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg font-bold transition">
                                            <FaTimesCircle /> Tolak
                                        </button>
                                    </>
                                )}
                                {filter === 'approved' && (
                                    <button onClick={() => updateStatus(t.id, 'rejected')} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg font-bold transition">
                                        <FaTimesCircle /> Sembunyikan
                                    </button>
                                )}
                                {filter === 'rejected' && (
                                    <>
                                        <button onClick={() => updateStatus(t.id, 'approved')} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-lg font-bold transition">
                                            <FaCheckCircle /> Tampilkan
                                        </button>
                                        <button onClick={() => handleDelete(t.id)} className="px-4 py-2 bg-slate-800 text-slate-400 hover:bg-red-600 hover:text-white rounded-lg transition">
                                            <FaTrash />
                                        </button>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}
