import React from 'react';
import { Link } from 'react-router-dom';
import { FaGithub, FaInstagram, FaWhatsapp, FaEnvelope } from 'react-icons/fa';

export default function Footer() {
    const services = [
        { name: 'Joki Tugas Coding', path: '/order/new' },
        { name: 'Web Development', path: '/order/new' }
    ];

    const helpLinks = [
        { name: 'FAQ', path: '/faq' },
        { name: 'Syarat & Ketentuan', path: '/terms' },
        { name: 'Kebijakan Privasi', path: '/privacy' },
        { name: 'Kontak Kami', path: '/contact' }
    ];

    return (
        <footer className="bg-[#020617] border-t border-slate-800/50 py-16 mt-20 relative z-10">
            <div className="max-w-7xl mx-auto px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="md:col-span-2">
                        <h2 className="text-3xl font-black heading-gradient mb-4 tracking-tighter uppercase italic">JasaJoki</h2>
                        <p className="text-slate-400 font-medium max-w-sm leading-relaxed mb-6">
                            Solusi tugas, coding, dan website premium untuk mahasiswa & startup. Bangun masa depan IT-mu bersama kami.
                        </p>
                        <div className="flex gap-4">
                            {[FaGithub, FaInstagram, FaWhatsapp, FaEnvelope].map((Icon, i) => (
                                <a key={i} href="#" className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all shadow-lg active:scale-90">
                                    <Icon size={18} />
                                </a>
                            ))}
                        </div>
                    </div>
                    
                    <div>
                        <h4 className="text-white font-black uppercase tracking-widest text-xs mb-6 italic">Layanan Kami</h4>
                        <ul className="space-y-4">
                            {services.map(item => (
                                <li key={item.name}>
                                    <Link to={item.path} className="text-slate-500 hover:text-blue-400 transition-colors text-xs font-bold uppercase tracking-wider">
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-black uppercase tracking-widest text-xs mb-6 italic">Bantuan</h4>
                        <ul className="space-y-4">
                            {helpLinks.map(item => (
                                <li key={item.name}>
                                    <Link to={item.path} className="text-slate-500 hover:text-blue-400 transition-colors text-xs font-bold uppercase tracking-wider">
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">
                        &copy; {new Date().getFullYear()} JasaJoki Platform. Premium Service for Better Future.
                    </div>
                    <div className="flex gap-6">
                        <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                            <div className="w-1 h-1 bg-emerald-500 rounded-full" /> System Status: Online
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
