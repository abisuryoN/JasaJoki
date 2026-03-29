import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import api from '../api';
import {
    FaFileDownload, FaClock, FaCheckCircle, FaTools,
    FaPen, FaHistory, FaPlus, FaCreditCard, FaStar,
    FaRegCommentDots, FaChevronRight, FaWhatsapp
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import OrderDetail from '../components/OrderDetail';
import FilePreviewModal from '../components/FilePreviewModal';
import { useNotification } from '../NotificationContext';
import { generateWhatsAppUrl } from '../utils/whatsapp';

export default function UserDashboard() {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        total: 0,
        per_page: 10
    });
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showRevisionModal, setShowRevisionModal] = useState(false);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [revisionReason, setRevisionReason] = useState('');
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [viewingOrder, setViewingOrder] = useState(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [previewFile, setPreviewFile] = useState({ url: '', name: '' });

    const { showToast } = useNotification();

    useEffect(() => {
        fetchOrders();
    }, [pagination.current_page]);

    const fetchOrders = async (page = 1, perPage = pagination.per_page) => {
        setLoading(true);
        try {
            const res = await api.get(`/orders?page=${page}&per_page=${perPage}`);
            setOrders(res.data.data);
            setPagination({
                current_page: res.data.current_page,
                last_page: res.data.last_page,
                total: res.data.total,
                per_page: res.data.per_page
            });
        } catch (error) {
            console.error('Failed to fetch orders', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (id) => {
        try {
            const res = await api.get(`/orders/${id}/download`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Hasil_Order_${id}.zip`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Download failed', error);
            alert('Gagal mengunduh file hasil.');
        }
    };

    const handleRevisionSubmit = async () => {
        if (!revisionReason) return;
        setSubmitting(true);
        try {
            await api.post(`/orders/${selectedOrder.id}/revision`, { reason: revisionReason });
            setShowRevisionModal(false);
            setRevisionReason('');
            fetchOrders();
        } catch (err) {
            alert(err.response?.data?.message || "Gagal mengajukan revisi.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleRatingSubmit = async () => {
        setSubmitting(true);
        try {
            await api.post(`/orders/${selectedOrder.id}/rate`, { rating, comment });
            setShowRatingModal(false);
            setRating(5);
            setComment('');
            fetchOrders();
        } catch (err) {
            alert("Gagal mengirim rating.");
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending':
                return <span className="px-3 py-1.5 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 text-[10px] font-black uppercase tracking-wider flex items-center gap-2"><FaClock size={10} /> Pending</span>;
            case 'process':
                return <span className="px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-black uppercase tracking-wider flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" /> Diproses</span>;
            case 'revision':
                return <span className="px-3 py-1.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-black uppercase tracking-wider flex items-center gap-2"><FaPen size={10} /> Revisi</span>;
            case 'done':
                return <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase tracking-wider flex items-center gap-2"><FaCheckCircle size={10} /> Selesai</span>;
            default:
                return status;
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 pt-24 pb-12 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                        <h1 className="text-4xl font-black text-white mb-2 flex items-center gap-3">
                            Dashboard <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                        </h1>
                        <p className="text-slate-400 font-medium">Selamat datang kembali, <span className="text-white">{user?.name}</span></p>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex gap-4">
                        <a 
                            href={generateWhatsAppUrl(user)} 
                            target="_blank" 
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold transition shadow-lg shadow-emerald-500/20 active:scale-95"
                        >
                            <FaWhatsapp /> Hubungi Admin
                        </a>
                        <Link to="/order/new" className="inline-flex items-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold transition shadow-lg shadow-blue-500/20 active:scale-95">
                            <FaPlus /> Buat Order Baru
                        </Link>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-3">
                        <div className="flex items-center justify-between gap-4 mb-6">
                            <div className="flex items-center gap-2 text-slate-400 font-bold text-sm uppercase tracking-widest">
                                <FaHistory /> Riwayat Order
                            </div>
                            <div className="flex items-center gap-2 bg-slate-800/50 p-1.5 rounded-2xl border border-slate-700/50">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-3">Show</span>
                                <select
                                    value={pagination.per_page}
                                    onChange={(e) => fetchOrders(1, e.target.value)}
                                    className="bg-slate-900 border border-slate-700 text-white text-xs font-bold rounded-xl px-3 py-1.5 outline-none focus:border-blue-500 transition-all cursor-pointer"
                                >
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                </select>
                            </div>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[1, 2, 3, 4].map(n => <div key={n} className="h-64 glass animate-pulse rounded-3xl" />)}
                            </div>
                        ) : orders.length === 0 ? (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-24 glass rounded-[40px] border-dashed border-2 border-slate-700/50">
                                <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <FaRegCommentDots className="text-slate-600" size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Belum ada order</h3>
                                <p className="text-slate-500 mb-8 max-w-sm mx-auto">Mulai perjalananmu dengan memesan joki tugas berkualitas pertama kamu sekarang.</p>
                                <Link to="/order/new" className="text-blue-400 font-bold hover:text-blue-300 transition flex items-center justify-center gap-2">
                                    Mulai Sekarang <FaChevronRight size={12} />
                                </Link>
                            </motion.div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {orders.map(order => (
                                        <motion.div key={order.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-dark p-8 rounded-[32px] border-slate-700/50 hover:border-blue-500/30 transition-all group relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                                <FaClock size={80} />
                                            </div>
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="space-y-1">
                                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Order ID #{order.id}</span>
                                                    <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors leading-tight">{order.title}</h3>
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    {getStatusBadge(order.status)}
                                                    <button
                                                        onClick={() => setViewingOrder(order)}
                                                        className="text-[10px] font-bold text-blue-400 hover:text-blue-300 underline transition"
                                                    >
                                                        Lihat Detail
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="text-sm text-slate-400 mb-8 line-clamp-3 leading-relaxed">{order.description}</p>
                                            <div className="flex flex-wrap gap-3 mb-8">
                                                <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800/50 flex-1 min-w-[120px]">
                                                    <span className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Revisi</span>
                                                    <span className="text-sm font-bold text-white">{order.revisions_left} Sisa</span>
                                                </div>
                                                <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex-1 min-w-[120px] flex flex-col justify-between">
                                                    <div>
                                                        <span className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Bayar</span>
                                                        <span className="text-sm font-bold text-blue-400">{order.payment_proof ? '✓ Lunas' : 'Menunggu'}</span>
                                                    </div>
                                                    {order.payment_proof && (
                                                        <button
                                                            onClick={() => {
                                                                setPreviewFile({
                                                                    url: `/orders/${order.id}/payment-proof`,
                                                                    name: `Bukti Bayar Order #${order.id}`
                                                                });
                                                                setIsPreviewOpen(true);
                                                            }}
                                                            className="text-[9px] font-bold text-blue-500 hover:text-blue-300 transition mt-2 text-left underline"
                                                        >
                                                            Lihat Bukti
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex flex-col sm:flex-row gap-3 relative z-10">
                                                {order.result_path && (
                                                    <button onClick={() => handleDownload(order.id)} className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-bold rounded-xl transition shadow-lg shadow-emerald-500/20 active:scale-95">
                                                        <FaFileDownload /> Hasil
                                                    </button>
                                                )}
                                                {!order.payment_proof && order.status !== 'done' && (
                                                    <Link to={`/order/${order.id}/pay`} className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold rounded-xl transition border border-slate-700 active:scale-95">
                                                        <FaCreditCard size={14} /> Bayar
                                                    </Link>
                                                )}
                                                {order.status === 'done' && order.revisions_left > 0 && !order.rating && (
                                                    <button onClick={() => { setSelectedOrder(order); setShowRevisionModal(true); }} className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold rounded-xl transition">
                                                        <FaPen size={12} /> Revisi
                                                    </button>
                                                )}
                                                {order.status === 'done' && !order.rating && (
                                                    <button onClick={() => { setSelectedOrder(order); setShowRatingModal(true); }} className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition shadow-lg shadow-blue-500/20">
                                                        <FaStar size={14} /> Selesaikan
                                                    </button>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                {pagination.last_page > 1 && (
                                    <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-6 px-8 py-6 glass rounded-[32px] border-white/5">
                                        <div className="text-slate-500 text-sm font-bold">
                                            Showing <span className="text-white">{(pagination.current_page - 1) * pagination.per_page + 1}</span> – <span className="text-white">{Math.min(pagination.current_page * pagination.per_page, pagination.total)}</span> of <span className="text-white">{pagination.total}</span> orders
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                disabled={pagination.current_page === 1 || loading}
                                                onClick={() => fetchOrders(pagination.current_page - 1)}
                                                className="px-6 py-2.5 rounded-xl bg-slate-800 text-white font-bold text-xs disabled:opacity-30 hover:bg-slate-700 transition active:scale-95 border border-slate-700"
                                            >
                                                Prev
                                            </button>
                                            <div className="flex items-center gap-1">
                                                {[...Array(pagination.last_page)].map((_, i) => (
                                                    <button
                                                        key={i + 1}
                                                        onClick={() => fetchOrders(i + 1)}
                                                        className={`w-10 h-10 rounded-xl text-xs font-black transition ${pagination.current_page === i + 1
                                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                                            : 'bg-slate-800 text-slate-400 hover:text-white'
                                                            }`}
                                                    >
                                                        {i + 1}
                                                    </button>
                                                ))}
                                            </div>
                                            <button
                                                disabled={pagination.current_page === pagination.last_page || loading}
                                                onClick={() => fetchOrders(pagination.current_page + 1)}
                                                className="px-6 py-2.5 rounded-xl bg-slate-800 text-white font-bold text-xs disabled:opacity-30 hover:bg-slate-700 transition active:scale-95 border border-slate-700"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Revision Modal */}
            <AnimatePresence>
                {showRevisionModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowRevisionModal(false)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass p-8 w-full max-w-lg rounded-[32px] relative z-20 border-blue-500/20">
                            <h2 className="text-2xl font-black text-white mb-2">Ajukan Revisi</h2>
                            <p className="text-slate-400 text-sm mb-6">Jelaskan bagian mana yang perlu diperbaiki.</p>
                            <textarea rows="5" value={revisionReason} onChange={(e) => setRevisionReason(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-4 text-white focus:ring-2 focus:ring-blue-500 outline-none mb-6" placeholder="Detail revisi..." />
                            <div className="flex gap-4">
                                <button onClick={() => setShowRevisionModal(false)} className="flex-1 py-4 text-slate-400 font-bold hover:text-white transition">Batal</button>
                                <button onClick={handleRevisionSubmit} disabled={submitting || !revisionReason} className="flex-[2] py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition disabled:opacity-50">{submitting ? 'Mengirim...' : 'Kirim Revisi'}</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Rating Modal */}
            <AnimatePresence>
                {showRatingModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowRatingModal(false)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass p-8 w-full max-w-lg rounded-[32px] relative z-20 border-blue-500/20">
                            <h2 className="text-2xl font-black text-white mb-2">Beri Penilaian</h2>
                            <p className="text-slate-400 text-sm mb-6">Terima kasih telah menggunakan jasa kami!</p>
                            <div className="flex justify-center gap-3 mb-8">
                                {[1, 2, 3, 4, 5].map(s => (
                                    <button key={s} onClick={() => setRating(s)} className="p-2 transition-transform hover:scale-110">
                                        <FaStar size={36} className={s <= rating ? 'text-yellow-400 drop-shadow-lg' : 'text-slate-700'} />
                                    </button>
                                ))}
                            </div>
                            <textarea rows="3" value={comment} onChange={(e) => setComment(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-4 text-white focus:ring-2 focus:ring-blue-500 outline-none mb-6" placeholder="Tulis komentar (opsional)..." />
                            <div className="flex gap-4">
                                <button onClick={() => setShowRatingModal(false)} className="flex-1 py-4 text-slate-400 font-bold hover:text-white transition">Batal</button>
                                <button onClick={handleRatingSubmit} disabled={submitting} className="flex-[2] py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition disabled:opacity-50">{submitting ? 'Mengirim...' : 'Kirim & Selesaikan'}</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {viewingOrder && (
                    <OrderDetail
                        order={viewingOrder}
                        onClose={() => setViewingOrder(null)}
                    />
                )}
            </AnimatePresence>

            <FilePreviewModal
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                fileUrl={previewFile.url}
                fileName={previewFile.name}
            />
        </div>
    );
}