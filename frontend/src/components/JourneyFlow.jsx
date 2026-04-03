import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
    FaSearch, FaPaperPlane, FaWhatsapp, FaLightbulb, 
    FaHandshake, FaCode, FaCheckDouble 
} from 'react-icons/fa';

export default function JourneyFlow() {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start center", "end center"]
    });

    const steps = [
        { icon: <FaSearch />, title: 'Masuk & Pilih Layanan', desc: 'Jelajahi paket yang kami tawarkan dan pilih yang paling sesuai dengan kebutuhan project Anda.' },
        { icon: <FaPaperPlane />, title: 'Kirim Request Project', desc: 'Isi form order atau chat langsung dengan detail spesifikasi secara lengkap.' },
        { icon: <FaWhatsapp />, title: 'Tim Menghubungi', desc: 'Admin akan merespon cepat via WhatsApp untuk mengkonfirmasi ketersediaan.' },
        { icon: <FaLightbulb />, title: 'Brainstorm & Validasi', desc: 'Diskusi teknis gratis untuk mencari solusi terbaik tanpa komitmen awal.' },
        { icon: <FaHandshake />, title: 'Finalisasi Deal', desc: 'Kesepakatan scope, harga investasi, waktu pengerjaan, dan terms pembayaran.' },
        { icon: <FaCode />, title: 'Eksekusi Project', desc: 'Tim spesialis kami mulai coding. Progress transparan dan terpantau.' },
        { icon: <FaCheckDouble />, title: 'Delivery & Revisi', desc: 'Penyerahan hasil akhir (source code/akses) dan proses revisi hingga 100% puas.' }
    ];

    return (
        <section ref={containerRef} className="py-32 relative bg-[#020617] overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 lg:px-8">
                <div className="text-center mb-24 text-glow-blue relative z-10">
                    <h2 className="text-4xl md:text-6xl font-black mb-6">Cara Kerja <span className="heading-gradient text-transparent bg-clip-text">DualCode</span></h2>
                    <p className="text-slate-400 text-lg md:text-xl uppercase tracking-[0.2em] font-bold">7 Langkah Menuju Kesuksesan Project Anda</p>
                </div>

                <div className="relative">
                    {/* The Background Dashed Line (Vertical on mobile, straight down middle on desktop) */}
                    <div className="absolute top-0 bottom-0 left-8 md:left-1/2 w-1 bg-slate-800/50 border-l-2 border-dashed border-slate-700 md:-translate-x-1/2 z-0"></div>
                    
                    {/* The Glow Progress Line */}
                    <motion.div 
                        className="absolute top-0 left-8 md:left-1/2 w-1 bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.8)] md:-translate-x-1/2 z-10 origin-top"
                        style={{ bottom: 0, scaleY: scrollYProgress }}
                    />

                    {/* Paper Plane following progress */}
                    <motion.div 
                        className="absolute left-8 md:left-1/2 z-20 text-blue-400 text-3xl filter drop-shadow-[0_0_15px_rgba(59,130,246,1)]"
                        style={{ 
                            top: useTransform(scrollYProgress, [0, 1], ["0%", "100%"]),
                            x: "-50%",
                            y: "-50%",
                            rotate: 180
                        }}
                    >
                        <FaPaperPlane />
                    </motion.div>

                    <div className="space-y-16 md:space-y-32 relative z-10 pt-10 pb-10">
                        {steps.map((step, index) => {
                            // Check if scrolling past this item
                            const isEven = index % 2 === 0;
                            const stepProgress = index / (steps.length - 1);
                            
                            // Glow effect trigger based on scroll
                            const opacity = useTransform(scrollYProgress, 
                                [stepProgress - 0.2, stepProgress - 0.05, stepProgress + 0.1], 
                                [0.3, 1, 0.3]
                            );
                            const scale = useTransform(scrollYProgress, 
                                [stepProgress - 0.2, stepProgress, stepProgress + 0.2], 
                                [0.9, 1.05, 0.95]
                            );
                            const glow = useTransform(scrollYProgress,
                                [stepProgress - 0.1, stepProgress, stepProgress + 0.1],
                                ["0px 0px 0px rgba(59,130,246,0)", "0px 0px 40px rgba(59,130,246,0.5)", "0px 0px 0px rgba(59,130,246,0)"]
                            );

                            return (
                                <div key={index} className="relative flex items-center md:justify-between">
                                    
                                    {/* Desktop Left Side Placeholder */}
                                    <div className={`hidden md:block w-[45%] ${isEven ? 'order-1' : 'order-3'}`}></div>

                                    {/* Icon / Node Container */}
                                    <motion.div 
                                        style={{ boxShadow: glow }}
                                        className={`absolute left-8 md:static md:left-auto w-14 h-14 md:w-20 md:h-20 bg-slate-900 border-4 border-slate-800 rounded-full flex items-center justify-center text-blue-500 z-30 transition-colors -translate-x-1/2 md:translate-x-0 ${isEven ? 'order-2' : 'order-2'}`}
                                    >
                                        <div className="text-xl md:text-3xl">{step.icon}</div>
                                    </motion.div>

                                    {/* Content Card (Zigzag placement) */}
                                    <motion.div 
                                        style={{ opacity, scale }}
                                        className={`w-full pl-20 md:pl-0 md:w-[45%] ${isEven ? 'order-3 md:text-left' : 'order-3 md:order-1 md:text-right'}`}
                                    >
                                        <div className={`glass-morphism p-6 md:p-8 rounded-3xl border border-white/5 relative group hover:border-blue-500/50 transition-all duration-300`}>
                                            <div className={`absolute top-1/2 -translate-y-1/2 w-0 h-0 border-y-[12px] border-y-transparent md:block hidden ${isEven ? 'left-0 -translate-x-[12px] border-r-[12px] border-r-slate-800/80 group-hover:border-r-blue-500/50' : 'right-0 translate-x-[12px] border-l-[12px] border-l-slate-800/80 group-hover:border-l-blue-500/50'}`}></div>
                                            
                                            <span className="text-blue-500 font-black text-6xl absolute -top-8 -right-4 opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity">
                                                0{index + 1}
                                            </span>
                                            
                                            <h4 className="text-2xl font-black text-white mb-3 tracking-tight group-hover:text-blue-400 transition-colors">
                                                {step.title}
                                            </h4>
                                            <p className="text-slate-400 font-medium leading-relaxed">
                                                {step.desc}
                                            </p>
                                        </div>
                                    </motion.div>

                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
