import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FaTimes, FaDownload, FaCalendarAlt, FaHistory, 
    FaCheckCircle, FaExclamationCircle, FaSearchPlus,
    FaCode, FaWallet, FaUserCircle, FaLayerGroup, FaArrowRight
} from 'react-icons/fa';
import SecureImage from './SecureImage';

const StatusBadge = ({ status }) => {
    const styles = {
        pending: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
        process: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        revision: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        done: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    };
    
    const labels = {
        pending: 'MENUNGGU',
        process: 'DIPROSES',
        revision: 'REVISI',
        done: 'SELESAI',
    };

    return (
        <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black border tracking-widest flex items-center gap-2 ${styles[status]}`}>
            {status === 'process' && <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />}
            {labels[status]}
        </span>
    );
};

export default function OrderDetail({ order, onClose }) {
    const [zoomImage, setZoomImage] = useState(null);

    if (!order) return null;

    const formatCurrency = (value) => {
        if (!value) return 'TBD';
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(value);
    };

    // ✅ Gunakan endpoint terproteksi untuk Bukti Bayar
    const paymentProofUrl = `/orders/${order.id}/payment-proof`;

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
                {/* Header Section */}
                <div className="relative p-8 md:p-10 border-b border-white/5 bg-gradient-to-r from-blue-600/10 via-transparent to-transparent overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] -mr-32 -mt-32 rounded-full" />
                    
                    <div className="relative flex justify-between items-start">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-lg">Order #{order.id}</span>
                                <StatusBadge status={order.status} />
                            </div>
                            <h2 className="text-3xl md:text-4xl font-black text-white leading-tight">{order.title}</h2>
                        </div>
                        <button onClick={onClose} className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition group">
                            <FaTimes size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                        </button>
                    </div>
                </div>

                {/* Main Scrollable Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-8 md:p-10 space-y-10">
                    
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
                        {/* Left Column: Description & Details */}
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
                                                                rev.status === 'process' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
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

                            {/* Payment Status */}
                            <section className="space-y-4">
                                <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest px-2">Pembayaran</h4>
                                {order.payment_proof ? (
                                    <div className="p-6 rounded-[32px] bg-slate-900 border border-white/5 space-y-4">
                                        <div 
                                            className="relative group cursor-pointer overflow-hidden rounded-2xl aspect-video border border-white/10"
                                            onClick={() => setZoomImage(paymentProofUrl)}
                                        >
                                            <SecureImage 
                                                src={paymentProofUrl} 
                                                alt="Proof" 
                                                className="w-full h-full object-cover transition duration-500 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-blue-900/40 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center">
                                                <FaSearchPlus className="text-white text-2xl" />
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-slate-500 font-bold uppercase">Metode</span>
                                            <span className="text-white font-black uppercase">{order.payment_method}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-6 rounded-[32px] bg-orange-500/5 border border-orange-500/10 flex items-center gap-3 text-orange-400">
                                        <FaExclamationCircle />
                                        <span className="text-xs font-bold">MENUNGGU PEMBAYARAN</span>
                                    </div>
                                )}
                            </section>

                            {/* Result Action */}
                            {order.result_path && (
                                <section className="p-6 rounded-[32px] bg-emerald-500/10 border border-emerald-500/20 space-y-4">
                                    <div className="flex items-center gap-2 text-emerald-400 font-black text-xs uppercase tracking-widest">
                                        <FaCheckCircle /> Hasil Selesai
                                    </div>
                                    <button 
                                        onClick={() => {
                                            // Handle download via api instance
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
                                        className="w-full flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-500 text-white p-4 rounded-2xl font-bold transition shadow-lg shadow-emerald-600/20 active:scale-95 group"
                                    >
                                        <FaDownload /> Download Hasil <FaArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </section>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>


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
