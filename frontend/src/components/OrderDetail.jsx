import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FaTimes, FaDownload, FaCalendarAlt, FaHistory, 
    FaCheckCircle, FaExclamationCircle, FaSearchPlus,
    FaCode, FaWallet, FaUserCircle, FaLayerGroup, FaArrowRight, FaWhatsapp,
    FaMoneyBillWave, FaCloudUploadAlt, FaTimesCircle, FaClock,
    FaImages, FaReceipt
} from 'react-icons/fa';
import SecureImage from './SecureImage';
import { useAuth } from '../AuthContext';
import { generateWhatsAppUrl } from '../utils/whatsapp';
import api from '../api';

const StatusBadge = ({ status }) => {
    const styles = {
        pending: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
        contacted: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
        deal: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
        progress: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        waiting_payment: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        revision: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        done: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    };
    
    const labels = {
        pending: 'MENUNGGU',
        contacted: 'DIHUBUNGI',
        deal: 'DEAL',
        progress: 'DIKERJAKAN',
        waiting_payment: 'MENUNGGU BAYAR',
        revision: 'REVISI',
        done: 'SELESAI',
    };

    return (
        <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black border tracking-widest flex items-center gap-2 ${styles[status] || styles.pending}`}>
            {status === 'progress' && <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />}
            {status === 'waiting_payment' && <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />}
            {labels[status] || status?.toUpperCase()}
        </span>
    );
};

const PaymentTypeBadge = ({ type }) => {
    const styles = {
        dp: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        cicilan: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        pelunasan: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    };
    const labels = { dp: 'DP', cicilan: 'CICILAN', pelunasan: 'LUNAS' };
    return (
        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black border tracking-widest ${styles[type] || ''}`}>
            {labels[type] || type?.toUpperCase()}
        </span>
    );
};

const PaymentStatusBadge = ({ status }) => {
    const styles = {
        pending: 'text-amber-400',
        approved: 'text-emerald-400',
        rejected: 'text-red-400',
    };
    const icons = {
        pending: <FaClock size={10} />,
        approved: <FaCheckCircle size={10} />,
        rejected: <FaTimesCircle size={10} />,
    };
    const labels = { pending: 'Pending', approved: 'Approved', rejected: 'Rejected' };
    return (
        <span className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider ${styles[status]}`}>
            {icons[status]} {labels[status] || status}
        </span>
    );
};

export default function OrderDetail({ order, onClose }) {
    const { user } = useAuth();
    const [zoomImage, setZoomImage] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentFile, setPaymentFile] = useState(null);
    const [submittingPayment, setSubmittingPayment] = useState(false);
    const [payments, setPayments] = useState([]);
    const [progressList, setProgressList] = useState([]);
    const [activeTab, setActiveTab] = useState('detail');

    if (!order) return null;

    useEffect(() => {
        fetchPayments();
        fetchProgress();
    }, [order.id]);

    const fetchPayments = async () => {
        try {
            const res = await api.get(`/orders/${order.id}/payments`);
            setPayments(res.data);
        } catch (e) { console.error('Failed to fetch payments', e); }
    };

    const fetchProgress = async () => {
        try {
            const res = await api.get(`/orders/${order.id}/progress`);
            setProgressList(res.data);
        } catch (e) { console.error('Failed to fetch progress', e); }
    };

    const formatCurrency = (value) => {
        if (!value && value !== 0) return 'TBD';
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(value);
    };

    const handlePaymentSubmit = async () => {
        if (!paymentFile || !paymentAmount) return;
        setSubmittingPayment(true);
        try {
            const formData = new FormData();
            formData.append('proof_image', paymentFile);
            formData.append('amount', paymentAmount);
            await api.post(`/orders/${order.id}/payments`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setShowPaymentModal(false);
            setPaymentAmount('');
            setPaymentFile(null);
            fetchPayments();
        } catch (err) {
            alert(err.response?.data?.error || 'Gagal submit pembayaran');
        } finally {
            setSubmittingPayment(false);
        }
    };

    const totalPaid = order.total_paid || 0;
    const pendingPaid = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + parseFloat(p.amount), 0);
    const remainingAmount = order.remaining_amount;
    const paymentProofUrl = `/orders/${order.id}/payment-proof`;

    // Payment logic hints
    const canPay = order.price && order.payment_status !== 'paid';
    const isFullPaymentOnly = order.price && order.price <= 500000;
    const minDpAmount = order.price ? Math.ceil(order.price * 0.5) : 0;

    const tabs = [
        { id: 'detail', label: 'Detail', icon: <FaLayerGroup size={12} /> },
        { id: 'payments', label: 'Pembayaran', icon: <FaReceipt size={12} />, count: payments.length },
        { id: 'progress', label: 'Progress', icon: <FaImages size={12} />, count: progressList.length },
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
            />
            
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 30 }}
                className="glass-dark w-full max-w-4xl max-h-[92vh] overflow-hidden rounded-[40px] border-white/5 flex flex-col relative z-10 shadow-2xl shadow-black/50"
            >
                {/* Header Section - compact */}
                <div className="relative px-6 py-5 md:px-8 md:py-6 border-b border-white/5 bg-gradient-to-r from-blue-600/10 via-transparent to-transparent overflow-hidden flex-shrink-0">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] -mr-32 -mt-32 rounded-full" />
                    
                    <div className="relative flex justify-between items-start">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-lg">Order #{order.id}</span>
                                <StatusBadge status={order.status} />
                            </div>
                            <h2 className="text-2xl md:text-3xl font-black text-white leading-tight">{order.title}</h2>
                        </div>
                        <button onClick={onClose} className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition group flex-shrink-0">
                            <FaTimes size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                        </button>
                    </div>

                    {/* Price Banner - compact */}
                    <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-600/10 to-transparent border border-emerald-500/10">
                        <div className="flex items-center justify-between flex-wrap gap-3">
                            <div>
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-0.5">Total Harga</span>
                                {order.price ? (
                                    <div>
                                        <span className="text-xl font-black text-emerald-400">{formatCurrency(order.price)}</span>
                                        {order.price_note && (
                                            <p className="text-[11px] text-slate-400 italic">Catatan: {order.price_note}</p>
                                        )}
                                    </div>
                                ) : (
                                    <span className="text-sm font-bold text-amber-400 flex items-center gap-2">
                                        <FaClock className="animate-pulse" size={12} /> Menunggu Penawaran dari Admin
                                    </span>
                                )}
                            </div>
                            {order.price && (
                                <div className="flex items-center gap-5">
                                    <div className="text-right">
                                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-0.5">Terbayar</span>
                                        <span className="text-sm font-bold text-emerald-400">{formatCurrency(totalPaid)}</span>
                                        {pendingPaid > 0 && (
                                            <span className="text-[9px] text-amber-400 font-bold block">+{formatCurrency(pendingPaid)} pending</span>
                                        )}
                                    </div>
                                    {remainingAmount > 0 && (
                                        <div className="text-right">
                                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-0.5">Sisa</span>
                                            <span className="text-sm font-bold text-red-400">{formatCurrency(remainingAmount)}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-1 px-6 pt-3 bg-slate-950/30 flex-shrink-0 border-b border-white/5">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all ${
                                activeTab === tab.id 
                                    ? 'bg-slate-900/80 text-white border-t border-x border-white/10' 
                                    : 'text-slate-500 hover:text-slate-300'
                            }`}
                        >
                            {tab.icon} {tab.label}
                            {tab.count > 0 && (
                                <span className="px-1.5 py-0.5 rounded-md bg-blue-500/20 text-blue-400 text-[9px] font-black">{tab.count}</span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Main Scrollable Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 space-y-8 min-h-0">
                    
                    {/* ═══════════════ TAB: DETAIL ═══════════════ */}
                    {activeTab === 'detail' && (
                        <>
                            {/* Key Stats Grid */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="p-5 rounded-3xl bg-white/5 border border-white/5 space-y-2">
                                    <div className="flex items-center gap-2 text-blue-400">
                                        <FaCalendarAlt size={14} />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Deadline</span>
                                    </div>
                                    <p className="text-sm font-bold text-white">
                                        {order.deadline ? new Date(order.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBD'}
                                    </p>
                                </div>
                                <div className="p-5 rounded-3xl bg-white/5 border border-white/5 space-y-2">
                                    <div className="flex items-center gap-2 text-emerald-400">
                                        <FaWallet size={14} />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Budget</span>
                                    </div>
                                    <p className="text-sm font-bold text-white">{formatCurrency(order.budget)}</p>
                                </div>
                                <div className="p-5 rounded-3xl bg-white/5 border border-white/5 space-y-2">
                                    <div className="flex items-center gap-2 text-purple-400">
                                        <FaHistory size={14} />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Revisi</span>
                                    </div>
                                    <p className="text-sm font-bold text-white">{order.revisions_left} Tersisa</p>
                                </div>
                                <div className="p-5 rounded-3xl bg-white/5 border border-white/5 space-y-2">
                                    <div className="flex items-center gap-2 text-amber-400">
                                        <FaCode size={14} />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Teknologi</span>
                                    </div>
                                    <p className="text-sm font-bold text-white line-clamp-1">{order.technology || 'Any'}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                                {/* Left Column: Description & Revisions */}
                                <div className="lg:col-span-2 space-y-10">
                                    <section className="space-y-4">
                                        <div className="flex items-center gap-2 text-white">
                                            <FaLayerGroup className="text-blue-500" />
                                            <h3 className="text-lg font-black uppercase tracking-tighter">Deskripsi Project</h3>
                                        </div>
                                        <div className="p-6 rounded-[32px] bg-slate-900/50 border border-white/5">
                                            <p className="text-slate-400 leading-relaxed whitespace-pre-wrap text-sm md:text-base">{order.description}</p>
                                        </div>
                                    </section>

                                    {/* Revision History */}
                                    {order.revisions && order.revisions.length > 0 && (
                                        <section className="space-y-4">
                                            <div className="flex items-center gap-2 text-white">
                                                <FaHistory className="text-purple-500" />
                                                <h3 className="text-lg font-black uppercase tracking-tighter">Riwayat Revisi</h3>
                                            </div>
                                            <div className="space-y-3">
                                                {order.revisions.map((rev, idx) => (
                                                    <div key={rev.id} className="p-5 rounded-2xl bg-white/5 border border-white/5 flex items-start gap-4">
                                                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-500 flex-shrink-0">
                                                            #{order.revisions.length - idx}
                                                        </div>
                                                        <div className="flex-1 space-y-2">
                                                            <div className="flex justify-between items-center">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-xs font-black text-white">{rev.user?.name || 'User'}</span>
                                                                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                                                                        rev.status === 'done' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                                                                        rev.status === 'progress' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                                        'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                                                    }`}>{rev.status || 'pending'}</span>
                                                                </div>
                                                                <span className="text-[10px] text-slate-500 font-bold">{new Date(rev.created_at).toLocaleDateString('id-ID')}</span>
                                                            </div>
                                                            <p className="text-xs text-slate-300 leading-relaxed bg-black/20 p-3 rounded-xl border border-white/5 italic">"{rev.message || rev.description}"</p>
                                                            {rev.deadline && (
                                                                <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                                                                    <FaCalendarAlt size={10} className="text-purple-500" /> Deadline Revisi: <span className="text-purple-400">{new Date(rev.deadline).toLocaleString('id-ID')}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </section>
                                    )}
                                </div>

                                {/* Right Column: Meta & Actions */}
                                <div className="space-y-8">
                                    {/* Client Info Card */}
                                    <section className="p-6 rounded-[32px] bg-blue-600/5 border border-blue-500/10 space-y-4">
                                        <div className="flex items-center gap-2 text-blue-400">
                                            <FaUserCircle size={18} />
                                            <h4 className="text-xs font-black uppercase tracking-widest">Informasi Klien</h4>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-lg font-bold text-white">{order.guest_name || order.user?.name || 'Anonim'}</p>
                                            <p className="text-xs text-slate-500">{order.guest_phone || order.user?.email || 'Kontak tidak tersedia'}</p>
                                        </div>
                                    </section>

                                    {/* Payment Status Summary */}
                                    <section className="space-y-4">
                                        <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest px-2">Status Pembayaran</h4>
                                        <div className={`p-5 rounded-[32px] border space-y-3 ${
                                            order.payment_status === 'paid' ? 'bg-emerald-500/5 border-emerald-500/10' :
                                            order.payment_status === 'dp_paid' || order.payment_status === 'partially_paid' ? 'bg-blue-500/5 border-blue-500/10' :
                                            'bg-orange-500/5 border-orange-500/10'
                                        }`}>
                                            <div className="flex items-center justify-between">
                                                <span className={`text-sm font-black uppercase ${
                                                    order.payment_status === 'paid' ? 'text-emerald-400' :
                                                    order.payment_status === 'dp_paid' ? 'text-blue-400' :
                                                    order.payment_status === 'partially_paid' ? 'text-blue-400' :
                                                    'text-orange-400'
                                                }`}>
                                                    {order.payment_status === 'paid' ? '✅ LUNAS' :
                                                     order.payment_status === 'dp_paid' ? '💰 DP TERBAYAR' :
                                                     order.payment_status === 'partially_paid' ? '💳 CICILAN BERJALAN' :
                                                     '⏳ BELUM BAYAR'}
                                                </span>
                                            </div>
                                            {order.price && (
                                                <div className="w-full bg-slate-800/50 rounded-full h-2 overflow-hidden">
                                                    <div 
                                                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-700"
                                                        style={{ width: `${Math.min(100, (totalPaid / order.price) * 100)}%` }}
                                                    />
                                                </div>
                                            )}
                                            {order.price && (
                                                <div className="flex justify-between text-[10px] font-bold text-slate-500">
                                                    <span>{formatCurrency(totalPaid)} terbayar</span>
                                                    <span>{Math.round((totalPaid / order.price) * 100)}%</span>
                                                </div>
                                            )}
                                        </div>
                                    </section>

                                    {/* Actions */}
                                    <section className="space-y-3">
                                        {canPay && (
                                            <button 
                                                onClick={() => setShowPaymentModal(true)}
                                                className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white p-4 rounded-2xl font-bold transition shadow-lg shadow-emerald-600/20 active:scale-95 group"
                                            >
                                                <FaMoneyBillWave /> Bayar Sekarang <FaArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                                            </button>
                                        )}

                                        {order.result_path && (
                                            <button 
                                                onClick={() => {
                                                    const downloadResult = async () => {
                                                        const res = await api.get(`/orders/${order.id}/download`, { responseType: 'blob' });
                                                        const url = window.URL.createObjectURL(new Blob([res.data]));
                                                        const link = document.createElement('a');
                                                        link.href = url;
                                                        link.setAttribute('download', `Result_Order_${order.id}.zip`);
                                                        document.body.appendChild(link);
                                                        link.click();
                                                        link.remove();
                                                    };
                                                    downloadResult();
                                                }}
                                                className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-400 text-white p-4 rounded-2xl font-bold transition shadow-lg shadow-blue-600/20 active:scale-95 group"
                                            >
                                                <FaDownload /> Download Hasil <FaArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                                            </button>
                                        )}
                                        
                                        <a 
                                            href={generateWhatsAppUrl(user || null, { orderId: order.id, serviceName: order.title })}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="w-full flex items-center justify-center gap-3 bg-slate-800 hover:bg-slate-700 text-white p-4 rounded-2xl font-bold transition border border-white/5 active:scale-95 group"
                                        >
                                            <FaWhatsapp className="text-emerald-500" /> Tanya Admin via WA
                                        </a>
                                    </section>
                                </div>
                            </div>
                        </>
                    )}

                    {/* ═══════════════ TAB: PEMBAYARAN ═══════════════ */}
                    {activeTab === 'payments' && (
                        <div className="space-y-6">
                            {/* Payment Info Banner */}
                            {order.price && (
                                <div className="p-5 rounded-2xl bg-slate-900/50 border border-white/5 space-y-3">
                                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Info Pembayaran</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                        <div>
                                            <span className="text-[10px] text-slate-500 font-bold block">Total Harga</span>
                                            <span className="text-sm font-black text-white">{formatCurrency(order.price)}</span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-slate-500 font-bold block">Terbayar</span>
                                            <span className="text-sm font-black text-emerald-400">{formatCurrency(totalPaid)}</span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-slate-500 font-bold block">Sisa</span>
                                            <span className="text-sm font-black text-red-400">{formatCurrency(remainingAmount)}</span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-slate-500 font-bold block">Metode</span>
                                            <span className="text-sm font-black text-white">
                                                {isFullPaymentOnly ? 'Bayar Penuh' : 'DP + Cicilan'}
                                            </span>
                                        </div>
                                    </div>
                                    {!isFullPaymentOnly && totalPaid === 0 && (
                                        <div className="mt-2 p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                                            <p className="text-[11px] text-amber-400 font-bold">💡 DP minimal 50% = {formatCurrency(minDpAmount)}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Payment History */}
                            {payments.length > 0 ? (
                                <div className="space-y-3">
                                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Riwayat Pembayaran</h4>
                                    {payments.map((p) => (
                                        <div key={p.id} className="p-5 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center">
                                                    <FaReceipt className="text-slate-500" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <PaymentTypeBadge type={p.type} />
                                                        <PaymentStatusBadge status={p.status} />
                                                    </div>
                                                    <span className="text-lg font-black text-white">{formatCurrency(p.amount)}</span>
                                                    {p.admin_note && (
                                                        <p className="text-[11px] text-slate-400 italic mt-1">"{p.admin_note}"</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <span className="text-[10px] text-slate-500 font-bold block">
                                                    {new Date(p.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </span>
                                                {p.proof_image && (
                                                    <button 
                                                        onClick={() => setZoomImage(`/orders/${order.id}/payments/${p.id}/proof`)}
                                                        className="text-[10px] text-blue-400 font-bold hover:text-blue-300 transition mt-1"
                                                    >
                                                        Lihat Bukti
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-12 rounded-3xl bg-slate-900/30 border border-dashed border-slate-700/50 text-center">
                                    <FaReceipt className="text-slate-700 mx-auto mb-4" size={32} />
                                    <p className="text-slate-500 font-bold">Belum ada riwayat pembayaran</p>
                                </div>
                            )}

                            {/* Pay Button */}
                            {canPay && (
                                <button 
                                    onClick={() => setShowPaymentModal(true)}
                                    className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white p-4 rounded-2xl font-bold transition shadow-lg shadow-emerald-600/20 active:scale-95"
                                >
                                    <FaMoneyBillWave /> Bayar Sekarang
                                </button>
                            )}
                        </div>
                    )}

                    {/* ═══════════════ TAB: PROGRESS ═══════════════ */}
                    {activeTab === 'progress' && (
                        <div className="space-y-6">
                            {progressList.length > 0 ? (
                                <div className="relative">
                                    {/* Timeline Line */}
                                    <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500/50 via-blue-500/20 to-transparent" />

                                    <div className="space-y-6">
                                        {progressList.map((p, idx) => (
                                            <div key={p.id} className="relative pl-16">
                                                {/* Timeline Dot */}
                                                <div className={`absolute left-[18px] w-3 h-3 rounded-full border-2 ${
                                                    idx === 0 ? 'bg-blue-500 border-blue-400 shadow-lg shadow-blue-500/50' : 'bg-slate-700 border-slate-600'
                                                }`} style={{ top: '24px' }} />

                                                <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-3 hover:bg-white/[0.07] transition">
                                                    <div className="flex justify-between items-center">
                                                        <span className={`text-[10px] font-black uppercase tracking-widest ${idx === 0 ? 'text-blue-400' : 'text-slate-500'}`}>
                                                            {new Date(p.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                        </span>
                                                        <span className="text-[10px] text-slate-600 font-bold">
                                                            {new Date(p.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                    {p.description && (
                                                        <p className="text-sm text-slate-300 leading-relaxed">{p.description}</p>
                                                    )}
                                                    {p.image_url && (
                                                        <div 
                                                            className="relative group cursor-pointer overflow-hidden rounded-xl aspect-video border border-white/10 max-w-md"
                                                            onClick={() => setZoomImage(`/orders/${order.id}/progress/${p.id}/image`)}
                                                        >
                                                            <SecureImage 
                                                                src={`/orders/${order.id}/progress/${p.id}/image`} 
                                                                alt={p.description || 'Progress'} 
                                                                className="w-full h-full object-cover transition duration-500 group-hover:scale-110"
                                                            />
                                                            <div className="absolute inset-0 bg-blue-900/40 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center">
                                                                <FaSearchPlus className="text-white text-2xl" />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="p-12 rounded-3xl bg-slate-900/30 border border-dashed border-slate-700/50 text-center">
                                    <FaImages className="text-slate-700 mx-auto mb-4" size={32} />
                                    <p className="text-slate-500 font-bold">Belum ada progress update</p>
                                    <p className="text-slate-600 text-xs mt-1">Admin akan upload progress pengerjaan di sini</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </motion.div>

            {/* ═══════════════ PAYMENT MODAL ═══════════════ */}
            <AnimatePresence>
                {showPaymentModal && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowPaymentModal(false)}
                            className="absolute inset-0 bg-slate-950/95 backdrop-blur-md"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="glass-dark p-8 w-full max-w-lg rounded-[32px] relative z-20 border border-white/10 space-y-6"
                        >
                            <div>
                                <h2 className="text-2xl font-black text-white">Pembayaran</h2>
                                <p className="text-slate-400 text-sm mt-1">Order #{order.id} — {order.title}</p>
                            </div>

                            <div className="p-4 rounded-2xl bg-slate-900/50 border border-white/5 space-y-2">
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-500 font-bold">Total Harga</span>
                                    <span className="text-white font-black">{formatCurrency(order.price)}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-500 font-bold">Sudah Dibayar</span>
                                    <span className="text-emerald-400 font-black">{formatCurrency(totalPaid)}</span>
                                </div>
                                <div className="flex justify-between text-xs border-t border-white/5 pt-2">
                                    <span className="text-slate-500 font-bold">Sisa Pembayaran</span>
                                    <span className="text-red-400 font-black">{formatCurrency(remainingAmount)}</span>
                                </div>
                                {isFullPaymentOnly && (
                                    <p className="text-[11px] text-amber-400 font-bold mt-2">⚡ Harga ≤ Rp 500.000 — Harus bayar penuh</p>
                                )}
                                {!isFullPaymentOnly && totalPaid === 0 && (
                                    <p className="text-[11px] text-amber-400 font-bold mt-2">💰 DP minimal 50% = {formatCurrency(minDpAmount)}</p>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Jumlah Pembayaran (Rp)</label>
                                    <input
                                        type="number"
                                        value={paymentAmount}
                                        onChange={(e) => setPaymentAmount(e.target.value)}
                                        placeholder={isFullPaymentOnly ? remainingAmount : (totalPaid === 0 ? minDpAmount : '0')}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-4 text-white text-lg font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Upload Bukti Bayar</label>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/png,image/jpg"
                                            onChange={(e) => setPaymentFile(e.target.files?.[0])}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                        />
                                        <div className={`p-4 border-2 border-dashed rounded-2xl flex items-center justify-center gap-3 transition-all ${
                                            paymentFile ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-slate-900/50 border-slate-700 hover:border-blue-500/50'
                                        }`}>
                                            <FaCloudUploadAlt className={paymentFile ? 'text-emerald-400' : 'text-slate-600'} size={20} />
                                            <span className="text-xs font-bold text-slate-400">
                                                {paymentFile ? `✓ ${paymentFile.name}` : 'Klik untuk upload gambar'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button 
                                    onClick={() => setShowPaymentModal(false)} 
                                    className="flex-1 py-4 text-slate-400 font-bold hover:text-white transition rounded-xl"
                                >
                                    Batal
                                </button>
                                <button 
                                    onClick={handlePaymentSubmit} 
                                    disabled={submittingPayment || !paymentAmount || !paymentFile}
                                    className="flex-[2] py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition disabled:opacity-50 active:scale-95 shadow-lg shadow-emerald-600/20"
                                >
                                    {submittingPayment ? 'Mengirim...' : 'Submit Pembayaran'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Image Zoom Modal */}
            <AnimatePresence>
                {zoomImage && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setZoomImage(null)}
                            className="absolute inset-0 bg-slate-950/95 backdrop-blur-md"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="relative z-10 max-w-4xl w-full"
                        >
                            <SecureImage 
                                src={zoomImage} 
                                alt="Zoomed" 
                                className="w-full h-auto rounded-2xl shadow-2xl border border-white/10" 
                            />
                            <button 
                                onClick={() => setZoomImage(null)}
                                className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition backdrop-blur-md"
                            >
                                <FaTimes size={24} />
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
