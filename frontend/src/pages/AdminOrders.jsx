import React, { useState, useEffect } from 'react';
import api from '../api';
import {
    FaEdit, FaUpload, FaCheck, FaTimes, FaExternalLinkAlt,
    FaEye, FaFileInvoiceDollar, FaExclamationTriangle, FaCheckCircle,
    FaSyncAlt, FaChevronLeft, FaChevronRight, FaMoneyBillWave,
    FaImages, FaCloudUploadAlt, FaTrash, FaTag, FaReceipt,
    FaTimesCircle, FaClock
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import OrderDetail from '../components/OrderDetail';
import FilePreviewModal from '../components/FilePreviewModal';

const STATUS_OPTIONS = [
    { value: 'pending', label: 'PENDING', color: 'orange' },
    { value: 'contacted', label: 'CONTACTED', color: 'cyan' },
    { value: 'deal', label: 'DEAL', color: 'indigo' },
    { value: 'progress', label: 'PROGRESS', color: 'blue' },
    { value: 'waiting_payment', label: 'WAITING PAYMENT', color: 'amber' },
    { value: 'revision', label: 'REVISION', color: 'purple' },
    { value: 'done', label: 'DONE', color: 'emerald' },
];

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        total: 0,
        per_page: 10
    });
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ status: '' });
    const [uploadingId, setUploadingId] = useState(null);
    const [viewingOrder, setViewingOrder] = useState(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [previewFile, setPreviewFile] = useState({ url: '', name: '' });

    // Price modal
    const [showPriceModal, setShowPriceModal] = useState(false);
    const [priceOrder, setPriceOrder] = useState(null);
    const [priceForm, setPriceForm] = useState({ price: '', price_note: '' });
    const [settingPrice, setSettingPrice] = useState(false);

    // Payment management modal
    const [showPaymentsModal, setShowPaymentsModal] = useState(false);
    const [paymentsOrder, setPaymentsOrder] = useState(null);
    const [payments, setPayments] = useState([]);
    const [processingPaymentId, setProcessingPaymentId] = useState(null);

    // Progress upload modal
    const [showProgressModal, setShowProgressModal] = useState(false);
    const [progressOrder, setProgressOrder] = useState(null);
    const [progressList, setProgressList] = useState([]);
    const [progressForm, setProgressForm] = useState({ image: null, description: '' });
    const [uploadingProgress, setUploadingProgress] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, [pagination.current_page]);

    const fetchOrders = async (page = 1, perPage = pagination.per_page) => {
        setLoading(true);
        try {
            const res = await api.get(`/orders?page=${page}&per_page=${perPage}`);
            setOrders(res.data.data || []);
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

    const handleEditClick = (order) => {
        setEditingId(order.id);
        setEditForm({ status: order.status });
    };

    const handleSaveEdit = async (id) => {
        try {
            await api.post(`/orders/${id}/status`, editForm);
            setEditingId(null);
            fetchOrders();
        } catch (error) {
            console.error('Failed to update order', error);
            alert('Gagal mengupdate order.');
        }
    };

    const handleFileUpload = async (e, id) => {
        e.preventDefault();
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingId(id);
        const formData = new FormData();
        formData.append('file', file);

        try {
            await api.post(`/orders/${id}/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            fetchOrders();
            alert('File hasil berhasil diupload!');
        } catch (error) {
            console.error('Upload failed', error);
            alert('Gagal mengupload file hasil.');
        } finally {
            setUploadingId(null);
        }
    };

    // ── Price Management ──
    const openPriceModal = (order) => {
        setPriceOrder(order);
        setPriceForm({ price: order.price || '', price_note: order.price_note || '' });
        setShowPriceModal(true);
    };

    const handleSetPrice = async () => {
        if (!priceForm.price) return;
        setSettingPrice(true);
        try {
            await api.post(`/orders/${priceOrder.id}/set-price`, priceForm);
            setShowPriceModal(false);
            fetchOrders();
        } catch (err) {
            alert(err.response?.data?.error || 'Gagal set harga');
        } finally {
            setSettingPrice(false);
        }
    };

    // ── Payments Management ──
    const openPaymentsModal = async (order) => {
        setPaymentsOrder(order);
        setShowPaymentsModal(true);
        try {
            const res = await api.get(`/orders/${order.id}/payments`);
            setPayments(res.data);
        } catch (e) {
            console.error('Failed to fetch payments', e);
        }
    };

    const handlePaymentAction = async (paymentId, status, adminNote = '') => {
        setProcessingPaymentId(paymentId);
        try {
            await api.put(`/orders/${paymentsOrder.id}/payments/${paymentId}/status`, {
                status,
                admin_note: adminNote,
            });
            // Refresh payments
            const res = await api.get(`/orders/${paymentsOrder.id}/payments`);
            setPayments(res.data);
            fetchOrders();
        } catch (err) {
            alert(err.response?.data?.error || 'Gagal update pembayaran');
        } finally {
            setProcessingPaymentId(null);
        }
    };

    // ── Progress Management ──
    const openProgressModal = async (order) => {
        setProgressOrder(order);
        setShowProgressModal(true);
        setProgressForm({ image: null, description: '' });
        try {
            const res = await api.get(`/orders/${order.id}/progress`);
            setProgressList(res.data);
        } catch (e) {
            console.error('Failed to fetch progress', e);
        }
    };

    const handleUploadProgress = async () => {
        if (!progressForm.image) return;
        setUploadingProgress(true);
        try {
            const formData = new FormData();
            formData.append('image', progressForm.image);
            if (progressForm.description) formData.append('description', progressForm.description);
            await api.post(`/orders/${progressOrder.id}/progress`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setProgressForm({ image: null, description: '' });
            const res = await api.get(`/orders/${progressOrder.id}/progress`);
            setProgressList(res.data);
        } catch (err) {
            alert(err.response?.data?.error || 'Gagal upload progress');
        } finally {
            setUploadingProgress(false);
        }
    };

    const handleDeleteProgress = async (progressId) => {
        if (!confirm('Hapus progress ini?')) return;
        try {
            await api.delete(`/orders/${progressOrder.id}/progress/${progressId}`);
            const res = await api.get(`/orders/${progressOrder.id}/progress`);
            setProgressList(res.data);
        } catch (err) {
            alert('Gagal menghapus progress');
        }
    };

    const formatCurrency = (value) => {
        if (!value && value !== 0) return '-';
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(value);
    };

    const getStatusStyle = (status) => {
        const map = {
            pending: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
            contacted: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
            deal: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
            progress: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
            waiting_payment: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
            revision: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
            done: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        };
        return map[status] || 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    };

    const getPaymentStatusLabel = (status) => {
        const map = {
            unpaid: { label: 'BELUM BAYAR', color: 'text-orange-400' },
            dp_paid: { label: 'DP TERBAYAR', color: 'text-blue-400' },
            partially_paid: { label: 'CICILAN', color: 'text-cyan-400' },
            paid: { label: 'LUNAS', color: 'text-emerald-400' },
        };
        const item = map[status] || map.unpaid;
        return <span className={`text-[9px] font-black uppercase tracking-widest ${item.color}`}>{item.label}</span>;
    };

    if (loading && orders.length === 0) return <div className="p-8 text-slate-400 flex items-center gap-2"><div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /> Loading orders...</div>;

    return (
        <div className="pb-10 space-y-8">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-6">
                    <h1 className="text-4xl font-black text-white tracking-tight">Manajemen Order</h1>
                    <div className="flex items-center gap-2 bg-slate-800/50 p-1.5 rounded-2xl border border-slate-700/50">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-3">Show</span>
                        <select
                            value={pagination.per_page}
                            onChange={(e) => fetchOrders(1, e.target.value)}
                            className="bg-slate-900 border border-slate-700 text-white text-xs font-bold rounded-xl px-3 py-1.5 outline-none focus:border-blue-500 transition-all"
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                        </select>
                    </div>
                </div>
                <button onClick={() => fetchOrders(pagination.current_page)} className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all active:rotate-180 duration-500">
                    <FaSyncAlt />
                </button>
            </div>

            <div className="glass rounded-[32px] border-slate-700/50 overflow-hidden bg-slate-900/40">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-max">
                        <thead>
                            <tr className="border-b border-slate-800/50 bg-slate-950/30">
                                <th className="py-5 px-6 text-[11px] font-black text-slate-500 uppercase tracking-widest">Info Order</th>
                                <th className="py-5 px-6 text-[11px] font-black text-slate-500 uppercase tracking-widest">Klien & Harga</th>
                                <th className="py-5 px-6 text-[11px] font-black text-slate-500 uppercase tracking-widest text-center">Status</th>
                                <th className="py-5 px-6 text-[11px] font-black text-slate-500 uppercase tracking-widest">Pembayaran</th>
                                <th className="py-5 px-6 text-[11px] font-black text-slate-500 uppercase tracking-widest text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/30">
                            {orders.map(order => (
                                <tr key={order.id} className="hover:bg-blue-500/[0.02] transition-colors group">
                                    <td className="py-6 px-6">
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-bold text-slate-600 block">ID #{order.id}</span>
                                            <div className="font-bold text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight">{order.title}</div>
                                            {order.technology && (
                                                <span className="text-[10px] text-slate-500 font-bold">{order.technology}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-6 px-6">
                                        <div className="space-y-3">
                                            <div>
                                                <div className="text-sm font-bold text-slate-300">{order.user?.name || order.guest_name || 'Guest'}</div>
                                                <div className="text-[10px] text-slate-500">{order.user?.email || 'No Email'}</div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <FaTag size={10} className="text-slate-600" />
                                                {order.price ? (
                                                    <span className="text-xs font-black text-emerald-400">{formatCurrency(order.price)}</span>
                                                ) : (
                                                    <button 
                                                        onClick={() => openPriceModal(order)}
                                                        className="text-[10px] font-bold text-amber-400 hover:text-amber-300 underline transition"
                                                    >
                                                        Set Harga
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-6 px-6">
                                        <div className="flex flex-col items-center gap-2">
                                            {editingId === order.id ? (
                                                <select
                                                    value={editForm.status}
                                                    onChange={(e) => setEditForm({ status: e.target.value })}
                                                    className="bg-slate-950 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                                                >
                                                    {STATUS_OPTIONS.map(opt => (
                                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <span className={`px-4 py-2 rounded-xl text-[10px] font-black border tracking-widest transition-all ${getStatusStyle(order.status)}`}>
                                                    {order.status?.toUpperCase().replace('_', ' ')}
                                                </span>
                                            )}
                                            {getPaymentStatusLabel(order.payment_status)}
                                        </div>
                                    </td>
                                    <td className="py-6 px-6">
                                        <div className="space-y-2">
                                            {/* Payment overview */}
                                            {order.price ? (
                                                <div className="space-y-2">
                                                    <div className="w-full bg-slate-800/50 rounded-full h-1.5 overflow-hidden max-w-[140px]">
                                                        <div 
                                                            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                                                            style={{ width: `${Math.min(100, ((order.total_paid || 0) / order.price) * 100)}%` }}
                                                        />
                                                    </div>
                                                    <div className="text-[10px] font-bold text-slate-500">
                                                        {formatCurrency(order.total_paid || 0)} / {formatCurrency(order.price)}
                                                    </div>
                                                    <button 
                                                        onClick={() => openPaymentsModal(order)}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-lg text-[10px] font-bold transition-all"
                                                    >
                                                        <FaReceipt size={10} /> Detail Bayar
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="text-[10px] font-bold text-slate-600 flex items-center gap-1.5">
                                                    <FaExclamationTriangle size={10} /> Belum ada harga
                                                </div>
                                            )}

                                            {/* Upload result */}
                                            <div className="relative group/upload">
                                                <input
                                                    type="file"
                                                    onChange={(e) => handleFileUpload(e, order.id)}
                                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                                />
                                                <div className={`p-2.5 border border-dashed rounded-xl flex items-center justify-center gap-1.5 transition-all text-[10px] ${order.result_path ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-slate-900/50 border-slate-800 group-hover/upload:border-blue-500/50'}`}>
                                                    {uploadingId === order.id ? (
                                                        <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                                    ) : (
                                                        <>
                                                            <FaUpload className={order.result_path ? 'text-emerald-500' : 'text-slate-600'} size={10} />
                                                            <span className="font-bold text-slate-500">{order.result_path ? 'GANTI FILE' : 'UPLOAD HASIL'}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-6 px-6 text-right">
                                        <div className="flex flex-col items-end gap-2">
                                            {editingId === order.id ? (
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleSaveEdit(order.id)} className="w-10 h-10 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded-xl flex items-center justify-center transition-all"><FaCheck /></button>
                                                    <button onClick={() => setEditingId(null)} className="w-10 h-10 bg-slate-800 text-slate-400 hover:bg-slate-700 rounded-xl flex items-center justify-center transition-all"><FaTimes /></button>
                                                </div>
                                            ) : (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => setViewingOrder(order)}
                                                        className="w-9 h-9 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl flex items-center justify-center transition-all"
                                                        title="View Details"
                                                    >
                                                        <FaEye size={12} />
                                                    </button>
                                                    <button 
                                                        onClick={() => openPriceModal(order)}
                                                        className="w-9 h-9 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center transition-all"
                                                        title="Set Harga"
                                                    >
                                                        <FaMoneyBillWave size={12} />
                                                    </button>
                                                    <button 
                                                        onClick={() => openProgressModal(order)}
                                                        className="w-9 h-9 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center transition-all"
                                                        title="Upload Progress"
                                                    >
                                                        <FaImages size={12} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleEditClick(order)} 
                                                        className="px-4 py-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5"
                                                    >
                                                        <FaEdit size={11} /> Status
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {pagination.last_page > 1 && (
                <div className="flex items-center justify-between px-8 py-6 glass rounded-[32px] border-white/5">
                    <div className="text-slate-500 text-xs font-bold uppercase tracking-widest">
                        Showing <span className="text-white">{(pagination.current_page - 1) * pagination.per_page + 1}</span> – <span className="text-white">{Math.min(pagination.current_page * pagination.per_page, pagination.total)}</span> of <span className="text-white">{pagination.total}</span> orders
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            disabled={pagination.current_page === 1 || loading}
                            onClick={() => fetchOrders(pagination.current_page - 1)}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800 text-white disabled:opacity-30 hover:bg-slate-700 transition active:scale-95 border border-slate-700"
                        >
                            <FaChevronLeft size={10} />
                        </button>
                        <div className="flex items-center gap-1 mx-2">
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
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800 text-white disabled:opacity-30 hover:bg-slate-700 transition active:scale-95 border border-slate-700"
                        >
                            <FaChevronRight size={10} />
                        </button>
                    </div>
                </div>
            )}

            {/* ═══════════════ SET PRICE MODAL ═══════════════ */}
            <AnimatePresence>
                {showPriceModal && priceOrder && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPriceModal(false)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-dark p-8 w-full max-w-lg rounded-[32px] relative z-20 border border-white/10 space-y-6">
                            <div>
                                <h2 className="text-2xl font-black text-white flex items-center gap-3">
                                    <FaMoneyBillWave className="text-emerald-400" /> Set Harga
                                </h2>
                                <p className="text-slate-400 text-sm mt-1">Order #{priceOrder.id} — {priceOrder.title}</p>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Harga (Rp)</label>
                                    <input
                                        type="number"
                                        value={priceForm.price}
                                        onChange={(e) => setPriceForm({ ...priceForm, price: e.target.value })}
                                        placeholder="contoh: 750000"
                                        className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-4 text-white text-lg font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition"
                                    />
                                    {priceForm.price > 500000 && (
                                        <p className="text-[11px] text-blue-400 mt-2 font-bold">💡 Harga &gt; 500k → User wajib DP minimal 50% dulu</p>
                                    )}
                                    {priceForm.price && priceForm.price <= 500000 && (
                                        <p className="text-[11px] text-emerald-400 mt-2 font-bold">⚡ Harga ≤ 500k → User bayar langsung penuh</p>
                                    )}
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Catatan / Alasan Harga</label>
                                    <textarea
                                        rows="3"
                                        value={priceForm.price_note}
                                        onChange={(e) => setPriceForm({ ...priceForm, price_note: e.target.value })}
                                        placeholder="Contoh: Termasuk hosting 1 tahun dan domain .com"
                                        className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-4 text-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
                                    />
                                </div>
                            </div>
                            <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                                <p className="text-[11px] text-amber-400 font-bold">⚠️ Setelah set harga, status order akan otomatis berubah ke WAITING PAYMENT</p>
                            </div>
                            <div className="flex gap-4">
                                <button onClick={() => setShowPriceModal(false)} className="flex-1 py-4 text-slate-400 font-bold hover:text-white transition rounded-xl">Batal</button>
                                <button 
                                    onClick={handleSetPrice} 
                                    disabled={settingPrice || !priceForm.price}
                                    className="flex-[2] py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition disabled:opacity-50 active:scale-95"
                                >
                                    {settingPrice ? 'Menyimpan...' : 'Simpan Harga'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ═══════════════ PAYMENTS MANAGEMENT MODAL ═══════════════ */}
            <AnimatePresence>
                {showPaymentsModal && paymentsOrder && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPaymentsModal(false)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-dark p-8 w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-[32px] relative z-20 border border-white/10 space-y-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-2xl font-black text-white flex items-center gap-3">
                                        <FaReceipt className="text-blue-400" /> Pembayaran
                                    </h2>
                                    <p className="text-slate-400 text-sm mt-1">Order #{paymentsOrder.id} — {formatCurrency(paymentsOrder.price)}</p>
                                </div>
                                <button onClick={() => setShowPaymentsModal(false)} className="p-2 text-slate-400 hover:text-white transition">
                                    <FaTimes />
                                </button>
                            </div>

                            {/* Payment Summary */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
                                    <span className="text-[10px] text-slate-500 font-bold block">Total</span>
                                    <span className="text-sm font-black text-white">{formatCurrency(paymentsOrder.price)}</span>
                                </div>
                                <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-center">
                                    <span className="text-[10px] text-slate-500 font-bold block">Terbayar</span>
                                    <span className="text-sm font-black text-emerald-400">{formatCurrency(paymentsOrder.total_paid || 0)}</span>
                                </div>
                                <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/10 text-center">
                                    <span className="text-[10px] text-slate-500 font-bold block">Sisa</span>
                                    <span className="text-sm font-black text-red-400">{formatCurrency(paymentsOrder.remaining_amount)}</span>
                                </div>
                            </div>

                            {/* Payments List */}
                            {payments.length > 0 ? (
                                <div className="space-y-3">
                                    {payments.map(p => (
                                        <div key={p.id} className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black border tracking-widest ${
                                                        p.type === 'dp' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                        p.type === 'cicilan' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                        'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                    }`}>
                                                        {p.type?.toUpperCase()}
                                                    </span>
                                                    <span className="text-lg font-black text-white">{formatCurrency(p.amount)}</span>
                                                </div>
                                                <span className={`flex items-center gap-1.5 text-[10px] font-black uppercase ${
                                                    p.status === 'approved' ? 'text-emerald-400' :
                                                    p.status === 'rejected' ? 'text-red-400' :
                                                    'text-amber-400'
                                                }`}>
                                                    {p.status === 'approved' && <FaCheckCircle size={10} />}
                                                    {p.status === 'rejected' && <FaTimesCircle size={10} />}
                                                    {p.status === 'pending' && <FaClock size={10} />}
                                                    {p.status}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold">
                                                <span>{new Date(p.created_at).toLocaleString('id-ID')}</span>
                                                {p.proof_image && (
                                                    <button 
                                                        onClick={() => {
                                                            setPreviewFile({
                                                                url: `/orders/${paymentsOrder.id}/payments/${p.id}/proof`,
                                                                name: `Bukti ${p.type?.toUpperCase()} - ${formatCurrency(p.amount)}`
                                                            });
                                                            setIsPreviewOpen(true);
                                                        }}
                                                        className="text-blue-400 hover:text-blue-300 underline transition"
                                                    >
                                                        Lihat Bukti
                                                    </button>
                                                )}
                                            </div>
                                            {p.admin_note && (
                                                <p className="text-[11px] text-slate-400 italic bg-black/20 p-2 rounded-lg">Admin: "{p.admin_note}"</p>
                                            )}
                                            {p.status === 'pending' && (
                                                <div className="flex gap-2 pt-2">
                                                    <button
                                                        onClick={() => handlePaymentAction(p.id, 'approved')}
                                                        disabled={processingPaymentId === p.id}
                                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
                                                    >
                                                        <FaCheck size={10} /> Approve
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            const note = prompt('Alasan reject (opsional):');
                                                            handlePaymentAction(p.id, 'rejected', note || '');
                                                        }}
                                                        disabled={processingPaymentId === p.id}
                                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-xl text-xs font-bold transition disabled:opacity-50 border border-red-500/20"
                                                    >
                                                        <FaTimes size={10} /> Reject
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-center text-slate-500 font-bold">
                                    Belum ada pembayaran masuk
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ═══════════════ PROGRESS UPLOAD MODAL ═══════════════ */}
            <AnimatePresence>
                {showProgressModal && progressOrder && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowProgressModal(false)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-dark p-8 w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-[32px] relative z-20 border border-white/10 space-y-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-2xl font-black text-white flex items-center gap-3">
                                        <FaImages className="text-blue-400" /> Progress Project
                                    </h2>
                                    <p className="text-slate-400 text-sm mt-1">Order #{progressOrder.id} — {progressOrder.title}</p>
                                </div>
                                <button onClick={() => setShowProgressModal(false)} className="p-2 text-slate-400 hover:text-white transition">
                                    <FaTimes />
                                </button>
                            </div>

                            {/* Upload Form */}
                            <div className="p-5 rounded-2xl bg-slate-900/50 border border-white/5 space-y-4">
                                <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Upload Progress Baru</h4>
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                                        onChange={(e) => setProgressForm({ ...progressForm, image: e.target.files?.[0] })}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                    />
                                    <div className={`p-4 border-2 border-dashed rounded-2xl flex items-center justify-center gap-3 transition-all ${
                                        progressForm.image ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-slate-900/50 border-slate-700 hover:border-blue-500/50'
                                    }`}>
                                        <FaCloudUploadAlt className={progressForm.image ? 'text-emerald-400' : 'text-slate-600'} size={18} />
                                        <span className="text-xs font-bold text-slate-400">
                                            {progressForm.image ? `✓ ${progressForm.image.name}` : 'Klik untuk upload screenshot'}
                                        </span>
                                    </div>
                                </div>
                                <textarea
                                    rows="2"
                                    value={progressForm.description}
                                    onChange={(e) => setProgressForm({ ...progressForm, description: e.target.value })}
                                    placeholder="Deskripsi progress (opsional)..."
                                    className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-3 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
                                />
                                <button 
                                    onClick={handleUploadProgress}
                                    disabled={uploadingProgress || !progressForm.image}
                                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition disabled:opacity-50 active:scale-95"
                                >
                                    {uploadingProgress ? 'Mengupload...' : 'Upload Progress'}
                                </button>
                            </div>

                            {/* Existing Progress */}
                            {progressList.length > 0 ? (
                                <div className="space-y-3">
                                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Riwayat Progress ({progressList.length})</h4>
                                    {progressList.map(p => (
                                        <div key={p.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-[10px] text-slate-500 font-bold">
                                                    {new Date(p.created_at).toLocaleString('id-ID')}
                                                </span>
                                                <button 
                                                    onClick={() => handleDeleteProgress(p.id)}
                                                    className="p-1.5 text-red-400/50 hover:text-red-400 transition"
                                                >
                                                    <FaTrash size={10} />
                                                </button>
                                            </div>
                                            {p.description && (
                                                <p className="text-sm text-slate-300">{p.description}</p>
                                            )}
                                            {p.image_url && (
                                                <button
                                                    onClick={() => {
                                                        setPreviewFile({
                                                            url: `/orders/${progressOrder.id}/progress/${p.id}/image`,
                                                            name: p.description || 'Progress Screenshot'
                                                        });
                                                        setIsPreviewOpen(true);
                                                    }}
                                                    className="text-[10px] text-blue-400 font-bold hover:text-blue-300 underline transition"
                                                >
                                                    Lihat Gambar
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-slate-500 text-sm font-bold py-6">Belum ada progress</p>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Order Detail Modal */}
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