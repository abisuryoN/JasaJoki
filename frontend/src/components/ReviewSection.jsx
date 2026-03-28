import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaStar, FaQuoteLeft, FaPlus } from 'react-icons/fa';
import { useAuth } from '../AuthContext';
import api from '../api';

export default function ReviewSection() {
    const { user } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const res = await api.get('/reviews');
            if (res.data && res.data.success && Array.isArray(res.data.data)) {
                setReviews(res.data.data);
            } else {
                setReviews([]);
            }
        } catch (err) {
            console.error("Failed to fetch reviews", err);
            setReviews([]);
        } finally {
            setLoading(false);
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) return;
        setSubmitting(true);
        try {
            await api.post('/reviews', newReview);
            setNewReview({ rating: 5, comment: '' });
            setShowForm(false);
            fetchReviews();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to submit review");
        } finally {
            setSubmitting(false);
        }
    };

    const getInitials = (name) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    return (
        <section className="py-24 relative overflow-hidden bg-slate-950/20">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-black mb-4">Apa Kata <span className="text-blue-400">Client Kami?</span></h2>
                    <p className="text-slate-400 text-lg mb-8">Kepercayaan Anda adalah prioritas utama kami.</p>
                    
                    {user && !showForm && (
                        <button 
                            onClick={() => setShowForm(true)}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600/20 text-blue-400 rounded-xl font-bold border border-blue-500/20 hover:bg-blue-600 hover:text-white transition-all"
                        >
                            <FaPlus size={14} /> Berikan Review
                        </button>
                    )}
                </div>

                {showForm && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-xl mx-auto mb-16 glass-morphism p-8 rounded-3xl border border-blue-500/30 ring-1 ring-blue-500/20"
                    >
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="flex justify-center gap-2">
                                {[1, 2, 3, 4, 5].map(s => (
                                    <button 
                                        key={s} 
                                        type="button"
                                        onClick={() => setNewReview({ ...newReview, rating: s })}
                                        className={`text-2xl transition-all ${s <= newReview.rating ? 'text-yellow-400 scale-110' : 'text-slate-600 hover:text-slate-400'}`}
                                    >
                                        <FaStar />
                                    </button>
                                ))}
                            </div>
                            <textarea 
                                required
                                value={newReview.comment}
                                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-all resize-none"
                                placeholder="Tuliskan pengalaman Anda..."
                                rows="3"
                            ></textarea>
                            <div className="flex gap-3">
                                <button 
                                    type="submit" 
                                    disabled={submitting}
                                    className="flex-grow py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 transition disabled:opacity-50"
                                >
                                    {submitting ? 'Mengirim...' : 'Kirim Review'}
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => setShowForm(false)}
                                    className="px-6 py-3 bg-slate-800 text-slate-300 rounded-xl font-bold hover:bg-slate-700 transition"
                                >
                                    Batal
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-64 bg-slate-800/50 rounded-3xl animate-pulse" />
                        ))}
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="text-center py-20 bg-slate-900/40 rounded-[40px] border border-dashed border-white/5">
                        <p className="text-slate-500 text-xl font-medium italic">"Belum ada review, jadilah yang pertama!"</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {reviews.map((t, i) => (
                            <motion.div
                                key={t.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                className="glass-morphism p-8 rounded-[32px] relative group border border-white/5 hover:border-blue-500/30 transition-all shadow-xl"
                            >
                                <FaQuoteLeft className="text-blue-500/10 text-6xl absolute top-6 left-6" />
                                <div className="relative z-10">
                                    <div className="flex space-x-1 mb-6">
                                        {[...Array(5)].map((_, i) => (
                                            <FaStar key={i} className={i < t.rating ? "text-yellow-400" : "text-slate-700"} size={14} />
                                        ))}
                                    </div>
                                    <p className="text-lg text-slate-300 italic mb-8 leading-relaxed">"{t.comment}"</p>
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/20 ring-1 ring-white/10 group-hover:scale-110 transition-transform">
                                            {getInitials(t.user?.name || 'User')}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white group-hover:text-blue-400 transition-colors">{t.user?.name || 'Anonymous'}</h4>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{new Date(t.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
