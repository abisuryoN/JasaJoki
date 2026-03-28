import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaFileUpload, FaCalendarAlt, FaCheck, FaArrowRight, FaArrowLeft, FaTrash } from 'react-icons/fa';
import api from '../api';

// Simple debounce implementation
function debounce(func, wait) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

export default function OrderForm() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [saveStatus, setSaveStatus] = useState('Tersimpan');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        deadline: '',
        extra_revisions: 0,
        guest_name: '',
        guest_phone: '',
    });

    // Fetch existing draft on mount
    useEffect(() => {
        const fetchDraft = async () => {
            try {
                const res = await api.get('/orders/draft');
                if (res.data) {
                    setFormData({
                        title: res.data.title || '',
                        description: res.data.description || '',
                        deadline: res.data.deadline ? res.data.deadline.split(' ')[0] : '',
                        extra_revisions: res.data.extra_revisions || 0,
                        guest_name: res.data.guest_name || '',
                        guest_phone: res.data.guest_phone || '',
                    });
                }
            } catch (err) {
                console.error("Failed to fetch draft", err);
            }
        };
        fetchDraft();
    }, []);

    // Auto-save logic
    const saveDraft = useCallback(
        debounce(async (data) => {
            setSaveStatus('Menyimpan...');
            try {
                await api.post('/orders', { ...data, status: 'draft' });
                setSaveStatus('Tersimpan');
            } catch (err) {
                setSaveStatus('Gagal menyimpan');
            }
        }, 1000),
        []
    );

    useEffect(() => {
        if (formData.title || formData.description) {
            saveDraft(formData);
        }
    }, [formData, saveDraft]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/orders', { ...formData, status: 'pending' });
            navigate('/dashboard?status=success');
        } catch (err) {
            alert("Gagal mengirim order. Silakan coba lagi.");
        } finally {
            setLoading(false);
        }
    };

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    return (
        <div className="min-h-screen bg-slate-900 pt-24 pb-12 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Progress Bar */}
                <div className="mb-12">
                    <div className="flex justify-between mb-2">
                        <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Langkah {step} dari 3</span>
                        <span className="text-xs text-slate-500 font-medium">{saveStatus}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <motion.div 
                            className="h-full bg-blue-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${(step / 3) * 100}%` }}
                        />
                    </div>
                </div>

                <motion.div 
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="glass p-8 md:p-10 rounded-3xl border-blue-500/20"
                >
                    <form onSubmit={handleSubmit}>
                        {step === 1 && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-2">Apa yang bisa kami bantu?</h2>
                                    <p className="text-slate-400 text-sm mb-6">Berikan judul singkat dan padat untuk tugas Anda.</p>
                                    <input 
                                        type="text"
                                        name="title"
                                        required
                                        placeholder="Contoh: Website E-Commerce Laravel"
                                        className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-5 py-4 focus:ring-2 focus:ring-blue-500 outline-none transition text-white"
                                        value={formData.title}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Nama Lengkap</label>
                                        <input 
                                            type="text"
                                            name="guest_name"
                                            required
                                            placeholder="Nama Anda"
                                            className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-5 py-4 focus:ring-2 focus:ring-blue-500 outline-none transition text-white"
                                            value={formData.guest_name}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">No. WhatsApp</label>
                                        <input 
                                            type="text"
                                            name="guest_phone"
                                            required
                                            placeholder="0812..."
                                            className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-5 py-4 focus:ring-2 focus:ring-blue-500 outline-none transition text-white"
                                            value={formData.guest_phone}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <button 
                                        type="button"
                                        onClick={nextStep}
                                        disabled={!formData.title || !formData.guest_name || !formData.guest_phone}
                                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold transition disabled:opacity-50"
                                    >
                                        Lanjut <FaArrowRight />
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-2">Detail & Deskripsi</h2>
                                    <p className="text-slate-400 text-sm mb-6">Jelaskan secara rinci kebutuhan, fitur, atau instruksi tugas.</p>
                                    <textarea 
                                        name="description"
                                        required
                                        rows="6"
                                        placeholder="Jelaskan di sini..."
                                        className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-5 py-4 focus:ring-2 focus:ring-blue-500 outline-none transition text-white"
                                        value={formData.description}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="flex justify-between">
                                    <button type="button" onClick={prevStep} className="flex items-center gap-2 text-slate-400 hover:text-white transition">
                                        <FaArrowLeft /> Kembali
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={nextStep}
                                        disabled={!formData.description}
                                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold transition disabled:opacity-50"
                                    >
                                        Lanjut <FaArrowRight />
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wide">Deadline</label>
                                        <div className="relative">
                                            <FaCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                            <input 
                                                type="date"
                                                name="deadline"
                                                required
                                                className="w-full bg-slate-950/50 border border-slate-700 rounded-xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-blue-500 outline-none transition text-white"
                                                value={formData.deadline}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wide">Ekstra Revisi</label>
                                        <select 
                                            name="extra_revisions"
                                            className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-5 py-4 focus:ring-2 focus:ring-blue-500 outline-none transition text-white appearance-none"
                                            value={formData.extra_revisions}
                                            onChange={handleChange}
                                        >
                                            <option value="0">Default (2x Gratis)</option>
                                            <option value="1">+1 Revisi</option>
                                            <option value="3">+3 Revisi</option>
                                            <option value="5">+5 Revisi</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="bg-blue-500/10 border border-blue-500/20 p-6 rounded-2xl">
                                    <h4 className="text-blue-400 font-bold mb-2 flex items-center gap-2">
                                        <FaCheck size={14} /> Tanpa Harga di Awal
                                    </h4>
                                    <p className="text-sm text-slate-400 leading-relaxed">
                                        Setelah Anda mengirimkan order ini, tim kami akan meninjau dan menghubungi Anda via Chat untuk konsultasi detail dan kesepakatan harga.
                                    </p>
                                </div>

                                <div className="flex justify-between pt-4">
                                    <button type="button" onClick={prevStep} className="flex items-center gap-2 text-slate-400 hover:text-white transition">
                                        <FaArrowLeft /> Kembali
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={loading}
                                        className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white px-10 py-4 rounded-xl font-bold transition shadow-lg shadow-emerald-500/20 active:scale-95"
                                    >
                                        {loading ? 'Mengirim...' : 'Kirim Order Sekarang'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
