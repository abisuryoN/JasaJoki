import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api';
import { FaChevronLeft, FaQuestionCircle, FaShieldAlt, FaEnvelope } from 'react-icons/fa';

export default function HelpPage() {
    const { slug } = useParams();
    const [page, setPage] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPage = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/help-pages/slug/${slug}`);
                setPage(res.data);
            } catch (error) {
                console.error('Page not found', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPage();
    }, [slug]);

    if (loading) return <div className="min-h-screen bg-slate-900 pt-24 pb-12 px-4 text-center text-slate-500">Memuat...</div>;

    if (!page) return (
        <div className="min-h-screen bg-slate-900 pt-24 pb-12 px-4 text-center">
            <h1 className="text-4xl font-black text-white mb-4">404</h1>
            <p className="text-slate-400 mb-8">Halaman bantuan tidak ditemukan.</p>
            <Link to="/" className="text-blue-400 font-bold hover:underline">Kembali ke Beranda</Link>
        </div>
    );

    const icons = {
        faq: <FaQuestionCircle />,
        tc: <FaShieldAlt />,
        contact: <FaEnvelope />,
    };

    return (
        <div className="min-h-screen bg-slate-900 pt-24 pb-12 px-4">
            <div className="max-w-3xl mx-auto">
                <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition mb-8 text-sm font-bold uppercase tracking-widest">
                    <FaChevronLeft /> Kembali
                </Link>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass p-8 md:p-12 rounded-[40px] border-white/5"
                >
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center text-3xl shadow-inner border border-blue-500/10">
                            {icons[page.type] || <FaQuestionCircle />}
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black text-white">{page.title}</h1>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Terakhir diperbarui: {new Date(page.updated_at).toLocaleDateString()}</p>
                        </div>
                    </div>

                    <div className="prose prose-invert max-w-none text-slate-400 leading-relaxed space-y-6">
                        {/* Render content - assuming it's safe text or simple HTML */}
                        <div className="whitespace-pre-wrap">{page.content}</div>
                    </div>
                </motion.div>

                <div className="mt-12 p-8 glass rounded-[32px] border-blue-500/10 text-center">
                    <h3 className="text-white font-bold mb-2">Masih punya pertanyaan?</h3>
                    <p className="text-slate-400 text-sm mb-6">Tim support kami siap membantu Anda 24/7 melalui Live Chat atau WhatsApp.</p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link to="/help/contact" className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition">Hubungi Kami</Link>
                        <a href="https://wa.me/yournumber" className="px-6 py-3 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/20 rounded-xl font-bold transition">WhatsApp</a>
                    </div>
                </div>
            </div>
        </div>
    );
}
