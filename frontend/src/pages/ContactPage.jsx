import React from 'react';
import { motion } from 'framer-motion';
import { FaWhatsapp, FaEnvelope, FaMapMarkerAlt, FaPaperPlane } from 'react-icons/fa';
import SEO from '../components/SEO';

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-[#020617] pt-32 pb-20 px-4">
            <SEO 
                title="Hubungi Kami - Konsultasi Gratis Project IT"
                description="Hubungi DualCode untuk konsultasi gratis mengenai project IT, tugas koding, atau pengerjaan website Anda. Respon cepat 24/7."
                keywords="hubungi jasa joki, kontak jasa coding, konsultasi project it, bantuan tugas pemrograman"
                canonicalUrl="/contact"
            />
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-4">Hubungi Kami</h1>
                    <p className="text-slate-400 text-lg">Punya pertanyaan? Kami siap membantu mewujudkan project IT Anda.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Contact Info */}
                    <div className="space-y-8">
                        <div className="glass-morphism p-8 rounded-3xl border border-white/5 hover:border-blue-500/20 transition-all group">
                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <FaWhatsapp size={28} />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-xl mb-1">WhatsApp</h4>
                                    <p className="text-slate-400">+62 812 3456 7890</p>
                                </div>
                            </div>
                            <a href="https://wa.me/6281234567890" target="_blank" className="mt-6 block w-full py-3 bg-emerald-500/20 text-emerald-400 text-center rounded-xl font-bold hover:bg-emerald-500 hover:text-white transition-all">Chat Sekarang</a>
                        </div>

                        <div className="glass-morphism p-8 rounded-3xl border border-white/5 hover:border-blue-500/20 transition-all group">
                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <FaEnvelope size={24} />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-xl mb-1">Email</h4>
                                    <p className="text-slate-400">support@dualcode.com</p>
                                </div>
                            </div>
                        </div>

                        <div className="glass-morphism p-8 rounded-3xl border border-white/5 hover:border-blue-500/20 transition-all group">
                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 bg-purple-500/10 text-purple-400 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <FaMapMarkerAlt size={24} />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-xl mb-1">Lokasi</h4>
                                    <p className="text-slate-400">Jakarta, Indonesia (Online Service)</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        className="glass-morphism p-8 md:p-12 rounded-[40px] border border-white/5"
                    >
                        <form className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-400 uppercase tracking-widest pl-1">Nama</label>
                                    <input type="text" className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-all" placeholder="John Doe" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-400 uppercase tracking-widest pl-1">Email</label>
                                    <input type="email" className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-all" placeholder="john@example.com" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-400 uppercase tracking-widest pl-1">Layanan</label>
                                <select className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer">
                                    <option>Joki Tugas Coding</option>
                                    <option>Web Development</option>
                                    <option>Lainnya</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-400 uppercase tracking-widest pl-1">Pesan</label>
                                <textarea rows="5" className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-all resize-none" placeholder="Ceritakan kebutuhan project Anda..."></textarea>
                            </div>
                            <button type="button" className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-lg transition shadow-lg shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-3">
                                Kirim Pesan <FaPaperPlane />
                            </button>
                        </form>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
