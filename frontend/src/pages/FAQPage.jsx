import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronDown, FaQuestionCircle } from 'react-icons/fa';
import SEO from '../components/SEO';

export default function FAQPage() {
    const faqs = [
        {
            q: "Bagaimana cara memesan jasa di DualCode?",
            a: "Anda bisa memulai dengan melakukan Konsultasi Gratis via WhatsApp atau klik tombol 'Order Sekarang' di Landing Page. Kami akan mendiskusikan kebutuhan Anda sebelum menentukan harga."
        },
        {
            q: "Apakah pengerjaan dijamin aman dan original?",
            a: "Tentu. Kami menjamin kualitas premium dan anti-plagiasi. Semua project dikerjakan dari nol sesuai scope yang disepakati."
        },
        {
            q: "Bagaimana sistem pembayarannya?",
            a: "Kami menggunakan sistem DP atau bayar setelah deal/progres tertentu sesuai kesepakatan saat konsultasi. Transparansi adalah prioritas kami."
        },
        {
            q: "Apakah ada garansi revisi?",
            a: "Ya, kami memberikan garansi revisi sesuai dengan scope awal yang disepakati sampai Anda puas dengan hasilnya."
        }
    ];

    return (
        <div className="min-h-screen bg-[#020617] pt-32 pb-20 px-4">
            <SEO 
                title="FAQ - Pertanyaan Seputar Jasa Joki Koding"
                description="Temukan jawaban atas pertanyaan umum seputar layanan jasa joki web, sistem pembayaran, garansi revisi, dan cara pemesanan di JasaJoki."
                keywords="faq jasa joki, tanya jawab jasa coding, garansi joki web, sistem bayar joki"
                canonicalUrl="/faq"
            />
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-16">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-400 mb-6"
                    >
                        <FaQuestionCircle size={32} />
                    </motion.div>
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-4">Frequently Asked Questions</h1>
                    <p className="text-slate-400">Semua yang perlu Anda ketahui tentang layanan kami.</p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, i) => (
                        <FAQItem key={i} faq={faq} index={i} />
                    ))}
                </div>
            </div>
        </div>
    );
}

function FAQItem({ faq, index }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`glass-morphism rounded-2xl overflow-hidden border border-white/5 transition-all ${isOpen ? 'border-blue-500/30 ring-1 ring-blue-500/20' : ''}`}
        >
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-6 py-5 flex items-center justify-between text-left group"
            >
                <span className="text-lg font-bold text-slate-200 group-hover:text-blue-400 transition-colors">{faq.q}</span>
                <FaChevronDown className={`text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180 text-blue-400' : ''}`} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="px-6 pb-6 text-slate-400 leading-relaxed border-t border-white/5 pt-4">
                            {faq.a}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
