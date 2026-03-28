import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { 
    FaArrowRight, FaRocket, FaClock, FaCheckCircle, FaComments, 
    FaSearch, FaHandshake, FaEdit, FaCheckDouble, FaWhatsapp,
    FaReact, FaLaravel, FaNodeJs, FaPython, FaDatabase, FaVuejs
} from 'react-icons/fa';
import { SiPostgresql, SiMysql, SiMariadb, SiCodeigniter } from 'react-icons/si';
import ReviewSection from '../components/ReviewSection';

export default function LandingPage() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const technologies = [
        { name: 'React', icon: <FaReact size={40} className="text-[#61DAFB]" /> },
        { name: 'Vue', icon: <FaVuejs size={40} className="text-[#4FC08D]" /> },
        { name: 'Laravel', icon: <FaLaravel size={40} className="text-[#FF2D20]" /> },
        { name: 'CodeIgniter', icon: <SiCodeigniter size={40} className="text-[#EE4323]" /> },
        { name: 'Node.js', icon: <FaNodeJs size={40} className="text-[#339933]" /> },
        { name: 'Python', icon: <FaPython size={40} className="text-[#3776AB]" /> },
        { name: 'PostgreSQL', icon: <SiPostgresql size={40} className="text-[#336791]" /> },
        { name: 'MySQL', icon: <SiMysql size={40} className="text-[#4479A1]" /> },
        { name: 'MariaDB', icon: <SiMariadb size={40} className="text-[#003545]" /> },
    ];

    const handleOrderClick = () => {
        if (!user) {
            navigate('/login');
        } else {
            navigate('/order/new');
        }
    };

    const trustCards = [
        { title: 'Konsultasi Gratis', desc: 'Diskusikan kebutuhanmu tanpa biaya sepeserpun sampai deal.', icon: <FaComments size={28} />, color: 'blue' },
        { title: 'Pengerjaan Cepat', desc: 'Kami mengerti deadline adalah segalanya. Tim kami siap bergerak cepat.', icon: <FaClock size={28} />, color: 'cyan' },
        { title: 'Kualitas Premium', desc: 'Bukan sekadar selesai, tapi memberikan hasil yang optimal dan rapi.', icon: <FaCheckCircle size={28} />, color: 'emerald' },
        { title: 'Transparansi Progress', desc: 'Pantau perkembangan tugasmu secara real-time di dashboard.', icon: <FaRocket size={28} />, color: 'purple' },
    ];

    const flowSteps = [
        { title: 'Konsultasi', desc: 'Hubungi kami via WhatsApp atau Chat untuk mulai.', icon: <FaWhatsapp /> },
        { title: 'Diskusi & Scope', desc: 'Tentukan detail project dan deadline yang diinginkan.', icon: <FaSearch /> },
        { title: 'Deal Harga', desc: 'Kami berikan penawaran terbaik sesuai tingkat kesulitan.', icon: <FaHandshake /> },
        { title: 'Pengerjaan', desc: 'Tim ahli kami mulai membangun solusi untuk Anda.', icon: <FaEdit /> },
        { title: 'Revisi / Selesai', desc: 'Cek hasil akhir, revisi jika perlu, dan project selesai!', icon: <FaCheckDouble /> },
    ];

    return (
        <div className="bg-[#020617] text-slate-100 selection:bg-blue-500/30 overflow-x-hidden">
            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
                {/* Background Decor */}
                <div className="absolute top-0 left-0 w-full h-full">
                    <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse-glow" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '2s' }} />
                </div>
                
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mt-[-5vh]">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center space-x-2 px-6 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-bold mb-8 backdrop-blur-md"
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        <span>Expert IT Assistance is Here</span>
                    </motion.div>

                    <motion.h1 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-5xl md:text-8xl font-black tracking-tighter mb-8 leading-[1] text-glow-blue"
                    >
                        Solusi IT Tanpa Ribet <br />
                        <span className="heading-gradient">& Tanpa Drama Deadline</span>
                    </motion.h1>

                    <motion.p 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-lg md:text-2xl text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed font-medium"
                    >
                        Dari tugas kuliah sampai project startup, semua bisa kami bantu dengan sistem konsultasi dulu — bayar setelah deal.
                    </motion.p>

                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-6"
                    >
                        <a 
                            href="https://wa.me/6281234567890" 
                            target="_blank"
                            className="group relative px-10 py-5 rounded-2xl bg-blue-600 text-white font-black text-xl hover:bg-blue-500 transition-all shadow-[0_0_40px_rgba(59,130,246,0.4)] flex items-center gap-3 active:scale-95 overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center gap-3">
                                🚀 Konsultasi Gratis
                            </span>
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        </a>
                        <button 
                            onClick={handleOrderClick}
                            className="px-10 py-5 rounded-2xl bg-slate-800/50 backdrop-blur-xl text-white font-bold text-xl hover:bg-slate-700/80 transition border border-white/10 flex items-center gap-3 active:scale-95"
                        >
                            📦 Order Sekarang
                        </button>
                    </motion.div>
                </div>
            </section>

            {/* Trust Section */}
            <section className="py-24 relative">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-black mb-4">Kenapa Memilih Kami?</h2>
                        <div className="h-1.5 w-20 bg-blue-500 mx-auto rounded-full" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {trustCards.map((card, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                className="glass-morphism p-8 rounded-[32px] border border-white/5 hover:border-blue-500/30 hover:shadow-blue-500/10 hover:-translate-y-2 transition-all duration-300 group"
                            >
                                <div className={`w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-lg`}>
                                    {card.icon}
                                </div>
                                <h3 className="text-xl font-bold text-white mb-4">{card.title}</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">{card.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Technologies Section */}
            <section className="py-20 relative overflow-hidden bg-slate-950/30 border-y border-white/5">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-50 hover:opacity-100 transition-opacity duration-700">
                        {technologies.map((tech, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="flex flex-col items-center gap-3 grayscale hover:grayscale-0 transition-all duration-500 cursor-default"
                            >
                                {tech.icon}
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{tech.name}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>


            {/* Flow Section */}
            <section className="py-24 relative bg-slate-900/40">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-20 text-glow-blue">
                        <h2 className="text-4xl md:text-5xl font-black mb-4">Gampang Banget!</h2>
                        <p className="text-slate-400 text-lg uppercase tracking-[0.2em] font-bold">Flow Cara Kerja JasaJoki</p>
                    </div>

                    <div className="relative">
                        {/* Connection Line */}
                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent hidden lg:block translate-y-[-50px]" />
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
                            {flowSteps.map((step, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: i * 0.1 }}
                                    className="text-center relative z-10 group"
                                >
                                    <div className="w-20 h-20 bg-slate-800 rounded-full border-2 border-white/5 flex items-center justify-center mx-auto mb-6 text-2xl text-blue-400 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-400 transition-all duration-500 shadow-xl relative">
                                        <div className="absolute -top-2 -left-2 w-8 h-8 bg-blue-500 text-white text-xs font-black rounded-full flex items-center justify-center">{i + 1}</div>
                                        {step.icon}
                                    </div>
                                    <h4 className="text-xl font-black text-white mb-3 tracking-tight">{step.title}</h4>
                                    <p className="text-slate-500 text-sm font-medium leading-relaxed">{step.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <ReviewSection />

            {/* Final CTA */}
            <section className="py-32 relative overflow-hidden text-center px-4">
                <div className="absolute inset-0 bg-blue-600/5" />
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="max-w-5xl mx-auto glass-morphism p-16 md:p-24 rounded-[60px] relative z-10 border border-blue-500/20 shadow-[-20px_-20px_100px_rgba(30,58,138,0.2),20px_20px_100px_rgba(8,145,178,0.1)]"
                >
                    <h2 className="text-5xl md:text-7xl font-black mb-8 text-white leading-tight">Wujudkan Ide IT-mu <br /> Sekarang!</h2>
                    <p className="text-xl md:text-2xl text-slate-400 mb-12 leading-relaxed max-w-2xl mx-auto">
                        Tim ahli kami siap memberikan hasil terbaik dengan proses yang transparan dan harga bersahabat.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <a 
                            href="https://wa.me/6281234567890" 
                            target="_blank"
                            className="w-full sm:w-auto px-12 py-6 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl font-black text-2xl transition shadow-[0_0_50px_rgba(16,185,129,0.3)] active:scale-95 flex items-center justify-center gap-3"
                        >
                            <FaWhatsapp /> Konsultasi via WhatsApp
                        </a>
                        <button 
                            onClick={handleOrderClick}
                            className="w-full sm:w-auto px-12 py-6 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-2xl transition shadow-[0_0_50px_rgba(59,130,246,0.3)] active:scale-95"
                        >
                            Mulai Order
                        </button>
                    </div>
                </motion.div>
            </section>
        </div>
    );
}
