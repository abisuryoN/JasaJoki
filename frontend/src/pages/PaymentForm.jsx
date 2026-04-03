import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaCreditCard, FaFileUpload, FaCheckCircle,
    FaChevronDown, FaWallet, FaUniversity, FaTimesCircle
} from 'react-icons/fa';
import api from '../api';

export default function PaymentForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [methodOpen, setMethodOpen] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState('');
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);   // ✅ preview lokal
    const [imgError, setImgError] = useState(false); // ✅ track image error

    const methods = [
        { id: 'bca', name: 'BCA Transfer', icon: <FaUniversity />, account: '123-456-7890 a/n DualCode' },
        { id: 'mandiri', name: 'Mandiri Transfer', icon: <FaUniversity />, account: '098-765-4321 a/n DualCode' },
        { id: 'gopay', name: 'GoPay', icon: <FaWallet />, account: '0812-3456-7890' },
        { id: 'dana', name: 'DANA', icon: <FaWallet />, account: '0812-3456-7890' },
    ];

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const res = await api.get(`/orders/${id}`);
                setOrder(res.data);
            } catch (err) {
                console.error(err);
                navigate('/dashboard');
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [id, navigate]);

    // ✅ Buat object URL untuk preview lokal — tidak butuh server
    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (!selected) return;

        setFile(selected);
        setImgError(false);

        // Revoke URL lama agar tidak memory leak
        if (preview) URL.revokeObjectURL(preview);

        if (selected.type.startsWith('image/')) {
            setPreview(URL.createObjectURL(selected));
        } else {
            // PDF — tampilkan icon saja, bukan gambar
            setPreview(null);
        }
    };

    // Cleanup object URL saat unmount
    useEffect(() => {
        return () => {
            if (preview) URL.revokeObjectURL(preview);
        };
    }, [preview]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedMethod || !file) {
            alert('Harap pilih metode dan upload bukti.');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('payment_method', selectedMethod);
        formData.append('file', file);

        try {
            // ✅ Endpoint sudah match dengan api.php route
            await api.post(`/orders/${id}/payment-proof`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            navigate('/dashboard?payment=success');
        } catch (err) {
            console.error('Upload Error:', err.response?.data);
            alert('Gagal mengunggah: ' + (err.response?.data?.message || err.message));
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
                Loading...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 pt-24 pb-12 px-4">
            <div className="max-w-xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass p-8 md:p-10 rounded-[40px] border-blue-500/20"
                >
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400">
                            <FaCreditCard size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-white">Pembayaran</h1>
                            <p className="text-sm text-slate-500">Order ID: #{id}</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Dropdown Metode */}
                        <div className="relative">
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">
                                Metode Pembayaran
                            </label>
                            <button
                                type="button"
                                onClick={() => setMethodOpen(!methodOpen)}
                                className="w-full flex items-center justify-between px-6 py-5 bg-slate-950/50 border border-slate-700/50 rounded-2xl text-white hover:border-blue-500 transition-all text-left"
                            >
                                {selectedMethod ? (
                                    <div className="flex items-center gap-3">
                                        {methods.find(m => m.id === selectedMethod)?.icon}
                                        <span className="font-bold">
                                            {methods.find(m => m.id === selectedMethod)?.name}
                                        </span>
                                    </div>
                                ) : (
                                    <span className="text-slate-500">Pilih metode pembayaran...</span>
                                )}
                                <FaChevronDown className={`transition-transform duration-300 ${methodOpen ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {methodOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute z-50 w-full mt-3 overflow-hidden rounded-[24px] border border-slate-700 bg-[#0f172a] shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                                    >
                                        <div className="p-2">
                                            {methods.map((m) => (
                                                <button
                                                    key={m.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedMethod(m.id);
                                                        setMethodOpen(false);
                                                    }}
                                                    className={`w-full flex items-center gap-4 px-6 py-4 hover:bg-white/5 transition-all text-left rounded-2xl mb-1 group ${selectedMethod === m.id
                                                            ? 'bg-blue-600/10 border border-blue-500/20'
                                                            : 'border border-transparent'
                                                        }`}
                                                >
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${selectedMethod === m.id
                                                            ? 'bg-blue-600 text-white'
                                                            : 'bg-slate-800 text-slate-400 group-hover:text-blue-400'
                                                        }`}>
                                                        {m.icon}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-white text-sm mb-0.5">{m.name}</h4>
                                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                                            {m.account}
                                                        </p>
                                                    </div>
                                                    {selectedMethod === m.id && (
                                                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Upload Area */}
                        <div>
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">
                                Bukti Pembayaran
                            </label>

                            {/* ✅ Preview lokal — tidak butuh request ke server */}
                            {file && (
                                <div className="mb-4 relative">
                                    {preview && !imgError ? (
                                        <img
                                            src={preview}
                                            alt="Preview bukti pembayaran"
                                            className="w-full max-h-60 object-contain rounded-2xl border border-slate-700 bg-slate-950"
                                            onError={() => setImgError(true)}
                                        />
                                    ) : (
                                        // Fallback inline — tidak pakai URL eksternal
                                        <div className="w-full h-32 rounded-2xl border border-slate-700 bg-slate-950 flex flex-col items-center justify-center gap-2">
                                            <FaFileUpload size={32} className="text-slate-500" />
                                            <span className="text-xs text-slate-400 font-bold">{file.name}</span>
                                            <span className="text-[10px] text-slate-600">
                                                {(file.size / 1024 / 1024).toFixed(2)} MB
                                            </span>
                                        </div>
                                    )}
                                    {/* Tombol hapus file */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setFile(null);
                                            setPreview(null);
                                            setImgError(false);
                                        }}
                                        className="absolute top-2 right-2 w-8 h-8 bg-red-500/80 hover:bg-red-500 rounded-full flex items-center justify-center text-white transition"
                                    >
                                        <FaTimesCircle size={14} />
                                    </button>
                                </div>
                            )}

                            <label className="relative group cursor-pointer block">
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/jpg,image/jpeg,image/png,application/pdf"
                                    onChange={handleFileChange}
                                />
                                <div className="w-full py-10 border-2 border-dashed border-slate-700 rounded-[32px] flex flex-col items-center justify-center group-hover:border-blue-500/50 group-hover:bg-blue-500/5 transition-all">
                                    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center text-slate-500 mb-4 group-hover:scale-110 transition-transform">
                                        <FaFileUpload size={24} />
                                    </div>
                                    <span className="text-sm font-bold text-slate-400 group-hover:text-blue-400">
                                        {file ? 'Ganti file' : 'Klik atau tarik file bukti di sini'}
                                    </span>
                                    <p className="text-[10px] text-slate-600 mt-2">JPG, PNG, atau PDF (Max 5MB)</p>
                                </div>
                            </label>
                        </div>

                        <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-2xl flex items-start gap-4">
                            <FaCheckCircle className="text-emerald-500 mt-1 shrink-0" />
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Pastikan nominal yang Anda transfer sesuai dengan kesepakatan di Chat.
                                Tim kami akan memverifikasi bukti Anda dalam waktu maksimal 1x24 jam.
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={uploading || !file || !selectedMethod}
                            className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-lg transition shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-50 disabled:grayscale"
                        >
                            {uploading ? 'Sedang Mengunggah...' : 'Konfirmasi Pembayaran'}
                        </button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}