import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import { FaPen, FaCheckCircle, FaClock, FaHistory, FaSearchPlus, FaTimes, FaImages, FaCloudUploadAlt } from 'react-icons/fa';
import { useNotification } from '../NotificationContext';

export default function AdminRevisions() {
    const [revisions, setRevisions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [zoomImage, setZoomImage] = useState(null);
    const { showToast } = useNotification();
    
    // Progress Modal states
    const [showProgressModal, setShowProgressModal] = useState(false);
    const [progressOrder, setProgressOrder] = useState(null);
    const [progressForm, setProgressForm] = useState({ image: null, description: '' });
    const [uploadingProgress, setUploadingProgress] = useState(false);

    useEffect(() => {
        fetchRevisions();
    }, []);

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

    const updateStatus = async (id, status) => {
        try {
            await api.put(`/revisions/${id}`, { status });
            showToast(`Status revisi diperbarui ke ${status.toUpperCase()}`, 'success');
            fetchRevisions();
        } catch (error) {
            showToast('Gagal memperbarui status', 'error');
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'pending': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            case 'process': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'done': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
        }
    };

    const openProgressModal = (order) => {
        if (!order) return;
        setProgressOrder(order);
        setProgressForm({ image: null, description: '' });
        setShowProgressModal(true);
    };

    const handleUploadProgress = async () => {
        if (!progressForm.image) return;
        
        // 2MB validation front-end check
        if (progressForm.image.size > 2 * 1024 * 1024) {
            showToast('Ukuran gambar maksimal 2MB!', 'error');
            return;
        }

        setUploadingProgress(true);
        try {
            const formData = new FormData();
            formData.append('image', progressForm.image);
            if (progressForm.description) formData.append('description', progressForm.description);
            await api.post(`/orders/${progressOrder.id}/progress`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setShowProgressModal(false);
            showToast('Progress berhasil diupload!', 'success');
        } catch (err) {
            showToast(err.response?.data?.error || 'Gagal upload progress', 'error');
        } finally {
            setUploadingProgress(false);
        }
    };

    if (loading) return <div className="p-10 text-center animate-pulse text-slate-500">Memuat data revisi...</div>;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-black text-white flex items-center gap-3">
                    Manajemen Revisi <FaPen className="text-blue-500" size={24} />
                </h1>
                <div className="px-4 py-2 glass rounded-xl border-white/10 text-xs font-bold text-slate-400">
                    Total: {revisions.length} Permintaan
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {revisions.length === 0 ? (
                    <div className="glass p-20 text-center rounded-[32px] border-dashed border-2 border-white/5">
                        <FaHistory size={48} className="mx-auto mb-4 text-slate-700" />
                        <h3 className="text-xl font-bold text-slate-500">Belum ada permintaan revisi</h3>
                    </div>
                ) : (
                    revisions.map((rev) => (
                        <motion.div 
                            key={rev.id} 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass p-6 rounded-3xl border-white/5 hover:border-blue-500/20 transition-all flex flex-col md:flex-row gap-6 md:items-center"
                        >
                            <div className="flex-1 space-y-3">
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Order #{rev.order_id}</span>
                                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold border ${getStatusStyle(rev.status)}`}>
                                        {rev.status.toUpperCase()}
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-white line-clamp-1">{rev.order?.title}</h3>
                                <p className="text-sm text-slate-400 leading-relaxed bg-slate-900/50 p-4 rounded-xl border border-white/5 italic">
                                    "{rev.description}"
                                </p>
                                <div className="text-[10px] text-slate-500 flex items-center gap-2">
                                    <FaClock /> {new Date(rev.created_at).toLocaleString()}
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 shrink-0 min-w-[200px]">
                                {rev.file_path && (
                                    <button 
                                        onClick={() => setZoomImage(rev.file_path)}
                                        className="w-full flex items-center justify-center gap-2 py-2.5 glass-dark border-white/5 hover:border-blue-500/20 text-xs font-bold text-blue-400 rounded-xl transition"
                                    >
                                        <FaSearchPlus /> Lihat Lampiran
                                    </button>
                                )}
                                <div className="grid grid-cols-3 gap-2">
                                    <button 
                                        onClick={() => updateStatus(rev.id, 'pending')}
                                        className={`p-2 rounded-lg text-[10px] font-bold transition ${rev.status === 'pending' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                                    >
                                        Pending
                                    </button>
                                    <button 
                                        onClick={() => updateStatus(rev.id, 'process')}
                                        className={`p-2 rounded-lg text-[10px] font-bold transition ${rev.status === 'process' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                                    >
                                        Proses
                                    </button>
                                    <button 
                                        onClick={() => updateStatus(rev.id, 'done')}
                                        className={`p-2 rounded-lg text-[10px] font-bold transition ${rev.status === 'done' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                                    >
                                        Selesai
                                    </button>
                                </div>
                                <button 
                                    onClick={() => openProgressModal(rev.order)}
                                    className="w-full flex items-center justify-center gap-2 py-2 glass-dark bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 text-xs font-bold text-blue-400 rounded-xl transition"
                                >
                                    <FaImages /> Upload Bukti Progress
                                </button>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Image Zoom Modal */}
            <AnimatePresence>
                {zoomImage && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setZoomImage(null)} className="absolute inset-0 bg-slate-950/95 backdrop-blur-md" />
                        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="relative z-10 max-w-4xl w-full">
                            <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/storage/${zoomImage}`} alt="Zoomed" className="w-full h-auto rounded-2xl shadow-2xl border border-white/10" />
                            <button onClick={() => setZoomImage(null)} className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition"><FaTimes size={24} /></button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* PROGRESS UPLOAD MODAL */}
            <AnimatePresence>
                {showProgressModal && progressOrder && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowProgressModal(false)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-dark p-8 w-full max-w-lg rounded-[32px] relative z-20 border border-white/10 space-y-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-2xl font-black text-white flex items-center gap-3">
                                        <FaImages className="text-blue-400" /> Bukti Progress
                                    </h2>
                                    <p className="text-slate-400 text-sm mt-1">Order #{progressOrder.id} — {progressOrder.title}</p>
                                </div>
                                <button onClick={() => setShowProgressModal(false)} className="p-2 text-slate-400 hover:text-white transition">
                                    <FaTimes />
                                </button>
                            </div>

                            <div className="p-1 rounded-2xl space-y-4">
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/jpg,image/webp"
                                        onChange={(e) => setProgressForm({ ...progressForm, image: e.target.files?.[0] })}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                    />
                                    <div className={`p-6 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 transition-all ${
                                        progressForm.image ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-slate-900/50 border-slate-700 hover:border-blue-500/50'
                                    }`}>
                                        <FaCloudUploadAlt className={progressForm.image ? 'text-emerald-400' : 'text-slate-600'} size={32} />
                                        <span className="text-sm font-bold text-slate-300">
                                            {progressForm.image ? progressForm.image.name : 'Pilih Gambar (Maks 2MB)'}
                                        </span>
                                        <span className="text-[10px] uppercase tracking-widest text-slate-500">Otomatis di kompres oleh sistem</span>
                                    </div>
                                </div>
                                
                                <textarea
                                    rows="2"
                                    value={progressForm.description}
                                    onChange={(e) => setProgressForm({ ...progressForm, description: e.target.value })}
                                    placeholder="Opsional: Tulis deskripsi pencapaian revisi ini..."
                                    className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-4 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
                                />
                            </div>

                            <div className="flex gap-4">
                                <button onClick={() => setShowProgressModal(false)} className="flex-1 py-4 text-slate-400 font-bold hover:text-white transition rounded-xl">Batal</button>
                                <button 
                                    onClick={handleUploadProgress}
                                    disabled={uploadingProgress || !progressForm.image}
                                    className="flex-[2] py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition disabled:opacity-50 active:scale-95"
                                >
                                    {uploadingProgress ? 'Mengupload...' : 'Upload Progress'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
