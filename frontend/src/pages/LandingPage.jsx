import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import {
    FaArrowRight, FaRocket, FaClock, FaCheckCircle, FaComments,
    FaSearch, FaHandshake, FaEdit, FaCheckDouble, FaWhatsapp,
    FaReact, FaLaravel, FaNodeJs, FaPython, FaDatabase, FaVuejs,
    FaGraduationCap, FaShieldAlt, FaUndo, FaHeadset, FaBriefcase, FaStar,
    FaCode
} from 'react-icons/fa';
import { SiPostgresql, SiMysql, SiMariadb, SiCodeigniter } from 'react-icons/si';
import ReviewSection from '../components/ReviewSection';
import JourneyFlow from '../components/JourneyFlow';
import { generateWhatsAppUrl } from '../utils/whatsapp';
import api from '../api';
import SEO from '../components/SEO';

export default function LandingPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [packages, setPackages] = useState([]);
    const [portfolios, setPortfolios] = useState([]);
    const [stats, setStats] = useState({ avg_rating: 0, total_reviews: 0 });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const pkgRes = await api.get('/packages');
                if (pkgRes.data?.success) setPackages(pkgRes.data.data);

                const revRes = await api.get('/reviews/stats');
                if (revRes.data?.success) setStats(revRes.data);

                const portRes = await api.get('/portfolios');
                if (portRes.data?.success) setPortfolios(portRes.data.data);
            } catch (err) {
                console.error("Failed fetching landing data", err);
            }
        };
        fetchData();
    }, []);

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



    return (
        <div className="bg-[#020617] text-slate-100 selection:bg-blue-500/30 overflow-x-hidden">
            <SEO 
                title="DualCode - Solusi Project IT & Software House Terpercaya"
                description="DualCode - Solusi Jasa Pembuatan Web & Pengerjaan Project IT Terpercaya. Bantu tugas koding, website perusahaan, dan project startup dengan kualitas premium."
                keywords="dualcode, jasa pembuatan website, pengerjaan tugas pemrograman, software house, jasa koding, bantuan project it"
            />
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

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="flex items-center justify-center gap-4 mb-8"
                    >
                        {stats.total_reviews > 0 && (
                            <div className="text-center">
                                <div className="flex text-yellow-500 text-sm">
                                    <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
                                </div>
                                <p className="text-xs text-slate-400 font-bold">⭐ {stats.avg_rating}/5 dari {stats.total_reviews} Client Terbantu</p>
                            </div>
                        )}
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-lg md:text-2xl text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed font-medium"
                    >
                        Dari tugas kuliah sampai project startup, semua bisa kami bantu dengan sistem konsultasi dulu — bayar setelah deal.
                        <span className="text-blue-400 block mt-2 font-bold italic">⚠️ Slot terbatas hari ini!</span>
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-6"
                    >
                        <a
                            href={generateWhatsAppUrl(user, { manualMessage: 'Halo admin, saya butuh cepat! Apakah slot masih ada? Saya ingin konsultasi project.' })}
                            target="_blank"
                            className="w-full sm:w-auto group relative px-10 py-5 rounded-2xl bg-blue-600 text-white font-black text-xl hover:bg-blue-500 transition-all shadow-[0_0_40px_rgba(59,130,246,0.4)] flex items-center justify-center gap-3 active:scale-95 overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center gap-3">
                                🔥 Chat Admin Sekarang!
                            </span>
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        </a>
                        <button
                            onClick={handleOrderClick}
                            className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-slate-800/50 backdrop-blur-xl text-white font-bold text-xl hover:bg-slate-700/80 transition border border-white/10 flex items-center justify-center gap-3 active:scale-95"
                        >
                            📦 Order via Dashboard
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

            {/* Promo Mahasiswa Section */}
            <section className="py-24 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="glass-morphism rounded-[64px] p-8 md:p-20 border border-blue-500/20 bg-gradient-to-br from-blue-600/10 via-slate-900/50 to-transparent relative overflow-hidden">
                        {/* Background Decor */}
                        <div className="absolute top-[-20%] right-[-10%] w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px]" />

                        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                            <div>
                                <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-[0.2em] mb-8 animate-pulse">
                                    🔥 Special Offer
                                </div>
                                <h2 className="text-5xl md:text-7xl font-black text-white mb-8 leading-tight tracking-tighter">
                                    🎓 Promo Khusus <br /> <span className="heading-gradient">Mahasiswa!</span>
                                </h2>
                                <p className="text-xl md:text-2xl text-slate-400 mb-10 leading-relaxed font-medium">
                                    Kami memberikan harga spesial untuk mahasiswa! <br />
                                    Mulai dari <span className="text-white font-black text-3xl">200rb-an</span> saja, tugas kuliah aman terkendali.
                                </p>
                                <ul className="space-y-6 mb-12">
                                    <li className="flex items-center gap-4 text-lg text-slate-300 font-bold group">
                                        <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-lg">✓</div>
                                        Harga Lebih Terjangkau (Start 200rb)
                                    </li>
                                    <li className="flex items-center gap-4 text-lg text-slate-300 font-bold group">
                                        <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-lg">✓</div>
                                        Bisa Nego Sesuai Budget Mahasiswa
                                    </li>
                                    <li className="flex items-center gap-4 text-lg text-slate-300 font-bold group">
                                        <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-lg">✓</div>
                                        Kualitas Premium & Original
                                    </li>
                                </ul>

                                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                    <a
                                        href={generateWhatsAppUrl(user, { manualMessage: 'Halo admin, saya mahasiswa dan ingin klaim harga khusus mahasiswa.\n\nBerikut data saya:\n* Nama:\n* Universitas:\n* NIM:\n* Kebutuhan:\n* Deadline:' })}
                                        target="_blank"
                                        className="inline-flex items-center gap-4 px-10 py-5 bg-white text-blue-600 rounded-[28px] font-black text-xl hover:bg-blue-50 transition-all shadow-2xl shadow-white/10"
                                    >
                                        🚀 Klaim Harga Mahasiswa <FaArrowRight />
                                    </a>
                                </motion.div>

                                <p className="mt-6 text-sm text-slate-500 font-bold italic flex items-center gap-2">
                                    <FaCheckCircle className="text-blue-500/50" /> *Cukup tunjukkan NIM atau Kartu Mahasiswa aktif
                                </p>
                            </div>

                            <div className="relative group perspective-1000">
                                {/* Student Card Mockup */}
                                <motion.div
                                    initial={{ rotateY: 5, rotateX: 5 }}
                                    whileHover={{ rotateY: 0, rotateX: 0 }}
                                    className="relative z-10 glass-morphism p-10 rounded-[48px] border border-white/10 shadow-[0_50px_100px_rgba(30,58,138,0.3)] bg-slate-900/80 backdrop-blur-3xl overflow-hidden transition-all duration-700 select-none"
                                >
                                    {/* Card Design Elements */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-bl-full border-l border-b border-white/5" />

                                    <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-10">
                                        {/* Profile Photo */}
                                        <div className="relative">
                                            <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 p-1 shadow-2xl">
                                                <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden border-4 border-slate-900">
                                                    <div className="text-4xl font-black text-blue-400">AN</div>
                                                </div>
                                            </div>
                                            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 rounded-full border-4 border-slate-900 flex items-center justify-center text-white text-[10px] font-bold shadow-lg shadow-emerald-500/20">
                                                ON
                                            </div>
                                        </div>

                                        <div className="text-center md:text-left pt-2">
                                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-wider rounded-full mb-3">
                                                Mahasiswa Aktif
                                            </div>
                                            <h3 className="text-3xl font-black text-white mb-2 leading-tight">Abi Suryo Negoro</h3>
                                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-1">Unindra (Univ. PGRI)</p>
                                            <p className="text-blue-500 font-black text-lg">202343500814</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4 mb-10">
                                        <div className="h-6 w-full bg-slate-800/50 rounded-2xl relative overflow-hidden">
                                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-transparent w-[85%]" />
                                            <div className="absolute inset-0 flex items-center px-4 justify-between">
                                                <span className="text-[10px] font-black text-blue-400 uppercase">Profile Completion</span>
                                                <span className="text-[10px] font-black text-white">85%</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="flex-1 h-3 bg-slate-800/30 rounded-full" />
                                            <div className="flex-1 h-3 bg-slate-800/30 rounded-full" />
                                            <div className="w-12 h-3 bg-blue-600 rounded-full animate-pulse" />
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center pt-8 border-t border-white/10 group-hover:border-blue-500/30 transition-colors">
                                        <div className="text-left">
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Status Verifikasi</p>
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                                <span className="text-white font-black text-xs uppercase tracking-tight">Verified Student</span>
                                            </div>
                                        </div>
                                        <div className="text-right flex items-center gap-2">
                                            <div className="text-right">
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Akreditasi</p>
                                                <span className="text-white font-black text-xl italic heading-gradient">Grade A+</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 text-center">
                                        <span className="text-[10px] text-slate-600 font-bold italic">"Contoh Kartu Mahasiswa (Mockup)"</span>
                                    </div>
                                </motion.div>

                                {/* Decorative Background Glow */}
                                <div className="absolute inset-0 bg-blue-600/10 blur-[120px] rounded-full translate-x-12 translate-y-12 -z-10" />

                                <div className="absolute -top-8 -right-8 glass-morphism p-6 rounded-full border border-white/10 shadow-2xl z-20 hidden md:block group-hover:scale-110 transition-transform duration-500">
                                    <div className="text-blue-500">
                                        <FaStar size={24} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Estimates & Business Pricing */}
            <section className="py-24 relative bg-slate-950/50">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-6xl font-black mb-4 italic heading-gradient tracking-tight">Pilih Paket Sesuai Kebutuhanmu</h2>
                        <p className="text-slate-400 text-lg md:text-xl font-medium">
                            Pilih layanan yang sesuai dengan kebutuhan dan budget kamu. <br />
                            <span className="text-blue-400">Konsultasi gratis sebelum deal!</span>
                        </p>
                    </div>

                    {packages.length === 0 ? (
                        <div className="text-center py-16 bg-slate-900/50 rounded-[32px] border border-white/5">
                            <h3 className="text-2xl font-bold text-white mb-2">Belum ada paket layanan</h3>
                            <p className="text-slate-400">Silakan hubungi admin untuk info lebih lanjut.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
                            {packages.map((pkg) => (
                                <div
                                    key={pkg.id}
                                    className={`glass-morphism p-8 rounded-[40px] border transition-all group relative overflow-hidden flex flex-col h-full ${pkg.is_popular
                                        ? 'border-blue-500/40 bg-blue-500/5 hover:-translate-y-2 ring-4 ring-blue-500/10 shadow-[0_0_50px_rgba(59,130,246,0.1)] scale-105 z-10'
                                        : 'border-white/5 hover:border-blue-500/30'
                                        }`}
                                >
                                    {pkg.is_popular && (
                                        <div className="absolute top-0 right-0 p-1 bg-blue-500 text-[10px] font-black uppercase text-white px-6 py-1 rounded-bl-2xl">Recommended</div>
                                    )}
                                    <div className="mb-8">
                                        <h3 className="text-2xl font-black text-white mb-2">{pkg.title}</h3>
                                        <p className="text-slate-500 text-sm font-medium">{pkg.subtitle}</p>
                                    </div>
                                    <div className="mb-8">
                                        <span className="text-slate-400 text-sm italic font-bold">
                                            {pkg.price.toLowerCase().includes('custom') ? 'Investasi Terbaik' : 'Hemat Mulai Dari'}
                                        </span>
                                        <div className="text-5xl font-black text-white mt-1 tracking-tighter">{pkg.price}</div>
                                    </div>
                                    <ul className="space-y-4 mb-10">
                                        {(pkg.features || []).map((feature, i) => (
                                            <li key={i} className="flex items-center gap-3 text-slate-400 text-sm font-bold">
                                                <FaCheckCircle className={pkg.is_popular ? "text-blue-500" : "text-emerald-500"} /> {feature}
                                            </li>
                                        ))}
                                    </ul>
                                    <a
                                        href={generateWhatsAppUrl(user, { manualMessage: `Halo admin, saya tertarik dengan paket ${pkg.title}. Boleh minta info lebih detail?` })}
                                        target="_blank"
                                        className={`mt-auto block w-full text-center py-5 rounded-[20px] font-black transition-all ${pkg.is_popular
                                            ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-[0_15px_30px_rgba(59,130,246,0.4)]'
                                            : 'bg-slate-800 text-white hover:bg-blue-600 hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]'
                                            }`}
                                    >
                                        Pesan Sekarang
                                    </a>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Portfolio Section */}
            <section className="py-24 relative">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-8 text-center md:text-left">
                        <div className="max-w-3xl">
                            <h2 className="text-4xl md:text-6xl font-black mb-6 text-white tracking-tighter">
                                Mengenal Lebih Dekat <br />
                                <span className="heading-gradient">DualCode</span>
                            </h2>
                            <p className="text-slate-400 text-lg md:text-xl font-medium leading-relaxed">
                                DualCode bukanlah sekadar penyedia jasa koding biasa. Kami adalah partner strategis yang lahir dari kolaborasi antara <span className="text-white font-bold">Desain Kreatif</span> dan <span className="text-white font-bold">Arsitektur Teknis</span> yang solid. Kami hadir untuk memutus rantai drama project IT yang lambat dan penuh bug, menggantinya dengan eksekusi presisi yang siap meningkatkan skala bisnis Anda.
                            </p>
                        </div>
                        <div className="hidden lg:block w-32 h-32 rounded-full border-2 border-blue-500/20 flex items-center justify-center p-4">
                            <div className="w-full h-full rounded-full bg-blue-600/10 flex items-center justify-center animate-pulse-glow">
                                <FaRocket size={40} className="text-blue-500" />
                            </div>
                        </div>
                    </div>

                    {portfolios.length === 0 ? (
                        <div className="relative group perspective-1000">
                            {/* Founders Section replacement for empty portfolio */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Founder: Abi (Growth & Strategy now) */}
                                <motion.div
                                    whileHover={{ y: -10 }}
                                    className="glass-morphism p-10 rounded-[48px] border border-white/10 bg-slate-900/60 backdrop-blur-3xl relative overflow-hidden flex flex-col items-center text-center group"
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-bl-full blur-2xl" />
                                    <div className="w-40 h-40 rounded-full bg-gradient-to-tr from-blue-600/20 to-indigo-600/20 p-1 mb-8 shadow-2xl relative flex items-center justify-center">
                                        <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden border-4 border-slate-900 relative">
                                            <img
                                                src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People/Man%20in%20Tuxedo.png"
                                                alt="Abi"
                                                className="w-32 h-32 object-contain"
                                            />
                                        </div>
                                        <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-blue-500 rounded-full border-4 border-slate-900 flex items-center justify-center text-white shadow-xl">
                                            <FaRocket size={20} />
                                        </div>
                                    </div>
                                    <h3 className="text-3xl font-black text-white mb-2 leading-tight">Abi</h3>
                                    <p className="text-blue-400 font-bold uppercase tracking-widest text-[10px] mb-6 px-4 py-1 bg-blue-500/10 rounded-full border border-blue-500/20 inline-block">Co-Founder & Growth Lead</p>
                                    <p className="text-slate-400 font-medium leading-relaxed max-w-sm text-sm">
                                        Abi adalah otak di balik strategi dan keberhasilan setiap project. Ia memastikan setiap solusi yang DualCode berikan memiliki nilai bisnis yang nyata dan berkelanjutan bagi client.
                                    </p>
                                </motion.div>

                                {/* Founder: Genes (Technical Lead now) */}
                                <motion.div
                                    whileHover={{ y: -10 }}
                                    className="glass-morphism p-10 rounded-[48px] border border-white/10 bg-slate-900/60 backdrop-blur-3xl relative overflow-hidden flex flex-col items-center text-center group"
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-600/10 rounded-bl-full blur-2xl" />
                                    <div className="w-40 h-40 rounded-full bg-gradient-to-tr from-emerald-600/20 to-teal-600/20 p-1 mb-8 shadow-2xl relative flex items-center justify-center">
                                        <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden border-4 border-slate-900 relative">
                                            <img
                                                src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People%20with%20professions/Man%20Technologist%20Medium-Light%20Skin%20Tone.png"
                                                alt="Genes"
                                                className="w-32 h-32 object-contain"
                                            />
                                        </div>
                                        <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-emerald-500 rounded-full border-4 border-slate-900 flex items-center justify-center text-white shadow-xl">
                                            <FaCode size={20} />
                                        </div>
                                    </div>
                                    <h3 className="text-3xl font-black text-white mb-2 leading-tight">Genes</h3>
                                    <p className="text-emerald-400 font-bold uppercase tracking-widest text-[10px] mb-6 px-4 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20 inline-block">Co-Founder & Technical Lead</p>
                                    <p className="text-slate-400 font-medium leading-relaxed max-w-sm text-sm">
                                        Genes bertanggung jawab penuh atas setiap baris kode yang lahir dari DualCode. Ia memastikan arsitektur sistem yang dibangun stabil, aman, dan menggunakan teknologi paling mutakhir.
                                    </p>
                                </motion.div>
                            </div>

                            {/* Call to action center snippet */}
                            <div className="mt-16 text-center max-w-2xl mx-auto">
                                <h4 className="text-2xl font-black text-white mb-4">Kenapa Mempercayakan Project Anda pada Kami?</h4>
                                <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8">
                                    Kami memulai DualCode karena bosan melihat project IT yang berakhir dengan kekecewaan. Kami percaya bahwa setiap ide besar berhak mendapatkan eksekusi koding yang jujur, transparan, dan berkualitas tinggi.
                                </p>
                                <button onClick={handleOrderClick} className="px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-3xl font-black text-xl transition shadow-[0_20px_50px_rgba(59,130,246,0.3)] active:scale-95 flex items-center justify-center gap-3 mx-auto">
                                    🤝 Mulai Konsultasi dengan Kami
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {portfolios.map((item, i) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="group relative overflow-hidden rounded-[32px] aspect-[4/3] bg-slate-900 border border-white/5 hover:border-blue-500/30 transition-all duration-500 hover:shadow-[0_20px_40px_rgba(30,58,138,0.3)]"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent z-10 opacity-90 transition-opacity" />

                                    {/* Icon / Image Placeholder */}
                                    {item.image_url ? (
                                        <div className="absolute inset-0 w-full h-full opacity-30 group-hover:opacity-50 transition-all duration-700 group-hover:scale-110">
                                            <img src={`http://localhost:8000/storage/${item.image_url}`} alt={item.title} className="w-full h-full object-cover" />
                                        </div>
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center opacity-20 group-hover:opacity-40 transition-opacity group-hover:scale-110 duration-700">
                                            {item.category.toLowerCase().includes('mobile') ? <FaReact size={120} className="text-blue-500" /> : <FaDatabase size={120} className="text-emerald-500" />}
                                        </div>
                                    )}

                                    <div className="absolute bottom-0 left-0 p-8 z-20 w-full translate-y-6 group-hover:translate-y-0 transition-transform duration-500">
                                        <div className="flex justify-between items-end mb-3">
                                            <div className="text-xs font-black text-blue-400 uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20 inline-block">
                                                {item.category}
                                            </div>
                                            {item.link && (
                                                <a href={item.link} target="_blank" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-blue-500 transition-colors backdrop-blur-md opacity-0 group-hover:opacity-100 delay-100">
                                                    <FaArrowRight />
                                                </a>
                                            )}
                                        </div>
                                        <h4 className="text-2xl font-black text-white mb-2 leading-tight">{item.title}</h4>
                                        <p className="text-slate-400 text-sm mb-4 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity delay-75 duration-300">
                                            {item.description}
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {(item.tech_stack || []).map((tech, idx) => (
                                                <span key={idx} className="px-3 py-1 bg-slate-800/80 backdrop-blur-sm rounded-full text-[10px] text-slate-300 font-bold border border-white/5">
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Hover overlay glow */}
                                    <div className="absolute bottom-[-20%] right-[-20%] w-64 h-64 bg-blue-600/20 rounded-full blur-[80px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Guarantees & Urgency Section */}
            <section className="py-24 relative overflow-hidden bg-gradient-to-b from-transparent to-blue-600/5">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <div className="flex items-center gap-4 mb-8 text-blue-400 font-black tracking-widest uppercase text-sm">
                                <FaShieldAlt size={24} /> Kami Menjamin Kepuasan Anda
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black text-white mb-8 leading-tight">
                                Hilangkan Rasa Takut, <br />
                                Fokus Pada <span className="text-blue-500 underline decoration-blue-500/30 underline-offset-8">Kesuksesan Anda.</span>
                            </h2>
                            <div className="space-y-8">
                                <div className="flex gap-6 items-start">
                                    <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-400 flex flex-shrink-0 items-center justify-center border border-blue-500/20">
                                        <FaUndo size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-black text-white mb-2 italic">Revisi Sampai Sesuai</h4>
                                        <p className="text-slate-400 font-medium">Hasil akhir belum pas? Tenang, kami revisi sampai benar-benar sesuai dengan spesifikasi awal Anda.</p>
                                    </div>
                                </div>
                                <div className="flex gap-6 items-start">
                                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex flex-shrink-0 items-center justify-center border border-emerald-500/20">
                                        <span className="font-black text-xl">Rp</span>
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-black text-white mb-2 italic">Uang Kembali (Money Back)</h4>
                                        <p className="text-slate-400 font-medium font-bold">Jika project tidak selesai atau tidak sesuai kesepakatan akhir, kami kembalikan dana Anda. Aman 100%.</p>
                                    </div>
                                </div>
                                <div className="flex gap-6 items-start">
                                    <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-400 flex flex-shrink-0 items-center justify-center border border-purple-500/20">
                                        <FaHeadset size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-black text-white mb-2 italic">Support Sampai Selesai</h4>
                                        <p className="text-slate-400 font-medium">Bukan cuma koding, tapi kami jelasin alurnya sampai Anda benar-benar paham cara kerjanya.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="glass-morphism p-12 rounded-[64px] border border-white/10 bg-slate-900/40 backdrop-blur-3xl relative z-10 shadow-2xl">
                                <div className="text-center mb-10">
                                    <div className="w-20 h-20 bg-blue-600/20 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                                        <FaClock size={40} />
                                    </div>
                                    <h3 className="text-3xl font-black text-white mb-4 italic">⚠️ Slot Terbatas!</h3>
                                    <p className="text-slate-400 text-lg font-medium leading-relaxed">
                                        Demi menjaga kualitas, kami hanya menerima <span className="text-blue-400 font-bold underline">3 slot project</span> baru setiap harinya.
                                    </p>
                                </div>
                                <div className="space-y-4 mb-10">
                                    <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full w-[85%] bg-blue-600 animate-pulse" />
                                    </div>
                                    <div className="flex justify-between text-[10px] font-black uppercase text-slate-500 tracking-widest">
                                        <span>Slot Terisi (2/3)</span>
                                        <span className="text-blue-400">Sisa 1 Slot Hari Ini</span>
                                    </div>
                                </div>
                                <a
                                    href={generateWhatsAppUrl(user, { manualMessage: 'BUTUH CEPAT! Halo admin, apakah slot project untuk hari ini masih tersedia? Saya punya deadline mepet.' })}
                                    target="_blank"
                                    className="block w-full text-center py-6 bg-blue-600 hover:bg-blue-500 text-white rounded-3xl font-black text-2xl transition shadow-[0_0_50px_rgba(59,130,246,0.5)] active:scale-95 flex items-center justify-center gap-4"
                                >
                                    ⚡ Butuh Cepat? Klik Sini!
                                </a>
                                <p className="mt-6 text-center text-slate-500 text-sm font-bold animate-pulse">
                                    🔥 Priority response untuk deadline mepet!
                                </p>
                            </div>
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/20 rounded-full blur-[80px]" />
                            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/10 rounded-full blur-[80px]" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Trust Badges Ribbon */}
            <section className="py-12 bg-slate-950 border-y border-white/5">
                <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center gap-12 md:gap-24 items-center opacity-60">
                    <div className="flex items-center gap-3">
                        <FaGraduationCap className="text-blue-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white">Mahasiswa Trusted</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <FaBriefcase className="text-blue-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white">Startup Ready</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <FaRocket className="text-blue-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white">Expert IT Team</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <FaClock className="text-blue-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white">Fast Response</span>
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


            {/* Flow Section (Zigzag Component) */}
            <JourneyFlow />

            {/* Testimonials */}
            {stats.total_reviews > 0 && <ReviewSection />}

            {/* Final CTA */}
            <section className="py-32 relative overflow-hidden text-center px-4">
                <div className="absolute inset-0 bg-blue-600/5" />
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="max-w-5xl mx-auto glass-morphism p-16 md:p-24 rounded-[60px] relative z-10 border border-blue-500/20 shadow-[-20px_-20px_100px_rgba(30,58,138,0.2),20px_20px_100px_rgba(8,145,178,0.1)]"
                >
                    <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-blue-500/10 text-blue-400 text-sm font-bold mb-8">
                        ⚡ Respon &lt; 5 Menit
                    </div>
                    <h2 className="text-5xl md:text-7xl font-black mb-8 text-white leading-tight italic">Wujudkan Ide IT-mu <br /> <span className="text-blue-400 underline decoration-blue-500/10">Sekarang!</span></h2>
                    <p className="text-xl md:text-2xl text-slate-400 mb-12 leading-relaxed max-w-2xl mx-auto">
                        Jangan biarkan tugas atau project startup-mu mangkrak. Tim ahli kami siap bantu 24/7 dengan jaminan kualitas terbaik.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <a
                            href={generateWhatsAppUrl(user, { manualMessage: 'Halo admin, saya tertarik dengan jasa Anda. Saya butuh bantuan project [Sebutkan Jenis] dengan deadline [Sebutkan Tanggal]. Apakah bisa dibantu?' })}
                            target="_blank"
                            className="w-full sm:w-auto px-12 py-6 bg-emerald-500 hover:bg-emerald-400 text-white rounded-3xl font-black text-2xl transition shadow-[0_0_50px_rgba(16,185,129,0.4)] active:scale-95 flex items-center justify-center gap-4"
                        >
                            <FaWhatsapp size={32} /> Tanya Sekarang
                        </a>
                        <button
                            onClick={handleOrderClick}
                            className="w-full sm:w-auto px-12 py-6 bg-blue-600 hover:bg-blue-500 text-white rounded-3xl font-black text-2xl transition shadow-[0_0_50px_rgba(59,130,246,0.3)] active:scale-95"
                        >
                            📦 Mulai Order
                        </button>
                    </div>
                    <p className="mt-10 text-slate-500 font-bold uppercase tracking-[0.2em] text-xs underline decoration-white/10 underline-offset-8 italic">
                        🔒 Full Support Sampai Project Selesai & Berjalan Lancar
                    </p>
                </motion.div>
            </section>
        </div>
    );
}
